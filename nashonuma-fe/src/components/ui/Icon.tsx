import type { CSSProperties } from 'react';
import { ICON_PATHS } from './iconPaths';

type Props = { name: string; size?: number | string; stroke?: number | string; style?: CSSProperties; className?: string };

/** Replaces the prototype's <n-icon name size stroke> custom element (same markup and box). */
export function Icon({ name, size = 18, stroke = 2, style, className }: Props) {
  const s = String(size);
  const body = ICON_PATHS[name] || '<circle cx="12" cy="12" r="9"/>';
  return (
    <span className={className ? 'n-icon ' + className : 'n-icon'} style={{ ...style, display: 'inline-flex', flex: 'none', width: s + 'px', height: s + 'px' }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={s}
        height={s}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ display: 'block' }}
        dangerouslySetInnerHTML={{ __html: body }}
      />
    </span>
  );
}
