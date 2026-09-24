import { useEffect, useMemo, useState } from 'react';

import { getApiDocumentId } from '@/service/api';
import type { DocumentDetail } from '@/types/document';

const cache = new Map<string, string | null>();
const inflight = new Map<string, Promise<string | null>>();

async function loadFileExt(documentId: string): Promise<string | null> {
  if (cache.has(documentId)) return cache.get(documentId)!;

  const existing = inflight.get(documentId);
  if (existing) return existing;

  const request = getApiDocumentId({ path: { id: documentId } })
    .then((res) => {
      const ext = (res as DocumentDetail).fileExt ?? null;
      cache.set(documentId, ext);
      return ext;
    })
    .catch(() => {
      cache.set(documentId, null);
      return null;
    })
    .finally(() => {
      inflight.delete(documentId);
    });

  inflight.set(documentId, request);
  return request;
}

export function useDocumentFileExts(documentIds: string[]) {
  const idsKey = useMemo(
    () => [...new Set(documentIds.filter(Boolean))].sort().join('\0'),
    [documentIds],
  );
  const ids = useMemo(() => (idsKey ? idsKey.split('\0') : []), [idsKey]);

  const [extMap, setExtMap] = useState<Record<string, string | null>>(() => {
    const initial: Record<string, string | null> = {};
    for (const id of ids) {
      if (cache.has(id)) initial[id] = cache.get(id)!;
    }
    return initial;
  });

  useEffect(() => {
    const cached: Record<string, string | null> = {};
    const missing: string[] = [];

    for (const id of ids) {
      if (cache.has(id)) cached[id] = cache.get(id)!;
      else missing.push(id);
    }

    if (Object.keys(cached).length) {
      setExtMap((prev) => ({ ...prev, ...cached }));
    }
    if (!missing.length) return;

    let cancelled = false;

    void Promise.all(
      missing.map(async (id) => [id, await loadFileExt(id)] as const),
    ).then((entries) => {
      if (cancelled) return;
      setExtMap((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
    });

    return () => {
      cancelled = true;
    };
  }, [ids]);

  return extMap;
}
