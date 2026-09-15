import { parseTransactionSms } from './smsParser';
import { ParsedSmsResult } from '../types';

/**
 * Web SMS Receiver API / Auto-Clipboard Monitor helper
 *
 * In real-world web applications and PWAs on Android, incoming OTP/transaction SMS
 * can be caught natively if the SMS Receiver API (navigator.sms) is available, or
 * via foreground clipboard notification listener (when the driver copies the SMS or notification text).
 */

export interface SmsListenerStatus {
  isSmsReceiverSupported: boolean;
  isClipboardSupported: boolean;
}

export function checkSmsCapabilities(): SmsListenerStatus {
  const isSmsReceiverSupported = typeof navigator !== 'undefined' && 'sms' in navigator;
  const isClipboardSupported = typeof navigator !== 'undefined' && 'clipboard' in navigator && !!navigator.clipboard.readText;

  return {
    isSmsReceiverSupported,
    isClipboardSupported,
  };
}

/**
 * Start listening for OTP/SMS via Web SMS Receiver API (Chromium Android)
 */
export async function listenForNativeSms(
  signal: AbortSignal,
  onReceived: (parsed: ParsedSmsResult) => void
): Promise<void> {
  if (typeof navigator === 'undefined' || !('sms' in navigator)) {
    return;
  }

  try {
    const sms = await (navigator as any).sms.receive({ signal });
    if (sms && sms.content) {
      const parsed = parseTransactionSms(sms.content);
      if (parsed) {
        onReceived(parsed);
      }
    }
  } catch (err: any) {
    // Aborted or user declined
    if (err.name !== 'AbortError') {
      console.warn('Native SMS receive listener ended:', err.message);
    }
  }
}
