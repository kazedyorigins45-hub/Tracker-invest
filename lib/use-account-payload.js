"use client";

import { useEffect, useRef, useState } from 'react';

export function useAccountPayload(storageKey, defaultValue, { readonly = false } = {}) {
  const [payload, setPayload] = useState(defaultValue);
  const [loaded, setLoaded] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const saveTimer = useRef(null);
  const payloadRef = useRef(defaultValue);

  // Keep payloadRef current so the unmount-save always uses the latest payload
  useEffect(() => {
    payloadRef.current = payload;
  });

  // Load on mount / storageKey change
  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    setPayload(defaultValue);

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
        // keep defaultValue on network error
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [storageKey]);

  // Debounced save — checks response and surfaces errors
  useEffect(() => {
    if (!loaded || readonly) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);

    saveTimer.current = setTimeout(async () => {
      saveTimer.current = null;
      try {
        const res = await fetch('/api/account-data', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ storageKey, payload: JSON.stringify(payload) }),
        });
        const result = await res.json().catch(() => ({}));
        if (!result.ok) {
          setSaveError(result.error || 'Erreur de sauvegarde');
          console.error('[useAccountPayload] Save failed:', result.error, '| key:', storageKey);
        } else {
          setSaveError(null);
        }
      } catch (err) {
        setSaveError('Erreur réseau lors de la sauvegarde');
        console.error('[useAccountPayload] Network error on save:', err, '| key:', storageKey);
      }
    }, 450);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [payload, loaded, storageKey, readonly]);

  // If a save is still pending when the component unmounts (e.g. page refresh),
  // fire it immediately with keepalive so the browser sends it even after unload.
  useEffect(() => {
    return () => {
      if (!saveTimer.current || readonly) return;
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
      fetch('/api/account-data', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storageKey, payload: JSON.stringify(payloadRef.current) }),
        keepalive: true,
      }).catch(() => {});
    };
  }, [storageKey, readonly]);

  return [payload, setPayload, loaded, saveError];
}
