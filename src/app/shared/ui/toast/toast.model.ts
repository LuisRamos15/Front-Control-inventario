export type ToastVariant = 'info' | 'success' | 'warning' | 'error';

export interface ToastData {
  id: string;
  title?: string;
  message: string;
  variant?: ToastVariant;
  timeoutMs?: number;
}