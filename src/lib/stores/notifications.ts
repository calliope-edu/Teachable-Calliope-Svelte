import { toast } from '@calliope-edu/ui';

type NotificationType = 'info' | 'success' | 'error' | 'warning';

/**
 * Shows a toast through calliope-ui's <Toaster /> (mounted in the root layout).
 * Returns its id for {@link hideNotification}. A duration of 0 keeps it until
 * it is closed.
 */
export function showNotification(
  message: string,
  options?: { type?: NotificationType; duration?: number }
) {
  const duration = options?.duration === 0 ? Infinity : (options?.duration ?? 4000);
  return toast[options?.type ?? 'info'](message, { duration });
}

export function hideNotification(id: string | number) {
  toast.dismiss(id);
}

export function clearNotifications() {
  toast.dismiss();
}
