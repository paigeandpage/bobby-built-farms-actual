import { currentUser } from "@/lib/auth";

/**
 * Returns the lowercased list of admin emails configured in env.
 * Allows comma-separated values, e.g.
 *   ADMIN_EMAILS=bobbybuiltfarms@gmail.com,riley@example.com
 */
function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Returns true if the given email is in the admin allowlist.
 * Email comparison is case-insensitive.
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}

/**
 * Server-side guard: returns the Clerk user object if they're signed in
 * and their primary email is on the admin allowlist; returns null
 * otherwise. Use this from server components / server actions to gate
 * admin functionality.
 */
export async function requireAdmin() {
  const user = await currentUser();
  if (!user) return null;
  const email = user.emailAddresses[0]?.emailAddress;
  if (!isAdminEmail(email)) return null;
  return user;
}
