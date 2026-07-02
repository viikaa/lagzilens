/**
 * Generates a simple, locally unique identifier.
 *
 * Uses `Date.now()` plus a random suffix. This avoids relying on
 * `crypto.randomUUID()`, which is unavailable in non-secure contexts
 * such as local-network development on iOS Safari/Brave.
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
