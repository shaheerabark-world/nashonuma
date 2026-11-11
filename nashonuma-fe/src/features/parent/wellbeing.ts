// @ts-nocheck -- ported as-is from nashonuma-code/source/modules/06-mother-wellbeing-srq20.js by scripts/port-modules.mjs.
// Same markup and inline styles as the prototype; type it by hand when you next change it.
/* eslint-disable */
import { MB_TODAY, mbDate } from '@/domain/morbas';
import { SRQ, SRQ_CUT, SRQ_MID, W_HELP, srqQ, wHelp, wTotal, wBand, wNew } from '@/domain/srq20';
import { nnW, nnPut } from '@/store';
import W_REPORTS0 from '@/data/mock/wellbeingReports.json';
import { mbH, MB_INK, MB_TONE, mbCard, mbTitle, mbIcon, mbPill } from '../morbas/morbasViews';

export function wBuild(self, st, role, page, pg, kit) {
  const { table, C, badge, act } = kit;
  const reps = nnW(st);
  const H = mbH, I = MB_INK;
  // ---------- PARENT · My wellbeing (phone) ----------
  if (role === 'parent' && page === 'pwell') {
    const F = st.wf || wNew();
    const set = p => self.setState(s => ({ wf: Object.assign({}, s.wf || F, typeof p === 'function' ? p(s.wf || F) : p) }));
    pg.title = 'My wellbeing'; pg.sub = 'A private check for you after your baby’s birth · 20 yes/no questions, about 5 minutes';
    pg.actions = []; void ([act('Restart demo', 'refresh-cw', () => self.setState({ wf: wNew() }))]);
    const weeks = F.baby ? Math.max(0, Math.floor((new Date(MB_TODAY) - new Date(F.baby)) / 604800000)) : null;
    const total = wTotal(F.ans), band = wBand(F.ans);
    const btn = (label, onClick, kind, disabled, extra) => H('button', { className: 'btn btn-' + (kind || 'primary'), disabled: !!disabled, onClick, style: Object.assign({ width: '100%', minHeight: 48, fontSize: 15 }, extra || {}) }, label);
    const step = F.done ? 5 : F.step;
    let body, foot;
    if (step === 1) {
      body = H('div', { style: { display: 'flex', flexDirection: 'column', gap: 16 } },
        H('div', { style: { fontSize: 22, fontWeight: 700, color: I.h, lineHeight: 1.25 } }, 'How are you feeling since your baby was born?'),
        H('div', { style: { fontSize: 14, color: I.t, lineHeight: 1.5 } }, 'Many mothers feel low, worried or tired after birth. These 20 short yes/no questions help you and your health worker notice when you need support. It is not a test you can fail.'),
        H('div', null, H('div', { style: { fontSize: 13, fontWeight: 600, color: I.t, marginBottom: 6 } }, 'When was your baby born?'), H('input', { className: 'input', type: 'date', value: F.baby, onChange: e => { const v = e.target.value; set({ baby: v }); }, style: { width: '100%', boxSizing: 'border-box', minHeight: 48, fontSize: 15 } }), weeks != null ? H('div', { style: { fontSize: 13, color: I.m, marginTop: 6 } }, weeks + ' weeks after birth' + (weeks < 2 ? ' · best taken from 2 weeks, but you can start now' : '')) : null),
        H('div', { style: { display: 'flex', gap: 10, padding: 12, borderRadius: 12, background: I.s, border: '1px solid ' + I.b, fontSize: 13, color: I.t } }, mbIcon('shield-check', 18, { color: I.p, flex: 'none' }), 'Your answers are private. They are only shared with your clinic if you agree at the end.'));
      foot = btn('Start', () => set({ step: 2, q: 0 }), 'primary', !F.baby);
    } else if (step === 2) {
      const pgI = F.q, from = pgI * 5, list = SRQ.slice(from, from + 5);
      const pageDone = list.every((_, k) => F.ans[from + k] != null);
      const yn = (i, v, label) => { const on = F.ans[i] === v; return H('button', { 'aria-pressed': on, onClick: () => set(c => { const a = c.ans.slice(); a[i] = v; return { ans: a }; }), style: { flex: 1, minHeight: 42, borderRadius: 10, border: '1px solid ' + (on ? (v ? I.p : '#64748B') : I.b), background: on ? (v ? I.pxl : '#F1F5F9') : '#FFFFFF', color: on ? (v ? I.pd : I.t) : I.t, font: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer' } }, label); };
      body = H('div', { style: { display: 'flex', flexDirection: 'column', gap: 12 } },
        H('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: I.m } }, H('span', null, 'Questions ' + (from + 1) + '–' + (from + list.length) + ' of 20'), H('span', null, 'In the last 30 days')),
        H('div', { style: { height: 6, borderRadius: 9999, background: '#F1F5F9', overflow: 'hidden' } }, H('div', { style: { width: (5 * F.ans.filter(v => v != null).length) + '%', height: '100%', background: I.p, borderRadius: 9999 } })),
        ...list.map((q, k) => { const i = from + k; return H('div', { key: i, style: { padding: 14, borderRadius: 14, border: '1px solid ' + I.b, display: 'flex', flexDirection: 'column', gap: 10 } }, H('div', { style: { display: 'flex', gap: 10 } }, H('span', { style: { width: 26, height: 26, flex: 'none', borderRadius: 8, background: I.pxl, color: I.pd, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' } }, i + 1), H('span', { style: { fontSize: 15, color: I.h, lineHeight: 1.4 } }, srqQ(i))), H('div', { style: { display: 'flex', gap: 6 } }, yn(i, 1, 'Yes'), yn(i, 0, 'No'))); }));
      foot = H('div', { style: { display: 'flex', gap: 8 } }, btn('Back', () => pgI ? set({ q: pgI - 1 }) : set({ step: 1 }), 'secondary', false, { width: 'auto', flex: '0 0 96px' }), btn(pgI < 3 ? 'Next' : 'See my result', () => pgI < 3 ? set({ q: pgI + 1 }) : set({ step: 3 }), 'primary', !pageDone));
    } else if (step === 3) {
      const urgent = band.k === 'urgent';
      const msg = { low: ['Thank you for checking in', 'Your answers don’t show signs of depression right now. Feelings can change in the first months, so we’ll remind you to check again in a few weeks.'], mid: ['You may be going through a hard time', 'Some of your answers show signs of stress or low mood. This is common after birth and it gets better with support. Talking to your health worker is a good next step.'], high: ['You don’t have to cope with this alone', 'Your answers suggest you may have postnatal depression or anxiety. It is common, it is not your fault, and it can be treated. Please let your health worker help you this week.'], urgent: ['Thank you for telling us', 'You said you have had thoughts of ending your life. You deserve support right now. Please talk to someone today — your health worker, a family member you trust, or emergency services.'] }[band.k];
      body = H('div', { style: { display: 'flex', flexDirection: 'column', gap: 14 } },
        H('span', { style: { width: 56, height: 56, borderRadius: '50%', background: urgent || band.k === 'high' ? '#FEE2E2' : band.k === 'mid' ? '#FEF3C7' : '#DCFCE7', color: urgent || band.k === 'high' ? '#B91C1C' : band.k === 'mid' ? '#B45309' : '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, mbIcon(band.k === 'low' ? 'circle-check' : 'info', 28)),
        H('div', { style: { fontSize: 22, fontWeight: 700, color: I.h, lineHeight: 1.25 } }, msg[0]),
        H('div', { style: { fontSize: 15, color: I.t, lineHeight: 1.55 } }, msg[1]),
        urgent ? H('div', { style: { display: 'flex', flexDirection: 'column', gap: 8, padding: 14, borderRadius: 14, background: '#FEF2F2', border: '1px solid #FECACA' } }, btn('Call my health worker now', () => self.toast('Calling Lady Health Worker Farzana Gul…'), 'danger'), btn('Emergency: call 1122', () => self.toast('Calling Rescue 1122…'), 'secondary')) : null,
        H('div', { style: { fontSize: 12, color: I.m, lineHeight: 1.5 } }, 'This check is a screening, not a diagnosis. A health worker will talk with you to understand how you are.'));
      foot = btn('Continue', () => set({ step: 4, help: urgent ? 'call' : F.help }));
    } else if (step === 4) {
      const urgent = band.k === 'urgent';
      body = H('div', { style: { display: 'flex', flexDirection: 'column', gap: 12 } },
        H('div', { style: { fontSize: 20, fontWeight: 700, color: I.h } }, 'How would you like support?'),
        ...Object.keys(W_HELP).filter(k => !(urgent && k === 'fine')).map(k => { const on = F.help === k; return H('button', { key: k, 'aria-pressed': on, onClick: () => set({ help: k }), style: { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 14, border: '2px solid ' + (on ? I.p : I.b), background: on ? I.pxl : '#FFFFFF', color: on ? I.pd : I.h, font: 'inherit', fontSize: 15, fontWeight: 600, textAlign: 'left', cursor: 'pointer' } }, mbIcon(k === 'call' ? 'volume-2' : k === 'visit' ? 'map' : 'check', 18), wHelp(k)); }),
        H('label', { style: { display: 'flex', gap: 10, alignItems: 'flex-start', padding: 14, marginTop: 4, borderRadius: 12, background: I.s, border: '1px solid ' + I.b, cursor: 'pointer', fontSize: 14, color: I.h } }, H('input', { type: 'checkbox', checked: F.consent, onChange: () => set({ consent: !F.consent }), style: { width: 20, height: 20, marginTop: 1, accentColor: I.p } }), 'Share my answers with my clinic so they can help me'),
        !F.consent ? H('div', { style: { fontSize: 12, color: I.m } }, 'If you don’t share, your result stays on this phone only.') : null);
      foot = btn(F.consent ? 'Send to my clinic' : 'Finish without sharing', () => {
        const id = nnId('MW');
        if (F.consent) nnPut('wellbeing', { id, mother: 'Shazia Bibi', phone: '+92 312 448 2210', baby: F.baby, date: MB_TODAY, ans: F.ans, help: F.help, status: 'New' });
        if (F.consent) self.setState(s => ({ wReports: [{ id, mother: 'Shazia Bibi', phone: '+92 312 448 2210', baby: F.baby, date: MB_TODAY, ans: F.ans, help: F.help, status: 'New' }].concat(s.wReports || W_REPORTS0) }));
        set({ done: F.consent ? id : 'private' });
      }, 'primary', !F.help);
    } else {
      const shared = F.done !== 'private';
      body = H('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12, paddingTop: 40 } }, H('span', { style: { width: 72, height: 72, borderRadius: '50%', background: '#DCFCE7', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, mbIcon('circle-check', 36)), H('div', { style: { fontSize: 22, fontWeight: 700, color: I.h } }, shared ? 'Sent to your clinic' : 'Saved on your phone'), H('div', { style: { fontSize: 14, color: I.t, lineHeight: 1.5 } }, shared ? (band.k === 'urgent' ? 'Your health worker has been alerted and will call you today.' : F.help === 'fine' ? 'Your clinic can see your answers. Reach out any time if you need to talk.' : 'Your health worker will contact you within 2 days.') : 'Nothing was shared.'), H('div', { style: { fontSize: 13, color: I.m } }, 'We’ll remind you to check again in 2 weeks.'), shared ? H('div', { style: { fontSize: 13, color: I.m } }, 'Reference: ', H('b', { style: { color: I.h, fontFamily: 'ui-monospace, monospace' } }, F.done)) : null);
      foot = btn('Done', () => self.setState({ wf: wNew() }), 'secondary');
    }
    const names = ['About you', 'Questions', 'Your result', 'Get support', 'Done'];
    const phone = H('div', { style: kit.mobile ? { height: '100%', display: 'flex', flexDirection: 'column', background: '#FFFFFF', minHeight: 0 } : { width: '100%', maxWidth: 620, margin: '0 auto', borderRadius: 16, border: '1px solid #E2E8F0', background: '#FFFFFF', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box' } },
      H('div', { style: { padding: kit.mobile ? '8px 20px 12px' : '20px 28px 16px', display: 'flex', flexDirection: 'column', gap: 10, borderBottom: '1px solid #F1F5F9' } },
        H('div', { style: { fontSize: 15, color: I.h, fontWeight: 700 } }, 'Step ' + step + ' / 5 · ' + names[step - 1]),
        H('div', { style: { display: 'flex', gap: 4 } }, ...[1, 2, 3, 4, 5].map(i => H('span', { key: i, style: { flex: 1, height: 4, borderRadius: 9999, background: i <= step ? I.p : '#E2E8F0' } })))),
      H('div', { style: kit.mobile ? { flex: 1, minHeight: 0, overflowY: 'auto', padding: 20 } : { padding: 28, minHeight: 360 } }, body),
      H('div', { style: { padding: kit.mobile ? '12px 20px 16px' : '16px 28px 24px', borderTop: '1px solid #F1F5F9', background: '#F8FAFC' } }, foot));
    const guide = [['About you', 'Baby’s birth date, and a short note that the check is private and not a test.'], ['20 questions', 'The WHO SRQ-20, five yes/no questions per screen, about the last 30 days.'], ['Her result', 'A kind, plain message for her score. Thoughts of self-harm show call buttons at once.'], ['Get support', 'She picks a call-back, a home visit, or not now, and chooses whether to share.'], ['Done', 'Shared answers appear under Mothers’ wellbeing for the clinician. A reminder is set for 2 weeks.']];
    const side = mbCard([mbTitle('Mother’s self-check', '5 steps, about 5 minutes'), H('div', { style: { display: 'flex', flexDirection: 'column', gap: 4 } }, ...guide.map(([t, s], i) => { const n = i + 1, cur = n === step, done = n < step; return H('div', { key: i, style: { display: 'flex', gap: 12, padding: '10px 12px', borderRadius: 10, background: cur ? I.pxl : 'transparent' } }, H('span', { style: { width: 26, height: 26, flex: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, background: done ? '#DCFCE7' : cur ? I.p : '#F1F5F9', color: done ? '#15803D' : cur ? '#FFFFFF' : I.m } }, done ? mbIcon('check', 14) : n), H('span', { style: { display: 'flex', flexDirection: 'column', gap: 2 } }, H('span', { style: { fontSize: 14, fontWeight: 600, color: cur ? I.pd : I.h } }, t), H('span', { style: { fontSize: 13, color: I.m, lineHeight: 1.45 } }, s))); })),
      step >= 3 ? H('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: 12, borderRadius: 10, background: I.s, border: '1px solid ' + I.b } }, H('span', { style: { fontSize: 13, color: I.t } }, 'Score (clinician view): ', H('b', null, total + ' / 20')), mbPill(band.tone, band.label)) : null,
      H('div', { style: { fontSize: 12, color: I.m, borderTop: '1px solid #F1F5F9', paddingTop: 12, lineHeight: 1.5 } }, 'The mother never sees a number or the word “score”. SRQ-20 (WHO). Use the official Urdu and Mongolian SRQ-20 for those languages.')], { flex: '1 1 300px', maxWidth: 420, alignSelf: 'flex-start' });
    return { on: true, view: phone };
  }

  // ---------- CLINICIAN · Mothers' wellbeing ----------
  if (role === 'clinician' && page === 'mothers') {
    if (!st.mw) {
      pg.title = 'Mothers’ wellbeing'; pg.sub = 'Postnatal self-checks (WHO SRQ-20) mothers chose to share';
      const order = { urgent: 0, high: 1, mid: 2, low: 3 };
      const rows = reps.slice().sort((a, b) => (a.status === 'New' ? 0 : 1) - (b.status === 'New' ? 0 : 1) || order[wBand(a.ans).k] - order[wBand(b.ans).k]);
      pg.kpis = [
        { label: 'Urgent today', v: String(reps.filter(r => wBand(r.ans).k === 'urgent' && r.status === 'New').length), note: 'Self-harm thoughts · call today', icon: 'flag', ibg: '#FEE2E2', ifg: '#B91C1C', nc: '#B91C1C' },
        { label: 'Likely depression', v: String(reps.filter(r => wBand(r.ans).k === 'high').length), note: 'Score ' + SRQ_CUT + ' or more (of 20)', icon: 'triangle-alert', ibg: '#FEF3C7', ifg: '#B45309', nc: '#64748B' },
        { label: 'Waiting for contact', v: String(reps.filter(r => r.status === 'New').length), note: 'Not yet called or visited', icon: 'clock', ibg: '#DBEAFE', ifg: '#1D4ED8', nc: '#64748B' }
      ];
      table(['Mother', 'Weeks after birth', 'Score', 'Result', 'Asked for', 'Status', { l: '', al: 'right' }], '1.6fr 1fr .6fr 1.5fr 1.1fr .9fr .3fr', rows.map(r => { const b = wBand(r.ans); return { onClick: () => self.setState({ mw: r.id }), cells: [C.person(r.mother, r.id + ' · ' + mbDate(r.date)), C.text(Math.floor((new Date(r.date) - new Date(r.baby)) / 604800000) + ' weeks'), C.text(wTotal(r.ans) + '/20', '', { fw: 600, color: '#172B4D' }), C.badge(badge(b.tone, b.label, MB_TONE[b.tone][2])), C.text(W_HELP[r.help]), C.badge(badge(r.status === 'New' ? 'info' : 'success', r.status)), C.chev()] }; }), reps.length, 960, 'checks');
      return { on: false, view: null };
    }
    const r = reps.find(x => x.id === st.mw) || reps[0], b = wBand(r.ans);
    const mark = () => { nnPut('wellbeing', Object.assign({}, r, { status: 'Contacted' })); self.setState(s => ({ wReports: (s.wReports || W_REPORTS0).map(x => x.id === r.id ? Object.assign({}, x, { status: 'Contacted' }) : x), mw: null })); self.toast(r.mother + ' marked as contacted'); };
    pg.hasBack = true; pg.backLabel = 'All mothers'; pg.onBack = () => self.setState({ mw: null });
    pg.title = r.mother; pg.sub = r.phone + ' · baby born ' + mbDate(r.baby) + ' · check sent ' + mbDate(r.date) + ' · ' + r.id;
    pg.actions = [act('Call ' + r.mother.split(' ')[0], 'volume-2', () => self.toast('Calling ' + r.mother + ' on ' + r.phone), b.k === 'urgent' ? 'danger' : 'secondary'), act('Mark as contacted', 'check', mark, 'primary', r.status !== 'New')];
    pg.kpis = [
      { label: 'SRQ-20 score', v: wTotal(r.ans) + ' / 20', note: SRQ_MID + '+ some signs · ' + SRQ_CUT + '+ likely', icon: 'activity', ibg: '#DBEAFE', ifg: '#1D4ED8', nc: '#64748B' },
      { label: 'Result', v: b.label.split(' · ')[0], note: b.act, icon: MB_TONE[b.tone][2], ibg: MB_TONE[b.tone][0], ifg: MB_TONE[b.tone][1], nc: MB_TONE[b.tone][1] },
      { label: 'Question 17 (ending life)', v: r.ans[16] === 1 ? 'Yes' : 'No', note: r.ans[16] === 1 ? 'Needs same-day contact' : 'No such thoughts', icon: 'flag', ibg: r.ans[16] === 1 ? '#FEE2E2' : '#F1F5F9', ifg: r.ans[16] === 1 ? '#B91C1C' : '#475569', nc: r.ans[16] === 1 ? '#B91C1C' : '#64748B' },
      { label: 'She asked for', v: W_HELP[r.help], note: r.status, icon: 'send', ibg: '#F1F5F9', ifg: '#475569', nc: '#64748B' }
    ];
    table(['#', 'Question (last 30 days)', 'Her answer'], '.3fr 3fr 1fr', SRQ.map((q, i) => ({ cells: [C.text(String(i + 1), '', { color: '#64748B' }), C.text(q, '', { color: '#172B4D' }), C.badge(badge(r.ans[i] === 1 ? (i === 16 ? 'error' : 'warning') : 'neutral', r.ans[i] === 1 ? 'Yes' : 'No'))] })), 20, 640, 'questions');
    pg.hasTableTitle = true; pg.tableTitle = 'Her answers';
    return { on: b.k === 'urgent', view: b.k === 'urgent' ? H('div', { style: { display: 'flex', gap: 12, alignItems: 'flex-start', padding: '14px 16px', borderRadius: 12, background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', fontSize: 14, lineHeight: 1.5 } }, mbIcon('flag', 18, { flex: 'none', marginTop: 2 }), H('span', null, H('b', null, 'She said yes to thoughts of ending her life. '), 'Call her today, check she is safe, involve a family member she trusts, and refer for same-day mental health assessment.')) : null };
  }
  return null;
}
