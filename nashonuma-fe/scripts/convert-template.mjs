// One-off converter: prototype template.html (web half) -> src/components/layout/AppView.generated.tsx
// Usage: node scripts/convert-template.mjs ../nashonuma-code/source/template.html
// Template rules (see CLAUDE_CODE_PROMPT.md):
//   {{ expr }}            -> {expr}
//   <sc-if value>         -> {cond ? <>…</> : null}
//   <sc-for list as>      -> {list.map((as, i) => <Fragment key={i}>…</Fragment>)}
//   sc-camel-on-click     -> onClick (also on-change, default-value, default-checked)
//   style-hover="…"       -> generated :hover class (src/styles/hover.generated.css)
//   <n-icon>, <n-logo>    -> <Icon>, <Logo>
import fs from 'node:fs';
import path from 'node:path';

const srcFile = process.argv[2];
const outDir = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const lines = fs.readFileSync(srcFile, 'utf8').split('\n');
// The web layout is lines 1..237; the mobile copy (238..) is identical apart from the phone frame.
let web = lines.slice(0, 237).join('\n').replace('</helmet>', '');

// ---------- tiny HTML parser ----------
const VOID = new Set(['input', 'br', 'img', 'hr']);
function parse(s) {
  let i = 0;
  const root = { tag: '#root', attrs: [], children: [] };
  const stack = [root];
  while (i < s.length) {
    if (s.startsWith('</', i)) {
      const j = s.indexOf('>', i);
      const tag = s.slice(i + 2, j).trim();
      const top = stack.pop();
      if (top.tag !== tag) throw new Error(`Mismatched </${tag}> (open: ${top.tag}) at ${i}`);
      i = j + 1;
    } else if (s[i] === '<' && /[a-z]/.test(s[i + 1])) {
      let j = i + 1;
      while (/[a-z0-9-]/.test(s[j])) j++;
      const tag = s.slice(i + 1, j);
      const attrs = [];
      for (;;) {
        while (/\s/.test(s[j])) j++;
        if (s[j] === '>') { j++; break; }
        if (s[j] === '/' && s[j + 1] === '>') { j += 2; break; }
        let k = j;
        while (/[A-Za-z0-9_:-]/.test(s[k])) k++;
        const name = s.slice(j, k);
        if (!name) throw new Error('Bad attribute at ' + j + ': ' + s.slice(j, j + 40));
        j = k;
        if (s[j] === '=') {
          const q = s[j + 1];
          const end = s.indexOf(q, j + 2);
          attrs.push([name, s.slice(j + 2, end)]);
          j = end + 1;
        } else attrs.push([name, true]);
      }
      const node = { tag, attrs, children: [] };
      stack[stack.length - 1].children.push(node);
      if (!VOID.has(tag)) stack.push(node);
      i = j;
    } else {
      let j = s.indexOf('<', i + 1);
      if (j < 0) j = s.length;
      // a '<' that does not start a tag stays in the text
      while (j < s.length && !(s[j + 1] === '/' || /[a-z]/.test(s[j + 1]))) { j = s.indexOf('<', j + 1); if (j < 0) j = s.length; }
      stack[stack.length - 1].children.push({ text: s.slice(i, j) });
      i = j;
    }
  }
  if (stack.length !== 1) throw new Error('Unclosed: ' + stack.map(n => n.tag).join(' > '));
  return root;
}

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', middot: '·', rsquo: '’', hellip: '…', times: '×', ndash: '–', mdash: '—' };
const decode = s => s.replace(/&(#x?[0-9a-fA-F]+|[a-z]+);/g, (m, e) => e[0] === '#' ? String.fromCodePoint(e[1] === 'x' ? parseInt(e.slice(2), 16) : +e.slice(1)) : (ENT[e] ?? m));

// ---------- expressions ----------
const EXPR = /\{\{\s*([\s\S]*?)\s*\}\}/g;
const topIds = new Set();
function expr(e, scope) {
  e = e.trim();
  // record first identifier of every path that is not a loop variable
  for (const m of e.matchAll(/(^|[^.\w$])([A-Za-z_$][\w$]*)/g)) {
    const id = m[2];
    if (['true', 'false', 'null', 'undefined'].includes(id)) continue;
    if (!scope.has(id)) topIds.add(id);
  }
  return e;
}
const isPure = v => /^\s*\{\{[\s\S]*?\}\}\s*$/.test(v) && v.match(EXPR).length === 1;
// attribute/text value -> JS expression source
function valueExpr(v, scope) {
  if (isPure(v)) return expr(v.replace(EXPR, '$1'), scope);
  if (!EXPR.test(v)) { EXPR.lastIndex = 0; return JSON.stringify(decode(v)); }
  EXPR.lastIndex = 0;
  let out = '`', last = 0;
  for (const m of v.matchAll(EXPR)) {
    out += decode(v.slice(last, m.index)).replace(/[`\\$]/g, c => '\\' + c) + '${' + expr(m[1], scope) + '}';
    last = m.index + m[0].length;
  }
  return out + decode(v.slice(last)).replace(/[`\\$]/g, c => '\\' + c) + '`';
}

// ---------- styles ----------
const camel = p => p.startsWith('--') ? p : p.replace(/-([a-z])/g, (_, c) => c.toUpperCase()).replace(/^Ms/, 'ms');
function splitDecls(s) {
  const out = []; let depth = 0, cur = '', inExpr = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (s.startsWith('{{', i)) inExpr = true;
    if (s.startsWith('}}', i)) inExpr = false;
    if (c === '(') depth++;
    if (c === ')') depth--;
    if (c === ';' && depth === 0 && !inExpr) { out.push(cur); cur = ''; } else cur += c;
  }
  out.push(cur);
  return out.map(d => d.trim()).filter(Boolean);
}
function styleObj(s, scope, extra = []) {
  const parts = splitDecls(s).map(d => {
    const k = d.indexOf(':');
    const prop = d.slice(0, k).trim(), val = d.slice(k + 1).trim();
    return `${JSON.stringify(camel(prop))}: ${valueExpr(val, scope)}`;
  }).concat(extra);
  // CSS custom properties (hover variables) are not in React's CSSProperties type
  return extra.length ? `{{ ${parts.join(', ')} } as CSSProperties}` : `{{ ${parts.join(', ')} }}`;
}

// ---------- hover rules ----------
const hoverCss = [];
let hoverN = 0;
function hover(v, scope) {
  const cls = 'nnh' + (++hoverN);
  const vars = [];
  const rules = splitDecls(v).map((d, idx) => {
    const k = d.indexOf(':');
    const prop = d.slice(0, k).trim(), val = d.slice(k + 1).trim();
    if (EXPR.test(val)) { EXPR.lastIndex = 0; const vn = `--${cls}-${idx}`; vars.push(`${JSON.stringify(vn)}: ${valueExpr(val, scope)}`); return `${prop}: var(${vn}) !important`; }
    EXPR.lastIndex = 0;
    return `${prop}: ${val} !important`;
  });
  hoverCss.push(`.${cls}:hover { ${rules.join('; ')}; }`);
  return { cls, vars };
}

// ---------- JSX emit ----------
const ATTR = { 'sc-camel-on-click': 'onClick', 'sc-camel-on-change': 'onChange', 'sc-camel-default-value': 'defaultValue', 'sc-camel-default-checked': 'defaultChecked', class: 'className', 'aria-label': 'aria-label', for: 'htmlFor' };
const ind = n => '  '.repeat(n);
let loopN = 0;

function emitChildren(children, scope, d) {
  const out = [];
  for (const c of children) {
    if (c.text != null) {
      const t = c.text;
      if (!/\S/.test(t)) { if (!t.includes('\n') && t.length) out.push(ind(d) + '{" "}'); continue; }
      const norm = t.replace(/\s+/g, ' ');
      let last = 0;
      for (const m of norm.matchAll(EXPR)) {
        const lit = norm.slice(last, m.index);
        if (lit) out.push(ind(d) + `{${JSON.stringify(decode(lit))}}`);
        out.push(ind(d) + `{${expr(m[1], scope)}}`);
        last = m.index + m[0].length;
      }
      const tail = norm.slice(last);
      if (tail && /\S/.test(tail) || (tail === ' ' && last > 0)) out.push(ind(d) + `{${JSON.stringify(decode(tail))}}`);
      continue;
    }
    out.push(emitNode(c, scope, d));
  }
  // trim a leading/trailing lone space (HTML would collapse it at block edges)
  while (out.length && out[0].trim() === '{" "}') out.shift();
  while (out.length && out[out.length - 1].trim() === '{" "}') out.pop();
  return out;
}

function attrMap(n) { return Object.fromEntries(n.attrs); }

function emitNode(n, scope, d) {
  const a = attrMap(n);
  if (n.tag === 'sc-if') {
    const cond = valueExpr(a.value, scope);
    const kids = emitChildren(n.children, scope, d + 2);
    return `${ind(d)}{(${cond}) ? (\n${ind(d + 1)}<>\n${kids.join('\n')}\n${ind(d + 1)}</>\n${ind(d)}) : null}`;
  }
  if (n.tag === 'sc-for') {
    const list = valueExpr(a.list, scope);
    const v = a.as;
    const iv = '__i' + (++loopN);
    const s2 = new Set(scope); s2.add(v);
    const kids = emitChildren(n.children, s2, d + 2);
    return `${ind(d)}{((${list}) as any[]).map((${v}: any, ${iv}: number) => (\n${ind(d + 1)}<Fragment key={${iv}}>\n${kids.join('\n')}\n${ind(d + 1)}</Fragment>\n${ind(d)}))}`;
  }
  let tag = n.tag;
  const props = [];
  let style = null, hov = null, cls = null;
  for (const [k, v] of n.attrs) {
    if (k.startsWith('hint-placeholder')) continue;
    if (k === 'style') { style = v; continue; }
    if (k === 'style-hover') { hov = hover(v, scope); continue; }
    if (k === 'class') { cls = v; continue; }
    const name = ATTR[k] || k;
    if (v === true) { props.push(name); continue; }
    if (name === 'size' && (tag === 'n-icon' || tag === 'n-logo')) { props.push(`size={${EXPR.test(v) ? (EXPR.lastIndex = 0, valueExpr(v, scope)) : Number(v)}}`); EXPR.lastIndex = 0; continue; }
    props.push(`${name}={${valueExpr(v, scope)}}`);
  }
  if (cls != null || hov) {
    const c = cls != null ? valueExpr(cls, scope) : '""';
    props.unshift(hov ? `className={${c === '""' ? JSON.stringify(hov.cls) : '(' + c + ') + ' + JSON.stringify(' ' + hov.cls)}}` : `className={${c}}`);
  }
  if (style != null || (hov && hov.vars.length)) props.push(`style=${styleObj(style || '', scope, hov ? hov.vars : [])}`);
  if (tag === 'n-icon') tag = 'Icon';
  if (tag === 'n-logo') tag = 'Logo';
  const open = `<${tag}${props.length ? ' ' + props.join(' ') : ''}`;
  if (VOID.has(n.tag) || (!n.children.length)) {
    return ind(d) + (['textarea', 'div', 'span', 'button', 'aside', 'main', 'nav', 'header', 'label', 'b', 'h1'].includes(n.tag) && !n.children.length ? `${open}></${tag}>` : `${open} />`);
  }
  const kids = emitChildren(n.children, scope, d + 1);
  if (!kids.length) return `${ind(d)}${open}></${tag}>`;
  return `${ind(d)}${open}>\n${kids.join('\n')}\n${ind(d)}</${tag}>`;
}

const tree = parse(web);
// root: <sc-if !mobileMode> <div …app…> </sc-if>
const ifNode = tree.children.find(c => c.tag === 'sc-if');
const appDiv = ifNode.children.find(c => c.tag === 'div');
// Inject the mobile drawer backdrop as the first child of the app div (from the mobile copy of the template).
appDiv.children.unshift({ tag: 'sc-if', attrs: [['value', '{{ mnavOpen }}']], children: [{ tag: 'div', attrs: [['class', 'mob-backdrop'], ['sc-camel-on-click', '{{ closeNav }}']], children: [] }] });
const body = emitNode(appDiv, new Set(), 2);

const ids = [...topIds].sort();
const out = `// AUTO-GENERATED by scripts/convert-template.mjs from nashonuma-code/source/template.html.
// Do not edit by hand: change the converter or the view-model instead.
/* eslint-disable */
import { Fragment, type CSSProperties } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';
import type { AppVM } from '@/app/buildViewModel';

export function AppView({ v }: { v: AppVM }) {
  const { ${ids.join(', ')} } = v as any;
  return (
${body}
  );
}
`;
fs.writeFileSync(path.join(outDir, 'src/components/layout/AppView.generated.tsx'), out);
fs.writeFileSync(path.join(outDir, 'src/styles/hover.generated.css'), '/* AUTO-GENERATED by scripts/convert-template.mjs (style-hover) */\n' + hoverCss.join('\n') + '\n');
console.log('ok:', ids.length, 'view-model keys,', hoverN, 'hover rules');
console.log('keys:', ids.join(' '));
