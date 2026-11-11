import type { Collection, ConfigDoc, NewAssessment, Rec, ReportsStore, Snapshot } from './ReportsStore';

const KEY = 'nn_store_v1';
const clone = <T,>(o: T): T => JSON.parse(JSON.stringify(o));

/**
 * localStorage implementation. Every tab on the same origin shares the data, and the
 * `storage` event pushes changes to the other tabs, so a check sent from the mother's
 * view in one tab appears at once on the clinician's dashboard in another.
 */
export class LocalReportsStore implements ReportsStore {
  private data: Snapshot;
  private listeners = new Set<(s: Snapshot) => void>();

  constructor(private seed: () => Snapshot) {
    this.data = this.load();
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', e => {
        if (e.key !== KEY) return;
        this.data = this.load();
        this.emit();
      });
    }
  }

  private load(): Snapshot {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw) as Snapshot;
        // Data saved before children were stored here has no `children`: take them from the seed.
        if (Array.isArray(s.reports) && Array.isArray(s.wellbeing)) {
          return { ...s, children: Array.isArray(s.children) ? s.children : clone(this.seed().children), config: s.config || {} };
        }
      }
    } catch {
      /* storage blocked or corrupt: fall back to the seed */
    }
    return clone(this.seed());
  }

  private save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(this.data));
    } catch {
      /* storage full or blocked: keep working in memory */
    }
    this.emit();
  }

  private emit() {
    const s = this.snapshot();
    this.listeners.forEach(fn => fn(s));
  }

  snapshot(): Snapshot {
    return this.data;
  }

  put(col: Collection, rec: Rec) {
    const list = this.data[col];
    const r = clone(rec);
    const i = list.findIndex(x => x.id === r.id);
    this.data = { ...this.data, [col]: i < 0 ? [r, ...list] : list.map(x => (x.id === r.id ? r : x)) };
    this.save();
  }

  update(col: Collection, id: string, patch: Partial<Rec>) {
    this.data = { ...this.data, [col]: this.data[col].map(x => (x.id === id ? { ...x, ...clone(patch) } : x)) };
    this.save();
  }

  setConfig(doc: ConfigDoc, value: any) {
    this.data = { ...this.data, config: { ...this.data.config, [doc]: clone(value) } };
    this.save();
  }

  /** Same rules as the prototype: case-insensitive reg number match, ids MB-3200 upwards, history sorted by date. */
  async addAssessment(regNo: string, a: NewAssessment) {
    const all: Rec[] = this.data.children.map(x => ({ ...x, hist: (x.hist || []).slice() }));
    const reg = regNo.trim();
    let kid: Rec | undefined = all.find(x => x.id.toLowerCase() === reg.toLowerCase());
    if (!kid) {
      kid = { id: reg, name: a.child.name, sex: a.child.sex || '—', dob: a.child.dob, area: a.child.area || '—', hist: [] };
      all.push(kid);
    }
    const assessmentId = 'MB-' + (3200 + all.reduce((n, x) => n + x.hist.length, 0));
    kid.hist.push(clone({ id: assessmentId, date: a.date, by: a.by, scores: a.scores, marks: a.marks }));
    kid.hist.sort((p: Rec, q: Rec) => (p.date < q.date ? -1 : 1));
    this.data = { ...this.data, children: all };
    this.save();
    return { childId: kid.id, assessmentId };
  }

  subscribe(fn: (s: Snapshot) => void) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  /** Dev helper: back to the sample data. */
  reset() {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    this.data = clone(this.seed());
    this.emit();
  }
}
