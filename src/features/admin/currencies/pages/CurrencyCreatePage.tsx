import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CurrencyForm } from '../components/CurrencyForm';
import { useCreateCurrency } from '../hooks/useCurrencies';

/**
 * Create new currency page
 */
export function CurrencyCreatePage() {
  const navigate = useNavigate();
  const { mutate: createCurrency, isPending } = useCreateCurrency();

  const handleSubmit = useCallback(
    (data: { currencyCode: string; providerSeriesId: string; enabled: boolean }) => {
      createCurrency(data, {
        onSuccess: () => {
          navigate('/admin/currencies');
        },
      });
    },
    [createCurrency, navigate],
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
            <PlusCircle className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Add New Currency</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a new currency series mapping for exchange rates
            </p>
          </div>
        </div>

        <div className="max-w-2xl rounded-xl border bg-card p-8 shadow-sm">
          <CurrencyForm onSubmit={handleSubmit} isSubmitting={isPending} mode="create" />
        </div>
      </div>
    </div>
  );
}
