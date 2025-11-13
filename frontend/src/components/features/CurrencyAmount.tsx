'use client';

import React from 'react';
import { useCurrency } from '@/hooks/useCurrency';
import { formatCurrencyWithConversion } from '@/lib/currencyUtils';
import { Loader2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CurrencyAmountProps {
  amount: number;
  currency: string; // Currency code
  convertTo?: string; // Optional target currency
  showOriginal?: boolean; // Show both original and converted
  showTooltip?: boolean; // Show exchange rate in tooltip
  className?: string;
}

export default function CurrencyAmount({
  amount,
  currency,
  convertTo,
  showOriginal = false,
  showTooltip = true,
  className,
}: CurrencyAmountProps) {
  const { data: sourceCurrency, isLoading: isLoadingSource } = useCurrency(currency);
  const { data: targetCurrency, isLoading: isLoadingTarget } = useCurrency(
    convertTo || '',
    !!convertTo
  );

  // Loading state
  if (isLoadingSource || (convertTo && isLoadingTarget)) {
    return (
      <span className={className}>
        <Loader2 className="h-4 w-4 animate-spin inline" />
      </span>
    );
  }

  // Error state - currency not found
  if (!sourceCurrency) {
    return <span className={className}>{amount.toFixed(2)}</span>;
  }

  // No conversion needed
  if (!convertTo || !targetCurrency || currency === convertTo) {
    const formatted = sourceCurrency.formatAmount?.(amount) ||
      `${sourceCurrency.symbol}${amount.toFixed(sourceCurrency.decimalPlaces)}`;
    return <span className={className}>{formatted}</span>;
  }

  // With conversion
  const formatted = formatCurrencyWithConversion(
    amount,
    sourceCurrency,
    targetCurrency,
    showOriginal
  );

  // Calculate exchange rate for tooltip
  const rate = targetCurrency.exchangeRate / sourceCurrency.exchangeRate;

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={className}>{formatted}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">
              Exchange Rate: 1 {currency} = {rate.toFixed(4)} {convertTo}
            </p>
            <p className="text-xs text-muted-foreground">
              Last updated: {new Date(sourceCurrency.lastUpdated).toLocaleString()}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return <span className={className}>{formatted}</span>;
}
