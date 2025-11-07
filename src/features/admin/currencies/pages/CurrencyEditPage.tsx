import { useParams, useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { ArrowLeft, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { CurrencyForm } from '../components/CurrencyForm';
import { useCurrency, useUpdateCurrency } from '../hooks/useCurrencies';

/**
 * Edit existing currency page
 */
export function CurrencyEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currencyId = id ? parseInt(id, 10) : 0;

  const { data: currency, isLoading, error } = useCurrency(currencyId);
  const { mutate: updateCurrency, isPending } = useUpdateCurrency();

  const handleSubmit = useCallback(
    (data: { currencyCode: string; providerSeriesId: string; enabled: boolean }) => {
      updateCurrency(
        {
          id: currencyId,
          data: {
            providerSeriesId: data.providerSeriesId,
            enabled: data.enabled,
          },
        },
        {
          onSuccess: () => {
            navigate('/admin/currencies');
          },
        },
      );
    },
    [currencyId, updateCurrency, navigate],
  );

  return (
    <div className="h-full bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-8 py-10">
        <Button
          variant="ghost"
          className="mb-8 gap-2"
          onClick={() => navigate('/admin/currencies')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Currencies
        </Button>

        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-3">
            <Edit3 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Edit Currency</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {currency ? `Update ${currency.currencyCode}` : `Currency ID: ${id}`}
            </p>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="max-w-2xl rounded-xl border border-destructive bg-destructive/10 p-6 shadow-sm">
            <p className="text-center text-sm font-medium text-destructive">
              Failed to load currency: {error.message}
            </p>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="max-w-2xl space-y-6 rounded-xl border bg-card p-8 shadow-sm">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        )}

        {/* Form */}
        {!isLoading && !error && currency && (
          <div className="max-w-2xl rounded-xl border bg-card p-8 shadow-sm">
            <CurrencyForm
              initialData={currency}
              onSubmit={handleSubmit}
              isSubmitting={isPending}
              mode="edit"
            />
          </div>
        )}
      </div>
    </div>
  );
}
