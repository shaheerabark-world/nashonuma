// WHO Self-Reporting Questionnaire (SRQ-20) for mothers after birth.
// 20 yes/no items about the past 30 days; score = number of "yes".
// Cut-off for Pakistan postnatal screening 9/10 (Rahman et al., JPPS 2005). Item 17 "yes" = same-day contact.
import D from './data/srq20.json';
import Q from '@/i18n/questionnaires.json';
import { getLang } from '@/i18n/lang';
import type { Tone } from './morbas';

export type YesNo = 0 | 1 | null;
export type HelpKey = 'call' | 'visit' | 'fine';

export const SRQ: string[] = D.SRQ;
export const SRQ_CUT = D.SRQ_CUT; // 10
export const SRQ_MID = D.SRQ_MID; // 8
export const W_HELP: Record<HelpKey, string> = D.W_HELP as Record<HelpKey, string>;
const SRQ_TR = Q.SRQ_TR as Record<string, string[]>;
const W_HELP_TR = Q.W_HELP_TR as Record<string, Record<string, string>>;

/** Question text in the current language (falls back to English). */
export const srqQ = (i: number): string => (SRQ_TR[getLang()] || SRQ)[i] || SRQ[i];
export const wHelp = (k: string): string => (W_HELP_TR[getLang()] || {})[k] || W_HELP[k as HelpKey];

export const wTotal = (a: YesNo[]): number => a.reduce<number>((n, v) => n + (v === 1 ? 1 : 0), 0);

export interface WBand { k: 'urgent' | 'high' | 'mid' | 'low'; tone: Tone; label: string; act: string }
export const wBand = (a: YesNo[]): WBand =>
  a[16] === 1
    ? { k: 'urgent', tone: 'error', label: 'Urgent · thoughts of ending life', act: 'Call her today' }
    : wTotal(a) >= SRQ_CUT
      ? { k: 'high', tone: 'error', label: 'Likely depression', act: 'Clinical assessment this week' }
      : wTotal(a) >= SRQ_MID
        ? { k: 'mid', tone: 'warning', label: 'Some signs', act: 'Follow-up call, repeat in 2 weeks' }
        : { k: 'low', tone: 'success', label: 'No signs now', act: 'Repeat at 6–8 weeks' };

/** Answers with "yes" at the given 1-based item numbers. */
export const wYes = (idx: number[]): YesNo[] => Array.from({ length: 20 }, (_, i) => (idx.includes(i + 1) ? 1 : 0));

export const wNew = () => ({ step: 1, baby: '', q: 0, ans: Array<YesNo>(20).fill(null), help: null as HelpKey | null, consent: false, done: null as unknown });
