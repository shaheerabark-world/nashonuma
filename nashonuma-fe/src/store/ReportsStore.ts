// Data layer for everything the mother's phone and the clinic dashboard share.
// Collections: "reports" (Check my child), "wellbeing" (SRQ-20) and "children" (with their
// MORBAS history); document "config/sdq" (licensed SDQ wording).
// Two implementations: LocalReportsStore (localStorage) and ApiReportsStore (NashoNuma API).

export type Collection = 'reports' | 'wellbeing';
export type ConfigDoc = 'sdq';
export interface Rec { id: string; [k: string]: any }

export interface Snapshot {
  reports: Rec[];
  wellbeing: Rec[];
  /** Same shape as data/mock/children.json: { id, name, sex, dob, area, hist: [{ id, date, by, scores, marks? }] } */
  children: Rec[];
  config: Partial<Record<ConfigDoc, any>>;
}

/** A MORBAS assessment to save. The child is created from `child` if the reg number is new. */
export interface NewAssessment {
  child: { name: string; dob: string; sex?: string; area?: string };
  date: string;
  by: string;
  scores: number[];
  marks?: unknown;
}

export interface ReportsStore {
  snapshot(): Snapshot;
  /** Insert (new ids go to the top of the list) or replace by id. */
  put(col: Collection, rec: Rec): void;
  /** Merge fields into an existing record. */
  update(col: Collection, id: string, patch: Partial<Rec>): void;
  setConfig(doc: ConfigDoc, value: any): void;
  /** Saves a MORBAS assessment. Resolves with the child's id (as stored) and the new assessment id. */
  addAssessment(regNo: string, a: NewAssessment): Promise<{ childId: string; assessmentId: string }>;
  /** Called on every change, including changes made in another tab. Returns an unsubscribe function. */
  subscribe(fn: (s: Snapshot) => void): () => void;
  /** Local: back to the sample data. API: reload everything from the server. */
  reset(): void;
}

/** New ids for records created on the phone, e.g. PR-1A2B3C (same format as the prototype). */
export const newId = (prefix: string) => prefix + '-' + Date.now().toString(36).toUpperCase().slice(-6);
