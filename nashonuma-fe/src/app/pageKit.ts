// Per-render helpers for page builders: search, filters, tabs and the table model.
// Port of the closures inside renderVals() (q, fv, match, mkFilters, mkTabs, table).
import type { Action, Cell, Kpi } from './kit';
import { toast as showToast, useAppStore, type AppState, type Updater } from './state';

export interface TableModel {
  cols: { l: string; al: string }[];
  tpl: string;
  minW: string;
  rows: { cells: Cell[]; onClick?: () => void; cur: string; bg: string }[];
}

/** Page view-model: what the shared page layout renders. Builders fill in what they need. */
export interface Pg {
  title: string; sub: string; actions: Action[]; kpis: Kpi[]; tabs: any[]; filters: any[];
  hasSearch: boolean; searchPh: string; section: string; table: TableModel | null;
  showMap: boolean; showValidation: boolean; showItems: boolean; showScoring: boolean; hasBack: boolean;
  countText?: string; backLabel?: string; onBack?: () => void;
  [k: string]: any;
}

export const newPg = (): Pg => ({
  title: '', sub: '', actions: [], kpis: [], tabs: [], filters: [], hasSearch: false, searchPh: '', section: '',
  table: null, showMap: false, showValidation: false, showItems: false, showScoring: false, hasBack: false
});

// ---------- the `self` the prototype's builders talk to ----------
type Navigate = (role: string, page: string | null) => void;
let navigateImpl: Navigate = () => {};
/** Registered by the router so setState({ role, page }) changes the URL. */
export const setNavigator = (fn: Navigate) => { navigateImpl = fn; };

export interface Self {
  readonly state: AppState;
  setState(u: Updater): void;
  toast(msg: string): void;
}

/**
 * Same API as the prototype component (`this.setState`, `this.toast`).
 * `role` and `page` are not kept in state: they live in the URL (/:role/:page).
 */
export function makeSelf(getRoute: () => { role: string; page: string }): Self {
  return {
    get state() {
      return useAppStore.getState();
    },
    setState(u: Updater) {
      const cur = useAppStore.getState();
      const patch: Partial<AppState> = typeof u === 'function' ? u(cur) : u;
      if ('role' in patch || 'page' in patch) {
        const { role, page, ...rest } = patch;
        const r = getRoute();
        navigateImpl(role !== undefined ? role : r.role, 'role' in patch && !('page' in patch) ? null : (page as string | null));
        useAppStore.setState(rest);
      } else {
        useAppStore.setState(patch);
      }
    },
    toast: showToast
  };
}

export interface PageKit {
  st: AppState;
  self: Self;
  set: Self['setState'];
  toast: Self['toast'];
  role: string;
  page: string;
  pg: Pg;
  /** page key for search/filter/tab state; builders may extend it (e.g. "admin:users:roles") */
  pk: string;
  tabOf(def: string): string;
  mkTabs(defs: [string, string, (number | null)?][], cur: string): any[];
  q(): string;
  fv(k: string, d?: string): string;
  match(...xs: unknown[]): boolean;
  mkFilters(defs: [string, string, [string, string][]][]): any[];
  table(cols: (string | { l: string; al: string })[], tpl: string, rows: { cells: Cell[]; onClick?: () => void }[], total: number, minW: number, noun: string): void;
}

export function makePageKit(st: AppState, self: Self, role: string, page: string, pg: Pg): PageKit {
  const set = self.setState;
  const k: PageKit = {
    st, self, set, toast: self.toast, role, page, pg,
    pk: role + ':' + page,
    tabOf: def => st.tab[role + ':' + page] || def,
    mkTabs: (defs, cur) => defs.map(([key, label, count]) => ({
      label, count: count == null ? '' : String(count), hasCount: count != null,
      bd: key === cur ? '#2563EB' : 'transparent', fg: key === cur ? '#2563EB' : '#64748B',
      cbg: key === cur ? '#DBEAFE' : '#F1F5F9', cfg: key === cur ? '#1D4ED8' : '#64748B',
      onClick: () => set(s => ({ tab: { ...s.tab, [role + ':' + page]: key }, open: null }))
    })),
    q: () => st.q[k.pk] || '',
    fv: (key, d) => (st.f[k.pk] || {})[key] ?? (d as string),
    match: (...xs) => {
      const s = k.q().trim().toLowerCase();
      return !s || xs.join(' ').toLowerCase().includes(s);
    },
    mkFilters: defs => defs.map(([key, label, opts]) => {
      const pk = k.pk;
      const id = pk + '|' + key, val = k.fv(key, opts[0][0]), active = val !== opts[0][0];
      return {
        label, valueLabel: (opts.find(o => o[0] === val) || opts[0])[1], open: st.open === id,
        bd: active ? '#93C5FD' : '#CBD5E1', bg: active ? '#EFF6FF' : '#FFFFFF', fg: active ? '#1D4ED8' : '#172B4D', active,
        toggle: () => set({ open: st.open === id ? null : id }),
        options: opts.map(([v, l]) => ({
          l, sel: v === val, fw: v === val ? 600 : 400,
          onClick: () => set(s => ({ f: { ...s.f, [pk]: { ...(s.f[pk] || {}), [key]: v } }, open: null }))
        }))
      };
    }),
    table: (cols, tpl, rows, total, minW, noun) => {
      pg.table = {
        cols: cols.map(c => (typeof c === 'string' ? { l: c, al: 'left' } : c)),
        tpl,
        minW: (minW || 760) + 'px',
        rows: rows.map(r => ({ cells: r.cells, onClick: r.onClick, cur: r.onClick ? 'pointer' : 'default', bg: '#FFFFFF' }))
      };
      pg.countText = rows.length === total ? total + ' ' + noun : rows.length + ' of ' + total + ' ' + noun;
    }
  };
  return k;
}
