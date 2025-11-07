// src/features/transactions/components/ImportMessageBanner.tsx
import { MessageBanner } from '@/components/MessageBanner';

export interface ImportMessageBannerProps {
  type: 'success' | 'error' | 'warning';
  message: string;
  onClose: () => void;
}

/**
 * Wrapper around MessageBanner for backward compatibility with import feature
 * Consider using MessageBanner directly in new code
 */
export function ImportMessageBanner({ type, message, onClose }: ImportMessageBannerProps) {
  return <MessageBanner type={type} message={message} onClose={onClose} />;
}
