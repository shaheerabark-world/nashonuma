// Golden test: runs the original prototype functions (../nashonuma-code/source) side by side with
// the TypeScript port on many inputs. Skipped when the prototype folder is not next to this project.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { describe, expect, it } from 'vitest';
import * as M from './morbas';
import * as W from './srq20';
import * as S from './sdq';
import * as P from './parent';

const SRC = path.resolve(__dirname, '../../../nashonuma-code/source/modules');
const has = fs.existsSync(SRC);

function loadOriginal() {
  const read = (f: string, n?: number) => {
    const t = fs.readFileSync(path.join(SRC, f), 'utf8');
    return n ? t.split('\n').slice(0, n).join('\n') : t;
  };
  const ctx: any = { NN_LANG: 'en' };
  vm.createContext(ctx);
  const run = (c: string) => vm.runInContext(c.replace(/^const (\w+)\s*=/gm, 'var $1 =').replace(/^let (\w+)\s*=/gm, 'var $1 ='), ctx);
  run(read('03-morbas-data.js'));
  run(read('05-parent-check-my-child.js', 42));
  run(read('06-mother-wellbeing-srq20.js', 19));
  run(read('07-sdq.js', 19));
  return ctx;
}

// deterministic pseudo-random
let seed = 42;
const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const pick = <T,>(xs: T[]) => xs[Math.floor(rnd() * xs.length)];

describe.skipIf(!has)('parity with the prototype', () => {
  const O = has ? loadOriginal() : null;

  it('MORBAS: mbStart, mbScore, mbCmp, mbGuide, mbAgeTxt', () => {
    for (let m = 0; m < 50; m += 0.37) {
      expect(M.mbStart(m)).toBe(O.mbStart(m));
      expect(M.mbAgeTxt(m)).toBe(O.mbAgeTxt(m));
    }
    for (let i = 0; i < 3000; i++) {
      const marks = Array.from({ length: 23 }, () => pick<M.Mark>(['o', 'x', null]));
      const S0 = pick([null, 1, 3, 6, 10, 15, 20, 23]);
      expect(M.mbScore(marks)).toBe(O.mbScore(marks));
      expect(M.mbGuide(marks, S0)).toEqual(O.mbGuide(marks, S0));
      const sc = Math.floor(rnd() * 24);
      expect(M.mbCmp(sc, S0)).toEqual(O.mbCmp(sc, S0));
    }
  });

  it('SRQ-20: wTotal and wBand', () => {
    for (let i = 0; i < 3000; i++) {
      const a = Array.from({ length: 20 }, () => pick<W.YesNo>([0, 1, null]));
      expect(W.wTotal(a)).toBe(O.wTotal(a));
      expect(W.wBand(a)).toEqual(O.wBand(a));
    }
  });

  it('SDQ: sdqScore and sdqBand', () => {
    for (let i = 0; i < 3000; i++) {
      const ans: Record<string, number | null> = {};
      for (let n = 1; n <= 25; n++) ans['sdq-' + n] = pick([0, 1, 2, null]);
      const s = S.sdqScore(ans);
      expect(s).toEqual(O.sdqScore(ans));
      expect(S.sdqBand(s.total)).toEqual(O.sdqBand(s.total));
    }
  });

  it('Ten Questions and routing', () => {
    for (let i = 0; i < 3000; i++) {
      const ans: Record<string, string> = {};
      for (let n = 1; n <= 10; n++) if (rnd() < 0.8) ans['tq-' + n] = pick(['y', 'n']);
      const m = rnd() * 120;
      expect(P.tqPositives(ans, m)).toEqual(O.tqPositives(ans, m));
    }
    for (let y = 2008; y <= 2026; y++) for (const mo of ['01', '05', '09', '12']) for (const c of ['PK', 'MN', undefined]) {
      const k = { dob: `${y}-${mo}-15`, country: c };
      expect(P.pInstr(k)).toBe(O.pInstr(k));
    }
    for (let S0 = 1; S0 <= 23; S0++) expect(P.pItems(S0)).toEqual(O.pItems(S0));
  });
});
