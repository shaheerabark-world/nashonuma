// @ts-nocheck -- ported as-is from nashonuma-code/source/modules/09-child-exercises.js by scripts/port-modules.mjs.
// Same markup and inline styles as the prototype; type it by hand when you next change it.
/* eslint-disable */
import { MB_ROWS, MB_STAR } from '@/domain/morbas';
import { h } from '@/i18n/h';
import { getLang } from '@/i18n/lang';
import { Component } from 'react';
import X_AUDIO from './audio.json';

// ===================== Interactive child exercises for the ★ MORBAS items =====================
export const xH = h;
export const XC = { ink: '#172B4D', text: '#334155', muted: '#64748B', line: '#E2E8F0', soft: '#F8FAFC', p: '#2563EB', pd: '#1D4ED8', pl: '#DBEAFE', ok: '#15803D', okl: '#DCFCE7', bad: '#B91C1C', badl: '#FEE2E2', warn: '#B45309', warnl: '#FEF3C7' };
export const xT = (lang, en, mn) => (lang === 'mn' ? mn : en);

// --- sound: spoken prompts (browser voice) and a short chime ---
let xPlaying = null;
export function xSpeech(text, lang) {
  try {
    const ss = window.speechSynthesis; if (!ss) return false;
    const want = lang === 'mn' ? 'mn' : 'en';
    const v = (ss.getVoices() || []).find(x => (x.lang || '').toLowerCase().startsWith(want));
    if (lang === 'mn' && !v) return false;
    const u = new SpeechSynthesisUtterance(text); if (v) u.voice = v; u.lang = lang === 'mn' ? 'mn-MN' : 'en-US'; u.rate = 0.85;
    window.__xU = u; // keep a reference so the browser does not drop it
    if (ss.speaking || ss.pending) { ss.cancel(); setTimeout(() => ss.speak(u), 80); } else ss.speak(u);
    return true;
  } catch (e) { return false; }
}
export const xBuf = {};
let xSrc = null;
export function xCtx() { try { xAC = xAC || new (window.AudioContext || window.webkitAudioContext)(); if (xAC.state === 'suspended') xAC.resume(); return xAC; } catch (e) { return null; } }
export function xB64(d) { const b = atob(d.slice(d.indexOf(',') + 1)); const u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u.buffer; }
export function xSay(text, lang) {
  const L = lang === 'mn' ? 'mn' : 'en';
  const t = L === 'mn' && /^\d+$/.test(text) ? NUMMN[+text - 1] : text;
  const key = L + '|' + t, src = X_AUDIO[key];
  const ac = src ? xCtx() : null;
  if (ac) {
    // Web Audio: decode the built-in clip and play it (no media URL, so the page's media rules do not apply)
    const play = buf => { try { if (xSrc) { try { xSrc.stop(); } catch (e) {} } const n = ac.createBufferSource(); n.buffer = buf; n.connect(ac.destination); n.start(); xSrc = n; } catch (e) { xSpeech(t, L); } };
    if (xBuf[key]) { play(xBuf[key]); return; }
    fetch(src).then(r => r.arrayBuffer()).then(ab => ac.decodeAudioData(ab, b => { xBuf[key] = b; play(b); }, () => xMedia(src, t, L))).catch(() => xMedia(src, t, L)); return;
  }
  if (src) { xMedia(src, t, L); return; }
  xSpeech(t, L);
}
export function xMedia(src, t, L) { try { if (xPlaying) xPlaying.pause(); const a = new Audio(src); xPlaying = a; const pr = a.play(); if (pr && pr.catch) pr.catch(() => xSpeech(t, L)); } catch (e) { xSpeech(t, L); } }
let xAC = null;
export function xChime(good) {
  try {
    xAC = xCtx(); if (!xAC) return;
    const notes = good ? [660, 880] : [300];
    notes.forEach((f, i) => { const o = xAC.createOscillator(), g = xAC.createGain(); o.type = 'sine'; o.frequency.value = f; const t = xAC.currentTime + i * 0.12; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.2, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25); o.connect(g); g.connect(xAC.destination); o.start(t); o.stop(t + 0.3); });
  } catch (e) {}
}

// --- pictures (simple original drawings) ---
export const xS = { stroke: '#334155', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
export const xSvg = (w, h, kids, label) => xH('svg', { viewBox: '0 0 ' + w + ' ' + h, width: '100%', height: '100%', role: 'img', 'aria-label': label, style: { display: 'block' } }, ...kids);
export const xPic = {
  horse: () => xSvg(120, 100, [
    xH('path', Object.assign({ key: 1, d: 'M28 70 L26 92 M40 72 L40 92 M78 72 L80 92 M90 70 L94 92' }, xS)),
    xH('ellipse', Object.assign({ key: 2, cx: 60, cy: 58, rx: 36, ry: 18, fill: '#C68B59' }, xS)),
    xH('path', Object.assign({ key: 3, d: 'M86 50 L98 22 L112 26 L108 38 L98 40 L94 56 Z', fill: '#C68B59' }, xS)),
    xH('path', Object.assign({ key: 4, d: 'M98 22 L92 30 L88 44', fill: 'none', stroke: '#5B3A1E', strokeWidth: 5, strokeLinecap: 'round' })),
    xH('path', Object.assign({ key: 5, d: 'M24 54 C12 58 10 72 14 80', fill: 'none' }, xS, { stroke: '#5B3A1E', strokeWidth: 5 })),
    xH('circle', { key: 6, cx: 104, cy: 30, r: 1.8, fill: '#172B4D' })], 'horse'),
  dog: () => xSvg(120, 100, [
    xH('path', Object.assign({ key: 1, d: 'M36 70 L34 90 M48 72 L48 90 M76 72 L76 90 M88 70 L90 90' }, xS)),
    xH('ellipse', Object.assign({ key: 2, cx: 62, cy: 60, rx: 32, ry: 16, fill: '#E9C46A' }, xS)),
    xH('path', Object.assign({ key: 3, d: 'M30 56 C20 50 18 40 22 34', fill: 'none' }, xS)),
    xH('circle', Object.assign({ key: 4, cx: 92, cy: 40, r: 16, fill: '#E9C46A' }, xS)),
    xH('path', Object.assign({ key: 5, d: 'M82 28 C76 30 74 44 80 48 C84 42 86 34 82 28 Z', fill: '#8D6E3F' }, xS)),
    xH('circle', { key: 6, cx: 96, cy: 37, r: 2, fill: '#172B4D' }), xH('circle', { key: 7, cx: 107, cy: 43, r: 3, fill: '#172B4D' })], 'dog'),
  bird: () => xSvg(120, 100, [
    xH('path', Object.assign({ key: 1, d: 'M10 82 C40 76 80 78 112 84', fill: 'none' }, xS, { stroke: '#7A5230', strokeWidth: 4 })),
    xH('ellipse', Object.assign({ key: 2, cx: 58, cy: 56, rx: 26, ry: 18, fill: '#60A5FA' }, xS)),
    xH('circle', Object.assign({ key: 3, cx: 82, cy: 40, r: 12, fill: '#60A5FA' }, xS)),
    xH('path', Object.assign({ key: 4, d: 'M93 38 L106 42 L93 46 Z', fill: '#F59E0B' }, xS)),
    xH('path', Object.assign({ key: 5, d: 'M44 52 C54 44 66 48 70 58 C60 62 50 60 44 52 Z', fill: '#3B82F6' }, xS)),
    xH('path', Object.assign({ key: 6, d: 'M34 58 L18 50 L22 64 Z', fill: '#3B82F6' }, xS)),
    xH('path', Object.assign({ key: 7, d: 'M54 74 L52 82 M64 74 L64 82', fill: 'none' }, xS)),
    xH('circle', { key: 8, cx: 85, cy: 37, r: 2, fill: '#172B4D' })], 'bird'),
  person: (s) => xSvg(120, 100, [
    xH('circle', Object.assign({ key: 1, cx: 60, cy: 100 - 86 * (s || 1), r: 10 * (s || 1), fill: '#FCD9B8' }, xS)),
    xH('path', Object.assign({ key: 2, d: 'M' + (60 - 14 * (s || 1)) + ' ' + (100 - 72 * (s || 1)) + ' h' + 28 * (s || 1) + ' v' + 34 * (s || 1) + ' h-' + 28 * (s || 1) + ' Z', fill: '#34D399' }, xS)),
    xH('path', Object.assign({ key: 3, d: 'M' + (60 - 14 * (s || 1)) + ' ' + (100 - 68 * (s || 1)) + ' l-12 ' + 20 * (s || 1) + ' M' + (60 + 14 * (s || 1)) + ' ' + (100 - 68 * (s || 1)) + ' l12 ' + 20 * (s || 1) + ' M' + (60 - 7 * (s || 1)) + ' ' + (100 - 38 * (s || 1)) + ' v' + 34 * (s || 1) + ' M' + (60 + 7 * (s || 1)) + ' ' + (100 - 38 * (s || 1)) + ' v' + 34 * (s || 1), fill: 'none' }, xS))], 'person'),
  big: () => xSvg(120, 100, [xH('circle', Object.assign({ key: 1, cx: 60, cy: 50, r: 38, fill: '#FDE68A' }, xS))], 'big circle'),
  small: () => xSvg(120, 100, [xH('circle', Object.assign({ key: 1, cx: 60, cy: 50, r: 14, fill: '#FDE68A' }, xS))], 'small circle'),
  long: () => xSvg(120, 100, [xH('rect', Object.assign({ key: 1, x: 54, y: 6, width: 12, height: 88, rx: 6, fill: '#A78BFA' }, xS))], 'long stick'),
  short: () => xSvg(120, 100, [xH('rect', Object.assign({ key: 1, x: 54, y: 62, width: 12, height: 32, rx: 6, fill: '#A78BFA' }, xS))], 'short stick'),
  tall: () => xPic.person(1), shortp: () => xPic.person(0.55),
  cups: (diff) => xSvg(200, 100, [
    xH('path', Object.assign({ key: 1, d: 'M14 30 h56 c0 30 -10 46 -28 46 S14 60 14 30 Z', fill: '#BAE6FD' }, xS)),
    xH('path', Object.assign({ key: 2, d: 'M70 38 c12 0 12 18 -2 18', fill: 'none' }, xS)),
    diff ? xH('path', Object.assign({ key: 3, d: 'M120 20 h40 l-5 62 h-30 Z', fill: '#FBCFE8' }, xS))
      : xH('path', Object.assign({ key: 3, d: 'M110 30 h56 c0 30 -10 46 -28 46 S110 60 110 30 Z', fill: '#BAE6FD' }, xS)),
    diff ? null : xH('path', Object.assign({ key: 4, d: 'M166 38 c12 0 12 18 -2 18', fill: 'none' }, xS))], diff ? 'cup and glass' : 'two cups'),
  table: (pos) => xSvg(140, 100, [
    xH('path', Object.assign({ key: 1, d: 'M14 40 h86 M22 40 v52 M92 40 v52', fill: 'none' }, xS, { strokeWidth: 4 })),
    xH('circle', Object.assign({ key: 2, cx: pos === 'on' ? 57 : pos === 'under' ? 57 : 120, cy: pos === 'on' ? 28 : 80, r: 11, fill: '#F87171' }, xS))], 'ball ' + pos + ' the table')
};

// --- shared bits ---
export const xBtn = (label, onClick, kind, extra) => xH('button', { className: 'btn btn-' + (kind || 'secondary'), onClick, style: Object.assign({ minHeight: 40 }, extra || {}) }, label);
export const xSpeak = (text, lang) => xH('button', { className: 'btn btn-secondary', onClick: () => xSay(text, lang), style: { minHeight: 40 }, 'aria-label': 'Play the question' }, xH('n-icon', { name: 'volume-2', size: '16' }), xT(lang, 'Play', 'Сонсох'));
export const xTile = (kids, onClick, state, key) => xH('button', { key, onClick, style: { position: 'relative', padding: 8, borderRadius: 16, cursor: 'pointer', background: state === 'ok' ? XC.okl : state === 'bad' ? XC.badl : '#FFFFFF', border: '2px solid ' + (state === 'ok' ? XC.ok : state === 'bad' ? XC.bad : XC.line), minHeight: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .15s, border-color .15s' } }, kids, state === 'ok' ? xH('span', { style: { position: 'absolute', top: 6, right: 6, color: XC.ok } }, xH('n-icon', { name: 'circle-check', size: '20' })) : null);

// Drawing pad: the child copies the model shape; a light auto-check helps the clinician
export const xGuess = (strokes, target) => {
  const pts = strokes.flat(); if (pts.length < 4) return false;
  const bb = s => { const xs = s.map(p => p[0]), ys = s.map(p => p[1]); return { w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys), x0: Math.min(...xs), y0: Math.min(...ys) }; };
  const len = s => s.reduce((n, p, i) => i ? n + Math.hypot(p[0] - s[i - 1][0], p[1] - s[i - 1][1]) : 0, 0);
  const isH = s => { const b = bb(s); return b.w > 50 && b.h < b.w * 0.4; }, isV = s => { const b = bb(s); return b.h > 50 && b.w < b.h * 0.4; };
  const b = bb(pts), tl = strokes.reduce((n, s) => n + len(s), 0);
  if (target === 'hline') return strokes.some(isH);
  if (target === 'vline') return strokes.some(isV);
  if (target === 'scribble') return b.w > 30 && b.h > 30 && tl > 2.5 * Math.max(b.w, b.h);
  if (target === 'circle') return strokes.some(s => { const c = bb(s), m = Math.max(c.w, c.h); const e = Math.hypot(s[0][0] - s[s.length - 1][0], s[0][1] - s[s.length - 1][1]); return m > 40 && c.w / Math.max(1, c.h) > 0.55 && c.w / Math.max(1, c.h) < 1.8 && e < 0.35 * m && len(s) > 2.3 * m; });
  if (target === 'cross') { const hs = strokes.filter(isH), vs = strokes.filter(isV); return hs.some(h => vs.some(v => { const a = bb(h), c = bb(v); return c.x0 > a.x0 - 10 && c.x0 < a.x0 + a.w + 10 && a.y0 > c.y0 - 10 && a.y0 < c.y0 + c.h + 10; })); }
  return false;
};
export const XMODEL = { hline: 'M30 60 H150', vline: 'M90 12 V108', circle: 'M90 18 a42 42 0 1 1 -0.1 0', scribble: 'M70 40 c30 -20 60 10 40 40 c-20 30 -60 10 -50 -20 c8 -20 40 -20 40 10', cross: 'M90 14 V106 M36 60 H144' };
export class XDraw extends Component {
  constructor(p) { super(p); this.state = { color: '#2563EB', strokes: [], pass: false }; this.cv = null; this.cur = null; }
  componentDidMount() { this.fit(); }
  fit() { const c = this.cv; if (!c) return; const w = c.clientWidth || 300; c.width = w * 2; c.height = 220 * 2; this.redraw(); }
  ctx() { const c = this.cv; const x = c.getContext('2d'); x.setTransform(2, 0, 0, 2, 0, 0); return x; }
  redraw() { const c = this.cv; if (!c) return; const x = this.ctx(); x.clearRect(0, 0, c.width, c.height); x.lineCap = 'round'; x.lineJoin = 'round'; x.lineWidth = 7; this.state.strokes.forEach(s => { x.strokeStyle = s.color; x.beginPath(); s.pts.forEach((p, i) => (i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]))); x.stroke(); }); }
  pos(e) { const r = this.cv.getBoundingClientRect(), k = this.cv.clientWidth / (r.width || 1); return [(e.clientX - r.left) * k, (e.clientY - r.top) * k]; }
  down(e) { e.preventDefault(); try { this.cv.setPointerCapture(e.pointerId); } catch (er) {} this.cur = { color: this.state.color, pts: [this.pos(e)] }; }
  move(e) { if (!this.cur) return; const p = this.pos(e); this.cur.pts.push(p); const x = this.ctx(), a = this.cur.pts[this.cur.pts.length - 2]; x.strokeStyle = this.cur.color; x.lineWidth = 7; x.lineCap = 'round'; x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(p[0], p[1]); x.stroke(); }
  up() { if (!this.cur) return; const strokes = this.state.strokes.concat([this.cur]); this.cur = null; const pass = xGuess(strokes.map(s => s.pts), this.props.target); if (pass && !this.state.pass) xChime(true); this.setState({ strokes, pass }); this.props.onAuto && this.props.onAuto(pass); }
  clear() { this.setState({ strokes: [], pass: false }, () => this.redraw()); this.props.onAuto && this.props.onAuto(false); }
  render() {
    const L = this.props.lang, t = this.props.target;
    const cols = ['#2563EB', '#DC2626', '#16A34A', '#F59E0B', '#7C3AED'];
    return xH('div', { style: { display: 'flex', flexDirection: 'column', gap: 12 } },
      xH('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 } },
        xH('div', { style: { border: '1px dashed #CBD5E1', borderRadius: 14, background: XC.soft, padding: 8, display: 'flex', flexDirection: 'column', gap: 4 } },
          xH('div', { style: { fontSize: 12, fontWeight: 600, color: XC.muted } }, xT(L, 'Watch me draw', 'Намайг зурахыг хар')),
          xH('svg', { viewBox: '0 0 180 120', style: { width: '100%', height: 200 }, 'aria-label': 'model shape' }, xH('path', { key: this.props.k, className: 'x-model', d: XMODEL[t], fill: 'none', stroke: '#172B4D', strokeWidth: 5, strokeLinecap: 'round', pathLength: 1 }))),
        xH('div', { style: { display: 'flex', flexDirection: 'column', gap: 4 } },
          xH('div', { style: { fontSize: 12, fontWeight: 600, color: XC.muted } }, xT(L, 'Now you draw here', 'Одоо энд зур')),
          xH('canvas', { ref: el => { this.cv = el; }, onPointerDown: e => this.down(e), onPointerMove: e => this.move(e), onPointerUp: () => this.up(), onPointerLeave: () => this.up(), style: { width: '100%', height: 220, borderRadius: 14, border: '2px solid ' + (this.state.pass ? XC.ok : XC.line), background: '#FFFFFF', touchAction: 'none', cursor: 'crosshair' }, 'aria-label': 'Drawing area' }))),
      xH('div', { style: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' } },
        ...cols.map(c => xH('button', { key: c, 'aria-label': 'Colour ' + c, onClick: () => this.setState({ color: c }), style: { width: 32, height: 32, borderRadius: '50%', background: c, border: this.state.color === c ? '3px solid #172B4D' : '3px solid #FFFFFF', boxShadow: '0 0 0 1px #CBD5E1', cursor: 'pointer' } })),
        xH('span', { style: { flex: 1 } }),
        xBtn(xT(L, 'Clear', 'Арилгах'), () => this.clear(), 'ghost')));
  }
}

// Look & point: the child taps the picture the prompt asks for
export class XPick extends Component {
  constructor(p) { super(p); this.state = { i: 0, found: [], wrong: null }; }
  tap(id) { const c = this.props.cfg, want = c.targets[this.state.i]; if (this.state.i >= c.targets.length) return; if (id === want) { xChime(true); const found = this.state.found.concat([id]), i = this.state.i + 1; this.setState({ found, i, wrong: null }); const done = i >= c.targets.length; this.props.onAuto && this.props.onAuto(done); if (!done) setTimeout(() => xSay(this.prompt(i), this.props.lang), 500); } else { xChime(false); this.setState({ wrong: id }); setTimeout(() => this.setState({ wrong: null }), 700); } }
  prompt(i) { const c = this.props.cfg, L = this.props.lang; if (c.ask) return c.ask[L]; const it = c.items.find(x => x.id === c.targets[i]); return it ? xT(L, 'Where is the ' + it.en + '?', it.mn + ' хаана байна?') : ''; }
  render() {
    const c = this.props.cfg, L = this.props.lang, done = this.state.i >= c.targets.length;
    return xH('div', { style: { display: 'flex', flexDirection: 'column', gap: 12 } },
      xH('div', { style: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' } }, xH('div', { style: { flex: 1, fontSize: 18, fontWeight: 700, color: XC.ink } }, done ? xT(L, 'Well done!', 'Сайн байна!') : this.prompt(this.state.i)), done ? null : xSpeak(this.prompt(this.state.i), L), c.targets.length > 1 ? xH('span', { style: { fontSize: 13, color: XC.muted } }, Math.min(this.state.i, c.targets.length) + ' / ' + c.targets.length) : null),
      xH('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(' + (c.items.length > 2 ? 'auto-fit, minmax(120px, 1fr)' : '2, 1fr') + ')', gap: 12 } }, ...c.items.map(it => xTile(xH('div', { style: { width: '100%', height: 110 } }, xPic[it.pic]()), () => this.tap(it.id), this.state.found.includes(it.id) ? 'ok' : this.state.wrong === it.id ? 'bad' : '', it.id))));
  }
}

// Question rounds with answer buttons (same/different, on/under/beside)
export class XChoice extends Component {
  constructor(p) { super(p); this.state = { ans: {} }; }
  pick(ri, v) { const c = this.props.cfg; const ans = Object.assign({}, this.state.ans, { [ri]: v }); xChime(v === c.rounds[ri].answer); this.setState({ ans }); const done = c.rounds.every((r, i) => ans[i] === r.answer); this.props.onAuto && this.props.onAuto(done); }
  render() {
    const c = this.props.cfg, L = this.props.lang;
    return xH('div', { style: { display: 'flex', flexDirection: 'column', gap: 12 } },
      xH('div', { style: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' } }, xH('div', { style: { flex: 1, fontSize: 18, fontWeight: 700, color: XC.ink } }, c.ask[L]), xSpeak(c.ask[L], L)),
      xH('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12 } }, ...c.rounds.map((r, ri) => { const a = this.state.ans[ri], ok = a === r.answer; return xH('div', { key: ri, style: { border: '2px solid ' + (a ? (ok ? XC.ok : XC.bad) : XC.line), background: a ? (ok ? XC.okl : XC.badl) : '#FFFFFF', borderRadius: 16, padding: 10, display: 'flex', flexDirection: 'column', gap: 8 } }, xH('div', { style: { height: 100 } }, r.pic()), xH('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap' } }, ...c.options.map(o => xH('button', { key: o.v, onClick: () => this.pick(ri, o.v), 'aria-pressed': a === o.v, style: { flex: '1 1 70px', minHeight: 36, borderRadius: 10, border: '1px solid ' + (a === o.v ? XC.p : XC.line), background: a === o.v ? XC.pxl || '#EFF6FF' : '#FFFFFF', color: a === o.v ? XC.pd : XC.text, font: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer' } }, o[L])))); })));
  }
}

// Listen & say: the app says the words, the child repeats; the clinician ticks each one heard
export class XSay extends Component {
  constructor(p) { super(p); this.state = { heard: {}, lit: -1 }; }
  componentWillUnmount() { (this._t || []).forEach(clearTimeout); }
  play() { const c = this.props.cfg, L = this.props.lang; xSay(c.say[L], L); this._t = (this._t || []).concat(c.words.map((w, i) => setTimeout(() => this.setState({ lit: i }), 900 + i * (c.gap || 700))), [setTimeout(() => this.setState({ lit: -1 }), 900 + c.words.length * (c.gap || 700) + 400)]); }
  toggle(i) { const c = this.props.cfg, L = this.props.lang; if (c.speakEach) xSay(c.words[i][L], L); const heard = Object.assign({}, this.state.heard, { [i]: !this.state.heard[i] }); this.setState({ heard }); const done = c.words.every((w, k) => heard[k]); if (done) xChime(true); this.props.onAuto && this.props.onAuto(done); }
  render() {
    const c = this.props.cfg, L = this.props.lang;
    return xH('div', { style: { display: 'flex', flexDirection: 'column', gap: 12 } },
      xH('div', { style: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' } }, xH('div', { style: { flex: 1, fontSize: 18, fontWeight: 700, color: XC.ink } }, c.say[L]), xH('button', { className: 'btn btn-primary', onClick: () => this.play(), style: { minHeight: 40 } }, xH('n-icon', { name: 'volume-2', size: '16' }), xT(L, 'Listen', 'Сонсох'))),
      xH('div', { style: { fontSize: 13, color: XC.muted } }, c.hint[L]),
      xH('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(' + (c.wide ? 150 : 64) + 'px, 1fr))', gap: 8 } }, ...c.words.map((w, i) => { const on = !!this.state.heard[i], lit = this.state.lit === i; return xH('button', { key: i, onClick: () => this.toggle(i), 'aria-pressed': on, style: { minHeight: 56, borderRadius: 14, border: '2px solid ' + (on ? XC.ok : lit ? XC.p : XC.line), background: on ? XC.okl : lit ? '#EFF6FF' : '#FFFFFF', color: on ? XC.ok : XC.ink, font: 'inherit', fontSize: c.wide ? 15 : 22, fontWeight: 700, cursor: 'pointer', transform: lit ? 'scale(1.06)' : 'none', transition: 'transform .15s, background .15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 } }, on ? xH('n-icon', { name: 'check', size: '16' }) : null, w[L]); })));
  }
}

// Balance timer: stand on one foot for 4–5 seconds
export class XTimer extends Component {
  constructor(p) { super(p); this.state = { run: false, ms: 0, best: 0 }; }
  componentWillUnmount() { clearInterval(this._i); }
  start() { clearInterval(this._i); this.t0 = Date.now(); this.setState({ run: true, ms: 0 }); this._i = setInterval(() => this.setState({ ms: Date.now() - this.t0 }), 100); xSay(xT(this.props.lang, 'Stand on one foot!', 'Нэг хөл дээрээ зогсоорой!'), this.props.lang); }
  stop() { clearInterval(this._i); const ms = Date.now() - this.t0, best = Math.max(this.state.best, ms); this.setState({ run: false, ms, best }); const pass = best >= 4000; if (pass) xChime(true); this.props.onAuto && this.props.onAuto(pass); }
  render() {
    const L = this.props.lang, s = (this.state.ms / 1000), pct = Math.min(1, s / 5), best = this.state.best / 1000;
    return xH('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 } },
      xH('div', { style: { fontSize: 18, fontWeight: 700, color: XC.ink, textAlign: 'center' } }, xT(L, 'Stand on one foot', 'Нэг хөл дээрээ зогс')),
      xH('div', { style: { position: 'relative', width: 160, height: 160 } }, xH('svg', { viewBox: '0 0 100 100', width: 160, height: 160 }, xH('circle', { cx: 50, cy: 50, r: 44, fill: 'none', stroke: '#E2E8F0', strokeWidth: 8 }), xH('circle', { cx: 50, cy: 50, r: 44, fill: 'none', stroke: s >= 4 ? XC.ok : XC.p, strokeWidth: 8, strokeLinecap: 'round', strokeDasharray: 276.5, strokeDashoffset: 276.5 * (1 - pct), transform: 'rotate(-90 50 50)' })), xH('div', { style: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' } }, xH('span', { style: { fontSize: 34, fontWeight: 700, color: XC.ink, fontVariantNumeric: 'tabular-nums' } }, s.toFixed(1)), xH('span', { style: { fontSize: 12, color: XC.muted } }, xT(L, 'seconds', 'секунд')))),
      this.state.run ? xBtn(xT(L, 'Foot down: stop', 'Хөлөө тавьсан: зогсоох'), () => this.stop(), 'danger', { minWidth: 220 }) : xBtn(xT(L, 'Start when the foot lifts', 'Хөлөө өргөхөд эхлүүлэх'), () => this.start(), 'primary', { minWidth: 220 }),
      best ? xH('div', { style: { fontSize: 13, color: best >= 4 ? XC.ok : XC.muted, fontWeight: 600 } }, xT(L, 'Best: ', 'Шилдэг: ') + best.toFixed(1) + ' s' + (best >= 4 ? ' ✓' : '')) : null);
  }
}

// What each ★ item opens
export const ANIMALS = [{ id: 'horse', pic: 'horse', en: 'horse', mn: 'морь' }, { id: 'dog', pic: 'dog', en: 'dog', mn: 'нохой' }, { id: 'bird', pic: 'bird', en: 'bird', mn: 'шувуу' }, { id: 'person', pic: 'person', en: 'person', mn: 'хүн' }];
export const NUM = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'], NUMMN = ['нэг', 'хоёр', 'гурав', 'дөрөв', 'тав', 'зургаа', 'долоо', 'найм', 'ес', 'арав'];
export const XCFG = {
  '1-21': { kind: 'timer', type: 'move' },
  '2-16': { kind: 'draw', target: 'scribble', type: 'draw' }, '2-19': { kind: 'draw', target: 'hline', type: 'draw' }, '2-20': { kind: 'draw', target: 'circle', type: 'draw' }, '2-21': { kind: 'draw', target: 'vline', type: 'draw' }, '2-23': { kind: 'draw', target: 'cross', type: 'draw' },
  '5-15': { kind: 'pick', type: 'look', items: ANIMALS, targets: ['dog'] },
  '5-16': { kind: 'pick', type: 'look', items: ANIMALS, targets: ['bird', 'horse', 'person'] },
  '5-20': { kind: 'say', type: 'listen', say: { en: 'Say after me: three, eight', mn: 'Миний араас хэл: гурав, найм' }, hint: { en: 'Tap each number the child says.', mn: 'Хүүхдийн хэлсэн тоо бүрийг дарна уу.' }, words: [{ en: '3', mn: '3' }, { en: '8', mn: '8' }], gap: 900 },
  '5-21': { kind: 'say', type: 'listen', say: { en: 'Let’s count to ten!', mn: 'Арав хүртэл тоолъё!' }, hint: { en: 'Tap each number as the child counts. Tapping also says the number.', mn: 'Хүүхэд тоолох бүрт тоог дарна уу. Дарахад тоо дуугарна.' }, words: NUM.map((w, i) => ({ en: String(i + 1), mn: String(i + 1), say: w })), speakEach: false, gap: 600 },
  '6-16': { kind: 'say', type: 'listen', wide: true, speakEach: true, say: { en: 'Show me your eyes, mouth, ears, nose, hands, feet and tummy', mn: 'Нүд, ам, чих, хамар, гар, хөл, гэдсээ заагаарай' }, hint: { en: 'Tap a part to hear it, then tick it when the child points to it.', mn: 'Хэсгийг дарж сонсоод, хүүхэд заахад тэмдэглэнэ.' }, words: [['eyes', 'нүд'], ['mouth', 'ам'], ['ears', 'чих'], ['nose', 'хамар'], ['hands', 'гар'], ['feet', 'хөл'], ['tummy', 'гэдэс']].map(([en, mn]) => ({ en, mn })) },
  '6-18': { kind: 'say', type: 'listen', wide: true, speakEach: true, say: { en: 'Show me your hair, teeth, tongue, belly button and nails', mn: 'Үс, шүд, хэл, хүйс, хумсаа заагаарай' }, hint: { en: 'Tap a part to hear it, then tick it when the child points to it.', mn: 'Хэсгийг дарж сонсоод, хүүхэд заахад тэмдэглэнэ.' }, words: [['hair', 'үс'], ['teeth', 'шүд'], ['tongue', 'хэл'], ['belly button', 'хүйс'], ['nails', 'хумс']].map(([en, mn]) => ({ en, mn })) },
  '6-19': { kind: 'pick', type: 'look', ask: { en: 'Which one is big?', mn: 'Аль нь том бэ?' }, items: [{ id: 'small', pic: 'small' }, { id: 'big', pic: 'big' }], targets: ['big'] },
  '6-20': { kind: 'pick', type: 'look', ask: { en: 'Which one is long?', mn: 'Аль нь урт вэ?' }, items: [{ id: 'long', pic: 'long' }, { id: 'short', pic: 'short' }], targets: ['long'] },
  '6-22': { kind: 'pick', type: 'look', ask: { en: 'Which one is tall?', mn: 'Аль нь өндөр вэ?' }, items: [{ id: 'shortp', pic: 'shortp' }, { id: 'tall', pic: 'tall' }], targets: ['tall'] },
  '7-22': { kind: 'choice', type: 'look', ask: { en: 'Are these two the same or different?', mn: 'Энэ хоёр адилхан уу, өөр үү?' }, options: [{ v: 'same', en: 'Same', mn: 'Адилхан' }, { v: 'diff', en: 'Different', mn: 'Өөр' }], rounds: [{ pic: () => xPic.cups(false), answer: 'same' }, { pic: () => xPic.cups(true), answer: 'diff' }] },
  '7-23': { kind: 'choice', type: 'look', ask: { en: 'Where is the ball?', mn: 'Бөмбөг хаана байна?' }, options: [{ v: 'on', en: 'On', mn: 'Дээр' }, { v: 'under', en: 'Under', mn: 'Доор' }, { v: 'beside', en: 'Beside', mn: 'Хажууд' }], rounds: [{ pic: () => xPic.table('on'), answer: 'on' }, { pic: () => xPic.table('under'), answer: 'under' }, { pic: () => xPic.table('beside'), answer: 'beside' }] }
};
// in the count exercise the voice says the word, not the digit
XCFG['5-21'].say.en = 'Let’s count to ten! One, two, three…'; XCFG['5-21'].speakEach = true; XCFG['5-21'].words = NUM.map((w, i) => ({ en: String(i + 1), mn: String(i + 1) }));
export const XTYPE = { draw: ['Draw', 'Зурах', 'image'], listen: ['Listen & say', 'Сонсож хэлэх', 'volume-2'], look: ['Look & point', 'Харж заах', 'eye'], move: ['Move', 'Хөдөлгөөн', 'activity'] };

// One exercise card: the activity, the auto-check, and (in the form) buttons that set the mark
export const XMOM = {"1-21": {"en": "Stand on one foot", "mn": "Нэг хөл дээр зогсох", "ur": "ایک پاؤں پر کھڑے ہوں"}, "2-16": {"en": "Scribble together", "mn": "Хамт сараачих", "ur": "مل کر لکیریں کھینچیں"}, "2-19": {"en": "Draw a line across", "mn": "Хөндлөн зураас зурах", "ur": "سیدھی لیٹی لکیر بنائیں"}, "2-20": {"en": "Draw a circle", "mn": "Дугуй зурах", "ur": "دائرہ بنائیں"}, "2-21": {"en": "Draw a line down", "mn": "Босоо зураас зурах", "ur": "کھڑی لکیر بنائیں"}, "2-23": {"en": "Draw a cross", "mn": "Загалмай зурах", "ur": "جمع کا نشان (+) بنائیں"}, "5-15": {"en": "Find the dog", "mn": "Нохойг ол", "ur": "کتا ڈھونڈیں"}, "5-16": {"en": "Find three animals", "mn": "Гурван амьтан ол", "ur": "تین جانور ڈھونڈیں"}, "5-20": {"en": "Say two numbers after me", "mn": "Хоёр тоог давтан хэлэх", "ur": "میرے بعد دو نمبر بولیں"}, "5-21": {"en": "Count to ten", "mn": "Арав хүртэл тоолох", "ur": "دس تک گنیں"}, "6-16": {"en": "Show me your eyes and nose", "mn": "Нүд, хамраа заах", "ur": "اپنی آنکھیں اور ناک دکھائیں"}, "6-18": {"en": "Show me your hair and teeth", "mn": "Үс, шүдээ заах", "ur": "اپنے بال اور دانت دکھائیں"}, "6-19": {"en": "Which one is big?", "mn": "Аль нь том бэ?", "ur": "بڑا کون سا ہے؟"}, "6-20": {"en": "Which one is long?", "mn": "Аль нь урт вэ?", "ur": "لمبا کون سا ہے؟"}, "6-22": {"en": "Which one is tall?", "mn": "Аль нь өндөр вэ?", "ur": "اونچا کون سا ہے؟"}, "7-22": {"en": "Same or different?", "mn": "Адилхан уу, өөр үү?", "ur": "ایک جیسے یا مختلف؟"}, "7-23": {"en": "On, under or beside?", "mn": "Дээр, доор, хажууд уу?", "ur": "اوپر، نیچے یا ساتھ؟"}};
export const xMom = (k, L) => { const m = XMOM[k]; return m ? (getLang() === 'ur' ? m.ur : m[L] || m.en) : k; };
export class XCard extends Component {
  constructor(p) { super(p); this.state = { auto: null, n: 0 }; }
  render() {
    const k = this.props.k, L = this.props.lang, c = XCFG[k]; if (!c) return null;
    const [a, n] = k.split('-').map(Number);
    const onAuto = v => this.setState({ auto: v });
    const prop = { key: k + '-' + this.state.n, k, lang: L, onAuto, cfg: c, target: c.target };
    const body = c.kind === 'draw' ? xH(XDraw, prop) : c.kind === 'pick' ? xH(XPick, prop) : c.kind === 'choice' ? xH(XChoice, prop) : c.kind === 'say' ? xH(XSay, prop) : xH(XTimer, prop);
    const ty = XTYPE[c.type];
    return xH('div', { style: { display: 'flex', flexDirection: 'column', gap: 14, padding: this.props.bare ? 0 : 16, borderRadius: 16, background: this.props.bare ? 'transparent' : '#FFFFFF', border: this.props.bare ? 0 : '1px solid ' + XC.line } },
      xH('div', { style: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' } },
        this.props.mom ? xH('span', { style: { flex: 1, minWidth: 160, fontSize: 20, fontWeight: 700, color: XC.ink } }, xMom(k, L)) : xH('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 6, height: 26, padding: '0 10px', borderRadius: 9999, background: XC.warnl, color: XC.warn, fontSize: 12, fontWeight: 700 } }, xH('n-icon', { name: ty[2], size: '14' }), '★ ' + k + ' · ' + xT(L, ty[0], ty[1])),
        this.props.mom ? null : xH('span', { style: { fontSize: 13, color: XC.muted, flex: 1, minWidth: 160 } }, MB_STAR[k] ? MB_STAR[k][L] : ''),
        xH('button', { className: 'btn btn-ghost', onClick: () => this.setState(s => ({ n: s.n + 1, auto: null })), style: { minHeight: 32, fontSize: 13 } }, xH('n-icon', { name: 'refresh-cw', size: '14' }), xT(L, 'Start again', 'Дахин эхлэх'))),
      body,
      xH('div', { style: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', paddingTop: 10, borderTop: '1px solid #F1F5F9' } },
        this.state.auto == null ? xH('span', { style: { fontSize: 13, color: XC.muted, flex: 1 } }, this.props.mom ? xT(L, 'Do it together. Praise every try.', 'Хамтдаа хийгээрэй. Оролдлого бүрийг магтаарай.') : xT(L, 'Auto-check appears when the child tries.', 'Хүүхэд оролдоход автомат шалгалт гарна.'))
          : xH('span', { style: { flex: 1, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: this.state.auto ? XC.ok : XC.warn } }, xH('n-icon', { name: this.state.auto ? 'circle-check' : 'info', size: '16' }), this.state.auto ? (this.props.mom ? xT(L, 'Well done! Try another game.', 'Сайн байна! Өөр тоглоом тоглоорой.') : xT(L, 'Looks done. You decide the mark.', 'Хийсэн бололтой. Тэмдгийг та шийднэ.')) : (this.props.mom ? xT(L, 'Nearly! Try again together.', 'Бараг! Дахин хамт оролдоорой.') : xT(L, 'Not yet. Let the child try again.', 'Одоогоор үгүй. Дахин оролдуулаарай.'))),
        this.props.onResult ? xH('div', { style: { display: 'flex', gap: 6 } }, xBtn('○ ' + xT(L, 'Can do', 'Чадна'), () => this.props.onResult('o'), 'primary'), xBtn('× ' + xT(L, 'Cannot', 'Чадахгүй'), () => this.props.onResult('x'), 'secondary')) : null));
  }
}

// Clinician page: all exercises in one place
export function xBuild(self, st, role, page, pg) {
  const mom = role === 'parent' && page === 'pexer';
  if (!(role === 'clinician' && page === 'exercises') && !mom) return null;
  const L = st.mbLang || (getLang() === 'mn' ? 'mn' : 'en'), cur = st.xk || '2-20';
  if (mom) { pg.title = xT(L, 'Play with my child', 'Хүүхэдтэйгээ тоглох'); pg.sub = xT(L, 'Short games to do together at home: draw, listen and say, look and point, move. There is no right or wrong.', 'Гэртээ хамт хийх богино тоглоомууд: зурах, сонсож хэлэх, харж заах, хөдлөх. Зөв буруу гэж байхгүй.'); }
  else { pg.title = xT(L, 'Child exercises', 'Хүүхдийн дасгалууд'); pg.sub = xT(L, 'Interactive ★ items: draw, listen and say, look and point. Use a tablet or phone with the child.', 'Интерактив ★ асуултууд: зурах, сонсож хэлэх, харж заах.'); }
  const groups = ['draw', 'look', 'listen', 'move'];
  const list = xH('div', { style: { display: 'flex', flexDirection: 'column', gap: 14, padding: 12, border: '1px solid ' + XC.line, borderRadius: 14, background: '#FFFFFF', alignSelf: 'start' } }, ...groups.map(g => xH('div', { key: g, style: { display: 'flex', flexDirection: 'column', gap: 4 } },
    xH('div', { style: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: XC.muted, padding: '0 8px' } }, xH('n-icon', { name: XTYPE[g][2], size: '14' }), xT(L, XTYPE[g][0], XTYPE[g][1])),
    ...Object.keys(XCFG).filter(k => XCFG[k].type === g).map(k => { const [a, n] = k.split('-').map(Number); const on = k === cur; return xH('button', { key: k, onClick: () => self.setState({ xk: k }), style: { display: 'flex', gap: 10, alignItems: 'flex-start', textAlign: 'left', padding: '8px 10px', borderRadius: 10, border: 0, cursor: 'pointer', font: 'inherit', background: on ? '#EFF6FF' : 'transparent' } }, mom ? null : xH('span', { style: { fontSize: 12, fontWeight: 700, color: on ? XC.pd : XC.warn, minWidth: 36 } }, k), xH('span', { style: { fontSize: mom ? 15 : 13, color: on ? XC.pd : XC.ink, fontWeight: on ? 600 : 500, lineHeight: 1.35 } }, mom ? xMom(k, L) : MB_ROWS[L][n - 1][a - 1])); }))));
  if (mom) {
    const chips = xH('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } }, ...groups.map(g => xH('div', { key: g, style: { display: 'flex', flexDirection: 'column', gap: 6 } },
      xH('div', { style: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: XC.muted } }, xH('n-icon', { name: XTYPE[g][2], size: '14' }), xT(L, XTYPE[g][0], XTYPE[g][1])),
      xH('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } }, ...Object.keys(XCFG).filter(k => XCFG[k].type === g).map(k => { const on = k === cur; return xH('button', { key: k, onClick: () => self.setState({ xk: k }), style: { padding: '8px 14px', minHeight: 40, borderRadius: 9999, border: '1px solid ' + (on ? XC.p || '#2563EB' : XC.line), background: on ? '#EFF6FF' : '#FFFFFF', color: on ? XC.pd : XC.ink, font: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer' } }, xMom(k, L)); })))));
    return { on: true, view: xH('div', { style: { display: 'flex', flexDirection: 'column', gap: 16 } }, xH(XCard, { key: cur + L, k: cur, lang: L, mom: true }), chips) };
  }
  return { on: true, view: xH('div', { style: { display: 'grid', gridTemplateColumns: '300px minmax(0, 1fr)', gap: 16 } }, list, xH(XCard, { key: cur + L, k: cur, lang: L })) };
}
