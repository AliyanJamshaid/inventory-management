'use client';

import React, { useState, useEffect } from 'react';
import { useActiveCurrencies, useBaseCurrency } from '@/hooks/useCurrency';
import { convertCurrency, formatCurrencyAmount, getCurrencyFlag } from '@/lib/currencyUtils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Loader2, RefreshCw } from 'lucide-react';

interface MultiPriceEditorProps {
  prices: Record<string, number>; // { "USD": 100, "EUR": 92, ... }
  onChange: (prices: Record<string, number>) => void;
  baseCurrency?: string;
  basePrice?: number;
}

export default function MultiPriceEditor({
  prices,
  onChange,
  baseCurrency: providedBaseCurrency,
  basePrice,
}: MultiPriceEditorProps) {
  const { data: currencies, isLoading } = useActiveCurrencies();
  const { data: defaultBaseCurrency } = useBaseCurrency();

  const baseCurrency = providedBaseCurrency || defaultBaseCurrency?.code || 'USD';

  const [localPrices, setLocalPrices] = useState<Record<string, number>>(prices);
  const [autoCalculate, setAutoCalculate] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLocalPrices(prices);
  }, [prices]);

  const handlePriceChange = (currencyCode: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    const updatedPrices = { ...localPrices, [currencyCode]: numValue };
    setLocalPrices(updatedPrices);
    onChange(updatedPrices);

    // Disable auto-calculate for this currency when manually edited
    setAutoCalculate({ ...autoCalculate, [currencyCode]: false });
  };

  const handleAutoCalculateToggle = (currencyCode: string, enabled: boolean) => {
    setAutoCalculate({ ...autoCalculate, [currencyCode]: enabled });

    if (enabled) {
      recalculatePrice(currencyCode);
    }
  };

  const recalculatePrice = (currencyCode: string) => {
    if (!currencies || !basePrice) return;

    const baseCurrencyObj = currencies.find((c) => c.code === baseCurrency);
    const targetCurrency = currencies.find((c) => c.code === currencyCode);

    if (!baseCurrencyObj || !targetCurrency) return;

    const convertedPrice = convertCurrency(
      basePrice,
      baseCurrencyObj.exchangeRate,
      targetCurrency.exchangeRate,
      targetCurrency.decimalPlaces
    );

    const updatedPrices = { ...localPrices, [currencyCode]: convertedPrice };
    setLocalPrices(updatedPrices);
    onChange(updatedPrices);
  };

  const recalculateAllPrices = () => {
    if (!currencies || !basePrice) return;

    const baseCurrencyObj = currencies.find((c) => c.code === baseCurrency);
    if (!baseCurrencyObj) return;

    const updatedPrices: Record<string, number> = {};
    const updatedAutoCalculate: Record<string, boolean> = {};

    currencies.forEach((currency) => {
      if (currency.code === baseCurrency) {
        updatedPrices[currency.code] = basePrice;
      } else {
        const convertedPrice = convertCurrency(
          basePrice,
          baseCurrencyObj.exchangeRate,
          currency.exchangeRate,
          currency.decimalPlaces
        );
        updatedPrices[currency.code] = convertedPrice;
        updatedAutoCalculate[currency.code] = true;
      }
    });

    setLocalPrices(updatedPrices);
    setAutoCalculate(updatedAutoCalculate);
    onChange(updatedPrices);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading currencies...
      </div>
    );
  }

  if (!currencies || currencies.length === 0) {
    return <div className="text-sm text-muted-foreground">No currencies available</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Multi-Currency Pricing</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={recalculateAllPrices}
          disabled={!basePrice}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Auto-calculate All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currencies.map((currency) => {
          const isBase = currency.code === baseCurrency;
          const price = localPrices[currency.code] || 0;
          const isAutoCalculated = autoCalculate[currency.code] || false;

          return (
            <Card key={currency.code} className={`p-4 ${isBase ? 'border-primary' : ''}`}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getCurrencyFlag(currency.code)}</span>
                    <div>
                      <p className="font-medium">
                        {currency.code}
                        {isBase && (
                          <span className="ml-2 text-xs text-primary">(Base)</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">{currency.name}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`price-${currency.code}`}>
                    Price ({currency.symbol})
                  </Label>
                  <Input
                    id={`price-${currency.code}`}
                    type="number"
                    step="0.01"
                    min="0"
                    value={price || ''}
                    onChange={(e) => handlePriceChange(currency.code, e.target.value)}
                    disabled={isBase}
                    placeholder={`0.${new Array(currency.decimalPlaces).fill('0').join('')}`}
                  />
                </div>

                {!isBase && (
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`auto-${currency.code}`} className="text-xs">
                      Auto-calculate
                    </Label>
                    <Switch
                      id={`auto-${currency.code}`}
                      checked={isAutoCalculated}
                      onCheckedChange={(checked) =>
                        handleAutoCalculateToggle(currency.code, checked)
                      }
                    />
                  </div>
                )}

                {!isBase && (
                  <p className="text-xs text-muted-foreground">
                    Rate: 1 {baseCurrency} = {currency.exchangeRate.toFixed(4)} {currency.code}
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
