// Module views (prototype modules 04–09). Each builder fills `pg` for its pages and returns
// { on, view } (the view goes into the page via {{ mb.view }}), or nothing for other pages.
// Order matches logic.js: SDQ admin, exercises, SRQ-20, parent check, MORBAS.
import type { Pg, Self } from '@/app/pageKit';
import type { AppState } from '@/app/state';
import { sdqAdmin } from './admin/sdqAdmin';
import { xBuild } from './exercises/exercises';
import { wBuild } from './parent/wellbeing';
import { pBuild } from './parent/checkMyChild';
import { mbBuild } from './morbas/morbasViews';

export interface ModuleKit { table: any; C: any; badge: any; act: any; mkTabs: any; BAND: any }
export interface ModuleView { on: boolean; view: any; [k: string]: any }

export function buildModuleView(self: Self, st: AppState, role: string, page: string, pg: Pg, kit: ModuleKit): ModuleView | null {
  return (
    (role === 'admin' && page === 'instruments' && st.instr === 'sdq' ? sdqAdmin(self, st, pg, kit) : null) ||
    xBuild(self, st, role, page, pg) ||
    wBuild(self, st, role, page, pg, kit) ||
    pBuild(self, st, role, page, pg, kit) ||
    mbBuild(self, st, role, page, pg, kit) ||
    null
  );
}
