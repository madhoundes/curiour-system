import { redirect } from "next/navigation";

/**
 * The dedicated admin login page has been folded into the unified
 * `/login` flow – administrators and merchants now sign in through the
 * same form and are routed to their role-appropriate landing page on
 * success.
 *
 * This route is kept as a permanent server-side redirect so that old
 * bookmarks (`/admin-login`), external links, and the various places
 * inside the app that still link here continue to work. Query string
 * params (e.g. `?redirect=/admin/users`) are preserved so the unified
 * login page can honor a deep-link target after a successful sign-in.
 */
export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string") {
      params.append(key, value);
    } else if (Array.isArray(value)) {
      for (const v of value) params.append(key, v);
    }
  }
  const qs = params.toString();
  redirect(qs ? `/login?${qs}` : "/login");
}
