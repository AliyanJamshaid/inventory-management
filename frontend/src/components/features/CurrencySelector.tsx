'use client';

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useActiveCurrencies } from '@/hooks/useCurrency';
import { getCurrencyFlag } from '@/lib/currencyUtils';
import { Loader2 } from 'lucide-react';

interface CurrencySelectorProps {
  value?: string;
  onChange: (value: string) => void;
  showFlag?: boolean;
  showSymbol?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function CurrencySelector({
  value,
  onChange,
  showFlag = true,
  showSymbol = true,
  placeholder = 'Select currency',
  className,
  disabled = false,
}: CurrencySelectorProps) {
  const { data: currencies, isLoading } = useActiveCurrencies();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading currencies...
      </div>
    );
  }

  if (!currencies || currencies.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No currencies available
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {currencies.map((currency) => (
          <SelectItem key={currency.code} value={currency.code}>
            <div className="flex items-center gap-2">
              {showFlag && (
                <span className="text-lg">{getCurrencyFlag(currency.code)}</span>
              )}
              <span className="font-medium">{currency.code}</span>
              {showSymbol && (
                <span className="text-muted-foreground">({currency.symbol})</span>
              )}
              <span className="text-muted-foreground">- {currency.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
