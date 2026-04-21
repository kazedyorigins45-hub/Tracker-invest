"use client";

import { useEffect, useRef, useState } from 'react';

export function useAccountPayload(storageKey, defaultValue) {
  const [payload, setPayload] = useState(defaultValue);
  const [loaded, setLoaded] = useState(false);
  const saveTimer = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/account-data?storageKey=${encodeURIComponent(storageKey)}`, {
          credentials: 'same-origin',
        });
        const text = await res.text();
        const data = text ? JSON.parse(text) : {};

        if (!cancelled && data.ok && typeof data.payload === 'string' && data.payload) {
          try {
            setPayload(JSON.parse(data.payload));
          } catch {
            setPayload(defaultValue);
          }
        }
      } catch {
        // keep defaultValue
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [storageKey]);

  useEffect(() => {
    if (!loaded) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);

    saveTimer.current = setTimeout(async () => {
      try {
        await fetch('/api/account-data', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ storageKey, payload: JSON.stringify(payload) }),
        });
      } catch {
        // ignore save errors for now
      }
    }, 450);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [payload, loaded, storageKey]);

  return [payload, setPayload, loaded];
}
