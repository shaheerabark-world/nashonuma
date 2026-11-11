// Admin: Instruments (list + item builder for the non-MORBAS/SDQ instruments), Users & access, Audit log, Consent withdrawal.
// MORBAS and SDQ instrument pages come from their module builders.
import { act, badge, C, type Tone } from '@/app/kit';
import type { PageKit } from '@/app/pageKit';
import { consentRequests, instruments } from '@/data/mock/app';

export const emptyBld = () => ({ q: '', items: [] as any[], cur: {} as any, none: false } as any);

export function instrumentList(k: PageKit) {
  const { pg, st, fv, match } = k;
  const INSTR = instruments(st.published);
  pg.title = 'Instruments'; pg.sub = 'The checks health workers run on their phones';
  pg.actions = [act('New instrument', 'plus', () => k.toast('Draft instrument created'), 'primary')];
  pg.hasSearch = true; pg.searchPh = 'Search instruments';
  pg.filters = k.mkFilters([['st', 'Status', [['all', 'All'], ['Live', 'Live'], ['Draft', 'Draft']]]]);
  const rows = INSTR.filter(r => match(r[1]) && (fv('st', 'all') === 'all' || r[4] === fv('st')));
  k.table(['Instrument', 'Version', 'Status', 'Updated', { l: '', al: 'right' }], '2.4fr .8fr .9fr .9fr .3fr', rows.map(r => ({
    onClick: () => k.set({ instr: r[0], item: 6, open: null }),
    cells: [C.text(r[1], r[2], { fw: 600, color: '#172B4D' }), C.text(r[3]), C.badge(r[4] === 'Live' ? badge('success', 'Live') : badge('info', 'Draft')), C.text(r[5]), C.chev()]
  })), INSTR.length, 680, 'instruments');
}

const ITEMS: [string, string][] = [
  ['Smiles back', 'When you smile at {child}, does {child} smile back?'], ['Turns to name', 'When you call {child}’s name, does {child} look up or turn?'],
  ['Plays pretend', 'Does {child} pretend, like feeding a doll or talking on a toy phone?'], ['Interest in children', 'Is {child} interested in other children?'],
  ['Brings things to show', 'Does {child} bring things to show you, just to share?'], ['Points to ask', 'Does {child} point with a finger to ask for something?'],
  ['Looks where you point', 'When you point at a toy far away, does {child} turn to look at it?'], ['Copies you', 'Does {child} copy what you do, like clapping or waving?'],
  ['Looks at your face', 'Does {child} look at your face to see how you feel?'], ['Everyday sounds', 'Does {child} get very upset by everyday sounds?'],
  ['Follows requests', 'Does {child} follow a simple request without you pointing?'], ['Points to show', 'Does {child} point with one finger to show you something?']
];

/** Instrument detail (items / scoring / versions). Returns the item-builder model (`bld`). */
export function instrumentDetail(k: PageKit) {
  const { pg, st } = k;
  const INSTR = instruments(st.published);
  const ins = INSTR.find(r => r[0] === st.instr) || INSTR[0];
  const tab = k.tabOf('items'); k.pk += ':b:' + tab;
  let bld = emptyBld();
  pg.hasBack = true; pg.backLabel = 'All instruments'; pg.onBack = () => k.set({ instr: null });
  pg.title = ins[1]; pg.sub = ins[3] + ' · ' + ins[4] + ' · ' + ins[2];
  pg.actions = [
    act('Preview', 'smartphone', () => k.toast('Preview sent to your test phone')),
    act(st.published && ins[0] === 'scc' ? 'Published' : 'Publish ' + ins[3], 'upload', () => { k.set({ published: true }); k.toast(ins[3] + ' published · phones update on next sync'); }, 'primary', ins[4] === 'Live' || st.published)
  ];
  pg.tabs = k.mkTabs([['items', 'Items', 12], ['scoring', 'Scoring'], ['versions', 'Versions', 3]], tab);
  if (tab === 'items') {
    const bq: string = st.bq || '';
    const cur: number = st.item ?? 6;
    const list = ITEMS.map((it, i) => ({ i, it })).filter(x => !bq || x.it[0].toLowerCase().includes(bq.toLowerCase()));
    bld = {
      q: bq, onQ: (e: { target: { value: string } }) => k.set({ bq: e.target.value }), none: list.length === 0,
      onAdd: () => k.toast('New item added at the end'), onSave: () => k.toast('Item ' + (cur + 1) + ' saved to draft'),
      items: list.map(({ i, it }) => ({ n: i + 1, t: it[0], bg: i === cur ? '#EFF6FF' : 'transparent', fg: i === cur ? '#1D4ED8' : '#334155', fw: i === cur ? 600 : 400, onClick: () => k.set({ item: i }) })),
      cur: { n: cur + 1, t: ITEMS[cur][0], q: ITEMS[cur][1], key: 'it' + cur }
    };
    pg.showItems = true;
  } else if (tab === 'scoring') {
    pg.showScoring = true;
  } else {
    k.table(['Version', 'Status', 'Checks run', 'Changes', 'Date'], '.7fr .9fr .9fr 2fr .9fr', [
      ['v2.1', st.published ? 'Live' : 'Draft', '—', 'Item 7 skip rule, new item 12', 'Today'],
      ['v2.0', st.published ? 'Retired' : 'Live', '9,412', 'Picture for every item', '3 Mar 2026'],
      ['v1.3', 'Retired', '4,880', 'First field version', 'Sep 2025']
    ].map(r => ({ cells: [C.mono(r[0]), C.badge(badge(r[1] === 'Live' ? 'success' : r[1] === 'Draft' ? 'info' : 'neutral', r[1])), C.text(r[2]), C.text(r[3]), C.text(r[4])] })), 3, 640, 'versions');
  }
  return bld;
}

export function users(k: PageKit) {
  const { pg, st } = k;
  const tab = k.tabOf('users'); k.pk += ':' + tab;
  pg.title = 'Users & access'; pg.sub = 'People, roles, facilities and catchment areas';
  pg.tabs = k.mkTabs([['users', 'Users', 8 + st.newUsers.length], ['roles', 'Roles', 6], ['facilities', 'Facilities', 4], ['catchments', 'Catchments', 4]], tab);
  pg.hasSearch = true;
  if (tab === 'users') {
    pg.actions = [act('Add user', 'user-plus', () => k.set({ modal: 'user', nu: { name: '', contact: '', role: 'Health worker' } }), 'primary')];
    pg.searchPh = 'Search name, phone or email';
    pg.filters = k.mkFilters([['role', 'Role', [['all', 'All'], ['Health worker', 'Health worker'], ['Supervisor', 'Supervisor'], ['Clinician', 'Clinician'], ['Programme', 'Programme'], ['Researcher', 'Researcher'], ['Admin', 'Admin']]], ['st', 'Status', [['all', 'All'], ['Active', 'Active'], ['Inactive', 'Inactive'], ['Invited', 'Invited']]]]);
    const U = st.newUsers.concat([
      ['Nasreen Bibi', '0300 ••• 115', 'Health worker', 'Gujar Garhi', 'Active', '12 min ago'], ['Shazia Parveen', '0302 ••• 448', 'Health worker', 'Mohalla Bazar', 'Active', '1 hour ago'],
      ['Farzana Gul', '0345 ••• 902', 'Health worker', 'Lund Khwar', 'Inactive', '6 days ago'], ['Rukhsana Begum', '0333 ••• 761', 'Supervisor', 'Takht Bhai cluster', 'Active', '1 hour ago'],
      ['Dr Sana Iqbal', 'sana.iqbal@mmc.pk', 'Clinician', 'MMC Child Clinic', 'Active', 'Now'], ['Imran Khattak', 'imran.k@health.kp.gov.pk', 'Programme', 'All districts', 'Active', '2 hours ago'],
      ['Dr Hira Malik', 'hira.malik@uni.edu.pk', 'Researcher', 'Validation study', 'Active', 'Yesterday'], ['Faisal Ahmed', 'faisal@nashonuma.pk', 'Admin', 'System', 'Active', 'Now']
    ]);
    const rows = U.filter(r => k.match(r[0], r[1], r[3]) && (k.fv('role', 'all') === 'all' || r[2] === k.fv('role')) && (k.fv('st', 'all') === 'all' || r[4] === k.fv('st')));
    k.table(['User', 'Role', 'Facility or area', 'Status', 'Last active'], '2.2fr 1.1fr 1.4fr .9fr 1fr', rows.map(r => ({
      cells: [C.person(r[0], r[1]), C.badge(badge(r[2] === 'Admin' ? 'info' : 'neutral', r[2])), C.text(r[3]), C.badge(badge(r[4] === 'Active' ? 'success' : r[4] === 'Invited' ? 'info' : 'neutral', r[4])), C.text(r[5])]
    })), U.length, 760, 'users');
  } else if (tab === 'roles') {
    pg.searchPh = 'Search roles';
    const R: [string, number, string][] = [['Health worker', 214, 'Register and check children in their own area'], ['Supervisor', 26, 'See team performance and escalate referrals'], ['Clinician', 9, 'See referred children and record outcomes'], ['Programme', 4, 'District numbers, DHIS2 and de-identified exports'], ['Researcher', 3, 'De-identified study data only'], ['Admin', 2, 'Instruments, users and consent withdrawal']];
    const rows = R.filter(r => k.match(r[0], r[2]));
    k.table(['Role', 'Users', 'Can do'], '1.2fr .6fr 3fr', rows.map(r => ({ cells: [C.text(r[0], '', { fw: 600, color: '#172B4D' }), C.text(r[1]), C.text(r[2])] })), R.length, 640, 'roles');
  } else if (tab === 'facilities') {
    pg.actions = [act('Add facility', 'plus', () => k.toast('Facility form opened'), 'secondary')];
    pg.searchPh = 'Search facilities';
    const F = [['Child Development Clinic, MMC', 'Referral clinic', 'Mardan', 'Mon, Wed, Sat'], ['DHQ Mardan · Paediatrics', 'Referral clinic', 'Mardan', 'Tue, Thu'], ['RHC Takht Bhai', 'Rural health centre', 'Mardan', 'Tue'], ['BHU Gujar Garhi', 'Basic health unit', 'Mardan', 'Daily']];
    const rows = F.filter(r => k.match(r[0], r[1]));
    k.table(['Facility', 'Type', 'District', 'Child clinic days'], '2.2fr 1.3fr 1fr 1.2fr', rows.map(r => ({ cells: [C.text(r[0], '', { fw: 600, color: '#172B4D' }), C.text(r[1]), C.text(r[2]), C.text(r[3])] })), F.length, 640, 'facilities');
  } else {
    pg.searchPh = 'Search catchments';
    const K: [string, number, string, string][] = [['Gujar Garhi', 412, 'Nasreen Bibi', 'BHU Gujar Garhi'], ['Mohalla Bazar', 388, 'Shazia Parveen', 'BHU Gujar Garhi'], ['Shergarh', 290, 'Robina Kausar', 'RHC Takht Bhai'], ['Lund Khwar', 344, 'Farzana Gul', 'RHC Takht Bhai']];
    const rows = K.filter(r => k.match(r[0], r[2]));
    k.table(['Catchment', 'Households', 'Health worker', 'Facility'], '1.4fr .9fr 1.4fr 1.6fr', rows.map(r => ({ cells: [C.text(r[0], '', { fw: 600, color: '#172B4D' }), C.text(r[1]), C.text(r[2]), C.text(r[3])] })), K.length, 640, 'catchments');
  }
}

export function audit(k: PageKit) {
  const { pg, fv, match } = k;
  pg.title = 'Audit log'; pg.sub = 'Append-only record of every view, change, export and deletion';
  pg.actions = [act('Export log', 'download', () => k.toast('Audit log exported'))];
  pg.hasSearch = true; pg.searchPh = 'Search user, record or detail';
  pg.filters = k.mkFilters([['a', 'Action', [['all', 'All'], ['Viewed', 'Viewed'], ['Edited', 'Edited'], ['Exported', 'Exported'], ['Deleted', 'Deleted'], ['Synced', 'Synced']]], ['r', 'Role', [['all', 'All'], ['Health worker', 'Health worker'], ['Supervisor', 'Supervisor'], ['Clinician', 'Clinician'], ['Programme', 'Programme'], ['Researcher', 'Researcher'], ['Admin', 'Admin']]], ['p', 'Period', [['7', 'Last 7 days'], ['30', 'Last 30 days']]]]);
  const AU = [
    ['27 Oct, 11:42', 'Dr Sana Iqbal', 'Clinician', 'Edited', 'Recorded clinic outcome', 'RF-0418'], ['27 Oct, 11:40', 'Dr Sana Iqbal', 'Clinician', 'Viewed', 'Opened child record', 'NN-0418'],
    ['27 Oct, 09:15', 'Imran Khattak', 'Programme', 'Exported', 'Requested de-identified export', 'EXP-0092'], ['26 Oct, 18:02', 'Faisal Ahmed', 'Admin', 'Edited', 'Changed skip rule on item 7', 'SCC v2.1'],
    ['26 Oct, 16:20', 'Rukhsana Begum', 'Supervisor', 'Edited', 'Escalated referral', 'RF-0391'], ['26 Oct, 10:05', 'Nasreen Bibi', 'Health worker', 'Synced', 'Synced 6 records from phone', 'DEV-114'],
    ['25 Oct, 14:31', 'Faisal Ahmed', 'Admin', 'Deleted', 'Withdrew consent and deleted data', 'WR-0007'], ['24 Oct, 15:12', 'Dr Hira Malik', 'Researcher', 'Edited', 'Linked study pair', 'VS-1060']
  ];
  const tone: Record<string, Tone> = { Viewed: 'neutral', Edited: 'info', Exported: 'warning', Deleted: 'error', Synced: 'success' };
  const rows = AU.filter(r => match(r[1], r[4], r[5]) && (fv('a', 'all') === 'all' || r[3] === fv('a')) && (fv('r', 'all') === 'all' || r[2] === fv('r')));
  k.table(['When', 'User', 'Action', 'Detail', 'Record'], '1.1fr 1.8fr .9fr 2fr 1fr', rows.map(r => ({ cells: [C.text(r[0]), C.person(r[1], r[2]), C.badge(badge(tone[r[3]], r[3])), C.text(r[4]), C.mono(r[5])] })), AU.length, 820, 'entries');
}

const wTone: Record<string, Tone> = { Verified: 'info', 'Awaiting ID': 'warning', Completed: 'success' };

export function consent(k: PageKit) {
  const { pg, st, fv, match } = k;
  const WR = consentRequests(st.wr);
  pg.title = 'Consent withdrawal'; pg.sub = 'Remove a child’s personal data when the family asks';
  pg.hasSearch = true; pg.searchPh = 'Search request, child or code';
  pg.filters = k.mkFilters([['st', 'Status', [['all', 'All'], ['Verified', 'Ready to delete'], ['Awaiting ID', 'Awaiting ID'], ['Completed', 'Completed']]]]);
  const rows = WR.filter(r => match(r[0], r[1], r[2]) && (fv('st', 'all') === 'all' || r[5] === fv('st')));
  k.table(['Request', 'Child', 'Requested via', 'Date', 'Status', { l: '', al: 'right' }], '.9fr 1.4fr 2fr .8fr 1.1fr .3fr', rows.map(r => ({
    onClick: () => k.set({ wrSel: r[0], wcheck: false }),
    cells: [C.mono(r[0]), C.person(r[1], r[2]), C.text(r[3]), C.text(r[4]), C.badge(badge(wTone[r[5]], r[5] === 'Verified' ? 'Ready to delete' : r[5])), C.chev()]
  })), WR.length, 760, 'requests');
}

/** Consent request detail drawer (`wd` in the template). */
export function consentDetail(k: PageKit) {
  const { st, role, page } = k;
  const WR = consentRequests(st.wr);
  const w = role === 'admin' && page === 'consent' && st.wrSel ? WR.find(r => r[0] === st.wrSel) : null;
  return {
    open: !!w, close: () => k.set({ wrSel: null }), id: w ? w[0] : '', child: w ? w[1] : '', code: w ? w[2] : '', via: w ? w[3] : '', date: w ? w[4] : '',
    b: badge(w ? wTone[w[5]] : 'neutral', w ? (w[5] === 'Verified' ? 'Ready to delete' : w[5]) : ''),
    del: ['Name, phone, household and GPS', 'All check answers, photos and audio', 'Consent record and referral slips', 'Clinic notes linked to this child'],
    keep: ['Totals already sent to DHIS2 (not traceable)', 'An audit entry with no personal data'],
    canAct: !!w && w[5] === 'Verified', isDone: !!w && w[5] === 'Completed', check: !!st.wcheck, noCheck: !st.wcheck,
    onCheck: () => k.set({ wcheck: !st.wcheck }), ask: () => k.set({ modal: 'confirm' }),
    confirm: () => {
      if (!w) return;
      k.set(s => ({ wr: { ...s.wr, [w[0]]: true }, modal: null, wcheck: false }));
      k.toast(w[1] + '’s personal data deleted');
    }
  };
}
