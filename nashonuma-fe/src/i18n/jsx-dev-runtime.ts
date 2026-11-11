import * as R from 'react/jsx-dev-runtime';
import { translateProps } from './translateProps';

export const Fragment = R.Fragment;
export function jsxDEV(type: any, props: any, key: any, isStatic: boolean, source?: any, self?: any) {
  return R.jsxDEV(type, translateProps(type, props), key, isStatic, source, self);
}
export type { JSX } from 'react/jsx-dev-runtime';
