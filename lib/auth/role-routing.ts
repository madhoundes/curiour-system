/**
 * Role-based routing helpers shared by the Next.js middleware, the
 * `/login` page, and any page-level role guards.
 *
 * Keeping these in one module means the edge middleware and the
 * client UI can never disagree about where a given role belongs, which
 * is what caused drivers to occasionally land on the merchant
 * dashboard (the middleware would unconditionally send authenticated
 * visitors to `/dashboard` because it had no role information).
 */

export type AuthRole = 'user' | 'driver' | 'courier' | 'admin';

const KNOWN_ROLES: readonly AuthRole[] = ['user', 'driver', 'courier', 'admin'];

export const isAuthRole = (value: string | null | undefined): value is AuthRole => {
  return !!value && (KNOWN_ROLES as readonly string[]).includes(value);
};

/**
 * Cookie name used to communicate the authenticated user's role
 * between the login page (which sets it) and the edge middleware
 * (which reads it). Not security-sensitive: it only affects routing.
 * Authorization on the API is still enforced server-side from the JWT.
 */
export const ROLE_COOKIE_NAME = 'user_role';

/**
 * Map an authenticated user's role to the landing page they should
 * see after login (or when they revisit `/login` while still
 * authenticated).
 *
 * Merchants (`'user'` on the backend) keep the legacy `/dashboard`
 * landing for backwards compatibility with existing links.
 */
export const landingPathForRole = (role: AuthRole | undefined): string => {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'driver':
    case 'courier':
      return '/courier';
    case 'user':
    default:
      return '/dashboard';
  }
};

/**
 * Section-level access rules. Each entry lists the roles that may
 * enter the section. Sections not listed here are open to any
 * authenticated role (e.g. `/profile`, `/support`, `/notifications`).
 *
 * Matching is exact-or-trailing-slash, so `/admin` matches `/admin`
 * and `/admin/users` but not `/admin-login`.
 */
const SECTION_ACCESS: ReadonlyArray<{
  prefix: string;
  allowed: ReadonlyArray<AuthRole>;
}> = [
  { prefix: '/admin', allowed: ['admin'] },
  { prefix: '/courier', allowed: ['driver', 'courier', 'admin'] },
  { prefix: '/dashboard', allowed: ['user'] },
];

const matchesSection = (pathname: string, prefix: string): boolean =>
  pathname === prefix || pathname.startsWith(prefix + '/');

/**
 * Returns true if the given path is inside a section the role is
 * allowed to access, or the path is not in any restricted section.
 *
 * Used by the middleware to keep wrong-role users out of role-locked
 * sections, and by the login page to ignore `?redirect=` params that
 * would land the user somewhere their role can't go.
 */
export const isPathAllowedForRole = (
  pathname: string,
  role: AuthRole | undefined,
): boolean => {
  for (const { prefix, allowed } of SECTION_ACCESS) {
    if (matchesSection(pathname, prefix)) {
      return !!role && (allowed as readonly string[]).includes(role);
    }
  }
  return true;
};
