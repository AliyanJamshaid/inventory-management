'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import CurrencySelector from './CurrencySelector';
import { useConvertAmount, useBaseCurrency } from '@/hooks/useCurrency';
import { ArrowLeftRight, RefreshCw } from 'lucide-react';
import { formatNumber } from '@/lib/currencyUtils';

export default function CurrencyConverter() {
  const { data: baseCurrency } = useBaseCurrency();
  const convertMutation = useConvertAmount();

  const [amount, setAmount] = useState<string>('100');
  const [fromCurrency, setFromCurrency] = useState<string>('');
  const [toCurrency, setToCurrency] = useState<string>('');
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);

  // Set default currencies when base currency is loaded
  useEffect(() => {
    if (baseCurrency && !fromCurrency) {
      setFromCurrency(baseCurrency.code);
    }
  }, [baseCurrency, fromCurrency]);

  const handleConvert = async () => {
    if (!amount || !fromCurrency || !toCurrency) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    const result = await convertMutation.mutateAsync({
      amount: numAmount,
      fromCurrency,
      toCurrency,
    });

    setConvertedAmount(result.convertedAmount);
    setExchangeRate(result.rate);
  };

  const handleSwapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
    setConvertedAmount(null);
    setExchangeRate(null);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Currency Converter</CardTitle>
        <CardDescription>
          Convert amounts between different currencies using live exchange rates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="from-currency">From Currency</Label>
            <CurrencySelector
              value={fromCurrency}
              onChange={setFromCurrency}
              placeholder="Select currency"
            />
          </div>
        </div>

        <div className="flex items-center justify-center">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleSwapCurrencies}
            disabled={!fromCurrency || !toCurrency}
          >
            <ArrowLeftRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="to-currency">To Currency</Label>
          <CurrencySelector
            value={toCurrency}
            onChange={setToCurrency}
            placeholder="Select currency"
          />
        </div>

        <Button
          type="button"
          className="w-full"
          onClick={handleConvert}
          disabled={!amount || !fromCurrency || !toCurrency || convertMutation.isPending}
        >
          {convertMutation.isPending && (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          )}
          Convert
        </Button>

        {convertedAmount !== null && exchangeRate !== null && (
          <div className="mt-6 p-4 bg-muted rounded-lg space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Converted Amount</p>
              <p className="text-3xl font-bold">
                {formatNumber(convertedAmount, 2)} {toCurrency}
              </p>
            </div>

            <div className="pt-3 border-t">
              <p className="text-sm text-muted-foreground">Exchange Rate</p>
              <p className="text-lg">
                1 {fromCurrency} = {formatNumber(exchangeRate, 4)} {toCurrency}
              </p>
            </div>

            <div className="text-xs text-muted-foreground">
              Conversion: {formatNumber(parseFloat(amount), 2)} {fromCurrency} ×{' '}
              {formatNumber(exchangeRate, 4)} = {formatNumber(convertedAmount, 2)} {toCurrency}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
