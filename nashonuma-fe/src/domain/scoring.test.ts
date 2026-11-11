import { describe, expect, it } from 'vitest';
import { mbAgeM, mbCmp, mbGuide, mbScore, mbStart, type Mark } from './morbas';
import { wBand, wTotal, wYes } from './srq20';
import { sdqBand, sdqPts, sdqScore } from './sdq';
import { pInstr, tqPositives } from './parent';

describe('SRQ-20 (mother wellbeing)', () => {
  it('scores the number of yes answers', () => {
    expect(wTotal(wYes([1, 2, 3]))).toBe(3);
  });
  it('cut-off 10 or more = likely depression', () => {
    expect(wBand(wYes([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])).k).toBe('high');
    expect(wBand(wYes([1, 2, 3, 4, 5, 6, 7, 8, 9])).k).toBe('mid');
  });
  it('8–9 = some signs, under 8 = no signs', () => {
    expect(wBand(wYes([1, 2, 3, 4, 5, 6, 7, 8])).k).toBe('mid');
    expect(wBand(wYes([1, 2, 3, 4, 5, 6, 7])).k).toBe('low');
  });
  it('item 17 yes is urgent, whatever the total', () => {
    const b = wBand(wYes([17]));
    expect(b.k).toBe('urgent');
    expect(b.tone).toBe('error');
    expect(b.act).toBe('Call her today');
  });
});

describe('SDQ', () => {
  it('reverse-scores items 7, 11, 14, 21 and 25', () => {
    for (const n of [7, 11, 14, 21, 25]) expect(sdqPts(n, 0)).toBe(2);
    expect(sdqPts(1, 0)).toBe(0);
    expect(sdqPts(3, null)).toBeNull();
  });
  it('total difficulties excludes the prosocial scale', () => {
    const ans: Record<string, number> = {};
    for (let n = 1; n <= 25; n++) ans['sdq-' + n] = 2;
    const s = sdqScore(ans);
    // every non-reversed item scores 2; reversed items (in hyp, con, peer) score 0
    expect(s.emo).toBe(10);
    expect(s.pro).toBe(10);
    expect(s.total).toBe(s.emo + s.con + s.hyp + s.peer);
  });
  it('bands', () => {
    expect(sdqBand(13).label).toBe('Close to average');
    expect(sdqBand(14).label).toBe('Slightly raised');
    expect(sdqBand(17).label).toBe('High');
    expect(sdqBand(20).label).toBe('Very high');
  });
});

describe('Ten Questions', () => {
  it('counts positives, with item 9 depending on age', () => {
    const ans = { 'tq-1': 'y', 'tq-4': 'n', 'tq-9': 'n', 'tq-2': 'n' };
    expect(tqPositives(ans, 30)).toEqual([1, 4, 9]); // under 3: item 9 positive = "n"
    expect(tqPositives(ans, 40)).toEqual([1, 4]); // 3+: item 9 positive = "y"
  });
});

describe('Questionnaire routing (MB_TODAY = 2026-11-06)', () => {
  const dobForMonths = (m: number) => {
    const d = new Date('2026-11-06T00:00:00Z');
    d.setUTCDate(d.getUTCDate() - Math.round(m * 30.4375) - 2);
    return d.toISOString().slice(0, 10);
  };
  it('Pakistan: under 2 MORBAS, 2–9 Ten Questions, 10+ SDQ', () => {
    expect(pInstr({ dob: dobForMonths(12), country: 'PK' })).toBe('morbas');
    expect(pInstr({ dob: dobForMonths(30) })).toBe('tq');
    expect(pInstr({ dob: dobForMonths(119) })).toBe('tq');
    expect(pInstr({ dob: dobForMonths(121) })).toBe('sdq');
  });
  it('Mongolia: MORBAS up to 42 months, then SDQ', () => {
    expect(pInstr({ dob: dobForMonths(41), country: 'MN' })).toBe('morbas');
    expect(pInstr({ dob: dobForMonths(43), country: 'MN' })).toBe('sdq');
  });
  it('no child = MORBAS', () => expect(pInstr(null)).toBe('morbas'));
});

describe('MORBAS', () => {
  it('start item from Table 2', () => {
    expect(mbStart(0.5)).toBe(1);
    expect(mbStart(11.9)).toBe(12);
    expect(mbStart(12)).toBe(13);
    expect(mbStart(39)).toBe(22);
    expect(mbStart(41)).toBe(23);
    expect(mbStart(null)).toBeNull();
  });
  it('score = first ○ index + number of ○', () => {
    const m: Mark[] = Array(23).fill(null);
    expect(mbScore(m)).toBe(0);
    m[4] = 'o'; m[5] = 'o'; m[6] = 'x';
    expect(mbScore(m)).toBe(6);
  });
  it('compares score with the start band', () => {
    expect(mbCmp(10, 10).label).toBe('At age band');
    expect(mbCmp(9, 10).label).toBe('1 band below');
    expect(mbCmp(8, 10).label).toBe('2 bands below');
    expect(mbCmp(7, 10).tone).toBe('error');
  });
  it('guides through five items up and down', () => {
    expect(mbGuide([], null).txt).toBe('Enter date of birth');
    expect(mbGuide([], 10)).toMatchObject({ done: false, txt: '10 left in range', next: 5 });
  });
  it('age in months', () => {
    expect(mbAgeM('2026-01-01', null)).toBeNull();
    expect(Math.round(mbAgeM('2025-11-06', '2026-11-06')!)).toBe(12);
  });
});
