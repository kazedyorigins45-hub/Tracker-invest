"use client";

import { useSyncExternalStore } from 'react';

const CURRENCY_KEY = 'mindset-currency';
const EVENT_NAME = 'mindset-currency-change';

function getCurrencySnapshot() {
  if (typeof window === 'undefined') return 'eur';
  const stored = (() => {
    try { return localStorage.getItem(CURRENCY_KEY); } catch { return null; }
  })();
  return stored === 'usd' ? 'usd' : 'eur';
}

function emitCurrencyChange(currency) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { currency } }));
}

export function applyCurrency(next) {
  if (typeof document === 'undefined') return;
  const normalized = next === 'usd' ? 'usd' : 'eur';
  try { localStorage.setItem(CURRENCY_KEY, normalized); } catch {}
  emitCurrencyChange(normalized);
}

function subscribe(callback) {
  if (typeof window === 'undefined') return () => {};
  const handler = () => callback();
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}

function getCurrencyServerSnapshot() { return 'eur'; }

export function useCurrency() {
  const currency = useSyncExternalStore(subscribe, getCurrencySnapshot, getCurrencyServerSnapshot);
  return { currency, setCurrency: applyCurrency };
}
