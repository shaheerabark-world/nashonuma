// Mother's "Check my child": Ten Questions Screen, questionnaire routing, MORBAS quick items.
// Port of the data/logic part of modules/05-parent-check-my-child.js.
import D from './data/parent.json';
import Q from '@/i18n/questionnaires.json';
import { getLang } from '@/i18n/lang';
import { MB_STAR, MB_TODAY, mbAgeM, mbStart } from './morbas';

export type Instr = 'morbas' | 'tq' | 'sdq';
export type Country = 'PK' | 'MN';
export interface Kid { id?: string; name?: string; dob: string; sex?: string; country?: Country | string; [k: string]: unknown }
export interface TqItem { n: number; q?: string; pos?: 'y' | 'n'; q2?: string; pos2?: 'y' | 'n'; q3?: string; pos3?: 'y' | 'n' }

export const P_L = { ...(D.P_L as Record<string, Record<string, any>>), ur: Q.P_L_ur as Record<string, any> };
export const P_CONCERNS = D.P_CONCERNS as [string, string, string][];
export const P_CONCERNS_UR = Q.P_CONCERNS_UR as Record<string, string>;
export const P_MOTHER = D.P_MOTHER as { name: string; phone: string; kids: string[] };
/** Ten Questions Screen (Durkin et al. 1995; Mirza et al., JPPS 2008). Ages 2–9. Any one positive answer = screen positive. */
export const TQ = D.TQ as TqItem[];
export const TQ_TR = Q.TQ_TR as Record<string, Record<string, TqItem>>;
/** MORBAS areas a mother answers (self-care and ★ items are left for the clinic visit) */
export const P_AREAS: number[] = D.P_AREAS;

/** Question text; item 9 has a different wording under 3 years. */
export const tqQ = (it: TqItem, m: number, lang?: string): string | undefined => {
  const t = (lang && TQ_TR[lang] && TQ_TR[lang][it.n]) || it;
  return it.n === 9 ? (m < 36 ? t.q2 : t.q3) : t.q;
};
/** The answer that counts as positive for this item. */
export const tqPos = (it: TqItem, m: number) => (it.n === 9 ? (m < 36 ? it.pos2 : it.pos3) : it.pos);
/** Item numbers answered positively. */
export const tqPositives = (ans: Record<string, unknown>, m: number): number[] =>
  TQ.filter(it => ans['tq-' + it.n] && ans['tq-' + it.n] === tqPos(it, m)).map(it => it.n);

export const pAge = (a: number, L: Record<string, any>) => (a >= 36 ? Math.floor(a / 12) + ' ' + (L.years || 'years') : Math.floor(a) + ' ' + L.months);

/**
 * Which questionnaire a child gets (keep exactly):
 * | Child        | Pakistan                 | Mongolia                     |
 * | under 2      | MORBAS                   | MORBAS (up to 42 months)     |
 * | 2–9          | Ten Questions            | MORBAS to 42 months, then SDQ|
 * | 10–17        | SDQ                      | SDQ                          |
 */
export const pInstr = (k?: Kid | null): Instr => {
  if (!k) return 'morbas';
  const m = mbAgeM(k.dob, MB_TODAY) ?? 0;
  if ((k.country || 'PK') === 'MN') return m >= 42 ? 'sdq' : 'morbas';
  return m >= 120 ? 'sdq' : m >= 24 ? 'tq' : 'morbas';
};

/** One MORBAS item per answered area at the child's start item, skipping ★ items. Index = area 0..6. */
export const pItems = (S: number): number[][] => {
  const out: number[][] = Array.from({ length: 7 }, () => []);
  P_AREAS.forEach(d => {
    let n = S;
    while (n >= 1 && MB_STAR[d + 1 + '-' + n]) n--;
    if (n < 1) {
      n = S;
      while (n <= 23 && MB_STAR[d + 1 + '-' + n]) n++;
    }
    out[d] = [n];
  });
  return out;
};

export const pMockAns = (dob: string, date: string, weak: number[]) => {
  const S = mbStart(mbAgeM(dob, date))!;
  const ans: Record<string, 'y' | 'n'> = {};
  pItems(S).forEach((a, d) => a.forEach(n => { ans[d + '-' + n] = weak.includes(d) ? 'n' : 'y'; }));
  return ans;
};

export const pNewFlow = () => ({
  step: 1, phone: '', sent: false, otp: '', kid: '', adding: false,
  nk: { name: '', dob: '', sex: '' }, extra: [] as Kid[], area: 0, ans: {} as Record<string, unknown>,
  concerns: [] as string[], note: '', worry: null as number | null, consent: false, done: null as unknown, lang: getLang() as string
});
