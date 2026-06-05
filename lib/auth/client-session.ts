/**
 * Client-side session cleanup helpers shared by every page-level auth
 * guard.
 *
 * Why this exists: each dashboard (admin, courier, courier sub-pages)
 * had its own client-side auth check that would `router.push("/login")`
 * on failure, but they only cleared a subset of the cookies/localStorage
 * keys involved in a session. The edge middleware reads `mock-auth`
 * and `user_role`, and if those cookies survive a failed auth check the
 * middleware bounces the user from `/login` straight back to the
 * dashboard they came from, which then fails its check again and
 * redirects back to `/login` – an infinite loop that visually shows up
 * as "Loading Courier Dashboard…" / "Verifying admin access…" forever.
 * This happened reliably once the JWT in `auth_token` expired.
 *
 * Centralising the cleanup here means every page can call
 * `redirectToLogin()` (or `clearAllClientSessionState()` if it only
 * wants to wipe state without navigating) and be guaranteed that the
 * full set of cookies + localStorage entries are scrubbed.
 */

import { authService } from "@/lib/api/auth";

const EXPIRED_COOKIE = "expires=Thu, 01 Jan 1970 00:00:00 GMT";

const clearCookie = (name: string) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; ${EXPIRED_COOKIE}; SameSite=Lax`;
};

/**
 * Wipe every localStorage entry and cookie our auth flows write,
 * synchronously. Safe to call from anywhere (no-ops on the server).
 *
 * Does NOT call the backend logout endpoint – use `redirectToLogin`
 * for that. This helper is for the rare "I just need everything
 * cleared now, no async work" path.
 */
export const clearAllClientSessionState = () => {
  if (typeof window === "undefined") return;

  // localStorage – auth token + role-specific session entries.
  const KEYS = [
    "auth_token",
    // Courier / driver
    "courier_authenticated",
    "courier_email",
    "courier_login_time",
    "courier_user",
    "courier_remember_me",
    // Admin
    "admin_authenticated",
    "admin_email",
    "admin_login_time",
    "admin_remember_me",
    "admin_user",
    "admin_name",
    "admin_role",
    "admin_user_id",
  ];
  for (const key of KEYS) {
    try {
      localStorage.removeItem(key);
    } catch {
      // Private mode / quota – non-fatal.
    }
  }

  // Cookies – everything the edge middleware reads, plus the
  // role-specific ones the page-level guards check.
  clearCookie("mock-auth");
  clearCookie("user_role");
  clearCookie("courier_authenticated");
  clearCookie("admin_authenticated");
};

export interface RedirectToLoginOptions {
  /**
   * If provided, appended as `?redirect=<encoded>` so the login page
   * can route the user back to the originally-requested route after
   * they re-authenticate. Skipped when the path is already `/login`.
   */
  redirectPath?: string;
  /**
   * If false, skips the `authService.logout()` backend call and only
   * clears local state. Use for purely-local failures (e.g. expired
   * JWT we already know is dead) to avoid an unnecessary network
   * round-trip. Defaults to true.
   */
  callBackendLogout?: boolean;
}

/**
 * Fully tear down the client session and hard-navigate to `/login`.
 *
 * - Calls `authService.logout()` (best-effort; ignored on failure) so
 *   the backend invalidates the token and the auth/role cookies are
 *   wiped via the shared logout pipeline.
 * - Wipes every auth-related localStorage entry and cookie locally as
 *   a backstop (in case the backend call fails or is skipped).
 * - Uses `window.location.href` for the navigation so React state and
 *   the edge middleware both see a freshly-cleared session.
 *
 * Always returns – the navigation itself unmounts the calling
 * component, so callers should `return` immediately after awaiting
 * (or just calling) this function.
 */
export const redirectToLogin = async (
  options: RedirectToLoginOptions = {},
): Promise<void> => {
  if (typeof window === "undefined") return;

  const { redirectPath, callBackendLogout = true } = options;

  if (callBackendLogout) {
    try {
      await authService.logout();
    } catch (err) {
      console.warn(
        "[auth] backend logout failed during redirectToLogin; clearing local session anyway.",
        err,
      );
    }
  }

  // Always run the local sweep, even if `authService.logout()` succeeded
  // (it covers most of these but not the role-specific localStorage and
  // the `admin_authenticated` cookie).
  clearAllClientSessionState();

  const dest =
    redirectPath && redirectPath !== "/login"
      ? `/login?redirect=${encodeURIComponent(redirectPath)}`
      : "/login";

  // Hard navigation, not `router.push`, so the middleware sees the
  // cleared cookies on the next request.
  window.location.href = dest;
};
