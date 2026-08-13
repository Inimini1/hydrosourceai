/**
 * Server-side password strength policy.
 *
 * Mirrors the rules shown to the user in app/(auth)/signup/page.tsx's
 * PW_RULES array. That list is UI-only (client JS can be bypassed by
 * calling the API directly), so this is the actual enforcement point.
 */
const RULES: { label: string; test: (p: string) => boolean }[] = [
  { label: 'be at least 8 characters',        test: (p) => p.length >= 8 },
  { label: 'include an uppercase letter',     test: (p) => /[A-Z]/.test(p) },
  { label: 'include a lowercase letter',      test: (p) => /[a-z]/.test(p) },
  { label: 'include a number',                test: (p) => /[0-9]/.test(p) },
  { label: 'include a special character',     test: (p) => /[^A-Za-z0-9]/.test(p) },
]

/** Returns an error message if the password fails any rule, or null if it passes all of them. */
export function validatePasswordStrength(password: string): string | null {
  const failed = RULES.find((r) => !r.test(password))
  return failed ? `Password must ${failed.label}.` : null
}
