// View-model building blocks shared by every page (port of the helpers at the top of
// renderVals() in logic.js). They return plain objects the AppView template binds to.
import type { Tone } from '@/domain/morbas';

export type { Tone };

/** [background, text, dot] per tone */
export const T: Record<Tone, [string, string, string]> = {
  success: ['#DCFCE7', '#15803D', '#16A34A'],
  warning: ['#FEF3C7', '#B45309', '#D97706'],
  error: ['#FEE2E2', '#B91C1C', '#DC2626'],
  info: ['#DBEAFE', '#1D4ED8', '#2563EB'],
  neutral: ['#F1F5F9', '#475569', '#94A3B8']
};

export interface Badge { bg: string; fg: string; dot: string; label: string; icon: string; hasIcon: boolean; noIcon: boolean }
export const badge = (tone: Tone, label: string, icon?: string): Badge => ({
  bg: T[tone][0], fg: T[tone][1], dot: T[tone][2], label, icon: icon || '', hasIcon: !!icon, noIcon: !icon
});

export const BAND: Record<string, Badge> = {
  High: badge('error', 'High', 'flag'),
  Medium: badge('warning', 'Medium', 'triangle-alert'),
  Low: badge('success', 'Low', 'circle-check')
};

/** A table cell. Exactly one of the is* flags is true. */
export interface Cell {
  isPerson: boolean; isText: boolean; isMono: boolean; isBadge: boolean; isBtn: boolean; isChev: boolean; isBar: boolean;
  jc: string; b: Badge; [k: string]: any;
}
const base = (): Cell => ({ isPerson: false, isText: false, isMono: false, isBadge: false, isBtn: false, isChev: false, isBar: false, jc: 'flex-start', b: badge('neutral', '') });

export const C = {
  person: (t: string, sub: string): Cell => ({
    ...base(), isPerson: true, t, sub,
    ini: t.replace('Dr ', '').split(' ').map(w => w[0]).slice(0, 2).join('')
  }),
  text: (t: string | number, sub?: string, o?: { fw?: number; color?: string } | null): Cell => ({
    ...base(), isText: true, t: String(t), sub: sub || '', hasSub: !!sub, fw: (o && o.fw) || 400, color: (o && o.color) || '#334155'
  }),
  mono: (t: string): Cell => ({ ...base(), isMono: true, t }),
  badge: (b: Badge, end?: boolean): Cell => ({ ...base(), isBadge: true, b, jc: end ? 'flex-end' : 'flex-start' }),
  btn: (label: string, icon: string, fn: () => void, kind?: string): Cell => ({
    ...base(), isBtn: true, label, icon, cls: 'btn btn-' + (kind || 'secondary'), jc: 'flex-end',
    onClick: (e: { stopPropagation(): void }) => { e.stopPropagation(); fn(); }
  }),
  chev: (): Cell => ({ ...base(), isChev: true, jc: 'flex-end' }),
  bar: (t: string | number, pct: number): Cell => ({ ...base(), isBar: true, t: String(t), w: pct + '%' })
};

export interface Kpi { label: string; v: string; note: string; icon: string; ibg: string; ifg: string; nc: string }
export const kpi = (label: string, v: string, note: string, tone: Tone, icon: string, noteTone?: Tone): Kpi => ({
  label, v, note, icon, ibg: T[tone][0], ifg: T[tone][1], nc: noteTone ? T[noteTone][1] : '#64748B'
});

export interface Action { label: string; icon: string; onClick: () => void; cls: string; disabled: boolean }
export const act = (label: string, icon: string, fn: () => void, kind?: string, disabled?: boolean): Action => ({
  label, icon, onClick: fn, cls: 'btn btn-' + (kind || 'secondary'), disabled: !!disabled
});
