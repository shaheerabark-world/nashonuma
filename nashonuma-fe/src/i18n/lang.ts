// Language system: English / Mongolian / Urdu (RTL).
// Port of modules/01-i18n.js. English UI strings are the keys; numbers inside a
// string are matched as "#" (e.g. "3 children waiting" -> "# children waiting").
import MN from './mn.json';
import UR from './ur.json';

export type Lang = 'en' | 'mn' | 'ur';

const I18N_MN = MN as Record<string, string>;
const I18N_UR = UR as Record<string, string>;
const MONTH_UR: Record<string, string> = { Jan: 'جنوری', Feb: 'فروری', Mar: 'مارچ', Apr: 'اپریل', May: 'مئی', Jun: 'جون', Jul: 'جولائی', Aug: 'اگست', Sep: 'ستمبر', Oct: 'اکتوبر', Nov: 'نومبر', Dec: 'دسمبر' };
const MONTH_MN: Record<string, string> = { Jan: '1-р сар', Feb: '2-р сар', Mar: '3-р сар', Apr: '4-р сар', May: '5-р сар', Jun: '6-р сар', Jul: '7-р сар', Aug: '8-р сар', Sep: '9-р сар', Oct: '10-р сар', Nov: '11-р сар', Dec: '12-р сар' };

function readStored(): Lang {
  try {
    const v = localStorage.getItem('nn_lang');
    return v === 'mn' || v === 'ur' ? v : 'en';
  } catch {
    return 'en';
  }
}

// Kept on globalThis on purpose: element creation (see jsx-runtime.ts) must translate synchronously,
// and Vite's dev server pre-bundles the JSX runtime with its own copy of this module. A shared
// singleton keeps every copy on the same language.
type LangState = { lang: Lang; listeners: Set<() => void> };
const G = globalThis as typeof globalThis & { __nnLang?: LangState };
const S: LangState = (G.__nnLang ??= { lang: typeof window === 'undefined' ? 'en' : readStored(), listeners: new Set() });
const listeners = S.listeners;

export const getLang = (): Lang => S.lang;

function applyToDocument(l: Lang) {
  if (typeof document === 'undefined') return;
  const el = document.documentElement;
  el.setAttribute('data-lang', l);
  el.dir = l === 'ur' ? 'rtl' : 'ltr';
  el.lang = l;
}
applyToDocument(S.lang);

export function setLang(l: string) {
  S.lang = l === 'mn' || l === 'ur' ? l : 'en';
  applyToDocument(S.lang);
  try {
    localStorage.setItem('nn_lang', S.lang);
  } catch {
    /* storage blocked */
  }
  listeners.forEach(fn => fn());
}

export function subscribeLang(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function trPart(t: string): string {
  if (/^[A-Z]{1,3}$/.test(t)) return t;
  const nums = t.match(/\d+/g) || [];
  const dict = S.lang === 'ur' ? I18N_UR : I18N_MN;
  const v = dict[t.replace(/\d+/g, '#')];
  let out = t;
  if (v != null) {
    let i = 0;
    out = v.replace(/#/g, () => (i < nums.length ? nums[i++] : '#'));
  }
  if (v == null && S.lang === 'mn') out = out.replace(/^Table (\d+): /, 'Хүснэгт $1: ').replace(/^Score /, 'Оноо ');
  return out.replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/g, m => (S.lang === 'ur' ? MONTH_UR : MONTH_MN)[m]);
}

/** Translate an English UI string into the current language (no-op for English). */
export function tr<T>(s: T): T {
  if (S.lang === 'en' || typeof s !== 'string' || !/[A-Za-z]/.test(s)) return s;
  const m = s.match(/^(\s*)([\s\S]*?)(\s*)$/)!;
  return (m[1] + m[2].split(' · ').map(trPart).join(' · ') + m[3]) as T;
}
