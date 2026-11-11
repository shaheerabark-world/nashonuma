// Researcher: Validation study (cut-off explorer with Wilson 95% CIs) and Linked pairs
import { act, badge, BAND, C, type Tone } from '@/app/kit';
import type { PageKit } from '@/app/pageKit';

export const emptyVal = () => ({ cutoff: 3, stats: [] as any[], tp: 0, fp: 0, fn: 0, tn: 0, onCut: (_e: any) => {} });

// children by screening score 0..12: without ASD / with ASD (clinic result)
const NON = [120, 110, 85, 55, 38, 24, 15, 10, 7, 5, 3, 2, 0];
const CAS = [1, 2, 3, 5, 6, 7, 8, 9, 9, 8, 7, 5, 4];

/** Wilson score interval, 95% */
export const wilson = (x: number, n: number): [number, number] => {
  const z = 1.96, p = x / n, d = 1 + (z * z) / n, c = p + (z * z) / (2 * n), m = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));
  return [(c - m) / d, (c + m) / d];
};

export function validation(k: PageKit) {
  const { pg, st } = k;
  pg.title = 'Validation study'; pg.sub = 'Social & talking check v2.0 compared with clinical assessment · 548 children';
  pg.actions = [act('Download report', 'file-text', () => k.toast('Validation report downloaded'))];
  const cut: number = st.cutoff || 3;
  const sum = (a: number[], f: (i: number) => boolean) => a.reduce((s, x, i) => s + (f(i) ? x : 0), 0);
  const tp = sum(CAS, i => i >= cut), fn = sum(CAS, i => i < cut), fp = sum(NON, i => i >= cut), tn = sum(NON, i => i < cut);
  const stat = (key: string, x: number, n: number, d: string) => {
    if (!n) return { k: key, v: '—', ci: '—', d };
    const [lo, hi] = wilson(x, n);
    return { k: key, v: Math.round((x / n) * 1000) / 10 + '%', ci: Math.round(lo * 100) + '–' + Math.round(hi * 100) + '%', d };
  };
  pg.showValidation = true;
  return {
    cutoff: cut, tp, fp, fn, tn,
    onCut: (e: { target: { value: string } }) => k.set({ cutoff: Number(e.target.value) }),
    stats: [stat('Sensitivity', tp, tp + fn, 'Children with ASD who screen positive'), stat('Specificity', tn, tn + fp, 'Children without ASD who screen negative'), stat('PPV', tp, tp + fp, 'Positive screens confirmed by clinic'), stat('NPV', tn, tn + fn, 'Negative screens confirmed by clinic')]
  };
}

export function pairs(k: PageKit) {
  const { pg, st, fv, match } = k;
  pg.title = 'Linked pairs'; pg.sub = 'Screenings matched to clinic results by study code';
  pg.actions = [act('Auto-match', 'link', () => { k.set({ matched: true }); k.toast('2 pairs matched'); }, 'secondary', st.matched)];
  pg.hasSearch = true; pg.searchPh = 'Search study code';
  pg.filters = k.mkFilters([['st', 'Status', [['all', 'All'], ['Linked', 'Linked'], ['Needs match', 'Needs match'], ['Excluded', 'Excluded']]], ['band', 'Band', [['all', 'All'], ['High', 'High'], ['Medium', 'Medium'], ['Low', 'Low']]]]);
  const m = st.matched;
  const PR: [string, string, number, string, string, string, string][] = [
    ['VS-1043', '2 Sep', 9, 'High', 'ASD', '18 days', 'Linked'], ['VS-1044', '2 Sep', 1, 'Low', 'Not ASD', '21 days', 'Linked'],
    ['VS-1051', '5 Sep', 4, 'Medium', 'Not ASD (DD)', '26 days', 'Linked'],
    ['VS-1058', '8 Sep', 6, 'Medium', m ? 'ASD' : '—', m ? '30 days' : '—', m ? 'Linked' : 'Needs match'],
    ['VS-1060', '9 Sep', 11, 'High', 'ASD', '12 days', 'Linked'],
    ['VS-1066', '12 Sep', 2, 'Low', m ? 'Not ASD' : '—', m ? '19 days' : '—', m ? 'Linked' : 'Needs match'],
    ['VS-0987', '14 Jun', 3, 'Medium', 'Not ASD', '104 days', 'Excluded']
  ];
  const tone: Record<string, Tone> = { Linked: 'success', 'Needs match': 'warning', Excluded: 'neutral' };
  const rows = PR.filter(r => match(r[0]) && (fv('st', 'all') === 'all' || r[6] === fv('st')) && (fv('band', 'all') === 'all' || r[3] === fv('band')));
  k.table(['Study code', 'Screened', 'Score', 'Band', 'Clinic result', 'Gap', 'Status'], '1fr .9fr .6fr .9fr 1.3fr .8fr 1fr', rows.map(r => ({
    cells: [C.mono(r[0]), C.text(r[1]), C.text(r[2], '', { fw: 600, color: '#172B4D' }), C.badge(BAND[r[3]]), C.text(r[4]), C.text(r[5]), C.badge(badge(tone[r[6]], r[6]))]
  })), PR.length, 760, 'pairs');
}
