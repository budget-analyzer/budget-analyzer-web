// src/components/ImportButton.tsx
import { useRef } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useImportTransactions } from '@/hooks/useImportTransactions';

interface ImportButtonProps {
  onSuccess?: (count: number) => void;
  onError?: (error: Error) => void;
}

export function ImportButton({ onSuccess, onError }: ImportButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: importTransactions, isPending } = useImportTransactions();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      importTransactions(fileArray, {
        onSuccess: (data) => {
          // Clear the file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          onSuccess?.(data.length);
        },
        onError: (error) => {
          onError?.(error);
        },
      });
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        multiple
        onChange={handleFileChange}
        className="hidden"
        aria-label="CSV file input"
      />
      <Button onClick={handleButtonClick} disabled={isPending} size="default" variant="default">
        <Upload className="mr-2 h-4 w-4" />
        {isPending ? 'Importing...' : 'Import Transactions'}
      </Button>
    </>
  );
}
