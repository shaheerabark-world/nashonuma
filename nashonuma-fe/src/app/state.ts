// App UI state. Same shape as the prototype component's `state`, kept in one zustand store
// so page builders and the ported modules can call setState / toast like they did before.
import { create } from 'zustand';
import type { Rec } from '@/store';

export interface AppState {
  q: Record<string, string>; // search text per page key
  f: Record<string, Record<string, string>>; // filter values per page key
  tab: Record<string, string>;
  open: string | null; // open filter popover id
  esc: Record<string, boolean>;
  reviewed: Record<string, boolean>;
  done: Record<string, string>; // referral id -> outcome
  retried: boolean;
  matched: boolean;
  wr: Record<string, boolean>;
  newUsers: string[][];
  newExports: string[][];
  published: boolean;
  nu: { name: string; contact: string; role: string };
  ex: Record<'checks' | 'referrals' | 'outcomes', boolean>;
  toast?: string | null;
  collapsed?: boolean;
  mnav?: boolean;
  roleMenu?: boolean;
  bell?: boolean;
  modal?: string | null;
  liveP?: Rec[];
  liveW?: Rec[];
  sdqCfg?: any;
  // the module builders keep their own keys here too (pf, wf, mbChild, …)
  [k: string]: any;
}

export const initialState: AppState = {
  q: {}, f: {}, tab: {}, open: null, esc: {}, reviewed: {}, done: {}, retried: false, matched: false, wr: {},
  newUsers: [], newExports: [], published: false,
  nu: { name: '', contact: '', role: 'Health worker' },
  ex: { checks: true, referrals: true, outcomes: false }
};

export const useAppStore = create<AppState>()(() => initialState);

export type Updater = Partial<AppState> | ((s: AppState) => Partial<AppState>);

let toastTimer: ReturnType<typeof setTimeout> | undefined;
export function toast(msg: string) {
  clearTimeout(toastTimer);
  useAppStore.setState({ toast: msg });
  toastTimer = setTimeout(() => useAppStore.setState({ toast: null }), 3200);
}
