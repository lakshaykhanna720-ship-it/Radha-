import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Sparkles, ArrowRight, Volume2, CheckCircle, Smartphone, ClipboardPaste, Radio, ShieldCheck, Zap } from 'lucide-react';
import { parseTransactionSms, SAMPLE_SMS_MESSAGES } from '../utils/smsParser';
import { ParsedSmsResult, Transaction } from '../types';
import { ProviderBadge } from './ProviderBadge';
import { checkSmsCapabilities } from '../utils/smsAutoReader';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onProcessSmsTransaction: (txn: Omit<Transaction, 'id' | 'timestamp'>) => void;
  onOpenApkModal?: () => void;
}

export const SmsReaderModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onProcessSmsTransaction,
  onOpenApkModal,
}) => {
  const [smsText, setSmsText] = useState<string>('');
  const [parsed, setParsed] = useState<ParsedSmsResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [autoListening, setAutoListening] = useState<boolean>(true);
  const [clipboardDetected, setClipboardDetected] = useState<boolean>(false);

  // Check capabilities
  const caps = checkSmsCapabilities();

  // Try auto-checking clipboard when opened
  useEffect(() => {
    if (!isOpen) return;

    const checkClipboardSilently = async () => {
      try {
        if (navigator.clipboard && navigator.clipboard.readText) {
          const text = await navigator.clipboard.readText();
          if (text && text.trim().length > 10) {
            const res = parseTransactionSms(text);
            if (res) {
              setSmsText(text);
              setParsed(res);
              setClipboardDetected(true);
            }
          }
        }
      } catch {
        // Silent catch: clipboard permissions may require gesture
      }
    };

    checkClipboardSilently();

    // Native Web SMS Receiver if supported
    let abortController: AbortController | null = null;
    if (typeof navigator !== 'undefined' && 'sms' in navigator) {
      abortController = new AbortController();
      (navigator as any).sms
        ?.receive({ signal: abortController.signal })
        .then((sms: any) => {
          if (sms && sms.content) {
            handleTextChange(sms.content);
          }
        })
        .catch((err: any) => {
          if (err.name !== 'AbortError') {
            console.warn('Native SMS listener error', err);
          }
        });
    }

    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTextChange = (text: string) => {
    setSmsText(text);
    setErrorMsg('');
    if (text.trim().length > 10) {
      const res = parseTransactionSms(text);
      setParsed(res);
      if (!res) {
        setErrorMsg('Could not detect a valid credit/amount. Paste full SMS text.');
      }
    } else {
      setParsed(null);
    }
  };

  const handleSelectSample = (sample: typeof SAMPLE_SMS_MESSAGES[0]) => {
    setSmsText(sample.text);
    const res = parseTransactionSms(sample.text);
    setParsed(res);
    setErrorMsg('');
  };

  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          handleTextChange(text);
        }
      }
    } catch {
      setErrorMsg('Clipboard permission denied. Please paste manually into the box.');
    }
  };

  const handleConfirmAndAnnounce = () => {
    if (!parsed) return;

    onProcessSmsTransaction({
      type: 'income',
      amount: parsed.amount,
      method: parsed.method,
      senderName: parsed.senderName || 'Customer QR',
      refNumber: parsed.refNumber,
      rawSms: parsed.rawText,
      customerNote: `Verified via SMS (${parsed.refNumber ? `Ref: ${parsed.refNumber}` : 'UPI'})`,
    });

    onClose();
  };

  return (
    <div
      id="sms-reader-backdrop"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        id="sms-reader-card"
        className="w-full max-w-lg bg-slate-900 border border-blue-500/30 rounded-t-3xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl shadow-blue-950/40 max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">SMS Transaction Reader</h2>
              <p className="text-xs text-slate-400">Auto-read UPI messages from GPay, PhonePe, Paytm</p>
            </div>
          </div>
          <button
            id="btn-close-sms-reader"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 100% Zero-Touch Android APK callout */}
        {onOpenApkModal && (
          <div className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <span className="font-bold text-white text-xs block truncate">Want 100% Zero Manual Input?</span>
                <span className="text-[10px] text-slate-400 block truncate">Use our Real Android .APK with background BroadcastReceiver</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenApkModal();
              }}
              className="py-1 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shrink-0 active:scale-95 transition-all shadow-md"
            >
              Get .APK
            </button>
          </div>
        )}

        {/* Quick Sample SMS buttons for instant testing */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate Real Bank / UPI SMS:</span>
            </span>
            <button
              type="button"
              onClick={handlePasteClipboard}
              className="py-1 px-2.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95"
            >
              <ClipboardPaste className="w-3 h-3 text-blue-400" />
              <span>Paste Clipboard</span>
            </button>
          </div>

          {clipboardDetected && (
            <div className="mb-2 p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-[11px] text-emerald-300 flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Auto-detected UPI payment text from your phone clipboard!</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            {SAMPLE_SMS_MESSAGES.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSample(sample)}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-left transition-all group"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                  <span>{sample.title}</span>
                  <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
                </div>
                <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                  {sample.text}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* SMS Input Box */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-slate-400 block mb-1">
            Or Paste SMS Text Here:
          </label>
          <textarea
            id="textarea-sms-input"
            rows={3}
            value={smsText}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="e.g. Payment of Rs 180.00 received on Paytm for QR code from VIKRAM..."
            className="w-full bg-slate-950 border border-slate-700 focus:border-blue-400 rounded-xl p-3 text-xs sm:text-sm text-slate-200 placeholder-slate-500 outline-none font-mono"
          />
          {errorMsg && <p className="text-xs text-rose-400 mt-1">{errorMsg}</p>}
        </div>

        {/* Extracted Transaction Card */}
        {parsed && (
          <div className="mb-4 p-4 rounded-2xl bg-slate-950 border-2 border-emerald-500/50 shadow-lg shadow-emerald-950/40 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                <span>Detected Transaction</span>
              </span>
              <ProviderBadge method={parsed.method} size="sm" />
            </div>

            <div className="flex items-baseline justify-between py-1 border-b border-slate-800">
              <span className="text-xs text-slate-400">Amount to credit:</span>
              <span className="text-3xl font-extrabold text-white font-mono flex items-center">
                <span className="text-emerald-400">₹</span>
                {parsed.amount.toLocaleString('en-IN')}
              </span>
            </div>

            {parsed.senderName && (
              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-850">
                <span className="text-slate-400">Sender / Passenger:</span>
                <span className="text-slate-200 font-semibold">{parsed.senderName}</span>
              </div>
            )}

            {parsed.refNumber && (
              <div className="flex items-center justify-between text-[11px] py-1">
                <span className="text-slate-500">Ref / UTR:</span>
                <span className="text-slate-400 font-mono">{parsed.refNumber}</span>
              </div>
            )}
          </div>
        )}

        {/* Android Auto-Listener Explainer Note */}
        <div className="mb-4 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
          <Smartphone className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-slate-300">Driver Tip:</strong> On your Android phone, any SMS notification from Paytm, PhonePe, or Google Pay can be read or pasted here to immediately trigger the Soundbox voice alert without looking away from the road.
          </span>
        </div>

        {/* Submit & Announce Button */}
        <div>
          <button
            id="btn-process-sms-transaction"
            type="button"
            disabled={!parsed}
            onClick={handleConfirmAndAnnounce}
            className={`w-full py-3.5 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all active:scale-95 ${
              parsed
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-600/30'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Volume2 className="w-5 h-5" />
            <span>Process & Announce via Soundbox 🔊</span>
          </button>
        </div>
      </div>
    </div>
  );
};
