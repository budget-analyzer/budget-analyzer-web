// src/features/transactions/components/EditableCell.tsx
import { useCallback, useState, useEffect, memo } from 'react';
import { Input } from '@/components/ui/Input';

interface EditableCellProps {
  value: string;
  isEditing: boolean;
  autoFocus?: boolean;
  onChange: (value: string) => void;
  onCancel: () => void;
  disabled?: boolean;
}

export const EditableCell = memo(function EditableCell({
  value,
  isEditing,
  autoFocus = false,
  onChange,
  onCancel,
  disabled = false,
}: EditableCellProps) {
  // Manage draft value internally during editing
  const [draftValue, setDraftValue] = useState(value);

  // Reset draft value when entering edit mode or when external value changes
  useEffect(() => {
    if (isEditing) {
      setDraftValue(value);
    }
  }, [isEditing, value]);

  // Sync draft changes back to parent
  useEffect(() => {
    if (isEditing) {
      onChange(draftValue);
    }
  }, [isEditing, draftValue, onChange]);

  const handleCancel = useCallback(() => {
    setDraftValue(value); // Reset to original
    onCancel();
  }, [value, onCancel]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
      // Note: Enter key no longer submits - parent handles submit via check button
    },
    [handleCancel],
  );

  if (!isEditing) {
    return <div className="max-w-md truncate">{value}</div>;
  }

  return (
    <Input
      value={draftValue}
      onChange={(e) => setDraftValue(e.target.value)}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      className="max-w-md"
      autoFocus={autoFocus}
    />
  );
});
