/**
 * Sanitizes a free-text name so it can be safely used in a filename.
 *
 * Rules:
 * - Lowercase
 * - Remove whitespace
 * - Strip Hungarian diacritics/accents via Unicode decomposition
 * - Remove everything except alphanumeric characters
 * - Cap length to avoid overly long filenames
 */
export function sanitizeName(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 30);
}
