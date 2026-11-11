/** NashoNuma logo (was the <n-logo size> custom element). */
export function Logo({ size = 32 }: { size?: number | string }) {
  const s = String(size);
  return (
    <span style={{ display: 'inline-flex', flex: 'none' }}>
      <svg xmlns="http://www.w3.org/2000/svg" width={s} height={s} viewBox="0 0 32 32" style={{ display: 'block' }} aria-label="NashoNuma">
        <rect width="32" height="32" rx="9" fill="#2563EB" />
        <circle cx="16" cy="8.6" r="3" fill="#FFFFFF" />
        <path d="M16 14.2v11" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M16 20.4c-4.1 0-7-2.6-7.6-6.4 3.9 0 6.9 2.4 7.6 6.4Z" fill="#FFFFFF" />
        <path d="M16 18c4.1 0 7-2.6 7.6-6.4-3.9 0-6.9 2.4-7.6 6.4Z" fill="#5EEAD4" />
        <path d="M10.5 26h11" stroke="#FFFFFF" strokeOpacity=".55" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </span>
  );
}
