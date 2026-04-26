/**
 * Firebase Email/Password sign-in requires an email address.
 * Typing "Admin" (case-insensitive) maps to this canonical account.
 * Create this user in Firebase Console → Authentication with your chosen password.
 */
export const QUINCY_ADMIN_EMAIL = "admin@quincy.school";

export function resolveLoginEmail(input: string): string {
  const t = input.trim();
  if (!t) return t;
  if (t.includes("@")) return t;
  if (t.toLowerCase() === "admin") return QUINCY_ADMIN_EMAIL;
  return t;
}
