"use client";

import { useState, useEffect } from 'react';

export const FX_FALLBACK_EUR_USD = 1.08;

export function useFxRate() {
  const [rate, setRate] = useState(FX_FALLBACK_EUR_USD);

  useEffect(() => {
    fetch('/api/fx')
      .then((r) => r.json())
      .then((d) => { if (d?.rate) setRate(d.rate); })
      .catch(() => {});
  }, []);

  return rate;
}
