import { API_URL, api, session } from '@/api/http';
import { toast } from '@/app/state';
import type { Collection, ConfigDoc, NewAssessment, Rec, ReportsStore, Snapshot } from './ReportsStore';

type Remote = Collection | 'children' | 'config';

const PATH: Record<Remote, string> = {
  reports: '/reports',
  wellbeing: '/wellbeing',
  children: '/children',
  config: '/config'
};

/**
 * ReportsStore backed by the NashoNuma API.
 * Reads are cached in a snapshot; writes update the snapshot at once (so the UI responds like it
 * did with localStorage), then go to the server, and are rolled back with a toast if the server
 * refuses. Changes made elsewhere arrive over server-sent events (GET /events).
 */
export class ApiReportsStore implements ReportsStore {
  private data: Snapshot = { reports: [], wellbeing: [], children: [], config: {} };
  private listeners = new Set<(s: Snapshot) => void>();
  private events: EventSource | null = null;
  private started = false;

  snapshot(): Snapshot {
    return this.data;
  }

  /** Loads everything. Called on the first subscribe, once a user is signed in. */
  private start() {
    if (this.started || !session.token()) return;
    this.started = true;
    void Promise.all((['reports', 'wellbeing', 'children', 'config'] as Remote[]).map(c => this.refetch(c)));
    this.listen();
  }

  private async refetch(col: Remote) {
    try {
      const value = await api<any>(PATH[col]);
      this.set(col === 'config' ? { config: value || {} } : { [col]: value });
    } catch (e) {
      console.warn(`Could not load ${col}`, e);
    }
  }

  /** EventSource cannot send headers, so the token goes in the query (the API accepts it on /events only). */
  private listen() {
    if (typeof EventSource === 'undefined') return;
    this.events?.close();
    this.events = new EventSource(`${API_URL}/events?token=${encodeURIComponent(session.token() || '')}`);
    this.events.addEventListener('change', e => {
      const { collection } = JSON.parse((e as MessageEvent).data) as { collection: Remote };
      if (collection in PATH) void this.refetch(collection);
    });
    // On a dropped connection EventSource reconnects by itself; reload everything when it does.
    this.events.addEventListener('open', () => {
      if (this.data.reports.length || this.data.wellbeing.length) {
        (['reports', 'wellbeing', 'children', 'config'] as Remote[]).forEach(c => void this.refetch(c));
      }
    });
  }

  private set(patch: Partial<Snapshot>) {
    this.data = { ...this.data, ...patch };
    const s = this.data;
    this.listeners.forEach(fn => fn(s));
  }

  /** Optimistic write: apply now, send, roll back on failure. */
  private async write(col: Remote, apply: () => void, send: () => Promise<unknown>) {
    const before = this.data;
    apply();
    try {
      await send();
    } catch (e) {
      this.data = before;
      this.set({});
      toast('Not saved: ' + (e instanceof Error ? e.message : 'server error'));
      void this.refetch(col);
    }
  }

  put(col: Collection, rec: Rec) {
    const r = JSON.parse(JSON.stringify(rec)) as Rec;
    void this.write(
      col,
      () => {
        const list = this.data[col];
        const i = list.findIndex(x => x.id === r.id);
        this.set({ [col]: i < 0 ? [r, ...list] : list.map(x => (x.id === r.id ? r : x)) });
      },
      () => api(`${PATH[col]}/${encodeURIComponent(r.id)}`, { method: 'PUT', body: r })
    );
  }

  update(col: Collection, id: string, patch: Partial<Rec>) {
    const current = this.data[col].find(x => x.id === id);
    if (!current) return;
    const keys = Object.keys(patch);
    const merged = { ...current, ...patch };
    void this.write(
      col,
      () => this.set({ [col]: this.data[col].map(x => (x.id === id ? merged : x)) }),
      // A status change has its own endpoint; anything else replaces the record.
      () =>
        keys.length === 1 && keys[0] === 'status'
          ? api(`${PATH[col]}/${encodeURIComponent(id)}`, { method: 'PATCH', body: patch })
          : api(`${PATH[col]}/${encodeURIComponent(id)}`, { method: 'PUT', body: merged })
    );
  }

  setConfig(doc: ConfigDoc, value: any) {
    void this.write(
      'config',
      () => this.set({ config: { ...this.data.config, [doc]: value } }),
      () => api(`/config/${doc}`, { method: 'PUT', body: { items: value?.items } })
    );
  }

  async addAssessment(regNo: string, a: NewAssessment) {
    const out = await api<{ child: Rec; assessmentId: string }>(`/children/${encodeURIComponent(regNo.trim())}/assessments`, {
      method: 'POST',
      body: { ...a.child, date: a.date, scores: a.scores, marks: a.marks }
    });
    const others = this.data.children.filter(c => c.id !== out.child.id);
    this.set({ children: [...others, out.child].sort((p, q) => (p.id < q.id ? -1 : 1)) });
    return { childId: out.child.id, assessmentId: out.assessmentId };
  }

  reset() {
    (['reports', 'wellbeing', 'children', 'config'] as Remote[]).forEach(c => void this.refetch(c));
  }

  subscribe(fn: (s: Snapshot) => void) {
    this.listeners.add(fn);
    this.start();
    return () => {
      this.listeners.delete(fn);
    };
  }
}
