import MB_KIDS0 from '@/data/mock/children.json';
import P_REPORTS0 from '@/data/mock/parentReports.json';
import W_REPORTS0 from '@/data/mock/wellbeingReports.json';
import { apiEnabled } from '@/api/http';
import { ApiReportsStore } from './apiStore';
import { LocalReportsStore } from './localStorageStore';
import type { Collection, Rec, ReportsStore } from './ReportsStore';

export * from './ReportsStore';

/**
 * The app's single data store: the NashoNuma API when VITE_API_URL is set,
 * otherwise localStorage seeded with the prototype's sample data.
 */
export const reportsStore: ReportsStore = apiEnabled
  ? new ApiReportsStore()
  : new LocalReportsStore(() => ({
      reports: P_REPORTS0 as Rec[],
      wellbeing: W_REPORTS0 as Rec[],
      children: MB_KIDS0 as Rec[],
      config: {}
    }));

/** Same call as the prototype's nnPut(collection, record). */
export const nnPut = (col: Collection, rec: Rec) => reportsStore.put(col, rec);

// Prototype names used by the ported modules: reports come from app state (liveP / liveW),
// which App keeps in sync with the store (see useLiveReports in App.tsx).
// With the API on, an empty list means "nothing yet", never the sample data.
export const nnP = (st: { liveP?: Rec[] }) => st.liveP || (apiEnabled ? [] : (P_REPORTS0 as Rec[]));
export const nnW = (st: { liveW?: Rec[] }) => st.liveW || (apiEnabled ? [] : (W_REPORTS0 as Rec[]));
