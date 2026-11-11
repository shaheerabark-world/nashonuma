// Builds everything AppView binds to. Port of renderVals() in logic.js:
// page builders by role/page, then the module views, then the shell (sidebar, header, modals).
import { getLang, setLang } from '@/i18n/lang';
import { pNewFlow } from '@/domain/parent';
import { nnP, nnW } from '@/store';
import { apiEnabled, logout, session } from '@/api/http';
import { NAV, NOTES, REF, ROLES, USERS, consentRequests, instruments, type Role } from '@/data/mock/app';
import { BAND, act, badge, C } from './kit';
import { makePageKit, newPg, type PageKit, type Self } from './pageKit';
import type { AppState } from './state';
import * as sup from '@/features/supervisor/pages';
import * as cli from '@/features/clinician/pages';
import * as prog from '@/features/programme/pages';
import * as res from '@/features/researcher/pages';
import * as adm from '@/features/admin/pages';
import { buildModuleView } from '@/features/modules';

export type AppVM = ReturnType<typeof buildViewModel>;

type PageBuilder = (k: PageKit) => void;
const PAGES: Record<string, PageBuilder> = {
  'supervisor:overview': sup.overview,
  'supervisor:referrals': sup.referrals,
  'supervisor:quality': sup.quality,
  'clinician:queue': cli.queue,
  'clinician:completed': cli.completed,
  'programme:dhis': prog.dhis,
  'programme:exports': prog.exportsPage,
  'researcher:pairs': res.pairs,
  'admin:users': adm.users,
  'admin:audit': adm.audit,
  'admin:consent': adm.consent
};

export interface BuildOpts {
  st: AppState;
  self: Self;
  role: Role;
  page: string;
  isMobile: boolean;
  go: (page: string) => void;
  switchRole: (role: Role) => void;
}

/** The signed-in user (API mode) or the prototype's sample user for this role. */
function currentUser(role: Role) {
  const u = session.user();
  if (u && u.role === role) return { ini: u.initials, name: u.name, role: u.job };
  return { ini: USERS[role][0], name: USERS[role][1], role: USERS[role][2] };
}

/**
 * The workspace menu. Without the API it switches between all six roles (demo mode).
 * With the API a role is an account, so it shows only the signed-in role and "Sign out".
 */
function roleMenuItems(role: Role, switchRole: (r: Role) => void, close: () => void) {
  if (!apiEnabled) {
    return ROLES.map(([key, label, icon, desc]) => ({ label, icon, desc, sel: key === role, onClick: () => switchRole(key) }));
  }
  const [, label, icon, desc] = ROLES.find(r => r[0] === role)!;
  const email = session.user()?.email;
  return [
    { label, icon, desc: email || desc, sel: true, onClick: close },
    { label: 'Sign out', icon: 'log-out', desc: 'Sign in as another user', sel: false, onClick: logout }
  ];
}

export function buildViewModel({ st, self, role, page, isMobile, go, switchRole }: BuildOpts) {
  const set = self.setState;
  const navDef = NAV[role];
  const pg = newPg();
  const k = makePageKit(st, self, role, page, pg);

  PAGES[role + ':' + page]?.(k);
  const map = role === 'programme' && page === 'dashboard' ? prog.dashboard(k) : prog.emptyMap();
  const val = role === 'researcher' && page === 'validation' ? res.validation(k) : res.emptyVal();
  let bld = adm.emptyBld();
  if (role === 'admin' && page === 'instruments' && !st.instr) adm.instrumentList(k);
  if (role === 'admin' && page === 'instruments' && st.instr && st.instr !== 'morbas' && st.instr !== 'sdq') bld = adm.instrumentDetail(k);
  const cd = cli.childDetail(k);
  const wd = adm.consentDetail(k);

  // MORBAS, Check my child, SRQ-20, SDQ and the exercises render their own views
  const mb = buildModuleView(self, st, role, page, pg, { table: k.table, C, badge, act, mkTabs: k.mkTabs, BAND }) || { on: false, view: null };

  // ---------- derived page flags ----------
  const pk = k.pk;
  const q = k.q();
  const anyActive = pg.filters.some((f: any) => f.active) || !!q;
  Object.assign(pg, {
    hasKpis: pg.kpis.length > 0, hasTabs: pg.tabs.length > 0, hasSection: !!pg.section, hasTable: !!pg.table,
    hasToolbar: pg.hasSearch || pg.filters.length > 0, q, hasQ: !!q, anyActive,
    isEmpty: !!pg.table && pg.table.rows.length === 0, countText: pg.countText || '',
    onQ: (e: { target: { value: string } }) => { const v = e.target.value; set(s => ({ q: { ...s.q, [pk]: v } })); },
    clearQ: () => set(s => ({ q: { ...s.q, [pk]: '' } })),
    clearAll: () => set(s => ({ q: { ...s.q, [pk]: '' }, f: { ...s.f, [pk]: {} }, open: null }))
  });

  // ---------- shell ----------
  const expanded = isMobile || !st.collapsed;
  const roleDef = ROLES.find(r => r[0] === role)!;
  const counts: Record<string, Record<string, number>> = {
    supervisor: { referrals: 7, quality: sup.openFlags(st.reviewed) },
    clinician: { queue: REF.filter(r => !st.done[r[0]]).length, reports: nnP(st).filter(r => r.status === 'New').length, mothers: nnW(st).filter(r => r.status === 'New').length },
    admin: { consent: consentRequests(st.wr).filter(r => r[5] === 'Verified').length }
  };
  const nav = navDef.map(([key, icon, label]) => {
    const a = key === page, c = (counts[role] || {})[key];
    return {
      icon, label, count: c ? String(c) : '', hasCount: !!c,
      bg: a ? '#FFFFFF' : 'transparent', bd: a ? '#E2E8F0' : 'transparent', sh: a ? 'var(--shadow-sm)' : 'none', fg: a ? '#1D4ED8' : '#475569', fw: a ? 600 : 500, hov: a ? '#FFFFFF' : '#F1F5F9',
      cbg: key === 'referrals' || key === 'consent' ? '#FEE2E2' : '#E2E8F0', cfg: key === 'referrals' || key === 'consent' ? '#B91C1C' : '#475569',
      onClick: () => go(key)
    };
  });
  const curNav = navDef.find(n => n[0] === page)!;
  const INSTR = instruments(st.published);
  const crumb = role === 'admin' && page === 'instruments' && st.instr ? (INSTR.find(r => r[0] === st.instr) || INSTR[0])[1] : curNav[2];
  const nu = st.nu;
  const closeModal = () => set({ modal: null });
  const lang = getLang();
  const pickLang = (l: 'en' | 'mn' | 'ur') => () => {
    setLang(l);
    set(s => ({ lang: l, mbLang: l === 'mn' ? 'mn' : 'en', pf: { ...(s.pf || pNewFlow()), lang: l } }));
  };

  return {
    pg, map, val, bld, cd, wd, nav, expanded, crumb, mb,
    langEn: lang === 'en' ? 'nn-lang-b on' : 'nn-lang-b',
    langMn: lang === 'mn' ? 'nn-lang-b on' : 'nn-lang-b',
    langUr: lang === 'ur' ? 'nn-lang-b on' : 'nn-lang-b',
    setEn: pickLang('en'), setMn: pickLang('mn'), setUr: pickLang('ur'),
    mobileMode: isMobile, mnavCls: st.mnav ? 'open' : '', mnavOpen: isMobile && !!st.mnav,
    closeNav: () => set({ mnav: false, roleMenu: false }),
    sbW: expanded ? '256px' : '76px', sbJc: expanded ? 'flex-start' : 'center',
    roleLabel: roleDef[1], roleIcon: roleDef[2], roleMenu: !!st.roleMenu, bell: !!st.bell,
    user: currentUser(role),
    notes: NOTES[role].map(([t, w]) => ({ t, w })),
    roles: roleMenuItems(role, switchRole, () => set({ roleMenu: false })),
    toggleRoleMenu: () => set({ roleMenu: !st.roleMenu, bell: false, open: null }),
    toggleBell: () => set({ bell: !st.bell, roleMenu: false, open: null }),
    toggleSidebar: isMobile ? () => set({ mnav: !st.mnav, roleMenu: false }) : () => set({ collapsed: !st.collapsed, roleMenu: false }),
    onLogout: apiEnabled ? logout : () => self.toast('You would be signed out here'),
    anyPopover: !!(st.open || st.roleMenu || st.bell),
    closePopovers: () => set({ open: null, roleMenu: false, bell: false }),
    bands: [
      { b: BAND.Low, from: '0', to: '2', act: 'Routine check in 6 months' },
      { b: BAND.Medium, from: '3', to: '7', act: 'Ask follow-up questions; refer if positive' },
      { b: BAND.High, from: '8', to: '20', act: 'Follow-up, then refer within 2 weeks' }
    ],
    modal: { confirm: st.modal === 'confirm', user: st.modal === 'user', export: st.modal === 'export', close: closeModal },
    nu: {
      name: nu.name, contact: nu.contact, invalid: !nu.name.trim() || !nu.contact.trim(),
      onName: (e: { target: { value: string } }) => { const v = e.target.value; set(s => ({ nu: { ...s.nu, name: v } })); },
      onContact: (e: { target: { value: string } }) => { const v = e.target.value; set(s => ({ nu: { ...s.nu, contact: v } })); },
      roles: ['Health worker', 'Supervisor', 'Clinician', 'Admin'].map(l => ({ l, sel: nu.role === l, onPick: () => set(s => ({ nu: { ...s.nu, role: l } })) })),
      submit: () => {
        if (!nu.name.trim()) return;
        set(s => ({ newUsers: [[nu.name.trim(), nu.contact.trim(), nu.role, '—', 'Invited', 'Not yet']].concat(s.newUsers), modal: null }));
        self.toast(nu.name.trim() + ' invited by SMS');
      }
    },
    ex: {
      sets: ([['checks', 'Checks and result bands'], ['referrals', 'Referrals and time to clinic'], ['outcomes', 'Clinic outcomes']] as [keyof AppState['ex'], string][]).map(([key, l]) => ({
        l, on: !!st.ex[key], toggle: () => set(s => ({ ex: { ...s.ex, [key]: !s.ex[key] } }))
      })),
      invalid: !Object.values(st.ex).some(Boolean),
      submit: () => {
        const n = 'EXP-00' + (93 + st.newExports.length);
        const sets = ([['checks', 'Checks'], ['referrals', 'referrals'], ['outcomes', 'outcomes']] as [keyof AppState['ex'], string][]).filter(([key]) => st.ex[key]).map(x => x[1]).join(', ');
        set(s => ({ newExports: [[n, sets.charAt(0).toUpperCase() + sets.slice(1), 'Jul–Sep 2026', 'Today', 'Awaiting approval']].concat(s.newExports), modal: null }));
        self.toast(n + ' requested · awaiting approval');
      }
    },
    toast: st.toast || '', hasToast: !!st.toast
  };
}
