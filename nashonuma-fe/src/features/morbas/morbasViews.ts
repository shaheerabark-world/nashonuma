// @ts-nocheck -- ported as-is from nashonuma-code/source/modules/04-morbas-views.js by scripts/port-modules.mjs.
// Same markup and inline styles as the prototype; type it by hand when you next change it.
/* eslint-disable */
import { MB_TODAY, MB_DOM, MB_SHORT, MB_ROWS, MB_STAR, MB_AGE, MB_LO, MB_HI, MB_RULES, mbAgeM, mbStart, mbScore, mbCmp, mbGuide, mbDate, mbAgeTxt } from '@/domain/morbas';
import MB_KIDS0 from '@/data/mock/children.json';
import { XCFG, XCard } from '../exercises/exercises';
import { h } from '@/i18n/h';
import { getLang } from '@/i18n/lang';
import { reportsStore } from '@/store';
import { session } from '@/api/http';

/** The signed-in clinician (API mode), or the prototype's demo clinician. */
const currentUserName = () => session.user()?.name || 'Dr Sana Iqbal';

// ---------- MORBAS views (rendered with React; dropped into the page via {{ mb.view }}) ----------
export const mbH = h;
export const MB_INK = { h: '#172B4D', t: '#334155', m: '#64748B', f: '#94A3B8', b: '#E2E8F0', s: '#F8FAFC', p: '#2563EB', pd: '#1D4ED8', pl: '#DBEAFE', pxl: '#EFF6FF' };
export const MB_TONE = { success: ['#DCFCE7', '#15803D', 'circle-check'], warning: ['#FEF3C7', '#B45309', 'triangle-alert'], error: ['#FEE2E2', '#B91C1C', 'flag'], info: ['#DBEAFE', '#1D4ED8', 'info'], neutral: ['#F1F5F9', '#475569', ''] };
export const mbCard = (kids, st2) => mbH('div', { style: Object.assign({ padding: 24, border: '1px solid ' + MB_INK.b, borderRadius: 12, background: '#FFFFFF', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }, st2 || {}) }, ...[].concat(kids));
export const mbTitle = (t, sub) => mbH('div', { style: { display: 'flex', flexDirection: 'column', gap: 2 } }, mbH('div', { style: { fontSize: 16, fontWeight: 600, color: MB_INK.h } }, t), sub ? mbH('div', { style: { fontSize: 13, color: MB_INK.m } }, sub) : null);
export const mbIcon = (name, size, style) => mbH('n-icon', { name, size: String(size || 16), style });
export const mbPill = (tone, label, noIcon) => { const c = MB_TONE[tone]; return mbH('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 6, height: 24, padding: '0 10px', borderRadius: 9999, background: c[0], color: c[1], fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' } }, c[2] && !noIcon ? mbIcon(c[2], 13) : mbH('span', { style: { width: 6, height: 6, borderRadius: '50%', background: c[1] } }), label); };
export const mbStarTag = (onClick, open) => mbH('button', { onClick, title: 'How to test this item', style: { display: 'inline-flex', alignItems: 'center', gap: 4, height: 22, padding: '0 8px', borderRadius: 9999, border: '1px solid ' + (open ? MB_INK.p : '#FDE68A'), background: open ? MB_INK.pxl : '#FFFBEB', color: open ? MB_INK.pd : '#B45309', fontSize: 12, fontWeight: 600, cursor: 'pointer', font: 'inherit', fontSize: 12 } }, '★ Exercise');
export const mbSeg = (val, opts, onPick) => mbH('div', { role: 'radiogroup', style: { display: 'inline-flex', padding: 3, borderRadius: 10, background: '#F1F5F9', border: '1px solid ' + MB_INK.b, gap: 2 } }, ...opts.map(([k, l]) => mbH('button', { key: k, role: 'radio', 'aria-checked': val === k, onClick: () => onPick(k), style: { height: 32, padding: '0 14px', borderRadius: 7, border: 0, cursor: 'pointer', font: 'inherit', fontSize: 13, fontWeight: 600, background: val === k ? '#FFFFFF' : 'transparent', color: val === k ? MB_INK.pd : MB_INK.m, boxShadow: val === k ? 'var(--shadow-sm)' : 'none' } }, l)));

// Demonstration pictures for ★ items (simple line drawings, after page 2 of the form)
export const mbFig = kind => {
  const S = { fill: 'none', stroke: '#334155', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const svg = (w, kids) => mbH('svg', { width: w, height: 64, viewBox: '0 0 ' + w + ' 64', style: { display: 'block' }, 'aria-hidden': true }, ...kids);
  const person = (x, s) => [mbH('circle', Object.assign({ key: 'h' + x, cx: x, cy: 14 * s + (1 - s) * 40, r: 7 * s }, S)), mbH('path', Object.assign({ key: 'b' + x, d: 'M' + x + ' ' + (21 * s + (1 - s) * 40) + 'v' + 22 * s + 'm-' + 10 * s + ' -' + 16 * s + 'h' + 20 * s + 'm-' + 16 * s + ' ' + 16 * s + 'l-4 ' + 14 * s + 'm' + 12 * s + ' -' + 14 * s + 'l4 ' + 14 * s }, S))];
  switch (kind) {
    case 'hline': return svg(120, [mbH('path', Object.assign({ key: 1, d: 'M25 32h70' }, S))]);
    case 'vline': return svg(120, [mbH('path', Object.assign({ key: 1, d: 'M60 6v52' }, S))]);
    case 'cross': return svg(120, [mbH('path', Object.assign({ key: 1, d: 'M60 6v52M32 30h56' }, S))]);
    case 'circle': return svg(120, [mbH('path', Object.assign({ key: 1, d: 'M48 10c14-4 30 2 32 16 2 14-8 28-24 28-14 0-22-12-20-24 1-10 4-17 12-20z' }, S))]);
    case 'scribble': return svg(120, [mbH('path', Object.assign({ key: 1, d: 'M50 12c16-6 30 4 28 18-2 14-16 24-28 20-12-4-14-18-6-26 6-6 14-6 18 0' }, S))]);
    case 'big': return svg(120, [mbH('circle', Object.assign({ key: 1, cx: 42, cy: 32, r: 24 }, S)), mbH('circle', Object.assign({ key: 2, cx: 92, cy: 40, r: 10 }, S))]);
    case 'long': return svg(120, [mbH('path', Object.assign({ key: 1, d: 'M52 6v54M70 40v20' }, S))]);
    case 'tall': return svg(120, [...person(44, 1), ...person(84, 0.55)]);
    case 'same': return svg(200, [mbH('path', Object.assign({ key: 1, d: 'M10 22h38c0 18-6 26-19 26S10 40 10 22zM48 28c8 0 8 12-1 12M60 22h38c0 18-6 26-19 26S60 40 60 22zM98 28c8 0 8 12-1 12M122 14h26l-3 38h-20zM160 14h26l-3 38h-20zM186 22c9 0 9 18-1 18' }, S))]);
    case 'pos': return svg(220, [mbH('path', Object.assign({ key: 1, d: 'M10 24h50M16 24v36M54 24v36M85 24h50M91 24v36M129 24v36M160 24h50M166 24v36M204 24v36' }, S)), mbH('circle', Object.assign({ key: 2, cx: 35, cy: 16, r: 7 }, S)), mbH('circle', Object.assign({ key: 3, cx: 110, cy: 52, r: 7 }, S)), mbH('circle', Object.assign({ key: 4, cx: 216, cy: 52, r: 6 }, S))]);
    case 'pics': return mbH('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } }, ...['Horse', 'Dog', 'Bird', 'Person'].map(t => mbH('span', { key: t, style: { padding: '6px 12px', border: '1px dashed #CBD5E1', borderRadius: 8, fontSize: 13, color: MB_INK.t, display: 'inline-flex', alignItems: 'center', gap: 6 } }, mbIcon('image', 14, { color: MB_INK.f }), t)));
    case 'nums': return mbH('div', { style: { display: 'flex', gap: 10 } }, ...['3', '8'].map(n => mbH('span', { key: n, style: { width: 44, height: 44, borderRadius: 10, border: '1px solid ' + MB_INK.b, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: MB_INK.h } }, n)));
    case 'count': return mbH('div', { style: { fontSize: 15, letterSpacing: '0.12em', color: MB_INK.h, fontWeight: 600 } }, '1 2 3 4 5 6 7 8 9 10');
    default: return null;
  }
};
export const mbStarBox = (key, lang) => { const s = MB_STAR[key]; if (!s) return null; return mbH('div', { style: { display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', padding: '12px 14px', borderRadius: 10, background: '#FFFBEB', border: '1px solid #FDE68A' } }, mbH('div', { style: { flex: '1 1 260px', fontSize: 13, color: MB_INK.t, lineHeight: 1.5 } }, mbH('div', { style: { fontSize: 12, fontWeight: 600, color: '#B45309', marginBottom: 2 } }, (lang === 'mn' ? 'Зааварчилгаа ' : 'How to test ') + key), s[lang]), mbFig(s.fig)); };

// Chart: developmental age per area vs age at assessment (single hue + dashed reference)
export const mbResultChart = (scores, ageM, lang) => {
  const max = Math.max(43, Math.ceil(ageM || 0) + 3), W = 1040, L = 150, R = 16, rowH = 30, top = 22, H = top + rowH * 7 + 26;
  const x = m => L + (W - L - R) * m / max;
  const ticks = [0, 6, 12, 18, 24, 30, 36, 42].filter(t => t <= max);
  const kids = [];
  ticks.forEach(t => { kids.push(mbH('line', { key: 'g' + t, x1: x(t), x2: x(t), y1: top - 6, y2: top + rowH * 7, stroke: '#F1F5F9' })); kids.push(mbH('text', { key: 't' + t, x: x(t), y: H - 8, textAnchor: 'middle', fontSize: 11, fill: MB_INK.m }, t)); });
  scores.forEach((s, i) => {
    const y = top + i * rowH + 8;
    kids.push(mbH('text', { key: 'l' + i, x: L - 10, y: y + 9, textAnchor: 'end', fontSize: 12, fill: MB_INK.t }, MB_SHORT[i]));
    if (s) {
      kids.push(mbH('rect', { key: 'b' + i, x: L, y, width: Math.max(4, x(MB_LO[s]) - L), height: 12, rx: 4, fill: '#2563EB' }, mbH('title', null, MB_SHORT[i] + ': score ' + s + ' → ' + MB_AGE.en[s])));
      kids.push(mbH('rect', { key: 'r' + i, x: x(MB_LO[s]) + 2, y, width: Math.max(2, x(MB_HI[s]) - x(MB_LO[s]) - 2), height: 12, rx: 4, fill: '#BFDBFE' }, mbH('title', null, 'Band ' + MB_AGE.en[s])));
    }
  });
  if (ageM != null) { kids.push(mbH('line', { key: 'age', x1: x(ageM), x2: x(ageM), y1: top - 8, y2: top + rowH * 7, stroke: '#172B4D', strokeWidth: 1.5, strokeDasharray: '4 3' })); kids.push(mbH('text', { key: 'agel', x: x(ageM), y: top - 11, textAnchor: 'middle', fontSize: 11, fontWeight: 600, fill: MB_INK.h }, 'Age ' + Math.floor(ageM) + ' mo')); }
  return mbH('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
    mbH('div', { style: { display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12, color: MB_INK.m } },
      mbH('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 6 } }, mbH('span', { style: { width: 14, height: 8, borderRadius: 3, background: '#2563EB' } }), 'Developmental age (start of band)'),
      mbH('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 6 } }, mbH('span', { style: { width: 14, height: 8, borderRadius: 3, background: '#BFDBFE' } }), 'Rest of the Table 2 band'),
      mbH('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 6 } }, mbH('span', { style: { width: 14, borderTop: '2px dashed #172B4D' } }), 'Age at assessment')),
    mbH('div', { style: { overflowX: 'auto' } }, mbH('svg', { viewBox: '0 0 ' + W + ' ' + H, width: '100%', style: { minWidth: 520, display: 'block' }, role: 'img', 'aria-label': 'Developmental age by area in months' }, ...kids)),
    mbH('div', { style: { fontSize: 12, color: MB_INK.m, textAlign: 'right' } }, 'Months'));
};
// Small multiples: one card per area, dev age over time vs age
export const mbSpark = (kid, i) => {
  const pts = kid.hist.map(a => ({ a, age: mbAgeM(kid.dob, a.date), dev: MB_LO[a.scores[i]] }));
  const W = 220, H = 96, P = 10, vals = pts.flatMap(p => [p.age, p.dev]), maxY = Math.max(...vals) + 3, minY = Math.max(0, Math.min(...vals) - 3);
  const t0 = new Date(pts[0].a.date).getTime() - 45 * 86400000, t1 = new Date(MB_TODAY).getTime() + 15 * 86400000;
  const x = d => P + (W - 2 * P) * (new Date(d).getTime() - t0) / (t1 - t0);
  const y = m => H - P - (H - 2 * P) * (m - minY) / (maxY - minY);
  const line = k => pts.map((p, j) => (j ? 'L' : 'M') + x(p.a.date).toFixed(1) + ' ' + y(p[k]).toFixed(1)).join(' ');
  const last = pts[pts.length - 1], prev = pts[pts.length - 2];
  const cmp = mbCmp(last.a.scores[i], mbStart(last.age));
  return mbH('div', { key: i, style: { padding: 16, border: '1px solid ' + MB_INK.b, borderRadius: 12, background: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: 8 } },
    mbH('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 } }, mbH('span', { style: { fontSize: 13, fontWeight: 600, color: MB_INK.h } }, MB_SHORT[i]), mbPill(cmp.tone, cmp.label)),
    mbH('div', { style: { display: 'flex', alignItems: 'baseline', gap: 8 } }, mbH('span', { style: { fontSize: 20, fontWeight: 700, color: MB_INK.h } }, MB_AGE.en[last.a.scores[i]]), prev ? mbH('span', { style: { fontSize: 12, color: MB_INK.m } }, 'score ' + prev.a.scores[i] + ' → ' + last.a.scores[i]) : null),
    mbH('svg', { viewBox: '0 0 ' + W + ' ' + H, width: '100%', style: { display: 'block' }, 'aria-hidden': true },
      mbH('line', { x1: P, x2: W - P, y1: H - P, y2: H - P, stroke: MB_INK.b }),
      mbH('path', { d: line('age'), fill: 'none', stroke: '#94A3B8', strokeWidth: 1.5, strokeDasharray: '4 3' }),
      mbH('path', { d: line('dev'), fill: 'none', stroke: '#2563EB', strokeWidth: 2 }),
      ...pts.map((p, j) => mbH('circle', { key: j, cx: x(p.a.date), cy: y(p.dev), r: 4.5, fill: '#2563EB', stroke: '#FFFFFF', strokeWidth: 2 }, mbH('title', null, mbDate(p.a.date) + ' · score ' + p.a.scores[i] + ' → ' + MB_AGE.en[p.a.scores[i]] + ' (age ' + Math.floor(p.age) + ' mo)')))));
};

export function mbBuild(self, st, role, page, pg, kit) {
  const { table, C, badge, act, mkTabs } = kit;
  const lang = st.mbLang || (getLang() === 'mn' ? 'mn' : 'en');
  const setLang = l => self.setState({ mbLang: l });
  const kids = st.mbKids || MB_KIDS0;
  const out = { on: false, view: null };
  const langSeg = mbSeg(lang, [['en', 'English'], ['mn', 'Монгол']], setLang);
  const B = t => badge(t === 'success' ? 'success' : t === 'warning' ? 'warning' : t === 'error' ? 'error' : 'neutral', '');
  const cmpBadge = c => { const b = badge(c.tone, c.label, MB_TONE[c.tone][2] || undefined); return b; };

  // ---------- CLINICIAN · Children ----------
  if (role === 'clinician' && page === 'children' && !st.mbChild) {
    pg.title = 'Children'; pg.sub = 'Children you follow with MORBAS, and how each area is developing';
    pg.actions = [act('New MORBAS assessment', 'clipboard-check', () => self.setState({ page: 'morbas', mbDraft: null }), 'primary')];
    pg.hasSearch = true; pg.searchPh = 'Search name or registration number';
    const q = (st.q['clinician:children'] || '').trim().toLowerCase();
    const rows = kids.filter(k => !q || (k.name + ' ' + k.id).toLowerCase().includes(q));
    pg.kpis = [
      { label: 'Children', v: String(kids.length), note: 'Followed with MORBAS', icon: 'users', ibg: '#DBEAFE', ifg: '#1D4ED8', nc: '#64748B' },
      { label: 'Assessments', v: String(kids.reduce((n, k) => n + k.hist.length, 0)), note: 'All time', icon: 'clipboard-check', ibg: '#DCFCE7', ifg: '#15803D', nc: '#64748B' },
      { label: 'An area 3+ bands below', v: String(kids.filter(k => k.hist.length && k.hist[k.hist.length - 1].scores.some(s => mbCmp(s, mbStart(mbAgeM(k.dob, k.hist[k.hist.length - 1].date))).tone === 'error')).length), note: 'At latest assessment', icon: 'flag', ibg: '#FEE2E2', ifg: '#B91C1C', nc: '#B91C1C' },
      { label: 'Never assessed', v: String(kids.filter(k => !k.hist.length).length), note: 'Start a first MORBAS', icon: 'clock', ibg: '#FEF3C7', ifg: '#B45309', nc: '#64748B' }
    ];
    table(['Child', 'Age today', 'Area', 'Last MORBAS', 'Lowest area', { l: '', al: 'right' }], '2fr 1fr 1fr 1fr 1.6fr .3fr', rows.map(k => {
      const last = k.hist[k.hist.length - 1];
      let low = C.badge(badge('neutral', 'Not assessed yet'));
      if (last) { const S = mbStart(mbAgeM(k.dob, last.date)); let mi = 0; last.scores.forEach((s, i) => { if (s - S < last.scores[mi] - S) mi = i; }); const c = mbCmp(last.scores[mi], S); low = C.badge(badge(c.tone, MB_SHORT[mi] + ' · ' + c.label, MB_TONE[c.tone][2] || undefined)); }
      return { onClick: () => self.setState({ mbChild: k.id, mbRes: null }), cells: [C.person(k.name, k.id + ' · ' + k.sex), C.text(mbAgeTxt(mbAgeM(k.dob, MB_TODAY)), 'Born ' + mbDate(k.dob)), C.text(k.area), C.text(last ? mbDate(last.date) : '—', k.hist.length + ' assessment' + (k.hist.length === 1 ? '' : 's')), low, C.chev()] };
    }), kids.length, 860, 'children');
    return out;
  }

  // ---------- CLINICIAN · Child profile / result ----------
  if (role === 'clinician' && page === 'children' && st.mbChild) {
    const k = kids.find(x => x.id === st.mbChild) || kids[0];
    const ageNow = mbAgeM(k.dob, MB_TODAY);
    if (st.mbRes) {
      const a = k.hist.find(x => x.id === st.mbRes) || k.hist[k.hist.length - 1];
      const ageM = mbAgeM(k.dob, a.date), S = mbStart(ageM);
      const cmps = a.scores.map(s => mbCmp(s, S));
      pg.hasBack = true; pg.backLabel = k.name; pg.onBack = () => self.setState({ mbRes: null });
      pg.title = 'MORBAS result'; pg.sub = k.name + ' · ' + k.id + ' · assessed ' + mbDate(a.date) + ' by ' + a.by;
      pg.actions = [act('Print form', 'file-text', () => self.toast('Filled MORBAS form sent to print')), act('Refer to specialist', 'send', () => self.toast(k.name + ' referred for a full developmental assessment'), cmps.some(c => c.tone === 'error') ? 'primary' : 'secondary')];
      pg.kpis = [
        { label: 'Age at assessment', v: mbAgeTxt(ageM), note: 'Start item ' + S + ' (Table 2)', icon: 'clock', ibg: '#DBEAFE', ifg: '#1D4ED8', nc: '#64748B' },
        { label: 'Areas at age band', v: cmps.filter(c => c.tone === 'success').length + ' of 7', note: 'Score ≥ start item', icon: 'circle-check', ibg: '#DCFCE7', ifg: '#15803D', nc: '#64748B' },
        { label: '1–2 bands below', v: String(cmps.filter(c => c.tone === 'warning').length), note: 'Re-check in 3 months', icon: 'triangle-alert', ibg: '#FEF3C7', ifg: '#B45309', nc: '#64748B' },
        { label: '3+ bands below', v: String(cmps.filter(c => c.tone === 'error').length), note: cmps.some(c => c.tone === 'error') ? 'Consider referral' : 'None', icon: 'flag', ibg: '#FEE2E2', ifg: '#B91C1C', nc: cmps.some(c => c.tone === 'error') ? '#B91C1C' : '#64748B' }
      ];
      table(['Area', 'Score', 'Developmental age (Table 2)', 'Compared with age', ''], '1.8fr .6fr 1.6fr 1.2fr .1fr', a.scores.map((s, i) => ({ cells: [C.text(MB_DOM[lang][i], lang === 'mn' ? MB_DOM.en[i] : '', { fw: 600, color: '#172B4D' }), C.text(String(s), '', { fw: 600, color: '#172B4D' }), C.text(MB_AGE[lang][s] || '—'), C.badge(cmpBadge(cmps[i])), C.text('')] })), 7, 760, 'areas');
      pg.hasTableTitle = true; pg.tableTitle = 'Scores by area';
      out.on = true;
      out.view = mbH('div', { style: { display: 'flex', flexDirection: 'column', gap: 16 } },
        mbCard([mbH('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' } }, mbTitle('Developmental age by area', 'Each area’s score is turned into an age band using Table 2. The dashed line is the child’s age on the day.'), langSeg), mbResultChart(a.scores, ageM, lang),
          mbH('div', { style: { fontSize: 12, color: MB_INK.m, borderTop: '1px solid #F1F5F9', paddingTop: 12 } }, 'Score = number of ○ in the area + the item number just before the first ○. “Bands below” compares the score with the start item for the child’s age; this comparison is a display rule set by the admin, not part of the MORBAS form.')]));
      return out;
    }
    pg.hasBack = true; pg.backLabel = 'All children'; pg.onBack = () => self.setState({ mbChild: null });
    pg.title = k.name; pg.sub = k.id + ' · ' + k.sex + ' · born ' + mbDate(k.dob) + ' · ' + mbAgeTxt(ageNow) + ' today · ' + k.area;
    pg.actions = [act('New MORBAS assessment', 'clipboard-check', () => self.setState({ page: 'morbas', mbChild: null, mbDraft: mbNewDraft(k) }), 'primary')];
    if (!k.hist.length) {
      out.on = true;
      out.view = mbH('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '48px 24px', textAlign: 'center', border: '1px dashed #CBD5E1', borderRadius: 12 } }, mbH('span', { style: { width: 48, height: 48, borderRadius: '50%', background: '#F1F5F9', color: MB_INK.m, display: 'flex', alignItems: 'center', justifyContent: 'center' } }, mbIcon('clipboard-check', 22)), mbH('span', { style: { fontSize: 16, fontWeight: 600, color: MB_INK.h } }, 'No MORBAS assessment yet'), mbH('span', { style: { fontSize: 14, color: MB_INK.m } }, k.name + ' is ' + mbAgeTxt(ageNow) + ' old, so the assessment starts at item ' + mbStart(ageNow) + ' in every area.'), mbH('button', { className: 'btn btn-primary', style: { marginTop: 8 }, onClick: () => self.setState({ page: 'morbas', mbChild: null, mbDraft: mbNewDraft(k) }) }, mbIcon('clipboard-check', 16), 'Start assessment'));
      return out;
    }
    const hist = k.hist.slice().reverse();
    table(['Date', 'Age', ...MB_SHORT.map(s => ({ l: s.replace(' language', ' lang.'), al: 'left' })), { l: '', al: 'right' }], '1fr .8fr repeat(7, .7fr) .3fr', hist.map(a => { const S = mbStart(mbAgeM(k.dob, a.date)); return { onClick: () => self.setState({ mbRes: a.id }), cells: [C.text(mbDate(a.date), a.id), C.text(mbAgeTxt(mbAgeM(k.dob, a.date)), 'start ' + S), ...a.scores.map(s => { const c = mbCmp(s, S); return C.badge(badge(c.tone, String(s))); }), C.chev()] }; }), hist.length, 980, 'assessments');
    pg.hasTableTitle = true; pg.tableTitle = 'Assessment history';
    out.on = true;
    out.view = mbH('div', { style: { display: 'flex', flexDirection: 'column', gap: 12 } },
      mbH('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' } }, mbTitle('Progress by area', k.hist.length + ' assessment' + (k.hist.length === 1 ? '' : 's') + ' · latest ' + mbDate(k.hist[k.hist.length - 1].date)),
        mbH('div', { style: { display: 'flex', gap: 16, fontSize: 12, color: MB_INK.m } }, mbH('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 6 } }, mbH('span', { style: { width: 14, borderTop: '2px solid #2563EB' } }), 'Developmental age'), mbH('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 6 } }, mbH('span', { style: { width: 14, borderTop: '2px dashed #94A3B8' } }), 'Age'))),
      mbH('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 } }, ...MB_SHORT.map((_, i) => mbSpark(k, i))));
    return out;
  }

  // ---------- CLINICIAN · MORBAS assessment form ----------
  if (role === 'clinician' && page === 'morbas') {
    const D = st.mbDraft || mbNewDraft(null);
    const setD = patch => self.setState(s => ({ mbDraft: Object.assign({}, s.mbDraft || D, typeof patch === 'function' ? patch(s.mbDraft || D) : patch) }));
    const ageM = mbAgeM(D.dob, D.date), S = mbStart(ageM);
    const d = D.d || 0;
    const scores = D.marks.map(mbScore);
    const guides = D.marks.map(m => mbGuide(m, S));
    const detailsOk = D.name.trim() && D.reg.trim() && D.dob && D.date;
    const canSave = detailsOk && scores.every(s => s > 0);
    // Saved through the store (localStorage or the API). App copies the store's children into st.mbKids.
    const save = () => {
      if (!canSave || st.mbSaving) return;
      const existing = kids.find(x => x.id === D.kid);
      const regNo = existing ? existing.id : D.reg.trim();
      const name = existing ? existing.name : D.name.trim();
      self.setState({ mbSaving: true });
      reportsStore
        .addAssessment(regNo, { child: { name: D.name.trim(), dob: D.dob }, date: D.date, by: currentUserName(), scores, marks: D.marks })
        .then(({ childId, assessmentId }) => {
          self.setState({ mbSaving: false, mbDraft: null, page: 'children', mbChild: childId, mbRes: assessmentId });
          self.toast('MORBAS saved for ' + name);
        })
        .catch(e => {
          self.setState({ mbSaving: false });
          self.toast('MORBAS not saved: ' + (e && e.message ? e.message : 'server error'));
        });
    };
    pg.title = 'MORBAS assessment'; pg.sub = 'Mongolian Rapid Baby Scale · 7 areas · 23 items each';
    pg.actions = [act('Clear form', 'trash-2', () => self.setState({ mbDraft: mbNewDraft(kids.find(x => x.id === D.kid) || null) })), act('Save assessment', 'check', save, 'primary', !canSave)];
    const field = (label, k2, type, ph) => mbH('div', { className: 'field', style: { flex: '1 1 200px', minWidth: 0 } }, mbH('label', null, label), mbH('input', { className: 'input', type: type || 'text', value: D[k2], placeholder: ph || '', onChange: e => { const v = e.target.value; setD({ [k2]: v }); }, style: { width: '100%', boxSizing: 'border-box' } }));
    const pick = mbH('div', { className: 'field', style: { flex: '1 1 200px', minWidth: 0 } }, mbH('label', null, 'Child'), mbH('select', { className: 'input', value: D.kid || '', style: { width: '100%', boxSizing: 'border-box' }, onChange: e => { const k = kids.find(x => x.id === e.target.value); setD(k ? { kid: k.id, name: k.name, reg: k.id, dob: k.dob } : { kid: '', name: '', reg: '', dob: '' }); } }, mbH('option', { value: '' }, 'New child (type details)'), ...kids.map(k => mbH('option', { key: k.id, value: k.id }, k.name + ' · ' + k.id))));
    const details = mbCard([
      mbH('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' } }, mbTitle(lang === 'mn' ? 'Хүүхдийн мэдээлэл' : 'Child details', lang === 'mn' ? 'Доорх 4 асуултанд хариулсны дараа сорилыг бөглөнө үү.' : 'Complete the four fields before starting the assessment.'), langSeg),
      mbH('div', { style: { display: 'flex', gap: 16, flexWrap: 'wrap' } }, pick, field(lang === 'mn' ? 'Хүүхдийн нэр' : 'Child’s name', 'name', 'text', 'Full name'), field(lang === 'mn' ? 'Хүүхдийн регистрийн дугаар' : 'Registration number', 'reg', 'text', 'e.g. CH-1070')),
      mbH('div', { style: { display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' } }, field(lang === 'mn' ? 'Хүүхдийн төрсөн он сар өдөр' : 'Date of birth', 'dob', 'date'), field(lang === 'mn' ? 'Сорил хийсэн он сар өдөр' : 'Assessment date', 'date', 'date'),
        mbH('div', { style: { flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: S ? MB_INK.pxl : '#F8FAFC', border: '1px solid ' + (S ? MB_INK.pl : MB_INK.b), minHeight: 44, boxSizing: 'border-box' } }, mbIcon('clock', 18, { color: S ? MB_INK.p : MB_INK.f }), S ? mbH('span', { style: { fontSize: 13, color: MB_INK.t, lineHeight: 1.35 } }, mbH('b', { style: { color: MB_INK.h } }, mbAgeTxt(ageM)), ' old · start at ', mbH('b', { style: { color: MB_INK.pd } }, 'item ' + S), mbH('br'), mbH('span', { style: { color: MB_INK.m, fontSize: 12 } }, 'Table 2: ' + MB_AGE[lang][S])) : mbH('span', { style: { fontSize: 13, color: MB_INK.m } }, 'Enter both dates to find the start item')))
    ]);
    // area tabs
    const tabs = mbH('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap' } }, ...MB_DOM.en.map((_, i) => {
      const on = i === d, g = guides[i], n = D.marks[i].filter(Boolean).length;
      return mbH('button', { key: i, onClick: () => setD({ d: i, star: null }), style: { display: 'flex', alignItems: 'center', gap: 8, height: 36, padding: '0 12px', borderRadius: 9999, cursor: 'pointer', font: 'inherit', fontSize: 13, fontWeight: 600, border: '1px solid ' + (on ? MB_INK.p : MB_INK.b), background: on ? MB_INK.pxl : '#FFFFFF', color: on ? MB_INK.pd : MB_INK.t } },
        mbH('span', { style: { width: 20, height: 20, borderRadius: '50%', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', background: g.done ? '#DCFCE7' : n ? '#FEF3C7' : '#F1F5F9', color: g.done ? '#15803D' : n ? '#B45309' : MB_INK.m } }, g.done ? mbIcon('check', 12) : String(i + 1)), MB_SHORT[i]);
    }));
    const marks = D.marks[d];
    const setMark = (n, v) => setD(cur => { const m = cur.marks.map(r => r.slice()); m[d][n - 1] = m[d][n - 1] === v ? null : v; return { marks: m }; });
    const inRange = n => S && n >= S - 5 && n <= S + 4;
    const g = guides[d];
    const markBtn = (n, v) => { const sel = marks[n - 1] === v; const on = v === 'o' ? ['#2563EB', '#FFFFFF'] : ['#B91C1C', '#FFFFFF']; return mbH('button', { 'aria-label': (v === 'o' ? 'Can do' : 'Cannot do') + ' item ' + n, 'aria-pressed': sel, onClick: () => setMark(n, v), style: { width: 40, height: 36, borderRadius: 8, cursor: 'pointer', font: 'inherit', fontSize: 17, fontWeight: 700, border: '1px solid ' + (sel ? on[0] : MB_INK.b), background: sel ? on[0] : '#FFFFFF', color: sel ? on[1] : MB_INK.m } }, v === 'o' ? '○' : '×'); };
    const rows = [];
    for (let n = 1; n <= 23; n++) {
      const key = (d + 1) + '-' + n, star = !!MB_STAR[key], open = D.star === key, start = n === S, rng = inRange(n), next = g.next === n;
      rows.push(mbH('div', { key: n, style: { display: 'flex', flexDirection: 'column', gap: 10, padding: '10px 16px', borderBottom: '1px solid #F1F5F9', borderLeft: '3px solid ' + (start ? MB_INK.p : rng ? '#BFDBFE' : 'transparent'), background: start ? MB_INK.pxl : next ? '#FFFBEB' : '#FFFFFF', opacity: S && !rng && !marks[n - 1] && !next ? 0.72 : 1 } },
        mbH('div', { style: { display: 'flex', alignItems: 'center', gap: 12 } },
          mbH('span', { style: { width: 28, flex: 'none', fontSize: 13, fontWeight: 600, color: start ? MB_INK.pd : MB_INK.m, fontVariantNumeric: 'tabular-nums' } }, n),
          mbH('span', { style: { flex: 1, minWidth: 0, fontSize: 14, color: MB_INK.h, lineHeight: 1.4 } }, MB_ROWS[lang][n - 1][d], start ? mbH('span', { style: { marginLeft: 8, fontSize: 11, fontWeight: 700, color: MB_INK.pd, background: MB_INK.pl, padding: '2px 6px', borderRadius: 6, whiteSpace: 'nowrap' } }, lang === 'mn' ? 'ЭХЛЭЛ' : 'START') : null, next ? mbH('span', { style: { marginLeft: 8, fontSize: 11, fontWeight: 700, color: '#B45309', background: '#FEF3C7', padding: '2px 6px', borderRadius: 6, whiteSpace: 'nowrap' } }, 'NEXT') : null),
          star ? mbStarTag(() => setD({ star: open ? null : key }), open) : null,
          mbH('div', { style: { display: 'flex', gap: 6, flex: 'none' } }, markBtn(n, 'o'), markBtn(n, 'x'))),
        open ? (XCFG[key] ? mbH(XCard, { key: key, k: key, lang, onResult: v => setD(cur => { const m = cur.marks.map(r => r.slice()); m[d][n - 1] = v; return { marks: m, star: null }; }) }) : mbStarBox(key, lang)) : null));
    }
    const list = mbH('div', { style: { border: '1px solid ' + MB_INK.b, borderRadius: 12, background: '#FFFFFF', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', minWidth: 0 } },
      mbH('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 16px', background: MB_INK.s, borderBottom: '1px solid ' + MB_INK.b, flexWrap: 'wrap' } },
        mbH('div', null, mbH('div', { style: { fontSize: 15, fontWeight: 600, color: MB_INK.h } }, (d + 1) + '. ' + MB_DOM[lang][d]), mbH('div', { style: { fontSize: 12, color: MB_INK.m } }, S ? 'Range: items ' + Math.max(1, S - 5) + '–' + Math.min(23, S + 4) + ' · ' + g.txt : 'Enter the dates above to highlight the range')),
        mbH('div', { style: { display: 'flex', gap: 8, alignItems: 'center' } }, mbPill(g.done ? 'success' : 'neutral', g.done ? 'Area complete' : g.txt), mbH('button', { className: 'btn btn-ghost', style: { minHeight: 32, padding: '0 10px', fontSize: 13 }, onClick: () => setD(cur => { const m = cur.marks.map(r => r.slice()); m[d] = Array(23).fill(null); return { marks: m }; }) }, 'Clear area'))),
      ...rows,
      mbH('div', { style: { display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: MB_INK.s } },
        mbH('button', { className: 'btn btn-secondary', disabled: d === 0, onClick: () => setD({ d: d - 1, star: null }) }, mbIcon('arrow-left', 16), 'Previous area'),
        d < 6 ? mbH('button', { className: 'btn btn-primary', onClick: () => setD({ d: d + 1, star: null }) }, 'Next area', mbIcon('chevron-right', 16)) : mbH('button', { className: 'btn btn-primary', disabled: !canSave, onClick: save }, mbIcon('check', 16), 'Save assessment')));
    // live score
    const summary = mbH('div', { style: { position: 'sticky', top: 88, display: 'flex', flexDirection: 'column', gap: 12 } },
      mbCard([mbTitle(lang === 'mn' ? 'Хүснэгт 1 · Оноо' : 'Table 1 · Live score', 'Updates as you mark items'),
        mbH('div', { style: { display: 'flex', flexDirection: 'column' } }, ...scores.map((s, i) => { const c = mbCmp(s, S); return mbH('button', { key: i, onClick: () => setD({ d: i, star: null }), style: { display: 'grid', gridTemplateColumns: '1fr auto', gap: 4, padding: '10px 0', borderTop: i ? '1px solid #F1F5F9' : 0, border: 0, borderTopStyle: 'solid', borderTopWidth: i ? 1 : 0, borderTopColor: '#F1F5F9', background: 'none', textAlign: 'left', cursor: 'pointer', font: 'inherit' } },
          mbH('span', { style: { fontSize: 13, fontWeight: i === d ? 700 : 500, color: i === d ? MB_INK.pd : MB_INK.h } }, MB_SHORT[i]),
          mbH('span', { style: { fontSize: 15, fontWeight: 700, color: MB_INK.h, textAlign: 'right', fontVariantNumeric: 'tabular-nums' } }, s || '—'),
          mbH('span', { style: { fontSize: 12, color: MB_INK.m } }, s ? MB_AGE[lang][s] : guides[i].txt),
          mbH('span', { style: { justifySelf: 'end' } }, s && S ? mbPill(c.tone, c.tone === 'success' ? 'On band' : c.label, true) : null)); })),
        mbH('div', { style: { fontSize: 12, color: MB_INK.m, borderTop: '1px solid #F1F5F9', paddingTop: 12, lineHeight: 1.5 } }, 'Score = count of ○ + the item number just before the first ○. ', mbH('b', null, guides.filter(x => x.done).length + ' of 7'), ' areas complete.'),
        mbH('button', { className: 'btn btn-primary', disabled: !canSave, onClick: save, style: { width: '100%' } }, mbIcon('check', 16), 'Save assessment'),
        !canSave ? mbH('div', { style: { fontSize: 12, color: MB_INK.m, textAlign: 'center', marginTop: -8 } }, !detailsOk ? 'Fill in the four child details first' : 'Every area needs at least one ○') : null]));
    out.on = true;
    out.view = mbH('div', { style: { display: 'flex', flexDirection: 'column', gap: 16 } }, details,
      D.fromReport ? mbH('div', { style: { fontSize: 13, color: '#1D4ED8', padding: '10px 14px', borderRadius: 10, background: MB_INK.pxl, border: '1px solid ' + MB_INK.pl, display: 'flex', gap: 10, alignItems: 'center' } }, mbIcon('smartphone', 16), 'Pre-filled from parent report ' + D.fromReport + ': Yes \u2192 \u25CB, No \u2192 \u00D7, Not sure left blank. Confirm each item with the child, and test the \u2605 items yourself.') : null,
      mbH('div', { style: { fontSize: 13, color: MB_INK.t, lineHeight: 1.5, padding: '10px 14px', borderRadius: 10, background: MB_INK.s, border: '1px solid ' + MB_INK.b, display: 'flex', gap: 10 } }, mbIcon('info', 16, { color: MB_INK.p, marginTop: 2 }), mbH('span', null, MB_RULES[lang][1] + ' ' + MB_RULES[lang][2] + ' ' + MB_RULES[lang][3] + ' ' + MB_RULES[lang][4])),
      tabs,
      mbH('div', { style: { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: 16, alignItems: 'start' } }, list, summary));
    return out;
  }

  // ---------- ADMIN · Instruments · MORBAS ----------
  if (role === 'admin' && page === 'instruments' && st.instr === 'morbas') {
    const tab = st.mbATab || 'items';
    pg.hasBack = true; pg.backLabel = 'All instruments'; pg.onBack = () => self.setState({ instr: null });
    pg.title = 'MORBAS – Mongolian Rapid Baby Scale'; pg.sub = 'v1.0 · Live · 161 items in 7 areas · 16 days to 42 months · Mongolian and English';
    pg.actions = [act('Preview on phone', 'smartphone', () => self.toast('Preview sent to your test phone')), act('Download paper form', 'download', () => self.toast('MORBAS paper form (2 pages) downloaded'))];
    pg.tabs = [['items', 'Items', 161], ['scoring', 'Scoring'], ['rules', 'How to administer'], ['versions', 'Versions', 2]].map(([k2, label, count]) => ({ label, count: count == null ? '' : String(count), hasCount: count != null, bd: k2 === tab ? '#2563EB' : 'transparent', fg: k2 === tab ? '#2563EB' : '#64748B', cbg: k2 === tab ? '#DBEAFE' : '#F1F5F9', cfg: k2 === tab ? '#1D4ED8' : '#64748B', onClick: () => self.setState({ mbATab: k2 }) }));
    out.on = true;
    if (tab === 'items') {
      const ad = st.mbAD || 0;
      const side = mbH('div', { style: { display: 'flex', flexDirection: 'column', gap: 2, padding: 8, border: '1px solid ' + MB_INK.b, borderRadius: 12, background: '#FFFFFF', alignSelf: 'start' } }, ...MB_DOM.en.map((t, i) => mbH('button', { key: i, onClick: () => self.setState({ mbAD: i, mbAStar: null }), style: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: 0, cursor: 'pointer', textAlign: 'left', font: 'inherit', background: i === ad ? MB_INK.pxl : 'transparent' } }, mbH('span', { style: { width: 22, height: 22, borderRadius: 6, background: i === ad ? MB_INK.p : '#F1F5F9', color: i === ad ? '#FFFFFF' : MB_INK.m, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' } }, i + 1), mbH('span', { style: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', lineHeight: 1.3 } }, mbH('span', { style: { fontSize: 13, fontWeight: 600, color: i === ad ? MB_INK.pd : MB_INK.h } }, t), mbH('span', { style: { fontSize: 12, color: MB_INK.m } }, MB_DOM.mn[i])), mbH('span', { style: { fontSize: 12, color: MB_INK.m } }, 23))));
      const head = mbH('div', { style: { display: 'grid', gridTemplateColumns: '40px 1fr 1fr 90px', gap: 16, padding: '12px 20px', background: MB_INK.s, borderBottom: '1px solid ' + MB_INK.b, fontSize: 12, fontWeight: 600, color: MB_INK.m } }, mbH('span', null, 'No'), mbH('span', null, 'English'), mbH('span', null, 'Монгол (original)'), mbH('span', { style: { textAlign: 'right' } }, 'Age band'));
      const rows = [];
      for (let n = 1; n <= 23; n++) {
        const key = (ad + 1) + '-' + n, star = !!MB_STAR[key], open = st.mbAStar === key;
        rows.push(mbH('div', { key: n, style: { borderBottom: '1px solid #F1F5F9' } },
          mbH('div', { style: { display: 'grid', gridTemplateColumns: '40px 1fr 1fr 90px', gap: 16, padding: '12px 20px', alignItems: 'start', fontSize: 13 } },
            mbH('span', { style: { fontWeight: 600, color: MB_INK.m } }, n),
            mbH('span', { style: { color: MB_INK.h, display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' } }, MB_ROWS.en[n - 1][ad], star ? mbStarTag(() => self.setState({ mbAStar: open ? null : key }), open) : null),
            mbH('span', { style: { color: MB_INK.t } }, MB_ROWS.mn[n - 1][ad]),
            mbH('span', { style: { textAlign: 'right', fontSize: 12, color: MB_INK.m } }, MB_AGE.en[n])),
          open ? mbH('div', { style: { padding: '0 20px 14px 76px', display: 'flex', flexDirection: 'column', gap: 8 } }, mbStarBox(key, 'en'), mbH('div', { style: { fontSize: 13, color: MB_INK.t } }, MB_STAR[key].mn)) : null));
      }
      out.view = mbH('div', { style: { display: 'grid', gridTemplateColumns: '280px minmax(0, 1fr)', gap: 16 } }, side,
        mbH('div', { style: { border: '1px solid ' + MB_INK.b, borderRadius: 12, background: '#FFFFFF', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', minWidth: 0 } },
          mbH('div', { style: { padding: '16px 20px', borderBottom: '1px solid ' + MB_INK.b, display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' } }, mbTitle((ad + 1) + '. ' + MB_DOM.en[ad], MB_DOM.mn[ad] + ' · 23 items · ' + Object.keys(MB_STAR).filter(x => x.startsWith((ad + 1) + '-')).length + ' ★ demonstration items'), mbH('button', { className: 'btn btn-secondary', onClick: () => self.toast('Item edits go into a new draft version') }, mbIcon('plus', 16), 'Suggest an edit')),
          mbH('div', { style: { overflowX: 'auto' } }, mbH('div', { style: { minWidth: 640 } }, head, ...rows))));
    } else if (tab === 'scoring') {
      const t2 = mbH('div', { style: { border: '1px solid ' + MB_INK.b, borderRadius: 10, overflow: 'hidden' } }, mbH('div', { style: { display: 'grid', gridTemplateColumns: '90px 1fr 1fr', gap: 12, padding: '10px 16px', background: MB_INK.s, fontSize: 12, fontWeight: 600, color: MB_INK.m } }, mbH('span', null, 'Score'), mbH('span', null, 'Developmental age'), mbH('span', null, 'Хөгжлийн нас')), ...MB_AGE.en.slice(1).map((a, i) => mbH('div', { key: i, style: { display: 'grid', gridTemplateColumns: '90px 1fr 1fr', gap: 12, padding: '8px 16px', borderTop: '1px solid #F1F5F9', fontSize: 13 } }, mbH('span', { style: { fontWeight: 600, color: MB_INK.h } }, i + 1), mbH('span', { style: { color: MB_INK.h } }, a), mbH('span', { style: { color: MB_INK.t } }, MB_AGE.mn[i + 1]))));
      const step = (n, t, s) => mbH('div', { style: { display: 'flex', gap: 12 } }, mbH('span', { style: { width: 26, height: 26, borderRadius: '50%', background: MB_INK.pl, color: MB_INK.pd, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' } }, n), mbH('div', null, mbH('div', { style: { fontSize: 14, fontWeight: 600, color: MB_INK.h } }, t), mbH('div', { style: { fontSize: 13, color: MB_INK.m } }, s)));
      const ex = ['×', '×', '○', '×', '○', '○', '×'];
      out.view = mbH('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16, alignItems: 'start' } },
        mbH('div', { style: { display: 'flex', flexDirection: 'column', gap: 16 } },
          mbCard([mbTitle('How a score is calculated', 'Same rule for each of the 7 areas (instructions, page 2)'),
            step(1, 'Count the ○ marks in the area', 'Every item the child can do.'),
            step(2, 'Add the item number just before the first ○', 'Items below the first ○ are counted as passed.'),
            step(3, 'Look the total up in Table 2', 'This gives the developmental age for that area.'),
            mbH('div', { style: { padding: 14, borderRadius: 10, background: MB_INK.s, border: '1px solid ' + MB_INK.b, display: 'flex', flexDirection: 'column', gap: 8 } }, mbH('div', { style: { fontSize: 12, fontWeight: 600, color: MB_INK.m } }, 'WORKED EXAMPLE · items 13–19'), mbH('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap' } }, ...ex.map((m, i) => mbH('span', { key: i, style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, fontSize: 11, color: MB_INK.m } }, mbH('span', { style: { width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, background: m === '○' ? '#2563EB' : '#FFFFFF', color: m === '○' ? '#FFFFFF' : '#B91C1C', border: '1px solid ' + (m === '○' ? '#2563EB' : MB_INK.b) } }, m), 13 + i))), mbH('div', { style: { fontSize: 13, color: MB_INK.t } }, 'First ○ is item 15, so add 14. Three ○ marks → score ', mbH('b', null, '14 + 3 = 17'), ' → ', mbH('b', null, '21–23 months'), '.'))]),
          mbCard([mbTitle('Comparison with age (app display rule)', 'Not part of the MORBAS form. Set by your programme and shown on results.'),
            mbH('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } }, ...[['success', 'At age band', 'Score ≥ start item for the child’s age', 'Routine follow-up'], ['warning', '1–2 bands below', 'Score is 1 or 2 below the start item', 'Re-check in 3 months'], ['error', '3+ bands below', 'Score is 3 or more below the start item', 'Consider referral']].map(([t, l, r, a2]) => mbH('div', { key: t, style: { display: 'grid', gridTemplateColumns: '150px 1fr', gap: 12, alignItems: 'center', fontSize: 13 } }, mbPill(t, l), mbH('span', null, mbH('span', { style: { color: MB_INK.h } }, r), mbH('br'), mbH('span', { style: { color: MB_INK.m } }, a2))))),
            mbH('button', { className: 'btn btn-secondary', style: { alignSelf: 'flex-start' }, onClick: () => self.toast('Cut-offs saved to draft · confirm with your clinical lead') }, 'Edit cut-offs')])),
        mbCard([mbTitle('Table 2 · Score to developmental age', 'Хүснэгт 2 · Ай тус бүрийн оноо → Хөгжлийн нас'), t2]));
    } else if (tab === 'rules') {
      out.view = mbH('div', { style: { display: 'flex', flexDirection: 'column', gap: 16 } },
        mbCard([mbH('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' } }, mbTitle(lang === 'mn' ? 'Сорил бөглөх заавар' : 'How to fill in the form', 'Shown to clinicians at the top of every assessment'), langSeg),
          mbH('ol', { style: { margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, color: MB_INK.t } }, ...MB_RULES[lang].map((r, i) => mbH('li', { key: i }, r)))]),
        mbH('div', { style: { fontSize: 16, fontWeight: 600, color: MB_INK.h, marginTop: 8 } }, (lang === 'mn' ? '★ тэмдэгтэй асуултууд' : '★ Demonstration items') + ' · ' + Object.keys(MB_STAR).length),
        mbH('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 } }, ...Object.keys(MB_STAR).map(key => { const [a, n] = key.split('-').map(Number); return mbH('div', { key, style: { padding: 16, border: '1px solid ' + MB_INK.b, borderRadius: 12, background: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: 10 } }, mbH('div', { style: { display: 'flex', gap: 8, alignItems: 'center' } }, mbH('span', { style: { fontSize: 12, fontWeight: 700, color: '#B45309', background: '#FEF3C7', padding: '2px 8px', borderRadius: 6 } }, '★ ' + key), mbH('span', { style: { fontSize: 12, color: MB_INK.m } }, MB_DOM[lang][a - 1])), mbH('div', { style: { fontSize: 14, fontWeight: 600, color: MB_INK.h } }, MB_ROWS[lang][n - 1][a - 1]), mbH('div', { style: { fontSize: 13, color: MB_INK.t } }, MB_STAR[key][lang]), mbFig(MB_STAR[key].fig)); })));
    } else {
      table(['Version', 'Language', 'Status', 'Notes', 'Date'], '.7fr .9fr 1.1fr 2fr .9fr', [['v1.0', 'Монгол (original)', badge('success', 'Live'), 'Original paper form, 23 items × 7 areas', '5 Nov 2026'], ['v1.0-en', 'English', badge('warning', 'Not clinically validated', 'triangle-alert'), 'Translation of the Mongolian form; item order and scoring unchanged', '5 Nov 2026']].map(r => ({ cells: [C.mono(r[0]), C.text(r[1]), C.badge(r[2]), C.text(r[3]), C.text(r[4])] })), 2, 760, 'versions');
      out.on = false;
    }
    return out;
  }
  return out;
}
export function mbNewDraft(k) { return { kid: k ? k.id : '', name: k ? k.name : '', reg: k ? k.id : '', dob: k ? k.dob : '', date: MB_TODAY, d: 0, star: null, marks: Array.from({ length: 7 }, () => Array(23).fill(null)) }; }
