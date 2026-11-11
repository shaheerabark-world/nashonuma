// Programme manager: District dashboard (tile map), DHIS2 sync, Exports
import { act, badge, C, kpi, type Tone } from '@/app/kit';
import type { PageKit } from '@/app/pageKit';

export const emptyMap = () => ({ metrics: [] as any[], tiles: [] as any[], legend: [] as any[], rank: [] as any[], sel: {} as any, metricLabel: '', noRank: false });

type Metric = 'cov' | 'pos' | 'comp';
// [district, tile row, tile col, registered, coverage %, positive %, completion %, median days to clinic]
const DISTRICTS: [string, number, number, number, number, number, number, number][] = [
  ['Malakand', 1, 2, 1150, 63, 7.2, 51, 19], ['Swat', 1, 3, 2310, 58, 7.9, 46, 22], ['Charsadda', 2, 1, 1980, 74, 8.1, 63, 14],
  ['Mardan', 2, 2, 2860, 84, 9.6, 72, 10], ['Buner', 2, 3, 1030, 49, 6.8, 38, 27], ['Peshawar', 3, 1, 3420, 81, 9.4, 68, 11],
  ['Nowshera', 3, 2, 1640, 69, 8.8, 59, 15], ['Swabi', 3, 3, 1920, 77, 8.3, 66, 13], ['Kohat', 4, 1, 1930, 66, 9.9, 55, 17]
];

export function dashboard(k: PageKit) {
  const { pg, st, fv, match } = k;
  const map = emptyMap();
  pg.title = 'District dashboard'; pg.sub = 'Khyber Pakhtunkhwa · 9 districts';
  pg.hasSearch = true; pg.searchPh = 'Search district';
  pg.filters = k.mkFilters([['period', 'Period', [['q3', 'Jul–Sep 2026'], ['q2', 'Apr–Jun 2026']]], ['age', 'Age', [['all', '0–6 years'], ['u2', 'Under 2'], ['o2', '2–6 years']]]]);
  const off = {
    cov: (fv('period', 'q3') === 'q2' ? -6 : 0) + (fv('age', 'all') === 'u2' ? -4 : fv('age', 'all') === 'o2' ? 2 : 0),
    comp: fv('period', 'q3') === 'q2' ? -5 : 0,
    pos: (fv('period', 'q3') === 'q2' ? 0.4 : 0) + (fv('age', 'all') === 'u2' ? -1.2 : 0)
  };
  const D = DISTRICTS.map(d => ({ name: d[0], r: d[1], c: d[2], reg: d[3], cov: d[4] + off.cov, pos: Math.round((d[5] + off.pos) * 10) / 10, comp: d[6] + off.comp, days: d[7] }));
  const avg = (key: Metric) => D.reduce((s, d) => s + d[key] * d.reg, 0) / D.reduce((s, d) => s + d.reg, 0);
  pg.kpis = [kpi('Coverage', Math.round(avg('cov')) + '%', 'Children screened in their age window', 'info', 'users'), kpi('Screen-positive rate', Math.round(avg('pos') * 10) / 10 + '%', 'Medium and High bands', 'warning', 'activity'), kpi('Referral completion', Math.round(avg('comp')) + '%', 'Clinic outcome within 30 days', 'success', 'circle-check')];
  const metric: Metric = st.metric || 'cov';
  const ML: Record<Metric, string> = { cov: 'coverage', pos: 'positive rate', comp: 'referral completion' };
  map.metricLabel = ML[metric];
  map.metrics = ([['cov', 'Coverage'], ['pos', 'Positive rate'], ['comp', 'Referral completion']] as [Metric, string][]).map(([key, label]) => ({
    label, bg: key === metric ? '#FFFFFF' : 'transparent', fg: key === metric ? '#172B4D' : '#64748B', sh: key === metric ? 'var(--shadow-sm)' : 'none', onClick: () => k.set({ metric: key })
  }));
  const ramp = metric === 'pos' ? ['#CCFBF1', '#99F6E4', '#5EEAD4', '#0D9488'] : ['#DBEAFE', '#BFDBFE', '#93C5FD', '#2563EB'];
  const cuts = metric === 'pos' ? [7.5, 8.5, 9.5] : metric === 'cov' ? [55, 65, 75] : [45, 55, 65];
  const fmt = (x: number) => x + '%';
  const bk = (x: number) => (x < cuts[0] ? 0 : x < cuts[1] ? 1 : x < cuts[2] ? 2 : 3);
  map.legend = ramp.map((bg, i) => ({ bg, t: i === 0 ? 'Under ' + fmt(cuts[0]) : i === 3 ? fmt(cuts[2]) + '+' : fmt(cuts[i - 1]) + '–' + fmt(cuts[i]) }));
  const dsel = st.district || 'Mardan';
  map.tiles = D.map(d => {
    const b = bk(d[metric]);
    return { name: d.name, r: d.r, c: d.c, val: fmt(d[metric]), bg: ramp[b], fg: b === 3 ? '#FFFFFF' : '#172B4D', ring: d.name === dsel ? '0 0 0 2px #FFFFFF, 0 0 0 4px #172B4D' : 'none', op: match(d.name) ? 1 : 0.35, onClick: () => k.set({ district: d.name }) };
  });
  const max = Math.max(...D.map(d => d[metric]));
  const ranked = D.filter(d => match(d.name)).sort((a, b) => b[metric] - a[metric]);
  map.rank = ranked.map(d => ({ name: d.name, val: fmt(d[metric]), w: Math.round((d[metric] / max) * 100) + '%', bar: ramp[3], fw: d.name === dsel ? 700 : 500, bg: d.name === dsel ? '#F1F5F9' : 'transparent', onClick: () => k.set({ district: d.name }) }));
  map.noRank = ranked.length === 0;
  const sd = D.find(d => d.name === dsel) || D[3];
  map.sel = { name: sd.name, reg: sd.reg.toLocaleString('en-US'), days: sd.days, cov: sd.cov + '%', pos: sd.pos + '%', comp: sd.comp + '%' };
  pg.showMap = true; pg.countText = ranked.length + ' of 9 districts';
  return map;
}

export function dhis(k: PageKit) {
  const { pg, st, fv, match } = k;
  pg.title = 'DHIS2 sync'; pg.sub = 'Aggregate numbers sent nightly to the provincial DHIS2';
  pg.actions = [act('Push now', 'upload', () => k.toast('Push started · usually takes 2 minutes'), 'primary')];
  pg.kpis = [kpi('Last push', 'Today, 02:00', 'Sent successfully', 'success', 'circle-check', 'success'), kpi('Next push', 'Tomorrow, 02:00', 'Runs automatically', 'info', 'clock'), kpi('Failed in last 30 days', st.retried ? '0' : '1', st.retried ? 'All resolved' : 'Needs a retry', st.retried ? 'success' : 'error', 'triangle-alert', st.retried ? 'success' : 'error')];
  pg.section = 'Push history'; pg.hasSearch = true; pg.searchPh = 'Search data set';
  pg.filters = k.mkFilters([['st', 'Status', [['all', 'All'], ['Sent', 'Sent'], ['Failed', 'Failed']]]]);
  const LOG = [['15 Oct, 02:00', 'Screening · monthly', 'Sep 2026', '1,412', 'Sent'], ['14 Oct, 02:00', 'Referral completion · weekly', 'Week 41', '216', 'Sent'], ['13 Oct, 02:00', 'Referral completion · weekly', 'Week 41', '—', st.retried ? 'Sent' : 'Failed'], ['12 Oct, 16:20', 'Screening · revision', 'Aug 2026', '88', 'Sent'], ['8 Oct, 02:00', 'Coverage · monthly', 'Sep 2026', '27', 'Sent'], ['7 Oct, 02:00', 'Referral completion · weekly', 'Week 40', '209', 'Sent']];
  const rows = LOG.filter(r => match(r[1], r[2]) && (fv('st', 'all') === 'all' || r[4] === fv('st')));
  k.table(['Time', 'Data set', 'Period', 'Values', 'Status', { l: '', al: 'right' }], '1.1fr 2fr .9fr .7fr .9fr .9fr', rows.map(r => ({
    cells: [C.text(r[0]), C.text(r[1], '', { fw: 500, color: '#172B4D' }), C.text(r[2]), C.text(r[3]), C.badge(r[4] === 'Sent' ? badge('success', 'Sent') : badge('error', 'Failed')),
      r[4] === 'Failed' ? C.btn('Retry', 'refresh-cw', () => { k.set({ retried: true }); k.toast('Retry sent · 216 values accepted'); }) : C.text('')]
  })), LOG.length, 760, 'pushes');
}

export function exportsPage(k: PageKit) {
  const { pg, st, fv, match } = k;
  pg.title = 'Exports'; pg.sub = 'De-identified data for analysis · every request is logged';
  pg.actions = [act('New export', 'plus', () => k.set({ modal: 'export' }), 'primary')];
  pg.hasSearch = true; pg.searchPh = 'Search export ID or data';
  pg.filters = k.mkFilters([['st', 'Status', [['all', 'All'], ['Ready', 'Ready'], ['Awaiting approval', 'Awaiting approval'], ['Expired', 'Expired']]]]);
  const EX = st.newExports.concat([['EXP-0092', 'Checks, referrals', 'Jul–Sep 2026', '27 Oct', 'Awaiting approval'], ['EXP-0088', 'Checks', 'Apr–Jun 2026', '2 Jul', 'Ready'], ['EXP-0081', 'Referrals', 'Jan–Mar 2026', '4 Apr', 'Expired']]);
  const tone: Record<string, Tone> = { Ready: 'success', 'Awaiting approval': 'warning', Expired: 'neutral' };
  const rows = EX.filter(r => match(r[0], r[1]) && (fv('st', 'all') === 'all' || r[4] === fv('st')));
  k.table(['Export', 'Data', 'Period', 'Requested', 'Status', { l: '', al: 'right' }], '1fr 1.6fr 1.1fr .9fr 1.2fr 1fr', rows.map(r => ({
    cells: [C.mono(r[0]), C.text(r[1], '', { fw: 500, color: '#172B4D' }), C.text(r[2]), C.text(r[3]), C.badge(badge(tone[r[4]], r[4])), r[4] === 'Ready' ? C.btn('Download', 'download', () => k.toast(r[0] + ' downloaded')) : C.text('')]
  })), EX.length, 760, 'exports');
}
