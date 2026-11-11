// One-off port of the prototype's view modules (04, 05, 06, 07, 09) into ES modules,
// plus the spoken prompts (08) into public/audio/*.mp3.
// Usage: node scripts/port-modules.mjs ../nashonuma-code/source
//
// The view code is kept as-is (h(...) calls with inline styles) so it renders exactly like the
// prototype. Each file starts with // @ts-nocheck until it is typed by hand (see README).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const SRC = path.resolve(process.argv[2], 'modules');
const ROOT = path.resolve('.');
const read = f => fs.readFileSync(path.join(SRC, f), 'utf8');

// ---------- 1. audio ----------
const audioSrc = read('08-audio-clips.js');
const X_AUDIO = JSON.parse(audioSrc.slice(audioSrc.indexOf('{'), audioSrc.lastIndexOf('}') + 1));
const audioDir = path.join(ROOT, 'public/audio');
fs.mkdirSync(audioDir, { recursive: true });
const manifest = {};
for (const [key, uri] of Object.entries(X_AUDIO)) {
  const [lang, text] = [key.slice(0, key.indexOf('|')), key.slice(key.indexOf('|') + 1)];
  const slug = text.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
  const hash = crypto.createHash('sha1').update(key).digest('hex').slice(0, 6);
  const file = `${lang}-${slug || 'clip'}-${hash}.mp3`;
  fs.writeFileSync(path.join(audioDir, file), Buffer.from(uri.slice(uri.indexOf(',') + 1), 'base64'));
  manifest[key] = '/audio/' + file;
}
fs.writeFileSync(path.join(ROOT, 'src/features/exercises/audio.json'), JSON.stringify(manifest, null, 1) + '\n');
console.log('audio:', Object.keys(manifest).length, 'clips');

// ---------- 2. view modules ----------
// [source file, first line to keep (1-based), output file]
const MODULES = [
  ['04-morbas-views.js', 1, 'src/features/morbas/morbasViews.ts'],
  ['05-parent-check-my-child.js', 43, 'src/features/parent/checkMyChild.ts'],
  ['06-mother-wellbeing-srq20.js', 20, 'src/features/parent/wellbeing.ts'],
  ['07-sdq.js', 20, 'src/features/admin/sdqAdmin.ts'],
  ['09-child-exercises.js', 1, 'src/features/exercises/exercises.ts']
];

// names provided by the typed domain/data layer
const domainExports = file => [...fs.readFileSync(path.join(ROOT, file), 'utf8').matchAll(/^export (?:const|function|class) (\w+)/gm)].map(m => m[1]);
const PROVIDERS = [
  ['@/domain/morbas', domainExports('src/domain/morbas.ts')],
  ['@/domain/parent', domainExports('src/domain/parent.ts')],
  ['@/domain/srq20', domainExports('src/domain/srq20.ts')],
  ['@/domain/sdq', domainExports('src/domain/sdq.ts')],
  ['@/store', ['nnP', 'nnW', 'nnPut', 'reportsStore']]
];
const DATA = { MB_KIDS0: '@/data/mock/children.json', P_REPORTS0: '@/data/mock/parentReports.json', W_REPORTS0: '@/data/mock/wellbeingReports.json' };

const topDecls = code => [...code.matchAll(/^(?:const|function|class) (\w+)/gm)].map(m => m[1]);
const uses = (code, name) => new RegExp('(^|[^\\w$.])' + name.replace(/\$/g, '\\$') + '\\b').test(code);

const bodies = MODULES.map(([f, from, out]) => {
  let code = read(f).split('\n').slice(from - 1).join('\n');
  code = code
    .replace(/React\.createElement/g, 'h')
    .replace(/React\.Component/g, 'Component')
    .replace(/\bNN_LANG\b/g, 'getLang()')
    // licensed SDQ wording -> shared config document
    .replace(/NN\.ready\.then\(db => \{ if \(db\) db\.doc\('config\/sdq'\)\.set\((\{[^}]*\})\)\.catch\(\(\) => self\.toast\('Could not save: no write access'\)\); \}\);/,
      "reportsStore.setConfig('sdq', $1);")
    // audio clips are files now: fetch, then decode
    .replace('try { const pr = ac.decodeAudioData(xB64(src), b => { xBuf[key] = b; play(b); }, () => xMedia(src, t, L)); if (pr && pr.catch) pr.catch(() => {}); return; } catch (e) {}',
      'fetch(src).then(r => r.arrayBuffer()).then(ab => ac.decodeAudioData(ab, b => { xBuf[key] = b; play(b); }, () => xMedia(src, t, L))).catch(() => xMedia(src, t, L)); return;')
    .replace("(typeof X_AUDIO !== 'undefined') && X_AUDIO[key]", 'X_AUDIO[key]');
  if (/NN\.ready|React\./.test(code)) throw new Error(f + ': unported global left');
  return { f, out, code, decls: topDecls(code) };
});

for (const b of bodies) {
  const imports = [];
  for (const [mod, names] of PROVIDERS) {
    const used = names.filter(n => !b.decls.includes(n) && uses(b.code, n));
    if (used.length) imports.push(`import { ${used.join(', ')} } from '${mod}';`);
  }
  for (const [n, mod] of Object.entries(DATA)) if (uses(b.code, n)) imports.push(`import ${n} from '${mod}';`);
  for (const o of bodies) {
    if (o === b) continue;
    const used = o.decls.filter(n => !b.decls.includes(n) && uses(b.code, n));
    if (used.length) imports.push(`import { ${used.join(', ')} } from './${path.relative(path.dirname(b.out), o.out).replace(/\\/g, '/').replace(/\.ts$/, '')}';`.replace("'./../", "'../"));
  }
  if (uses(b.code, 'h')) imports.push("import { h } from '@/i18n/h';");
  if (uses(b.code, 'getLang')) imports.push("import { getLang } from '@/i18n/lang';");
  if (uses(b.code, 'Component')) imports.push("import { Component } from 'react';");
  if (uses(b.code, 'X_AUDIO')) imports.push("import X_AUDIO from './audio.json';");
  const exported = b.code.replace(/^(const|function|class) /gm, 'export $1 ');
  const header = `// @ts-nocheck -- ported as-is from nashonuma-code/source/modules/${b.f} by scripts/port-modules.mjs.\n// Same markup and inline styles as the prototype; type it by hand when you next change it.\n/* eslint-disable */\n`;
  fs.mkdirSync(path.dirname(path.join(ROOT, b.out)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, b.out), header + imports.join('\n') + '\n\n' + exported.trim() + '\n');
  console.log(b.out, '-', b.decls.length, 'declarations,', imports.length, 'imports');
}
