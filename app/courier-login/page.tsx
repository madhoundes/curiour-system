import { redirect } from "next/navigation";

/**
 * The dedicated courier login page has been folded into the unified
 * `/login` flow – couriers/drivers now sign in through the same form
 * and are routed to `/courier` on success.
 *
 * This route is kept as a permanent server-side redirect so that old
 * bookmarks, deep links from the courier middleware bounce, and the
 * Expo client's web fallback continue to work. Query string params
 * (notably `?redirect=…`) are preserved so the unified login page can
 * honor a deep-link target after a successful sign-in.
 */
export default function CourierLoginPage({
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
