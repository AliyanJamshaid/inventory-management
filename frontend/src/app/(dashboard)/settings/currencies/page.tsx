'use client';

import React, { useState } from 'react';
import {
  useCurrencies,
  useBaseCurrency,
  useUpdateExchangeRates,
  useSetBaseCurrency,
  useDeactivateCurrency,
  useCreateCurrency,
} from '@/hooks/useCurrency';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, RefreshCw, Plus, Star, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getCurrencyFlag, formatNumber } from '@/lib/currencyUtils';
import { toast } from '@/components/ui/use-toast';

export default function CurrenciesPage() {
  const { data: currencies, isLoading } = useCurrencies();
  const { data: baseCurrency } = useBaseCurrency();
  const updateRatesMutation = useUpdateExchangeRates();
  const setBaseMutation = useSetBaseCurrency();
  const deactivateMutation = useDeactivateCurrency();
  const createMutation = useCreateCurrency();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCurrency, setNewCurrency] = useState({
    code: '',
    name: '',
    symbol: '',
    decimalPlaces: 2,
    isActive: true,
  });

  const handleUpdateRates = async () => {
    await updateRatesMutation.mutateAsync();
  };

  const handleSetBase = async (code: string) => {
    await setBaseMutation.mutateAsync(code);
  };

  const handleDeactivate = async (code: string) => {
    await deactivateMutation.mutateAsync(code);
  };

  const handleCreateCurrency = async () => {
    if (!newCurrency.code || !newCurrency.name || !newCurrency.symbol) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    await createMutation.mutateAsync(newCurrency);
    setIsAddDialogOpen(false);
    setNewCurrency({
      code: '',
      name: '',
      symbol: '',
      decimalPlaces: 2,
      isActive: true,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Currency Management</h1>
          <p className="text-muted-foreground">
            Manage currencies and exchange rates for your business
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleUpdateRates}
            disabled={updateRatesMutation.isPending}
            variant="outline"
          >
            {updateRatesMutation.isPending && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            {!updateRatesMutation.isPending && <RefreshCw className="h-4 w-4 mr-2" />}
            Update Rates
          </Button>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Currency
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Currency</DialogTitle>
                <DialogDescription>
                  Add a new currency to your system
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Currency Code (ISO 4217)</Label>
                  <Input
                    id="code"
                    placeholder="USD"
                    value={newCurrency.code}
                    onChange={(e) =>
                      setNewCurrency({ ...newCurrency, code: e.target.value.toUpperCase() })
                    }
                    maxLength={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Currency Name</Label>
                  <Input
                    id="name"
                    placeholder="United States Dollar"
                    value={newCurrency.name}
                    onChange={(e) => setNewCurrency({ ...newCurrency, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="symbol">Symbol</Label>
                  <Input
                    id="symbol"
                    placeholder="$"
                    value={newCurrency.symbol}
                    onChange={(e) => setNewCurrency({ ...newCurrency, symbol: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="decimalPlaces">Decimal Places</Label>
                  <Input
                    id="decimalPlaces"
                    type="number"
                    min="0"
                    max="4"
                    value={newCurrency.decimalPlaces}
                    onChange={(e) =>
                      setNewCurrency({
                        ...newCurrency,
                        decimalPlaces: parseInt(e.target.value) || 2,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="isActive">Active</Label>
                  <Switch
                    id="isActive"
                    checked={newCurrency.isActive}
                    onCheckedChange={(checked) =>
                      setNewCurrency({ ...newCurrency, isActive: checked })
                    }
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateCurrency} disabled={createMutation.isPending}>
                  {createMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Add Currency
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {baseCurrency && (
        <Card>
          <CardHeader>
            <CardTitle>Base Currency</CardTitle>
            <CardDescription>
              The base currency for your business. All exchange rates are relative to this currency.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <span className="text-4xl">{getCurrencyFlag(baseCurrency.code)}</span>
              <div>
                <p className="text-2xl font-bold">{baseCurrency.code}</p>
                <p className="text-lg text-muted-foreground">{baseCurrency.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Currencies</CardTitle>
          <CardDescription>
            Manage exchange rates and currency settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Currency</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Exchange Rate</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currencies?.map((currency) => (
                <TableRow key={currency.code}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getCurrencyFlag(currency.code)}</span>
                      <span className="font-medium">{currency.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{currency.code}</span>
                      {currency.isBaseCurrency && (
                        <Badge variant="default" className="gap-1">
                          <Star className="h-3 w-3" />
                          Base
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">{currency.symbol}</TableCell>
                  <TableCell className="font-mono">
                    {formatNumber(currency.exchangeRate, 4)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(currency.lastUpdated), {
                        addSuffix: true,
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    {currency.isActive ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {!currency.isBaseCurrency && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetBase(currency.code)}
                          disabled={setBaseMutation.isPending}
                        >
                          Set as Base
                        </Button>
                      )}
                      {!currency.isBaseCurrency && currency.isActive && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeactivate(currency.code)}
                          disabled={deactivateMutation.isPending}
                        >
                          Deactivate
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
