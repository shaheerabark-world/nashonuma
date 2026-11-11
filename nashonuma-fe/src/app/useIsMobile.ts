import { useSyncExternalStore } from 'react';

/** Phone layout below 768px (the prototype's #mobile view, without the phone frame). */
const QUERY = '(max-width: 767px)';

export function useIsMobile() {
  return useSyncExternalStore(
    fn => {
      const m = window.matchMedia(QUERY);
      m.addEventListener('change', fn);
      return () => m.removeEventListener('change', fn);
    },
    () => window.matchMedia(QUERY).matches,
    () => false
  );
}
