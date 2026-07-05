/**
 * Admin → merchant impersonation session helpers.
 *
 * When an admin views a merchant dashboard we swap the JWT and role cookie
 * while keeping the original admin session in sessionStorage so they can
 * return to /admin with one click.
 */

import type { User } from "@/lib/api/types";

const BACKUP_KEY = "parcego_admin_impersonation_backup";
const CONTEXT_KEY = "parcego_impersonation_context";
const SESSION_MAX_AGE_SECONDS = 86400;

export interface ImpersonationContext {
  merchantId: number;
  merchantEmail: string;
  merchantLabel: string;
  adminEmail: string;
}

interface ImpersonationBackup {
  auth_token: string;
  user_role: string;
}

const readCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match?.[1] ?? null;
};

const setCookie = (name: string, value: string, maxAgeSeconds: number) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${value}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
};

const buildMerchantLabel = (merchant: User): string => {
  if (merchant.business_name?.trim()) {
    return merchant.business_name.trim();
  }
  const fullName = [merchant.first_name, merchant.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  return fullName || merchant.email;
};

export const getImpersonationContext = (): ImpersonationContext | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CONTEXT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ImpersonationContext;
  } catch {
    return null;
  }
};

export const isImpersonatingMerchant = (): boolean =>
  getImpersonationContext() !== null;

export const startMerchantImpersonation = (
  merchant: User,
  accessToken: string,
  adminEmail: string,
): void => {
  if (typeof window === "undefined") return;

  const backup: ImpersonationBackup = {
    auth_token: localStorage.getItem("auth_token") ?? "",
    user_role: readCookie("user_role") ?? "admin",
  };
  sessionStorage.setItem(BACKUP_KEY, JSON.stringify(backup));

  const context: ImpersonationContext = {
    merchantId: merchant.id,
    merchantEmail: merchant.email,
    merchantLabel: buildMerchantLabel(merchant),
    adminEmail,
  };
  sessionStorage.setItem(CONTEXT_KEY, JSON.stringify(context));

  localStorage.setItem("auth_token", accessToken);
  setCookie("user_role", "user", SESSION_MAX_AGE_SECONDS);
  setCookie("mock-auth", "true", SESSION_MAX_AGE_SECONDS);

  window.location.href = "/dashboard";
};

export const endMerchantImpersonation = (): void => {
  if (typeof window === "undefined") return;

  const rawBackup = sessionStorage.getItem(BACKUP_KEY);
  sessionStorage.removeItem(BACKUP_KEY);
  sessionStorage.removeItem(CONTEXT_KEY);

  if (rawBackup) {
    try {
      const backup = JSON.parse(rawBackup) as ImpersonationBackup;
      if (backup.auth_token) {
        localStorage.setItem("auth_token", backup.auth_token);
      }
      setCookie("user_role", backup.user_role, SESSION_MAX_AGE_SECONDS);
      setCookie("mock-auth", "true", SESSION_MAX_AGE_SECONDS);
    } catch {
      // Fall through to admin redirect; user can re-login if restore fails.
    }
  }

  window.location.href = "/admin";
};
