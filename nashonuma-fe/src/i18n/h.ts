// `h(type, props, ...children)` used by the ported module views (MORBAS, parent check,
// SRQ-20, SDQ, exercises). Same as React.createElement, plus the prototype's translation rule.
import { createElement, type ReactNode } from 'react';
import { getLang, tr } from './lang';
import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';

const ATTRS = ['placeholder', 'title', 'aria-label'];

export function h(type: any, props?: any, ...children: any[]): any {
  if (type === 'n-icon') type = Icon;
  else if (type === 'n-logo') type = Logo;
  if (getLang() !== 'en') {
    children = children.map(c => (typeof c === 'string' ? tr(c) : c));
    if (props && typeof type === 'string') {
      let p2: any = null;
      for (const a of ATTRS) if (typeof props[a] === 'string') { p2 = p2 || { ...props }; p2[a] = tr(props[a]); }
      if (p2) props = p2;
    }
  }
  return createElement(type, props, ...(children as ReactNode[]));
}
