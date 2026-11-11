// Custom JSX runtime (configured as jsxImportSource "@nn" in vite.config.ts / tsconfig.json).
// It is React's runtime plus automatic UI translation (see translateProps.ts).
import * as R from 'react/jsx-runtime';
import { translateProps } from './translateProps';

export const Fragment = R.Fragment;
export function jsx(type: any, props: any, key?: any) {
  return R.jsx(type, translateProps(type, props), key);
}
export function jsxs(type: any, props: any, key?: any) {
  return R.jsxs(type, translateProps(type, props), key);
}
export type { JSX } from 'react/jsx-runtime';
