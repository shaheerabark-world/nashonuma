// Clinician: Referral queue (+ child detail panel) and Completed.
// Parent reports, Mothers' wellbeing, Children, MORBAS and Exercises come from the module builders.
import { badge, BAND, C, type Tone } from '@/app/kit';
import type { PageKit } from '@/app/pageKit';
import { OC, ocLabel, REF } from '@/data/mock/app';

const stTone: Record<string, Tone> = { Arrived: 'success', Booked: 'info', 'Not booked': 'warning' };

export function queue(k: PageKit) {
  const { pg, st, fv, match } = k;
  const live = REF.filter(r => !st.done[r[0]]);
  pg.title = 'Referral queue'; pg.sub = 'Child Development Clinic · Mardan Medical Complex';
  pg.hasSearch = true; pg.searchPh = 'Search name or referral ID';
  pg.filters = k.mkFilters([['urg', 'Urgency', [['all', 'All'], ['High', 'High'], ['Medium', 'Medium']]], ['st', 'Status', [['all', 'All'], ['Arrived', 'Arrived'], ['Booked', 'Booked'], ['Not booked', 'Not booked']]]]);
  const rows = live.filter(r => match(r[0], r[1]) && (fv('urg', 'all') === 'all' || r[3] === fv('urg')) && (fv('st', 'all') === 'all' || r[6] === fv('st')));
  k.table(['Child', 'Urgency', 'Waiting', 'Referred by', 'Status', { l: '', al: 'right' }], '2.2fr 1fr .9fr 1.3fr 1fr .3fr', rows.map(r => ({
    onClick: () => k.set({ sel: r[0], outcome: null }),
    cells: [C.person(r[1], r[0] + ' · ' + r[2]), C.badge(BAND[r[3]]), C.text(r[4] + ' days', '', r[4] >= 30 ? { color: '#B91C1C', fw: 600 } : null), C.text(r[5]), C.badge(badge(stTone[r[6]], r[6])), C.chev()]
  })), live.length, 760, 'children waiting');
}

const DONE0: string[][] = [
  ['RF-0377', 'Hamid', '3y 2m', 'Developmental delay', '24 Oct', 'Robina Kausar'], ['RF-0385', 'Iqra Bibi', '2y 1m', 'Typical development', '23 Oct', 'Salma Khan'],
  ['RF-0369', 'Faizan', '4y 4m', 'Autism (ASD)', '21 Oct', 'Gulnaz Bibi'], ['RF-0372', 'Sana Gul', '1y 9m', 'Did not attend', '20 Oct', 'Nasreen Bibi'],
  ['RF-0360', 'Umar Khan', '5y', 'Both ASD and DD', '17 Oct', 'Kulsoom Bibi']
];

export function completed(k: PageKit) {
  const { pg, st, fv, match } = k;
  pg.title = 'Completed'; pg.sub = 'Outcomes recorded in the last 30 days';
  pg.hasSearch = true; pg.searchPh = 'Search name or referral ID';
  pg.filters = k.mkFilters([['oc', 'Outcome', ([['all', 'All']] as [string, string][]).concat(OC.map(o => [o[1], o[1]] as [string, string]))]]);
  const doneRows = REF.filter(r => st.done[r[0]]).map(r => [r[0], r[1], r[2], ocLabel(st.done[r[0]]), 'Today', r[5]]);
  const ALL = doneRows.concat(DONE0);
  const rows = ALL.filter(r => match(r[0], r[1]) && (fv('oc', 'all') === 'all' || r[3] === fv('oc')));
  k.table(['Child', 'Outcome', 'Seen', 'Referred by'], '2.2fr 1.6fr .8fr 1.3fr', rows.map(r => ({
    cells: [C.person(r[1], r[0] + ' · ' + r[2]), C.badge(badge(r[3] === 'Typical development' ? 'success' : r[3] === 'Did not attend' ? 'neutral' : 'info', r[3])), C.text(r[4]), C.text(r[5])]
  })), ALL.length, 680, 'outcomes');
}

/** Child detail panel for the selected referral in the queue (`cd` in the template). */
export function childDetail(k: PageKit) {
  const { st, role, page } = k;
  const sr = role === 'clinician' && page === 'queue' && st.sel ? REF.find(r => r[0] === st.sel) : null;
  const isAli = !!sr && sr[0] === 'RF-0418';
  const first = sr ? sr[1].split(' ')[0] : '';
  return {
    open: !!sr, close: () => k.set({ sel: null, outcome: null }),
    id: sr ? sr[0] : '', name: sr ? sr[1] : '', age: sr ? sr[2] : '', cg: sr ? sr[7] : '', refd: sr ? sr[8] : '', chw: sr ? sr[5] : '',
    ini: sr ? sr[1].split(' ').map(w => w[0]).slice(0, 2).join('') : '',
    tools: isAli
      ? [{ t: 'Social & talking check', d: '15 Oct · 8 of 20 answers flagged', r: 'High', b: BAND.High }, { t: 'Follow-up questions', d: '3 of 4 still flagged', r: 'Positive', b: BAND.High }, { t: 'Milestones check', d: 'Talking and social areas', r: 'Medium', b: BAND.Medium }]
      : sr ? [{ t: 'Milestones check', d: 'Screened ' + sr[8], r: sr[3], b: BAND[sr[3]] }] : [],
    outcomes: OC.map(([key, t]) => {
      const s = st.outcome === key;
      return { t, bd: s ? '#2563EB' : '#E2E8F0', bg: s ? '#EFF6FF' : '#FFFFFF', dot: s ? '#2563EB' : '#CBD5E1', fill: s ? '#2563EB' : '#FFFFFF', onClick: () => k.set({ outcome: key }) };
    }),
    msg: st.outcome === 'typical' ? 'Visit done. ' + first + ' is developing well.' : st.outcome === 'dna' ? 'Family did not come. Please help them rebook.' : 'Visit done. A support plan has started for ' + first + '.',
    noOutcome: !st.outcome,
    save: () => {
      if (!sr || !st.outcome) return;
      k.set(s => ({ done: { ...s.done, [sr[0]]: s.outcome }, sel: null, outcome: null }));
      k.toast('Outcome saved for ' + sr[1] + ' · referral closed');
    }
  };
}
