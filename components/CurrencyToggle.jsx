"use client";

import { useCurrency } from '@/lib/currency';

export default function CurrencyToggle({ className = '' }) {
  const { currency, setCurrency } = useCurrency();
  return (
    <button
      type="button"
      className={`theme-toggle ${className}`.trim()}
      onClick={() => setCurrency(currency === 'eur' ? 'usd' : 'eur')}
      aria-label="Basculer la devise"
    >
      {currency === 'eur' ? '$ USD' : '€ EUR'}
    </button>
  );
}
