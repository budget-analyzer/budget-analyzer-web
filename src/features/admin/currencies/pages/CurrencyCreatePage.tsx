import { useNavigate } from 'react-router-dom';
import { useState, useCallback, useEffect, useRef } from 'react';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { MessageBanner } from '@/components/MessageBanner';
import { CurrencyForm } from '../components/CurrencyForm';
import { useCreateCurrency } from '../hooks/useCurrencies';
import { ApiError } from '@/types/apiError';

interface Message {
  type: 'success' | 'error' | 'warning';
  text: string;
}

/**
 * Create new currency page
 */
export function CurrencyCreatePage() {
  const navigate = useNavigate();
  const { mutate: createCurrency, isPending } = useCreateCurrency();
  const [message, setMessage] = useState<Message | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const clearMessage = useCallback(() => {
    setMessage(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const handleSubmit = useCallback(
    (data: { currencyCode: string; providerSeriesId: string; enabled: boolean }) => {
      createCurrency(data, {
        onSuccess: (newCurrency) => {
          setMessage({
            type: 'success',
            text: `Currency ${newCurrency.currencyCode} created successfully`,
          });

          // Auto-dismiss success message and navigate after 2 seconds
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          timeoutRef.current = setTimeout(() => {
            navigate('/admin/currencies');
          }, 2000);
        },
        onError: (error: Error) => {
          // Check for specific error code
          let errorMessage = 'Failed to create currency';

          if (error instanceof ApiError) {
            if (error.response.code === 'INVALID_PROVIDER_SERIES_ID') {
              errorMessage =
                'The Provider Series ID is invalid. Please check the FRED documentation for the correct series ID.';
            } else {
              errorMessage = error.message;
            }
          }

          setMessage({
            type: 'error',
            text: errorMessage,
          });
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

        <div className="max-w-2xl space-y-4">
          {/* Message Banner */}
          <AnimatePresence mode="wait">
            {message && (
              <MessageBanner type={message.type} message={message.text} onClose={clearMessage} />
            )}
          </AnimatePresence>

          {/* Form */}
          <div className="rounded-xl border bg-card p-8 shadow-sm">
            <CurrencyForm onSubmit={handleSubmit} isSubmitting={isPending} mode="create" />
          </div>
        </div>
      </div>
    </div>
  );
}
