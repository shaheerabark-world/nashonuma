// MORBAS (Mongolian Rapid Baby Scale): 23 items x 7 areas, Table 2 age conversion, scoring.
// Port of modules/03-morbas-data.js. Data lives in ./data/morbas.json (generated from the prototype).
import D from './data/morbas.json';

export type Mark = 'o' | 'x' | null | undefined;
export type Tone = 'success' | 'warning' | 'error' | 'info' | 'neutral';
export interface StarItem { fig: string; en: string; mn: string }

export const MB_TODAY: string = D.MB_TODAY;
export const MB_DOM: { en: string[]; mn: string[] } = D.MB_DOM;
export const MB_SHORT: string[] = D.MB_SHORT;
/** rows = item 1..23, columns = the 7 areas */
export const MB_ROWS: { en: string[][]; mn: string[][] } = D.MB_ROWS;
/** ★ items, key = "area-item" (1-based) */
export const MB_STAR: Record<string, StarItem> = D.MB_STAR;
export const MB_AGE: { en: string[]; mn: string[] } = D.MB_AGE;
export const MB_LO: number[] = D.MB_LO;
export const MB_HI: number[] = D.MB_HI;
export const MB_RULES: { en: string[]; mn: string[] } = D.MB_RULES;

/** Age in months (30.4375-day months), or null if a date is missing. */
export const mbAgeM = (dob?: string | null, date?: string | null): number | null =>
  !dob || !date ? null : Math.max(0, (new Date(date).getTime() - new Date(dob).getTime()) / 86400000 / 30.4375);

/** Table 2: the item to start at for a child's age in months. */
export const mbStart = (m: number | null): number | null => {
  if (m == null) return null;
  const f = Math.floor(m);
  if (f < 12) return f + 1;
  const T = [[14, 13], [16, 14], [18, 15], [21, 16], [24, 17], [27, 18], [30, 19], [33, 20], [36, 21], [40, 22]];
  for (const [u, s] of T) if (f < u) return s;
  return 23;
};

/** Area score = index of the first ○ + number of ○ marks (0 if none). */
export const mbScore = (marks: Mark[]): number => {
  const first = marks.indexOf('o');
  if (first < 0) return 0;
  return first + marks.filter(x => x === 'o').length;
};

/** Synthetic marks for a known score (used for mock history). */
export const mbSynth = (s: number): Mark[] => Array.from({ length: 23 }, (_, i) => (i < s ? 'o' : i < s + 3 ? 'x' : null));

export const mbCmp = (score: number, start: number | null): { tone: Tone; label: string; d: number } => {
  if (!score || !start) return { tone: 'neutral', label: 'Not scored', d: 0 };
  const d = score - start;
  return d >= 0
    ? { tone: 'success', label: 'At age band', d }
    : d >= -2
      ? { tone: 'warning', label: -d + ' band' + (d === -1 ? '' : 's') + ' below', d }
      : { tone: 'error', label: -d + ' bands below', d };
};

/** Form rules: five items up and down from the start item, then the continuation rules. */
export const mbGuide = (marks: Mark[], S: number | null): { done: boolean; txt: string; next?: number } => {
  if (!S) return { done: false, txt: 'Enter date of birth' };
  const up: number[] = [], down: number[] = [];
  for (let n = S - 5; n < S; n++) if (n >= 1) up.push(n);
  for (let n = S; n < S + 5; n++) if (n <= 23) down.push(n);
  const left = up.concat(down).filter(n => !marks[n - 1]).length;
  if (left) return { done: false, txt: left + ' left in range', next: up.concat(down).find(n => !marks[n - 1]) };
  if (down.every(n => marks[n - 1] === 'o')) {
    let n = S + 5;
    while (n <= 23 && marks[n - 1] === 'o') n++;
    if (n <= 23 && marks[n - 1] !== 'x') return { done: false, txt: 'Continue down to item ' + n, next: n };
  }
  if (up.length && up.filter(n => marks[n - 1] === 'o').length <= 1) {
    let n = S - 6;
    while (n >= 1 && marks[n - 1] === 'x') n--;
    if (n >= 1 && marks[n - 1] !== 'o') return { done: false, txt: 'Continue up to item ' + n, next: n };
  }
  return { done: true, txt: 'Complete' };
};

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const mbDate = (d?: string | null): string => {
  if (!d) return '—';
  const x = new Date(d);
  return x.getDate() + ' ' + MON[x.getMonth()] + ' ' + x.getFullYear();
};

export const mbAgeTxt = (m: number | null): string =>
  m == null ? '—' : Math.floor(m) < 1 ? Math.round(m * 30.4) + ' days' : Math.floor(m) >= 36 ? Math.floor(m / 12) + ' years' : Math.floor(m) + ' months';
