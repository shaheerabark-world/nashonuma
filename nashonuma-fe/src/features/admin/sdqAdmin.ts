// @ts-nocheck -- ported as-is from nashonuma-code/source/modules/07-sdq.js by scripts/port-modules.mjs.
// Same markup and inline styles as the prototype; type it by hand when you next change it.
/* eslint-disable */
import { MB_TODAY } from '@/domain/morbas';
import { SDQ_SCALES, SDQ_REV } from '@/domain/sdq';
import { reportsStore } from '@/store';
import { mbH, MB_INK, mbCard, mbTitle, mbIcon, mbPill } from '../morbas/morbasViews';

// Admin page: licensed text import + scoring structure
export function sdqAdmin(self, st, pg, kit) {
  const { table, C, badge, act } = kit; const H = mbH, I = MB_INK;
  const cfg = st.sdqCfg || null, has = l => !!(cfg && cfg.items && Array.isArray(cfg.items[l]) && cfg.items[l].length === 25);
  pg.hasBack = true; pg.backLabel = 'All instruments'; pg.onBack = () => self.setState({ instr: null });
  pg.title = 'SDQ – Strengths and Difficulties Questionnaire'; pg.sub = '25 items · 5 scales · children and teenagers · Pakistan (from 10 years) and Mongolia (from 42 months)';
  const save = () => { let v; try { v = JSON.parse(st.sdqPaste || ''); } catch (e) { self.toast('That is not valid JSON. Paste {"en":[25 items],"ur":[…],"mn":[…]}'); return; } const ok = ['en', 'ur', 'mn'].filter(l => Array.isArray(v[l]) && v[l].length === 25); if (!ok.length) { self.toast('Each language needs exactly 25 items'); return; } const items = {}; ok.forEach(l => { items[l] = v[l].map(String); }); reportsStore.setConfig('sdq', { items, by: 'admin', at: MB_TODAY }); self.setState({ sdqCfg: { items }, sdqPaste: '' }); self.toast('Licensed SDQ text saved for ' + ok.join(', ').toUpperCase()); };
  pg.actions = [act('Licence: Youthinmind', 'link', () => self.toast('Licence and official versions: sdqinfo.org'))];
  table(['Scale', 'Items (number)', 'Reverse-scored', 'Range'], '1.6fr 1.6fr 1fr .6fr', SDQ_SCALES.map(sc => ({ cells: [C.text(sc.en, '', { fw: 600, color: '#172B4D' }), C.text(sc.items.join(', ')), C.text(sc.items.filter(n => SDQ_REV.includes(n)).join(', ') || '—'), C.text('0–10')] })), 5, 640, 'scales');
  pg.hasTableTitle = true; pg.tableTitle = 'Scoring structure';
  return { on: true, view: H('div', { style: { display: 'flex', flexDirection: 'column', gap: 16 } },
    mbCard([mbTitle('Licensed item wording', 'SDQ text is copyright. Paste the wording from your licence; it is stored in this app’s database and used everywhere.'),
      H('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } }, ...['en', 'ur', 'mn'].map(l => mbPill(has(l) ? 'success' : 'warning', ({ en: 'English', ur: 'Urdu', mn: 'Mongolian' })[l] + (has(l) ? ' · loaded' : ' · placeholder')))),
      H('textarea', { className: 'input', value: st.sdqPaste || '', placeholder: '{"en": ["item 1", … 25 items], "ur": […], "mn": […]}', onChange: e => { const v = e.target.value; self.setState({ sdqPaste: v }); }, style: { width: '100%', boxSizing: 'border-box', minHeight: 120, fontFamily: 'ui-monospace, monospace', fontSize: 13 } }),
      H('div', { style: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' } }, H('button', { className: 'btn btn-primary', onClick: save }, mbIcon('upload', 16), 'Save licensed text'), H('span', { style: { fontSize: 13, color: I.m } }, 'Until it is saved, mothers see a short placeholder topic for each item, marked as such.'))]),
    mbCard([mbTitle('Result bands (parent report, total difficulties 0–40)', 'Total = emotional + conduct + hyperactivity + peer. Prosocial is reported separately.'), H('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } }, mbPill('success', '0–13 Close to average'), mbPill('warning', '14–16 Slightly raised'), mbPill('error', '17–19 High'), mbPill('error', '20–40 Very high'))])) };
}
