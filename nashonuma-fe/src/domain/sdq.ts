// SDQ (Strengths and Difficulties Questionnaire) scoring for older children and teenagers.
// 25 items, 5 scales of 5, answers 0/1/2, items 7, 11, 14, 21 and 25 reverse-scored.
// ITEM WORDING IS NOT SHIPPED: SDQ text is copyright (Youthinmind). An admin pastes the licensed
// wording (Admin > Instruments > SDQ); it is stored in config/sdq. Until then items show a neutral topic.
import D from './data/sdq.json';
import type { Tone } from './morbas';

export interface SdqScale { k: 'emo' | 'con' | 'hyp' | 'peer' | 'pro'; en: string; ur: string; mn: string; items: number[] }
export interface SdqConfig { items?: Record<string, string[]>; [k: string]: unknown }
export type SdqAnswers = Record<string, number | null | undefined>;
export type SdqScores = Record<SdqScale['k'] | 'total', number>;

export const SDQ_SCALES = D.SDQ_SCALES as SdqScale[];
export const SDQ_REV: number[] = D.SDQ_REV;
export const SDQ_TOPIC: Record<string, string> = D.SDQ_TOPIC;
export const SDQ_OPTS: Record<string, string[]> = D.SDQ_OPTS;

/** Licensed item text for item n (1-based), or null when no licence text is loaded. */
export const sdqText = (n: number, lang: string, cfg?: SdqConfig | null): string | null => {
  const t = cfg && cfg.items && (cfg.items[lang] || cfg.items.en);
  return (t && t[n - 1]) || null;
};

export const sdqPts = (n: number, v: number | null | undefined): number | null => (v == null ? null : SDQ_REV.includes(n) ? 2 - v : v);

export const sdqScore = (ans: SdqAnswers): SdqScores => {
  const s = {} as SdqScores;
  SDQ_SCALES.forEach(sc => {
    s[sc.k] = sc.items.reduce((a, n) => a + (sdqPts(n, ans['sdq-' + n]) || 0), 0);
  });
  s.total = s.emo + s.con + s.hyp + s.peer;
  return s;
};

/** Parent-report four-band categories for total difficulties (0–40). */
export const sdqBand = (t: number): { tone: Tone; label: string } =>
  t >= 20 ? { tone: 'error', label: 'Very high' } : t >= 17 ? { tone: 'error', label: 'High' } : t >= 14 ? { tone: 'warning', label: 'Slightly raised' } : { tone: 'success', label: 'Close to average' };
