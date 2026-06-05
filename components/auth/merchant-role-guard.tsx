"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/api";
import {
  ROLE_COOKIE_NAME,
  isAuthRole,
  landingPathForRole,
  type AuthRole,
} from "@/lib/auth/role-routing";

const readCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() ?? null;
  return null;
};

const writeRoleCookie = (role: AuthRole) => {
  if (typeof document === "undefined") return;
  // 24h max-age matches the default `mock-auth` lifetime when
  // "Remember me" wasn't checked.
  document.cookie = `${ROLE_COOKIE_NAME}=${role}; path=/; max-age=86400; SameSite=Lax`;
};

interface MerchantRoleGuardProps {
  children: React.ReactNode;
}

/**
 * Client-side defense-in-depth guard for the merchant dashboard area.
 *
 * The edge middleware already redirects wrong-role users out of
 * `/dashboard` when the `user_role` cookie is present. This component
 * handles the remaining edge case: an authenticated session from
 * before the role cookie existed (or one where the cookie was
 * cleared/expired but `mock-auth` survived) that lands on the
 * merchant dashboard. In that case we look up the role via the API,
 * backfill the cookie, and bounce non-merchants to their own
 * dashboard.
 */
export const MerchantRoleGuard = ({ children }: MerchantRoleGuardProps) => {
  const router = useRouter();
  const [ready, setReady] = useState<boolean>(() => {
    if (typeof document === "undefined") return false;
    const cookieRole = readCookie(ROLE_COOKIE_NAME);
    // Middleware already enforced this if the cookie says "user".
    return cookieRole === "user";
  });

  useEffect(() => {
    let cancelled = false;

    const cookieRole = readCookie(ROLE_COOKIE_NAME);
    if (cookieRole === "user") {
      setReady(true);
      return;
    }

    // Cookie says wrong role – middleware should have redirected us,
    // but be defensive: bounce immediately.
    if (isAuthRole(cookieRole) && cookieRole !== "user") {
      router.replace(landingPathForRole(cookieRole));
      return;
    }

    // No / unknown role cookie. Resolve via the API, then either
    // backfill the cookie (merchant) or redirect (driver/admin).
    (async () => {
      try {
        const response = await authService.getCurrentUser();
        if (cancelled) return;
        const role = response.data.role;
        if (!isAuthRole(role)) {
          router.replace("/login");
          return;
        }
        if (role === "user") {
          writeRoleCookie(role);
          setReady(true);
        } else {
          writeRoleCookie(role as AuthRole);
          router.replace(landingPathForRole(role as AuthRole));
        }
      } catch (err) {
        if (cancelled) return;
        console.error("MerchantRoleGuard: failed to resolve role", err);
        router.replace("/login");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
