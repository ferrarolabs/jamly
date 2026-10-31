/**
 * Story A4. What gets saved is what the roster shows, so a stray space or a
 * second "Vox" would be on screen for the whole band.
 */

import { hasInstrument, normaliseInstruments } from '../instruments';

describe('normaliseInstruments', () => {
  it('trims, and drops empty entries', () => {
    expect(normaliseInstruments(['  drums ', '', '   ', 'vox'])).toEqual(['drums', 'vox']);
  });

  it('drops duplicates ignoring case, keeping the first spelling and the order', () => {
    expect(normaliseInstruments(['Vox', 'drums', 'vox', ' VOX ', 'Drums'])).toEqual([
      'Vox',
      'drums',
    ]);
  });

  it('keeps an empty list empty — it is valid, and the default', () => {
    expect(normaliseInstruments([])).toEqual([]);
  });

  it('keeps what nobody anticipated', () => {
    expect(normaliseInstruments(['occasional harmonica'])).toEqual(['occasional harmonica']);
  });
});

describe('hasInstrument', () => {
  it('ignores case and spaces', () => {
    expect(hasInstrument(['Drums'], ' drums')).toBe(true);
    expect(hasInstrument(['drums'], 'bass')).toBe(false);
  });
});
