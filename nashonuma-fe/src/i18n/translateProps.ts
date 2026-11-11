import { getLang, tr } from './lang';

const ATTRS = ['placeholder', 'title', 'aria-label'] as const;

/**
 * Same rule as the prototype's createElement patch:
 * - string children are translated,
 * - placeholder / title / aria-label on DOM elements are translated.
 * Strings nested inside arrays produced by .map() are not touched (they are their own elements).
 */
export function translateProps(type: unknown, props: any): any {
  if (getLang() === 'en' || props == null) return props;
  let p = props;
  const c = props.children;
  if (typeof c === 'string') {
    p = { ...p, children: tr(c) };
  } else if (Array.isArray(c) && c.some(x => typeof x === 'string')) {
    p = { ...p, children: c.map(x => (typeof x === 'string' ? tr(x) : x)) };
  }
  if (typeof type === 'string') {
    for (const a of ATTRS) {
      if (typeof props[a] === 'string') {
        if (p === props) p = { ...props };
        p[a] = tr(props[a]);
      }
    }
  }
  return p;
}
