/**
 * End-to-end: real Nest app + real Postgres (the nashonuma_test database from .env.test).
 * Jest sets NODE_ENV=test, so the data source and ConfigModule read .env.test.
 * The test database is dropped, migrated and seeded before the run.
 */
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import dataSource from '../src/config/data-source';
import { configureApp } from '../src/main';
import { runSeeders } from '../src/seed/seed';

const PASSWORD = process.env.SEED_PASSWORD || 'Password123!';
const items25 = Array.from({ length: 25 }, (_, i) => `Item ${i + 1}`);

describe('NashoNuma API (e2e)', () => {
  let app: INestApplication;
  let http: ReturnType<typeof request>;
  const token: Record<string, string> = {};

  beforeAll(async () => {
    if (!process.env.DATABASE_URL?.includes('_test')) throw new Error('Refusing to run e2e against a non-test database');
    await dataSource.initialize();
    await dataSource.dropDatabase();
    await dataSource.runMigrations();
    await runSeeders();
    await dataSource.destroy();

    const mod = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = mod.createNestApplication();
    configureApp(app);
    await app.init();
    http = request(app.getHttpServer());

    for (const role of ['parent', 'clinician', 'admin', 'researcher']) {
      const res = await http.post('/api/auth/login').send({ email: `${role}@nashonuma.test`, password: PASSWORD }).expect(200);
      token[role] = res.body.token;
    }
  });

  afterAll(async () => {
    await app?.close();
  });

  const as = (role: string) => ({ Authorization: `Bearer ${token[role]}` });

  it('rejects requests without a token', () => http.get('/api/reports').expect(401));

  it('rejects a wrong password', () =>
    http.post('/api/auth/login').send({ email: 'parent@nashonuma.test', password: 'nope' }).expect(401));

  it('a check sent by the parent reaches the clinician, who marks it Seen', async () => {
    const report = { id: 'PR-E2E1', kid: 'CH-1034', name: 'Bilal Ahmed', dob: '2025-03-02', sex: 'Boy', mother: 'Shazia Bibi', phone: '+92 312 448 2210', date: '2026-11-11', concerns: ['talk'], note: '', worry: 1, status: 'New', ans: { 'tq-1': 'y' }, instr: 'tq', country: 'PK' };
    await http.put('/api/reports/PR-E2E1').set(as('parent')).send(report).expect(200);

    const list = await http.get('/api/reports').set(as('clinician')).expect(200);
    expect(list.body.find((r: { id: string }) => r.id === 'PR-E2E1')).toMatchObject({ status: 'New', instr: 'tq' });

    await http.patch('/api/reports/PR-E2E1').set(as('parent')).send({ status: 'Seen' }).expect(403);
    await http.patch('/api/reports/PR-E2E1').set(as('clinician')).send({ status: 'Seen' }).expect(200);

    const mine = await http.get('/api/reports').set(as('parent')).expect(200);
    expect(mine.body.find((r: { id: string }) => r.id === 'PR-E2E1').status).toBe('Seen');
  });

  it('a parent cannot overwrite a sent check', () =>
    http.put('/api/reports/PR-E2E1').set(as('parent')).send({ name: 'X', date: '2026-11-11' }).expect(403));

  it('a parent only sees her own reports', async () => {
    const res = await http.get('/api/reports').set(as('parent')).expect(200);
    expect(res.body.every((r: { phone: string }) => r.phone === '+92 312 448 2210')).toBe(true);
  });

  it('rejects an invalid wellbeing check (19 answers)', () =>
    http.put('/api/wellbeing/MW-E2E1').set(as('parent')).send({ mother: 'Shazia Bibi', date: '2026-11-11', ans: Array(19).fill(0) }).expect(400));

  it('saves a MORBAS assessment with a server id and returns the history', async () => {
    const res = await http
      .post('/api/children/CH-1021/assessments')
      .set(as('clinician'))
      .send({ name: 'Ayesha Khan', dob: '2024-09-12', date: '2026-11-11', scores: [20, 20, 19, 20, 18, 20, 20] })
      .expect(201);
    expect(res.body.assessmentId).toMatch(/^MB-\d+$/);
    expect(res.body.child.hist.at(-1)).toMatchObject({ id: res.body.assessmentId, by: 'Dr Sana Iqbal' });
  });

  it('only a clinician can save MORBAS', () =>
    http.post('/api/children/CH-1021/assessments').set(as('researcher')).send({ name: 'A', dob: '2024-09-12', date: '2026-11-11', scores: [1, 1, 1, 1, 1, 1, 1] }).expect(403));

  it('only an admin can save the SDQ text, and everyone can read it', async () => {
    await http.put('/api/config/sdq').set(as('clinician')).send({ items: { en: items25 } }).expect(403);
    await http.put('/api/config/sdq').set(as('admin')).send({ items: { en: items25.slice(1) } }).expect(400);
    await http.put('/api/config/sdq').set(as('admin')).send({ items: { en: items25 } }).expect(200);
    const res = await http.get('/api/config').set(as('parent')).expect(200);
    expect(res.body.sdq.items.en).toHaveLength(25);
  });
});
