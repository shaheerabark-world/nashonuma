// Smoke test: every role/page renders in EN, MN and UR without errors, and shows its page title.
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, describe, expect, it } from 'vitest';
import App from '@/App';
import { AppView } from '@/components/layout/AppView.generated';
import { NAV, type Role } from '@/data/mock/app';
import { setLang, tr } from '@/i18n/lang';
import { useAppStore, initialState } from './state';
import { buildViewModel } from './buildViewModel';
import { makeSelf } from './pageKit';
import { reportsStore } from '@/store';

const render = (url: string) =>
  renderToStaticMarkup(
    <MemoryRouter initialEntries={[url]}>
      <App />
    </MemoryRouter>
  );

const pages = (Object.keys(NAV) as Role[]).flatMap(role => NAV[role].map(([page, , label]) => ({ role, page, label })));

describe.each(['en', 'mn', 'ur'] as const)('renders every page (%s)', lang => {
  afterAll(() => setLang('en'));
  it.each(pages)('$role / $page', ({ role, page, label }) => {
    setLang(lang);
    useAppStore.setState(initialState, true);
    const html = render(`/${role}/${page}`);
    expect(html.length).toBeGreaterThan(1000);
    // the breadcrumb shows the nav label, translated
    expect(html).toContain(escape(tr(label)));
  });
});

// Server rendering of <App/> always uses the store's *initial* state (zustand's server snapshot),
// so tests that depend on state render the view-model directly with the current state.
const renderState = (role: Role, pg: string, extra: Record<string, unknown> = {}) => {
  useAppStore.setState({ ...initialState, liveP: reportsStore.snapshot().reports, liveW: reportsStore.snapshot().wellbeing, ...extra }, true);
  const self = makeSelf(() => ({ role, page: pg }));
  const v = buildViewModel({ st: useAppStore.getState(), self, role, page: pg, isMobile: false, go: () => {}, switchRole: () => {} });
  return renderToStaticMarkup(<AppView v={v} />);
};

describe('module pages show their content', () => {
  const page = (url: string, extra?: Record<string, unknown>) => {
    setLang('en');
    const [, role, pg] = url.split('/');
    return renderState(role as Role, pg, extra);
  };
  it('Parent reports lists the mothers’ checks', () => {
    const html = page('/clinician/reports');
    for (const n of ['Bilal Ahmed', 'Sana Ahmed', 'Usman Ahmed']) expect(html).toContain(n);
  });
  it('Mothers’ wellbeing flags SRQ-20 item 17 as urgent', () => {
    const html = page('/clinician/mothers');
    expect(html).toContain('Rubina Khan');
    expect(html).toMatch(/Urgent/);
  });
  it('MORBAS, children, exercises and the mother’s pages render', () => {
    expect(page('/clinician/morbas')).toMatch(/MORBAS/);
    expect(page('/clinician/children')).toContain('Ayesha Khan');
    expect(page('/clinician/exercises').length).toBeGreaterThan(5000);
    expect(page('/parent/pcheck')).toMatch(/Check my child/);
    expect(page('/parent/pwell')).toMatch(/wellbeing/i);
  });
  it('SDQ admin page shows the import step until licensed text is loaded', () => {
    const html = page('/admin/instruments', { instr: 'sdq', sdqCfg: null });
    expect(html).toContain('SDQ – Strengths and Difficulties Questionnaire');
    expect(html).toContain('All instruments'); // back link of the detail page
  });
  it('a report sent from the phone reaches the clinician list and count', () => {
    const before = reportsStore.snapshot().reports.filter(r => r.status === 'New').length;
    reportsStore.put('reports', { ...reportsStore.snapshot().reports[0], id: 'PR-TEST1', name: 'Test Child', status: 'New' });
    const html = page('/clinician/reports');
    expect(html).toContain('Test Child');
    expect(reportsStore.snapshot().reports.filter(r => r.status === 'New').length).toBe(before + 1);
    reportsStore.reset();
  });
});

describe('interactions through the view-model', () => {
  const vm = (role: Role, page: string) => {
    const self = makeSelf(() => ({ role, page }));
    return buildViewModel({ st: useAppStore.getState(), self, role, page, isMobile: false, go: () => {}, switchRole: () => {} });
  };

  it('filters and search narrow the table', () => {
    useAppStore.setState(initialState, true);
    let v = vm('supervisor', 'overview');
    expect(v.pg.countText).toBe('8 health workers');
    v.pg.filters[0].options[2].onClick(); // Status: Needs review
    v = vm('supervisor', 'overview');
    expect(v.pg.countText).toBe('3 of 8 health workers');
    v.pg.onQ({ target: { value: 'robina' } });
    v = vm('supervisor', 'overview');
    expect(v.pg.countText).toBe('1 of 8 health workers');
    v.pg.clearAll();
    expect(vm('supervisor', 'overview').pg.countText).toBe('8 health workers');
  });

  it('saving a clinic outcome moves the child from the queue to Completed', () => {
    useAppStore.setState(initialState, true);
    let v = vm('clinician', 'queue');
    expect(v.pg.countText).toBe('7 children waiting');
    v.pg.table!.rows[0].onClick!();
    v = vm('clinician', 'queue');
    expect(v.cd.open).toBe(true);
    v.cd.outcomes[0].onClick();
    vm('clinician', 'queue').cd.save();
    expect(vm('clinician', 'queue').pg.countText).toBe('6 children waiting');
    expect(vm('clinician', 'completed').pg.countText).toBe('6 outcomes');
    expect(useAppStore.getState().toast).toBe('Outcome saved for Ali Raza · referral closed');
  });

  it('validation cut-off recomputes sensitivity', () => {
    useAppStore.setState(initialState, true);
    const v = vm('researcher', 'validation');
    expect(v.val.stats[0].k).toBe('Sensitivity');
    v.val.onCut({ target: { value: '8' } });
    expect(vm('researcher', 'validation').val.cutoff).toBe(8);
  });
});

function escape(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#x27;').replace(/"/g, '&quot;');
}
