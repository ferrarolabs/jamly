/**
 * Story A4: what I play in this band.
 *
 * Instruments are free-form strings, not an enum (13-domain-model,
 * `BandMembership`). The suggestions only save typing for the common cases;
 * anything else is typed.
 */

export const INSTRUMENT_SUGGESTIONS = ['drums', 'bass', 'guitar', 'keys', 'vox'] as const;

/**
 * Trims each entry, drops empty ones, and drops duplicates ignoring case.
 *
 * The first spelling wins: "Vox" typed before "vox" stays "Vox". Order is kept,
 * because the musician put their main instrument first.
 */
export function normaliseInstruments(list: readonly string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of list) {
    const value = raw.trim();
    const key = value.toLowerCase();
    if (!value || seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }

  return result;
}

/** Whether `list` already has `instrument`, ignoring case and spaces. */
export function hasInstrument(list: readonly string[], instrument: string): boolean {
  const key = instrument.trim().toLowerCase();
  return list.some((item) => item.trim().toLowerCase() === key);
}
