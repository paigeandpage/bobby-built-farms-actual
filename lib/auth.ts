/**
 * Temporary authentication compatibility layer for the ownership takeover.
 * The previous Clerk application is not available to the new owner.
 * Public pages and guest checkout therefore operate without a user session.
 * Replace this module when the new authentication system is selected.
 */
export async function auth() {
  return { userId: null as string | null };
}

export async function currentUser() {
  return null;
}
