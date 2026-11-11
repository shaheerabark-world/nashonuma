/** Internal columns that the web app does not use. */
const INTERNAL = new Set(['createdAt', 'updatedAt', 'submittedById', 'submittedBy', 'motherUserId', 'motherUser', 'byUserId', 'assessments']);

/**
 * Turns an entity into the plain record the React app already understands:
 * the same keys as the old mock JSON, with null fields left out.
 */
export function toRecord<T extends object>(entity: T, keep: string[] = []): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(entity)) {
    if (v === null || v === undefined) continue;
    if (INTERNAL.has(k) && !keep.includes(k)) continue;
    out[k] = v;
  }
  return out;
}

/** A value stored in a jsonb column. */
export type Json = Record<string, unknown> | unknown[] | null;
