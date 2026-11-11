// Supervisor: Overview, Overdue referrals, Data quality
import { act, badge, BAND, C, kpi } from '@/app/kit';
import type { PageKit } from '@/app/pageKit';

// [name, area, checks, avg time, positive %, last sync, status, note]
const CHW: [string, string, number, string, number, string, string, string][] = [
  ['Nasreen Bibi', 'Gujar Garhi', 64, '12m 10s', 9, '12 min ago', 'ok', ''],
  ['Shazia Parveen', 'Mohalla Bazar', 71, '3m 50s', 4, '1 hour ago', 'review', 'Very fast checks'],
  ['Robina Kausar', 'Shergarh', 48, '13m 20s', 31, '2 hours ago', 'review', 'High positive rate'],
  ['Farzana Gul', 'Lund Khwar', 52, '10m 55s', 8, '6 days ago', 'sync', ''],
  ['Gulnaz Bibi', 'Pir Sabaq', 39, '11m 05s', 10, '25 min ago', 'review', 'Outside catchment'],
  ['Salma Khan', 'Takht Bhai', 58, '12m 40s', 7, '3 hours ago', 'ok', ''],
  ['Naheed Akhtar', 'Sher Garh 2', 44, '14m 30s', 11, 'Yesterday', 'ok', ''],
  ['Kulsoom Bibi', 'Jalala', 36, '9m 50s', 12, '40 min ago', 'ok', '']
];

export function overview(k: PageKit) {
  const { pg, fv, match } = k;
  pg.title = 'Overview'; pg.sub = 'Takht Bhai cluster · October 2026';
  pg.actions = [act('Export report', 'download', () => k.toast('Report downloaded as CSV'))];
  pg.kpis = [kpi('Checks this month', '412', '+8% from September', 'info', 'clipboard-check', 'success'), kpi('Screen-positive rate', '9.2%', 'Within expected range', 'info', 'activity'), kpi('Overdue referrals', '7', '3 are over 14 days late', 'error', 'clock', 'error')];
  pg.section = 'Health workers'; pg.hasSearch = true; pg.searchPh = 'Search name or area';
  pg.filters = k.mkFilters([['status', 'Status', [['all', 'All'], ['ok', 'On track'], ['review', 'Needs review'], ['sync', 'Not synced']]], ['sort', 'Sort', [['checks', 'Most checks'], ['pos', 'Positive rate'], ['name', 'Name A–Z']]]]);
  const sort = fv('sort', 'checks');
  const rows = CHW.filter(r => match(r[0], r[1]) && (fv('status', 'all') === 'all' || r[6] === fv('status'))).sort((a, b) => (sort === 'name' ? a[0].localeCompare(b[0]) : sort === 'pos' ? b[4] - a[4] : b[2] - a[2]));
  const warn = { color: '#B45309', fw: 600 };
  k.table(['Health worker', 'Checks', 'Avg. time', 'Positive rate', 'Last sync', 'Status'], '2fr 1.3fr 1fr 1fr 1.1fr 1.4fr', rows.map(r => ({
    cells: [
      C.person(r[0], r[1]), C.bar(r[2], Math.round((r[2] / 71) * 100)),
      C.text(r[3], '', r[7] === 'Very fast checks' ? warn : null),
      C.text(r[4] + '%', '', r[7] === 'High positive rate' ? warn : null),
      C.text(r[5], '', r[6] === 'sync' ? { color: '#B91C1C', fw: 600 } : null),
      C.badge(r[6] === 'ok' ? badge('success', 'On track') : r[6] === 'sync' ? badge('error', 'Not synced') : badge('warning', r[7]))
    ]
  })), CHW.length, 860, 'health workers');
}

// [id, child, age, band, clinic, days late, health worker]
const OD: [string, string, string, string, string, number, string][] = [
  ['RF-0402', 'Saad Ullah', '3y 2m', 'High', 'RHC Takht Bhai', 21, 'Robina Kausar'], ['RF-0412', 'Hira Bibi', '1y 11m', 'Medium', 'MMC Child Clinic', 13, 'Farzana Gul'],
  ['RF-0391', 'Bilal Khan', '2y 4m', 'High', 'MMC Child Clinic', 9, 'Nasreen Bibi'], ['RF-0395', 'Imran Wali', '4y', 'High', 'DHQ Mardan', 6, 'Salma Khan'],
  ['RF-0398', 'Mahnoor', '2y 6m', 'Medium', 'DHQ Mardan', 4, 'Kulsoom Bibi'], ['RF-0409', 'Zainab Ahmed', '11m', 'High', 'MMC Child Clinic', 3, 'Nasreen Bibi'],
  ['RF-0401', 'Ayesha Gul', '3y 5m', 'Medium', 'RHC Takht Bhai', 2, 'Gulnaz Bibi']
];

export function referrals(k: PageKit) {
  const { pg, fv, match, st } = k;
  pg.title = 'Overdue referrals'; pg.sub = 'Children past their visit-by date with no clinic outcome';
  pg.hasSearch = true; pg.searchPh = 'Search child, ID or health worker';
  pg.filters = k.mkFilters([['band', 'Band', [['all', 'All'], ['High', 'High'], ['Medium', 'Medium']]], ['late', 'Late by', [['all', 'Any'], ['7', '7+ days'], ['14', '14+ days']]], ['clinic', 'Clinic', [['all', 'All'], ['MMC Child Clinic', 'MMC Child Clinic'], ['DHQ Mardan', 'DHQ Mardan'], ['RHC Takht Bhai', 'RHC Takht Bhai']]]]);
  const rows = OD.filter(r => match(r[0], r[1], r[6]) && (fv('band', 'all') === 'all' || r[3] === fv('band')) && (fv('late', 'all') === 'all' || r[5] >= +fv('late')) && (fv('clinic', 'all') === 'all' || r[4] === fv('clinic')));
  k.table(['Child', 'Band', 'Clinic', 'Late by', 'Health worker', { l: '', al: 'right' }], '2fr .9fr 1.4fr .8fr 1.3fr 1.1fr', rows.map(r => ({
    cells: [
      C.person(r[1], r[0] + ' · ' + r[2]), C.badge(BAND[r[3]]), C.text(r[4]),
      C.text(r[5] + ' days', '', r[5] >= 14 ? { color: '#B91C1C', fw: 600 } : { fw: 500 }), C.text(r[6]),
      st.esc[r[0]]
        ? C.badge(badge('success', 'Escalated', 'check'), true)
        : C.btn('Escalate', 'arrow-up-right', () => { k.set(s => ({ esc: { ...s.esc, [r[0]]: true } })); k.toast(r[1] + ' escalated to the clinic and supervisor'); })
    ]
  })), OD.length, 820, 'referrals');
}

// [id, type, issue, detail, health worker, records, raised]
const FL: [string, string, string, string, string, number, string][] = [
  ['f1', 'speed', 'Very fast checks', '6 checks under 4 minutes', 'Shazia Parveen', 6, 'Today'],
  ['f2', 'pattern', 'Same answer to every question', 'All "Yes" on 3 checks', 'Robina Kausar', 3, 'Yesterday'],
  ['f3', 'location', 'Outside catchment', '2 households 4 km away', 'Gulnaz Bibi', 2, '14 Oct'],
  ['f4', 'edit', 'Birth date changed after a check', 'Age set may be wrong', 'Salma Khan', 1, '13 Oct'],
  ['f5', 'sync', 'No sync for 6 days', 'About 14 records on the phone', 'Farzana Gul', 14, '9 Oct']
];
// [child, original band, health worker, re-check by, result, tone]
const SM: [string, string, string, string, string, string][] = [
  ['Hassan Ali', 'High', 'Gulnaz Bibi', '21 Oct', 'Same band', 'success'], ['Adil Khan', 'Low', 'Shazia Parveen', '20 Oct', 'Band changed', 'warning'],
  ['Maryam Shah', 'Medium', 'Nasreen Bibi', '22 Oct', 'Booked', 'info'], ['Laiba Noor', 'Medium', 'Kulsoom Bibi', '23 Oct', 'Booked', 'info'],
  ['Noor Fatima', 'Low', 'Robina Kausar', '24 Oct', 'Not started', 'neutral'], ['Ayaan Shah', 'Low', 'Salma Khan', '25 Oct', 'Not started', 'neutral']
];

export function quality(k: PageKit) {
  const { pg, st } = k;
  const open = FL.filter(f => !st.reviewed[f[0]]).length;
  const tab = k.tabOf('flags'); k.pk += ':' + tab;
  pg.title = 'Data quality'; pg.sub = 'Checks to review and this week’s re-screen sample';
  pg.tabs = k.mkTabs([['flags', 'Flags', open], ['sample', 'Re-screen sample', 6]], tab);
  pg.hasSearch = true;
  if (tab === 'flags') {
    pg.searchPh = 'Search issue or health worker';
    pg.filters = k.mkFilters([['type', 'Type', [['all', 'All'], ['speed', 'Speed'], ['pattern', 'Answer pattern'], ['location', 'Location'], ['edit', 'Edits'], ['sync', 'Sync']]], ['st', 'Status', [['all', 'All'], ['open', 'Open'], ['rev', 'Reviewed']]]]);
    const rows = FL.filter(r => k.match(r[2], r[3], r[4]) && (k.fv('type', 'all') === 'all' || r[1] === k.fv('type')) && (k.fv('st', 'all') === 'all' || (k.fv('st') === 'rev') === !!st.reviewed[r[0]]));
    k.table(['Issue', 'Health worker', 'Records', 'Raised', { l: '', al: 'right' }], '2.4fr 1.3fr .7fr .8fr 1fr', rows.map(r => ({
      cells: [
        C.text(r[2], r[3], { fw: 600, color: '#172B4D' }), C.text(r[4]), C.text(r[5]), C.text(r[6]),
        st.reviewed[r[0]]
          ? C.badge(badge('success', 'Reviewed', 'check'), true)
          : C.btn('Mark reviewed', 'check', () => { k.set(s => ({ reviewed: { ...s.reviewed, [r[0]]: true } })); k.toast('Flag marked as reviewed'); })
      ]
    })), FL.length, 820, 'flags');
  } else {
    pg.searchPh = 'Search child or health worker';
    pg.actions = [act('Draw new sample', 'shuffle', () => k.toast('New 5% sample drawn for next week'))];
    pg.filters = k.mkFilters([['st', 'Status', [['all', 'All'], ['Not started', 'Not started'], ['Booked', 'Booked'], ['done', 'Done']]]]);
    const sf = k.fv('st', 'all');
    const rows = SM.filter(r => k.match(r[0], r[2]) && (sf === 'all' || (sf === 'done' ? r[4] === 'Same band' || r[4] === 'Band changed' : r[4] === sf)));
    k.table(['Child', 'Original band', 'Health worker', 'Re-check by', 'Result'], '1.8fr 1fr 1.4fr 1fr 1.2fr', rows.map(r => ({
      cells: [C.person(r[0], 'Sampled 14 Oct'), C.badge(BAND[r[1]]), C.text(r[2]), C.text(r[3]), C.badge(badge(r[5] as any, r[4]))]
    })), SM.length, 720, 'children');
  }
}

/** Open data-quality flags (sidebar count). */
export const openFlags = (reviewed: Record<string, boolean>) => FL.length - Object.keys(reviewed).length;
