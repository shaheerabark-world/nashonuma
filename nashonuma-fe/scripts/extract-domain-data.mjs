// One-off: evaluates the prototype's data constants and writes them as JSON,
// so the React code uses exactly the same items, translations and seed records.
// Usage: node scripts/extract-domain-data.mjs ../nashonuma-code/source
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const src = path.resolve(process.argv[2]);
const out = path.resolve('src');
const read = f => fs.readFileSync(path.join(src, 'modules', f), 'utf8');
const firstLines = (f, n) => read(f).split('\n').slice(0, n).join('\n');

const ctx = { NN_LANG: 'en', console };
vm.createContext(ctx);
const run = code => vm.runInContext(code.replace(/^const (\w+)\s*=/gm, 'var $1 =').replace(/^let (\w+)\s*=/gm, 'var $1 ='), ctx);
run(read('03-morbas-data.js'));
run(firstLines('05-parent-check-my-child.js', 42));
run(firstLines('06-mother-wellbeing-srq20.js', 19));
run(firstLines('07-sdq.js', 19));

const pick = names => Object.fromEntries(names.map(n => [n, ctx[n]]));
const write = (file, obj) => {
  fs.mkdirSync(path.dirname(path.join(out, file)), { recursive: true });
  fs.writeFileSync(path.join(out, file), JSON.stringify(obj, null, 1) + '\n');
  console.log('wrote', file);
};

// English (and MORBAS Mongolian, which is part of the official form) stay with the instrument data.
const PL = { ...ctx.P_L };
delete PL.ur;
write('domain/data/morbas.json', pick(['MB_TODAY', 'MB_DOM', 'MB_SHORT', 'MB_ROWS', 'MB_STAR', 'MB_AGE', 'MB_LO', 'MB_HI', 'MB_RULES']));
write('domain/data/parent.json', { P_L: PL, P_CONCERNS: ctx.P_CONCERNS, P_MOTHER: ctx.P_MOTHER, TQ: ctx.TQ, P_AREAS: ctx.P_AREAS });
write('domain/data/srq20.json', { SRQ: ctx.SRQ, W_HELP: ctx.W_HELP, SRQ_CUT: ctx.SRQ_CUT, SRQ_MID: ctx.SRQ_MID });
write('domain/data/sdq.json', pick(['SDQ_SCALES', 'SDQ_REV', 'SDQ_TOPIC', 'SDQ_OPTS']));
// Working translations of the questionnaires: replace with the official ones before the pilot.
write('i18n/questionnaires.json', { SRQ_TR: ctx.SRQ_TR, TQ_TR: ctx.TQ_TR, P_L_ur: ctx.P_L.ur, P_CONCERNS_UR: ctx.P_CONCERNS_UR, W_HELP_TR: ctx.W_HELP_TR });
// Seed records (mock data shown before anything is sent)
write('data/mock/children.json', ctx.MB_KIDS0);
write('data/mock/parentReports.json', ctx.P_REPORTS0);
write('data/mock/wellbeingReports.json', ctx.W_REPORTS0);
