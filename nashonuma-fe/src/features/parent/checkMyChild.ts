// @ts-nocheck -- ported as-is from nashonuma-code/source/modules/05-parent-check-my-child.js by scripts/port-modules.mjs.
// Same markup and inline styles as the prototype; type it by hand when you next change it.
/* eslint-disable */
import { MB_TODAY, MB_DOM, MB_SHORT, MB_ROWS, mbAgeM, mbStart, mbDate, mbAgeTxt } from '@/domain/morbas';
import { P_L, P_CONCERNS, P_CONCERNS_UR, P_MOTHER, TQ, tqQ, tqPos, tqPositives, pAge, pInstr, pItems, pNewFlow } from '@/domain/parent';
import { SDQ_SCALES, SDQ_TOPIC, SDQ_OPTS, sdqText, sdqScore, sdqBand } from '@/domain/sdq';
import { nnP, nnPut } from '@/store';
import MB_KIDS0 from '@/data/mock/children.json';
import P_REPORTS0 from '@/data/mock/parentReports.json';
import { mbH, MB_INK, MB_TONE, mbCard, mbTitle, mbIcon, mbPill, mbSeg, mbNewDraft } from '../morbas/morbasViews';

export function pBuild(self, st, role, page, pg, kit) {
  const { table, C, badge, act } = kit;
  const reports = nnP(st);
  // ---------- PARENT (mother) phone flow ----------
  if (role === 'parent') {
    const F = st.pf || pNewFlow();
    const L = P_L[F.lang];
    const set = patch => self.setState(s => ({ pf: Object.assign({}, s.pf || F, typeof patch === 'function' ? patch(s.pf || F) : patch) }));
    const myKids = P_MOTHER.kids.map(id => (st.mbKids || MB_KIDS0).find(k => k.id === id)).filter(Boolean).concat(F.extra);
    const kid = myKids.find(k => k.id === F.kid);
    const ageM = kid ? mbAgeM(kid.dob, MB_TODAY) : null, S = kid ? mbStart(ageM) : null;
    const instr = pInstr(kid);
    const items = S ? pItems(S) : [];
    const total = instr === 'sdq' ? 25 : instr === 'tq' ? 10 : items.reduce((n, a) => n + a.length, 0), answered = Object.keys(F.ans).filter(k => F.ans[k] != null && F.ans[k] !== '').length;
    if (page === 'psent') {
      pg.title = 'My checks'; pg.sub = 'Checks this mother has sent to the clinic';
      const mine = reports.filter(r => r.mother === P_MOTHER.name);
      table(['Child', 'Sent', 'Worries', 'Status'], '2fr 1fr 2fr 1fr', mine.map(r => ({ cells: [C.person(r.name, r.id), C.text(mbDate(r.date)), C.text(r.concerns.length ? r.concerns.map(c => P_CONCERNS.find(x => x[0] === c)[1]).join(', ') : 'None'), C.badge(badge(r.status === 'New' ? 'info' : 'success', r.status === 'New' ? 'Waiting for clinic' : 'Seen by clinic'))] })), mine.length, 700, 'checks');
      return { on: false, view: null };
    }
    pg.title = 'Check my child'; pg.sub = 'A few quick questions, about 2 minutes · your answers go only to your clinic';
    pg.actions = []; void ([act('Restart demo', 'refresh-cw', () => self.setState({ pf: pNewFlow() }))]);
    const step = F.done ? 6 : F.step;
    const H = mbH, I = MB_INK;
    const btn = (label, onClick, kind, disabled, extra) => H('button', { className: 'btn btn-' + (kind || 'primary'), disabled: !!disabled, onClick, style: Object.assign({ width: '100%', minHeight: 48, fontSize: 15 }, extra || {}) }, label);
    const inp = (val, on, ph, type) => H('input', { className: 'input', value: val, placeholder: ph || '', type: type || 'text', onChange: e => on(e.target.value), style: { width: '100%', boxSizing: 'border-box', minHeight: 48, fontSize: 15 } });
    const lab = t => H('div', { style: { fontSize: 13, fontWeight: 600, color: I.t, marginBottom: 6 } }, t);
    const chip = (on, label, onClick, key) => H('button', { key, onClick, 'aria-pressed': on, style: { minHeight: 40, padding: '8px 14px', borderRadius: 9999, border: '1px solid ' + (on ? I.p : I.b), background: on ? I.pxl : '#FFFFFF', color: on ? I.pd : I.t, font: 'inherit', fontSize: 14, fontWeight: 500, cursor: 'pointer', textAlign: 'left', display: 'inline-flex', alignItems: 'center', gap: 6 } }, on ? mbIcon('check', 14) : null, label);
    let body, foot;
    if (step === 1) {
      body = H('div', { style: { display: 'flex', flexDirection: 'column', gap: 16 } },
        H('div', { style: { fontSize: 22, fontWeight: 700, color: I.h, lineHeight: 1.25 } }, F.lang === 'mn' ? 'Хүүхдийнхээ хөгжлийг шалгая' : 'Let’s check how your child is growing'),
        H('div', { style: { fontSize: 14, color: I.m } }, F.lang === 'mn' ? '6 богино асуулт, ойролцоогоор 2 минут. Таны хариултыг зөвхөн таны эмнэлэг харна.' : 'A few quick questions about your child, about 2 minutes. Only your clinic sees your answers.'),
        H('div', null, lab(L.phone), inp(F.phone, v => set({ phone: v }), '+92 3__ ___ ____', 'tel')),
        F.sent ? H('div', null, lab(L.code), inp(F.otp, v => set({ otp: v.replace(/\D/g, '').slice(0, 6) }), '• • • • • •'), H('div', { style: { fontSize: 12, color: I.m, marginTop: 6 } }, 'Demo code: 482913')) : null);
      foot = F.sent ? btn(L.cont, () => set({ step: 2 }), 'primary', F.otp.length !== 6) : btn(L.sendCode, () => set({ sent: true, phone: F.phone || P_MOTHER.phone }), 'primary', false);
    } else if (step === 2) {
      body = H('div', { style: { display: 'flex', flexDirection: 'column', gap: 12 } },
        H('div', { style: { fontSize: 20, fontWeight: 700, color: I.h } }, L.pick),
        ...myKids.map(k => { const on = F.kid === k.id, a = mbAgeM(k.dob, MB_TODAY); return H('button', { key: k.id, onClick: () => set({ kid: k.id, ans: {}, area: 0, sq: 0 }), style: { display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, border: '2px solid ' + (on ? I.p : I.b), background: on ? I.pxl : '#FFFFFF', cursor: 'pointer', font: 'inherit', textAlign: 'left' } }, H('span', { style: { width: 44, height: 44, borderRadius: '50%', background: on ? I.p : '#F1F5F9', color: on ? '#FFFFFF' : I.t, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 } }, k.name.split(' ').map(w => w[0]).join('').slice(0, 2)), H('span', { style: { flex: 1, display: 'flex', flexDirection: 'column' } }, H('span', { style: { fontSize: 16, fontWeight: 600, color: I.h } }, k.name), H('span', { style: { fontSize: 13, color: I.m } }, pAge(a, L) + ' · ' + (pInstr(k) === 'sdq' ? '25 ' + L.qCount + ' \u00B7 SDQ' : pInstr(k) === 'tq' ? '10 ' + L.qCount + ' \u00B7 Ten Questions' : pItems(mbStart(a)).reduce((n, x) => n + x.length, 0) + ' ' + L.qCount + ' \u00B7 MORBAS'))), on ? mbIcon('circle-check', 22, { color: I.p }) : null); }),
        F.adding ? H('div', { style: { display: 'flex', flexDirection: 'column', gap: 12, padding: 14, borderRadius: 14, border: '1px dashed #CBD5E1' } },
          H('div', null, lab(L.kidName), inp(F.nk.name, v => set(c => ({ nk: Object.assign({}, c.nk, { name: v }) })))),
          H('div', null, lab(L.dob), inp(F.nk.dob, v => set(c => ({ nk: Object.assign({}, c.nk, { dob: v }) })), '', 'date')),
          H('div', null, lab(L.sex), H('div', { style: { display: 'flex', gap: 8 } }, chip(F.nk.sex === 'Boy', L.boy, () => set(c => ({ nk: Object.assign({}, c.nk, { sex: 'Boy' }) })), 'b'), chip(F.nk.sex === 'Girl', L.girl, () => set(c => ({ nk: Object.assign({}, c.nk, { sex: 'Girl' }) })), 'g'))),
          btn(L.save, () => set(c => { const id = 'NEW-' + (c.extra.length + 1); return { extra: c.extra.concat([{ id, name: c.nk.name.trim(), dob: c.nk.dob, sex: c.nk.sex, hist: [] }]), kid: id, adding: false, nk: { name: '', dob: '', sex: '' }, ans: {}, area: 0 }; }), 'secondary', !F.nk.name.trim() || !F.nk.dob || !F.nk.sex))
          : H('button', { className: 'btn btn-ghost', onClick: () => set({ adding: true }), style: { alignSelf: 'flex-start' } }, mbIcon('plus', 16), L.addKid));
      foot = btn(L.cont, () => set({ step: 3, area: 0 }), 'primary', !kid);
    } else if (step === 3 && instr === 'sdq') {
      const cfg = st.sdqCfg, pgI = F.sq || 0, from = pgI * 5, nums = [1, 2, 3, 4, 5].map(i => from + i), OL = SDQ_OPTS[F.lang] || SDQ_OPTS.en;
      const pageDone = nums.every(n => F.ans['sdq-' + n] != null);
      body = H('div', { style: { display: 'flex', flexDirection: 'column', gap: 12 } },
        H('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: I.m, fontWeight: 600 } }, H('span', null, 'SDQ \u00B7 ' + (from + 1) + '\u2013' + (from + 5) + ' / 25'), H('span', null, answered + '/25 ' + L.answered)),
        H('div', { style: { height: 6, borderRadius: 9999, background: '#F1F5F9', overflow: 'hidden' } }, H('div', { style: { width: (4 * answered) + '%', height: '100%', background: I.p, borderRadius: 9999 } })),
        H('div', { style: { fontSize: 13, color: I.m } }, F.lang === 'ur' ? 'پچھلے چھ مہینوں میں اپنے بچے کے رویے کے بارے میں سوچ کر جواب دیں۔' : F.lang === 'mn' ? 'Сүүлийн 6 сарын хүүхдийнхээ зан байдлыг бодож хариулна уу.' : 'Think about your child\u2019s behaviour over the last six months.'),
        ...nums.map(n => { const k = 'sdq-' + n, v = F.ans[k], txt = sdqText(n, F.lang, cfg); return H('div', { key: k, style: { padding: 14, borderRadius: 14, border: '1px solid ' + I.b, display: 'flex', flexDirection: 'column', gap: 10 } }, H('div', { style: { display: 'flex', gap: 10, alignItems: 'flex-start' } }, H('span', { style: { width: 28, height: 28, flex: 'none', borderRadius: 8, background: I.pxl, color: I.pd, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' } }, n), H('span', { style: { display: 'flex', flexDirection: 'column', gap: 2 } }, H('span', { style: { fontSize: 15, color: I.h, lineHeight: 1.4 } }, txt || SDQ_TOPIC[n]), txt ? null : H('span', { style: { fontSize: 11, color: '#B45309', fontWeight: 600 } }, 'Placeholder topic \u00B7 licensed SDQ wording not loaded'))), H('div', { style: { display: 'flex', gap: 6 } }, ...OL.map((lab2, vi) => H('button', { key: vi, 'aria-pressed': v === vi, onClick: () => set(c => ({ ans: Object.assign({}, c.ans, { [k]: vi }) })), style: { flex: 1, minHeight: 42, borderRadius: 10, border: '1px solid ' + (v === vi ? I.p : I.b), background: v === vi ? I.pxl : '#FFFFFF', color: v === vi ? I.pd : I.t, font: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '4px 6px' } }, lab2)))); }));
      foot = H('div', { style: { display: 'flex', gap: 8 } }, btn(L.back, () => pgI ? set({ sq: pgI - 1 }) : set({ step: 2 }), 'secondary', false, { width: 'auto', flex: '0 0 96px' }), btn(L.cont, () => pgI < 4 ? set({ sq: pgI + 1 }) : set({ step: 4 }), 'primary', !pageDone));
    } else if (step === 3 && instr === 'tq') {
      const allDone = TQ.every(it => F.ans['tq-' + it.n]);
      body = H('div', { style: { display: 'flex', flexDirection: 'column', gap: 12 } },
        H('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: I.m, fontWeight: 600 } }, H('span', null, 'Ten Questions Screen'), H('span', null, answered + '/10 ' + L.answered)),
        H('div', { style: { height: 6, borderRadius: 9999, background: '#F1F5F9', overflow: 'hidden' } }, H('div', { style: { width: (10 * answered) + '%', height: '100%', background: I.p, borderRadius: 9999 } })),
        H('div', { style: { fontSize: 20, fontWeight: 700, color: I.h } }, (F.lang === 'ur' ? kid.name.split(' ')[0] + ' کے بارے میں' : F.lang === 'mn' ? kid.name.split(' ')[0] + '-ийн тухай' : 'About ' + kid.name.split(' ')[0])),
        ...TQ.map(it => { const k = 'tq-' + it.n, v = F.ans[k]; const opt = (val, label) => H('button', { onClick: () => set(c => ({ ans: Object.assign({}, c.ans, { [k]: c.ans[k] === val ? null : val }) })), 'aria-pressed': v === val, style: { flex: 1, minHeight: 42, borderRadius: 10, border: '1px solid ' + (v === val ? I.p : I.b), background: v === val ? I.pxl : '#FFFFFF', color: v === val ? I.pd : I.t, font: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer' } }, label);
          return H('div', { key: k, style: { padding: 14, borderRadius: 14, border: '1px solid ' + I.b, background: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: 10 } }, H('div', { style: { display: 'flex', gap: 10, alignItems: 'flex-start' } }, H('span', { style: { width: 28, height: 28, flex: 'none', borderRadius: 8, background: I.pxl, color: I.pd, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' } }, it.n), H('span', { style: { fontSize: 15, color: I.h, lineHeight: 1.4 } }, tqQ(it, ageM, F.lang))), H('div', { style: { display: 'flex', gap: 6 } }, opt('y', L.yes), opt('n', L.no))); }));
      foot = H('div', { style: { display: 'flex', gap: 8 } }, btn(L.back, () => set({ step: 2 }), 'secondary', false, { width: 'auto', flex: '0 0 96px' }), btn(L.cont, () => set({ step: 4 }), 'primary', !allDone));
    } else if (step === 3) {
      const qs = []; items.forEach((a, d) => a.forEach(n => qs.push([d, n])));
      const allDone = qs.every(([d, n]) => F.ans[d + '-' + n]);
      body = H('div', { style: { display: 'flex', flexDirection: 'column', gap: 12 } },
        H('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: I.m, fontWeight: 600 } }, H('span', null, qs.length + ' ' + L.qCount), H('span', null, answered + '/' + total + ' ' + L.answered)),
        H('div', { style: { height: 6, borderRadius: 9999, background: '#F1F5F9', overflow: 'hidden' } }, H('div', { style: { width: (100 * answered / Math.max(1, total)) + '%', height: '100%', background: I.p, borderRadius: 9999 } })),
        H('div', { style: { fontSize: 20, fontWeight: 700, color: I.h } }, L.can),
        ...qs.map(([d, n], qi) => { const k = d + '-' + n, v = F.ans[k]; const opt = (val, label) => H('button', { onClick: () => set(c => ({ ans: Object.assign({}, c.ans, { [k]: c.ans[k] === val ? null : val }) })), 'aria-pressed': v === val, style: { flex: 1, minHeight: 40, borderRadius: 10, border: '1px solid ' + (v === val ? (val === 'n' ? '#B91C1C' : val === 'y' ? I.p : '#64748B') : I.b), background: v === val ? (val === 'n' ? '#FEE2E2' : val === 'y' ? I.pxl : '#F1F5F9') : '#FFFFFF', color: v === val ? (val === 'n' ? '#B91C1C' : val === 'y' ? I.pd : I.t) : I.t, font: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer' } }, label);
          return H('div', { key: k, style: { padding: 14, borderRadius: 14, border: '1px solid ' + I.b, background: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: 10 } }, H('div', { style: { display: 'flex', gap: 10, alignItems: 'flex-start' } }, H('span', { style: { width: 28, height: 28, flex: 'none', borderRadius: 8, background: I.pxl, color: I.pd, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' } }, qi + 1), H('span', { style: { display: 'flex', flexDirection: 'column', gap: 2 } }, H('span', { style: { fontSize: 12, color: I.m, fontWeight: 600 } }, MB_DOM[F.lang === 'mn' ? 'mn' : 'en'][d]), H('span', { style: { fontSize: 15, color: I.h, lineHeight: 1.4 } }, MB_ROWS[F.lang === 'mn' ? 'mn' : 'en'][n - 1][d]))), H('div', { style: { display: 'flex', gap: 6 } }, opt('y', L.yes), opt('n', L.no), opt('u', L.ns))); }));
      foot = H('div', { style: { display: 'flex', gap: 8 } }, btn(L.back, () => set({ step: 2 }), 'secondary', false, { width: 'auto', flex: '0 0 96px' }), btn(L.cont, () => set({ step: 4 }), 'primary', !allDone));
    } else if (step === 4) {
      body = H('div', { style: { display: 'flex', flexDirection: 'column', gap: 14 } },
        H('div', { style: { fontSize: 20, fontWeight: 700, color: I.h } }, L.worryQ),
        H('div', { style: { fontSize: 13, color: I.m, marginTop: -8 } }, L.worryHint),
        H('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 8 } }, ...P_CONCERNS.map(([k, en, mn]) => chip(F.concerns.includes(k), F.lang === 'mn' ? mn : F.lang === 'ur' ? (P_CONCERNS_UR[k] || en) : en, () => set(c => ({ concerns: c.concerns.includes(k) ? c.concerns.filter(x => x !== k) : c.concerns.concat([k]) })), k))),
        H('div', null, lab(L.note), H('textarea', { className: 'input', value: F.note, onChange: e => { const v = e.target.value; set({ note: v }); }, style: { width: '100%', boxSizing: 'border-box', fontSize: 15 } })),
        H('div', null, lab(L.howW), H('div', { style: { display: 'flex', gap: 6 } }, ...L.w.map((t, i) => H('button', { key: i, onClick: () => set({ worry: i }), 'aria-pressed': F.worry === i, style: { flex: 1, minHeight: 44, borderRadius: 10, border: '1px solid ' + (F.worry === i ? I.p : I.b), background: F.worry === i ? I.pxl : '#FFFFFF', color: F.worry === i ? I.pd : I.t, font: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '4px 6px' } }, t)))));
      foot = H('div', { style: { display: 'flex', gap: 8 } }, btn(L.back, () => set({ step: 3 }), 'secondary', false, { width: 'auto', flex: '0 0 96px' }), btn(L.cont, () => set({ step: 5 }), 'primary', F.worry == null));
    } else if (step === 5) {
      const row = (t, v, go) => H('div', { style: { display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 0', borderTop: '1px solid #F1F5F9' } }, H('span', { style: { flex: 1, display: 'flex', flexDirection: 'column', gap: 2 } }, H('span', { style: { fontSize: 12, color: I.m } }, t), H('span', { style: { fontSize: 14, color: I.h, fontWeight: 500 } }, v)), H('button', { className: 'btn btn-ghost', onClick: go, style: { minHeight: 32, padding: '0 8px', fontSize: 13 } }, L.edit));
      const cnt = v => Object.values(F.ans).filter(x => x === v).length;
      const qSummary = instr === 'sdq' ? answered + '/25 ' + L.answered : instr === 'tq' ? answered + '/10 ' + L.answered + ' \u00B7 ' + L.yes + ' ' + cnt('y') + ' \u00B7 ' + L.no + ' ' + cnt('n') : null;
      body = H('div', { style: { display: 'flex', flexDirection: 'column', gap: 4 } },
        H('div', { style: { fontSize: 20, fontWeight: 700, color: I.h, marginBottom: 8 } }, L.review),
        row(L.steps[1], kid.name + ' · ' + pAge(ageM, L), () => set({ step: 2 })),
        row(L.steps[2], qSummary || (answered + ' ' + L.answered + ' · ' + L.yes + ' ' + cnt('y') + ' · ' + L.no + ' ' + cnt('n') + ' · ' + L.ns + ' ' + cnt('u')), () => set({ step: 3, area: 0, sq: 0 })),
        row(L.steps[3], (F.concerns.length ? F.concerns.map(c => { const x = P_CONCERNS.find(y => y[0] === c); return F.lang === 'mn' ? x[2] : F.lang === 'ur' ? (P_CONCERNS_UR[x[0]] || x[1]) : x[1]; }).join(', ') : L.none) + ' · ' + L.w[F.worry], () => set({ step: 4 })),
        H('label', { style: { display: 'flex', gap: 10, alignItems: 'flex-start', padding: 14, marginTop: 8, borderRadius: 12, background: I.s, border: '1px solid ' + I.b, cursor: 'pointer', fontSize: 14, color: I.h } }, H('input', { type: 'checkbox', checked: F.consent, onChange: () => set({ consent: !F.consent }), style: { width: 20, height: 20, marginTop: 1, accentColor: I.p } }), L.consent));
      foot = btn(L.send, () => {
        const id = nnId('PR');
        const rep = { id, kid: kid.id.startsWith('NEW') ? '' : kid.id, name: kid.name, dob: kid.dob, sex: kid.sex, mother: P_MOTHER.name, phone: F.phone || P_MOTHER.phone, date: MB_TODAY, concerns: F.concerns, note: F.note.trim(), worry: F.worry, status: 'New', ans: F.ans, instr, country: kid.country || 'PK' };
        nnPut('reports', rep);
        self.setState(s => ({ pReports: [rep].concat(s.pReports || P_REPORTS0), pf: Object.assign({}, s.pf || F, { done: id }) }));
      }, 'primary', !F.consent);
    } else {
      body = H('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12, paddingTop: 40 } }, H('span', { style: { width: 72, height: 72, borderRadius: '50%', background: '#DCFCE7', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, mbIcon('circle-check', 36)), H('div', { style: { fontSize: 22, fontWeight: 700, color: I.h } }, L.sentT), H('div', { style: { fontSize: 14, color: I.t, lineHeight: 1.5 } }, L.sentS), H('div', { style: { fontSize: 13, color: I.m } }, L.ref + ': ', H('b', { style: { color: I.h, fontFamily: 'ui-monospace, monospace' } }, F.done)));
      foot = btn(L.newCheck, () => self.setState({ pf: Object.assign(pNewFlow(), { step: 2, lang: F.lang, phone: F.phone }) }), 'secondary');
    }
    const dots = H('div', { style: { display: 'flex', gap: 4 } }, ...[1, 2, 3, 4, 5].map(i => H('span', { key: i, style: { flex: 1, height: 4, borderRadius: 9999, background: i <= Math.min(step, 5) ? I.p : '#E2E8F0' } })));
    const phone = H('div', { style: kit.mobile ? { height: '100%', display: 'flex', flexDirection: 'column', background: '#FFFFFF', minHeight: 0 } : { width: '100%', maxWidth: 620, margin: '0 auto', borderRadius: 16, border: '1px solid #E2E8F0', background: '#FFFFFF', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box' } },
      H('div', { style: { padding: kit.mobile ? '8px 20px 12px' : '20px 28px 16px', display: 'flex', flexDirection: 'column', gap: 10, borderBottom: '1px solid #F1F5F9' } },
        H('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } }, H('span', { style: { flex: 1, fontSize: 15, fontWeight: 700, color: I.h } }, step <= 5 ? (F.lang === 'mn' ? 'Алхам ' : 'Step ') + step + ' / 5 \u00B7 ' + L.steps[step - 1] : L.sentT), mbSeg(F.lang, [['en', 'English'], ['mn', 'Монгол'], ['ur', 'اردو']], l => set({ lang: l }))),
        step <= 5 ? dots : null),
      H('div', { style: kit.mobile ? { flex: 1, minHeight: 0, overflowY: 'auto', padding: 20 } : { padding: 28, minHeight: 360 } }, body),
      H('div', { style: { padding: kit.mobile ? '12px 20px 16px' : '16px 28px 24px', borderTop: '1px solid #F1F5F9', background: '#F8FAFC', background: '#FFFFFF' } }, foot));
    const guide = [['Sign in', 'Phone number and a 6-digit SMS code. No password to remember.'], ['Choose the child', 'Pick a child already on file, or add one with name, birth date and sex.'], ['Answer questions', 'Only the MORBAS items for the child’s age (about 10 per area, 7 areas), as Yes / No / Not sure. ★ items are left for the clinic.'], ['Share worries', 'Tap any worries, write in her own words, and say how worried she is.'], ['Review & send', 'Check answers, agree to share, send. The clinic sees it under Parent reports.']];
    const side = mbCard([mbTitle('Mother’s journey', '5 steps, about 10 minutes'), H('div', { style: { display: 'flex', flexDirection: 'column', gap: 4 } }, ...guide.map(([t, s], i) => { const n = i + 1, cur = n === step, done = n < step; return H('div', { key: i, style: { display: 'flex', gap: 12, padding: '10px 12px', borderRadius: 10, background: cur ? I.pxl : 'transparent' } }, H('span', { style: { width: 26, height: 26, flex: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, background: done ? '#DCFCE7' : cur ? I.p : '#F1F5F9', color: done ? '#15803D' : cur ? '#FFFFFF' : I.m } }, done ? mbIcon('check', 14) : n), H('span', { style: { display: 'flex', flexDirection: 'column', gap: 2 } }, H('span', { style: { fontSize: 14, fontWeight: 600, color: cur ? I.pd : I.h } }, t), H('span', { style: { fontSize: 13, color: I.m, lineHeight: 1.45 } }, s))); })),
      H('div', { style: { fontSize: 12, color: I.m, borderTop: '1px solid #F1F5F9', paddingTop: 12, lineHeight: 1.5 } }, 'A mother’s answers are a screening, not a MORBAS score. The clinician confirms them with the child at the visit, and can start the MORBAS form with her answers already filled in.')], { flex: '1 1 300px', maxWidth: 420, alignSelf: 'flex-start' });
    return { on: true, view: phone };
  }

  // ---------- CLINICIAN · Parent reports ----------
  if (role === 'clinician' && page === 'reports') {
    if (!st.pr) {
      pg.title = 'Parent reports'; pg.sub = 'Answers and worries mothers send from their phones';
      pg.hasSearch = true; pg.searchPh = 'Search child or mother';
      const q = (st.q['clinician:reports'] || '').trim().toLowerCase();
      const rows = reports.filter(r => !q || (r.name + ' ' + r.mother + ' ' + r.id).toLowerCase().includes(q));
      table(['Child', 'Mother', 'Sent', 'Worries', 'Screen result', 'Status', { l: '', al: 'right' }], '1.6fr 1.3fr .9fr 1.6fr .9fr .9fr .3fr', rows.map(r => { const no = Object.values(r.ans).filter(v => v === 'n').length, isTq = r.instr === 'tq', tp = isTq ? tqPositives(r.ans, mbAgeM(r.dob, r.date)).length : 0; return { onClick: () => self.setState({ pr: r.id }), cells: [C.person(r.name, r.id + ' · ' + mbAgeTxt(mbAgeM(r.dob, r.date))), C.text(r.mother, r.phone), C.text(mbDate(r.date)), C.text(r.concerns.length ? r.concerns.map(c => P_CONCERNS.find(x => x[0] === c)[1]).join(', ') : 'None', ['Not worried', 'A little worried', 'Very worried'][r.worry]), r.instr === 'sdq' ? (sb => C.badge(badge(sb.tone, 'SDQ \u00B7 ' + sb.label)))(sdqBand(sdqScore(r.ans).total)) : isTq ? C.badge(badge(tp ? 'error' : 'success', tp ? 'TQ positive \u00B7 ' + tp : 'TQ negative')) : C.badge(badge(no >= 3 ? 'warning' : 'neutral', 'MORBAS \u00B7 ' + no + ' No')), C.badge(badge(r.status === 'New' ? 'info' : 'success', r.status)), C.chev()] }; }), reports.length, 980, 'reports');
      return { on: false, view: null };
    }
    const r = reports.find(x => x.id === st.pr) || reports[0];
    const ageM = mbAgeM(r.dob, r.date), S = mbStart(ageM), its = pItems(S);
    if (r.instr === 'sdq') {
      const H = mbH, I = MB_INK, sc = sdqScore(r.ans), band = sdqBand(sc.total);
      const done = () => { nnPut('reports', Object.assign({}, r, { status: 'Seen' })); self.setState(s => ({ pReports: (s.pReports || P_REPORTS0).map(x => x.id === r.id ? Object.assign({}, x, { status: 'Seen' }) : x), pr: null })); self.toast(band.tone === 'success' ? r.name + ' marked as seen' : r.name + ' referred for a mental health assessment'); };
      pg.hasBack = true; pg.backLabel = 'All parent reports'; pg.onBack = () => self.setState({ pr: null });
      pg.title = 'Parent report \u00B7 ' + r.name; pg.sub = 'From ' + r.mother + ' \u00B7 ' + r.phone + ' \u00B7 sent ' + mbDate(r.date) + ' \u00B7 ' + r.id;
      pg.actions = [act('Call mother', 'volume-2', () => self.toast('Calling ' + r.mother + ' on ' + r.phone)), act(band.tone === 'success' ? 'Mark as seen' : 'Refer for assessment', band.tone === 'success' ? 'check' : 'send', done, 'primary', r.status !== 'New')];
      pg.kpis = [
        { label: 'Child\u2019s age', v: Math.floor(mbAgeM(r.dob, r.date) / 12) + ' years', note: 'SDQ \u00B7 parent report', icon: 'clock', ibg: '#DBEAFE', ifg: '#1D4ED8', nc: '#64748B' },
        { label: 'Total difficulties', v: sc.total + ' / 40', note: band.label, icon: MB_TONE[band.tone][2] || 'activity', ibg: MB_TONE[band.tone][0], ifg: MB_TONE[band.tone][1], nc: MB_TONE[band.tone][1] },
        { label: 'Prosocial', v: sc.pro + ' / 10', note: 'Strengths, reported separately', icon: 'users', ibg: '#F1F5F9', ifg: '#475569', nc: '#64748B' }
      ];
      table(['Scale', 'Score', 'Items'], '2fr .8fr 1.4fr', SDQ_SCALES.map(s2 => ({ cells: [C.text(s2.en, '', { fw: 600, color: '#172B4D' }), C.text(sc[s2.k] + ' / 10', '', { fw: 600, color: '#172B4D' }), C.text(s2.items.join(', '))] })), 5, 560, 'scales');
      pg.hasTableTitle = true; pg.tableTitle = 'SDQ scales';
      return { on: true, view: H('div', { style: { fontSize: 13, color: I.m } }, 'Bands for total difficulties (parent report): 0\u201313 close to average, 14\u201316 slightly raised, 17\u201319 high, 20\u201340 very high. Items 7, 11, 14, 21 and 25 are reverse-scored.' + (st.sdqCfg ? '' : ' Licensed SDQ wording is not loaded yet (Admin > Instruments > SDQ).')) };
    }
    if (r.instr === 'tq') {
      const H = mbH, I = MB_INK, pos = tqPositives(r.ans, ageM);
      const refer = () => { nnPut('reports', Object.assign({}, r, { status: 'Seen' })); self.setState(s => ({ pReports: (s.pReports || P_REPORTS0).map(x => x.id === r.id ? Object.assign({}, x, { status: 'Seen' }) : x), pr: null })); self.toast(r.name + ' referred for a full developmental assessment'); };
      pg.hasBack = true; pg.backLabel = 'All parent reports'; pg.onBack = () => self.setState({ pr: null });
      pg.title = 'Parent report \u00B7 ' + r.name; pg.sub = 'From ' + r.mother + ' \u00B7 ' + r.phone + ' \u00B7 sent ' + mbDate(r.date) + ' \u00B7 ' + r.id;
      pg.actions = [act('Call mother', 'volume-2', () => self.toast('Calling ' + r.mother + ' on ' + r.phone)), act(pos.length ? 'Refer for assessment' : 'Mark as seen', pos.length ? 'send' : 'check', refer, 'primary', r.status !== 'New')];
      pg.kpis = [
        { label: 'Child\u2019s age', v: mbAgeTxt(ageM), note: 'Pakistan \u00B7 Ten Questions Screen (2\u20139 years)', icon: 'clock', ibg: '#DBEAFE', ifg: '#1D4ED8', nc: '#64748B' },
        { label: 'Screen result', v: pos.length ? 'Positive' : 'Negative', note: pos.length ? 'Any one positive answer = refer' : 'No positive answers', icon: pos.length ? 'flag' : 'circle-check', ibg: pos.length ? '#FEE2E2' : '#DCFCE7', ifg: pos.length ? '#B91C1C' : '#15803D', nc: pos.length ? '#B91C1C' : '#64748B' },
        { label: 'Positive answers', v: String(pos.length) + ' of 10', note: pos.length ? 'Questions ' + pos.join(', ') : '\u2014', icon: 'list-checks', ibg: '#F1F5F9', ifg: '#475569', nc: '#64748B' }
      ];
      const worriesT = mbCard([mbTitle('Mother\u2019s worries', ['Not worried', 'A little worried', 'Very worried'][r.worry]), r.concerns.length ? H('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 8 } }, ...r.concerns.map(c => H('span', { key: c, style: { padding: '6px 12px', borderRadius: 9999, background: '#FEF3C7', color: '#B45309', fontSize: 13, fontWeight: 600 } }, P_CONCERNS.find(x => x[0] === c)[1]))) : H('div', { style: { fontSize: 14, color: I.m } }, 'No worries chosen'), r.note ? H('div', { style: { fontSize: 14, color: I.t, padding: '12px 14px', borderRadius: 10, background: I.s, border: '1px solid ' + I.b, fontStyle: 'italic' } }, '\u201C' + r.note + '\u201D') : null]);
      table(['#', 'Question', 'Mother\u2019s answer', 'Flag'], '.3fr 3fr .9fr 1fr', TQ.map(it => { const v = r.ans['tq-' + it.n], p = v === tqPos(it, ageM); return { cells: [C.text(String(it.n), '', { color: '#64748B' }), C.text(tqQ(it, ageM), '', { color: '#172B4D' }), C.text(v === 'y' ? 'Yes' : v === 'n' ? 'No' : '\u2014'), C.badge(badge(p ? 'error' : 'neutral', p ? 'Positive' : 'OK', p ? 'flag' : undefined))] }; }), 10, 720, 'questions');
      pg.hasTableTitle = true; pg.tableTitle = 'Ten Questions Screen';
      return { on: true, view: H('div', { style: { display: 'flex', flexDirection: 'column', gap: 12 } }, worriesT, H('div', { style: { fontSize: 13, color: I.m } }, 'For questions 4, 7 and 8 a \u201CNo\u201D is positive; question 9 changes with age (age 2: naming an object; ages 3\u20139: unclear speech). Screen-positive children need a full assessment, not a diagnosis.')) };
    }
    const cnt = v => Object.values(r.ans).filter(x => x === v).length;
    const startForm = () => {
      const marks = Array.from({ length: 7 }, () => Array(23).fill(null));
      Object.keys(r.ans).forEach(k => { const [d, n] = k.split('-').map(Number); if (r.ans[k] === 'y') marks[d][n - 1] = 'o'; if (r.ans[k] === 'n') marks[d][n - 1] = 'x'; });
      const rest = reports.map(x => x.id === r.id ? Object.assign({}, x, { status: 'Seen' }) : x);
      nnPut('reports', Object.assign({}, r, { status: 'Seen' }));
      self.setState({ pReports: rest, pr: null, page: 'morbas', mbDraft: Object.assign(mbNewDraft(null), { kid: r.kid, name: r.name, reg: r.kid, dob: r.dob, marks, fromReport: r.id }) });
      self.toast('MORBAS started with ' + r.mother + '’s answers · confirm ★ items with the child');
    };
    pg.hasBack = true; pg.backLabel = 'All parent reports'; pg.onBack = () => self.setState({ pr: null });
    pg.title = 'Parent report · ' + r.name; pg.sub = 'From ' + r.mother + ' · ' + r.phone + ' · sent ' + mbDate(r.date) + ' · ' + r.id;
    pg.actions = [act('Call mother', 'volume-2', () => self.toast('Calling ' + r.mother + ' on ' + r.phone)), act('Start MORBAS with these answers', 'clipboard-check', startForm, 'primary')];
    pg.kpis = [
      { label: 'Child’s age', v: mbAgeTxt(ageM), note: '6 questions · one per area', icon: 'clock', ibg: '#DBEAFE', ifg: '#1D4ED8', nc: '#64748B' },
      { label: '“Yes”', v: String(cnt('y')), note: 'Mother says the child can', icon: 'circle-check', ibg: '#DCFCE7', ifg: '#15803D', nc: '#64748B' },
      { label: '“No”', v: String(cnt('n')), note: 'Check these at the visit', icon: 'circle-x', ibg: '#FEE2E2', ifg: '#B91C1C', nc: cnt('n') >= 6 ? '#B91C1C' : '#64748B' },
      { label: '“Not sure”', v: String(cnt('u')), note: 'Left blank on the form', icon: 'info', ibg: '#F1F5F9', ifg: '#475569', nc: '#64748B' }
    ];
    const H = mbH, I = MB_INK;
    const ansPill = v => v === 'y' ? mbPill('success', 'Yes', true) : v === 'n' ? mbPill('error', 'No', true) : v === 'u' ? mbPill('neutral', 'Not sure', true) : mbPill('neutral', '—', true);
    const worries = mbCard([mbTitle('Mother’s worries', ['Not worried', 'A little worried', 'Very worried'][r.worry]), r.concerns.length ? H('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 8 } }, ...r.concerns.map(c => H('span', { key: c, style: { padding: '6px 12px', borderRadius: 9999, background: '#FEF3C7', color: '#B45309', fontSize: 13, fontWeight: 600 } }, P_CONCERNS.find(x => x[0] === c)[1]))) : H('div', { style: { fontSize: 14, color: I.m } }, 'No worries chosen'), r.note ? H('div', { style: { fontSize: 14, color: I.t, padding: '12px 14px', borderRadius: 10, background: I.s, border: '1px solid ' + I.b, fontStyle: 'italic' } }, '“' + r.note + '”') : null]);
    const areas = H('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: 12 } }, ...its.map((list, d) => ({ list, d })).filter(x => x.list.length).map(({ list, d }) => { const no = list.filter(n => r.ans[d + '-' + n] === 'n').length; return H('div', { key: d, style: { padding: 16, border: '1px solid ' + I.b, borderRadius: 12, background: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: 8 } }, H('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 } }, H('span', { style: { fontSize: 14, fontWeight: 600, color: I.h } }, (d + 1) + '. ' + MB_SHORT[d]), no ? mbPill('warning', 'Check at visit') : null), ...list.map(n => H('div', { key: n, style: { display: 'grid', gridTemplateColumns: '24px 1fr auto', gap: 8, alignItems: 'center', fontSize: 13, padding: '4px 0', borderTop: '1px solid #F8FAFC' } }, H('span', { style: { color: I.m, fontWeight: 600 } }, n), H('span', { style: { color: I.t } }, MB_ROWS.en[n - 1][d]), ansPill(r.ans[d + '-' + n]))), null); }));
    return { on: true, view: H('div', { style: { display: 'flex', flexDirection: 'column', gap: 16 } }, worries, H('div', { style: { fontSize: 16, fontWeight: 600, color: I.h, marginTop: 8 } }, 'Mother’s 6 answers'), areas, H('div', { style: { fontSize: 13, color: I.m } }, 'Self-care and ★ items were not asked. Check them, and the rest of the MORBAS range, at the visit.')) };
  }
  return null;
}
