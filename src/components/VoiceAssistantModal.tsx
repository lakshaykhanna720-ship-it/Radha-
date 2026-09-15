import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Volume2, Sparkles, Check, Fuel, ArrowDownRight } from 'lucide-react';
import { createSpeechRecognizer, parseVoiceCommand } from '../utils/voiceRecognition';
import { DriverSettings, Transaction, VoiceCommandResult } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (txn: Omit<Transaction, 'id' | 'timestamp'>, announce: boolean) => void;
  onSpeakSummary: () => void;
  settings: DriverSettings;
}

const SAMPLE_VOICE_COMMANDS = [
  { text: 'CNG 500', label: 'CNG 500 (⛽ Cost)' },
  { text: 'सीएनजी 600', label: 'सीएनजी 600 (Cost)' },
  { text: 'Cash 250', label: 'Cash 250 (💰 Fare)' },
  { text: 'PhonePe 320', label: 'PhonePe 320 (Fare)' },
  { text: 'Toll 85', label: 'Toll 85 (Cost)' },
  { text: 'Kitna kamaya aaj', label: 'Kitna kamaya aaj (Report)' },
];

const CNG_QUICK_PRESETS = [300, 400, 500, 600, 750, 1000];

export const VoiceAssistantModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onAddTransaction,
  onSpeakSummary,
  settings,
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [parsedResult, setParsedResult] = useState<VoiceCommandResult | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string>('Tap the microphone and speak your offline payment or cost...');
  const [pendingExpenseCategory, setPendingExpenseCategory] = useState<string | null>(null);
  const [micSupported, setMicSupported] = useState<boolean>(true);

  const recognizerRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      stopListening();
      setPendingExpenseCategory(null);
      return;
    }

    // Auto-start listening on modal open for quick hands-free driver experience
    startListening();

    return () => {
      stopListening();
    };
  }, [isOpen]);

  const startListening = () => {
    setTranscript('');
    setParsedResult(null);
    setPendingExpenseCategory(null);
    setFeedbackMsg('Listening... speak now ("CNG 500", "Cash 250", etc.)');

    try {
      const recognizer = createSpeechRecognizer(
        (text, isFinal) => {
          setTranscript(text);
          const result = parseVoiceCommand(text);
          setParsedResult(result);

          if (isFinal) {
            handleFinalCommand(result);
          }
        },
        (err) => {
          console.warn('Speech error:', err);
          setIsListening(false);
          if (err === 'not-allowed' || err === 'service-not-allowed') {
            setFeedbackMsg('Microphone access denied. You can tap quick sample commands below.');
          } else {
            setFeedbackMsg(`Recognition paused: ${err}. Tap mic to retry or choose below.`);
          }
        },
        () => {
          setIsListening(false);
        },
        settings.soundboxVoiceLang === 'hi' ? 'hi-IN' : 'en-IN'
      );

      if (recognizer) {
        recognizerRef.current = recognizer;
        recognizer.start();
        setIsListening(true);
        setMicSupported(true);
      } else {
        setMicSupported(false);
        setFeedbackMsg('Voice recognition not supported on this browser. Use sample commands below.');
      }
    } catch (e) {
      console.warn('Voice init failed:', e);
      setIsListening(false);
      setFeedbackMsg('Tap mic to start or use quick voice simulation pills.');
    }
  };

  const stopListening = () => {
    if (recognizerRef.current) {
      try {
        recognizerRef.current.stop();
      } catch {
        // ignore
      }
      recognizerRef.current = null;
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
      setFeedbackMsg('Microphone stopped.');
    } else {
      startListening();
    }
  };

  const handleFinalCommand = (cmd: VoiceCommandResult) => {
    if (cmd.action === 'speak_summary') {
      setFeedbackMsg('Speaking today\'s summary aloud...');
      onSpeakSummary();
      setTimeout(onClose, 2500);
    } else if (cmd.action === 'record_income' && cmd.amount) {
      setFeedbackMsg(`Recorded ₹${cmd.amount} ${cmd.method || 'cash'}!`);
      onAddTransaction(
        {
          type: 'income',
          amount: cmd.amount,
          method: cmd.method || 'cash',
          customerNote: `Voice logged: "${cmd.transcript}"`,
          senderName: 'Offline Passenger',
        },
        true
      );
      setTimeout(onClose, 1800);
    } else if (cmd.action === 'record_expense') {
      if (cmd.amount) {
        setFeedbackMsg(`⛽ Recorded -₹${cmd.amount} CNG/Expense (Deducted from profit)!`);
        onAddTransaction(
          {
            type: 'expense',
            amount: cmd.amount,
            method: 'cash',
            expenseCategory: cmd.expenseCategory || 'fuel_cng',
            customerNote: `Voice logged cost: "${cmd.transcript}"`,
          },
          true // Always announce expenses out loud!
        );
        setTimeout(onClose, 2000);
      } else {
        setPendingExpenseCategory(cmd.expenseCategory || 'fuel_cng');
        setFeedbackMsg('CNG / Fuel cost detected! Tap or say the amount below:');
      }
    } else {
      setFeedbackMsg('Could not detect an amount. Tap mic and say e.g. "CNG 500" or "Cash 200".');
    }
  };

  const handleSelectPresetExpense = (amt: number) => {
    setFeedbackMsg(`⛽ Recorded -₹${amt} CNG cost (Deducted from profit)!`);
    onAddTransaction(
      {
        type: 'expense',
        amount: amt,
        method: 'cash',
        expenseCategory: 'fuel_cng',
        customerNote: 'Voice logged: CNG Refill',
      },
      true
    );
    setTimeout(onClose, 1800);
  };

  const handleSimulateVoiceCommand = (cmdText: string) => {
    setTranscript(cmdText);
    const parsed = parseVoiceCommand(cmdText);
    setParsedResult(parsed);
    handleFinalCommand(parsed);
  };

  if (!isOpen) return null;

  return (
    <div
      id="voice-assistant-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div
        id="voice-assistant-card"
        className="relative w-full max-w-md bg-slate-900 border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-500/20 text-center overflow-hidden"
      >
        {/* Close Button */}
        <button
          id="btn-close-voice-modal"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-wider uppercase flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Driver Hands-Free Voice Logger</span>
          </div>
        </div>
        <h2 className="text-xl font-bold text-white mb-1">Speak Offline Payment or Cost</h2>
        <p className="text-xs text-slate-400 mb-4">
          Say <span className="text-rose-400 font-semibold">"CNG 500"</span> for fuel expense or{' '}
          <span className="text-emerald-400 font-semibold">"Cash 200"</span> for fare
        </p>

        {/* Big Mic Button with Pulsing Wave */}
        <div className="relative my-3 flex items-center justify-center">
          {isListening && (
            <>
              <div className="absolute w-36 h-36 rounded-full bg-cyan-500/20 animate-ping" />
              <div className="absolute w-28 h-28 rounded-full bg-cyan-500/30 animate-pulse" />
            </>
          )}
          <button
            id="btn-toggle-mic-recording"
            type="button"
            onClick={toggleListening}
            className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-95 ${
              isListening
                ? 'bg-cyan-500 text-slate-950 shadow-cyan-500/50 ring-4 ring-cyan-300/40'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-2 border-slate-600'
            }`}
          >
            {isListening ? (
              <Mic className="w-10 h-10 animate-bounce" />
            ) : (
              <MicOff className="w-10 h-10" />
            )}
          </button>
        </div>

        {/* Live Status text */}
        <div className="min-h-12 flex flex-col items-center justify-center mb-3">
          <p className="text-sm font-semibold text-slate-200">{feedbackMsg}</p>
          {transcript && (
            <p className="text-xs text-cyan-300 font-mono italic mt-1 max-w-xs truncate">
              "{transcript}"
            </p>
          )}
        </div>

        {/* Quick Amount Pills if driver said "CNG" without amount */}
        {pendingExpenseCategory && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-950/60 border border-rose-800 text-center animate-in fade-in">
            <span className="text-xs font-bold text-rose-300 flex items-center justify-center gap-1 mb-2">
              <Fuel className="w-4 h-4 text-rose-400" />
              <span>Select CNG / Fuel Amount (Deducted from profits):</span>
            </span>
            <div className="flex flex-wrap gap-2 justify-center">
              {CNG_QUICK_PRESETS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleSelectPresetExpense(amt)}
                  className="px-3 py-1.5 rounded-xl bg-rose-900/80 hover:bg-rose-800 text-white font-mono font-bold text-xs border border-rose-600 active:scale-95 transition-all"
                >
                  -₹{amt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Detected Action Preview */}
        {parsedResult && parsedResult.action !== 'unknown' && !pendingExpenseCategory && (
          <div
            className={`mb-4 p-3 rounded-xl border text-xs flex items-center justify-between transition-colors ${
              parsedResult.action === 'record_expense'
                ? 'bg-rose-950/80 border-rose-500/60 text-rose-200'
                : 'bg-slate-950 border-cyan-500/40 text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 text-left">
              {parsedResult.action === 'record_expense' ? (
                <ArrowDownRight className="w-4 h-4 text-rose-400 shrink-0" />
              ) : null}
              <div>
                <span
                  className={`font-bold block ${
                    parsedResult.action === 'record_expense' ? 'text-rose-400' : 'text-cyan-400'
                  }`}
                >
                  {parsedResult.action === 'speak_summary'
                    ? '🔊 Announce Details'
                    : parsedResult.action === 'record_income'
                    ? `💰 Record Fare: +₹${parsedResult.amount} (${parsedResult.method || 'Cash'})`
                    : `⛽ DEDUCT COST: -₹${parsedResult.amount} (CNG / Fuel Expense)`}
                </span>
                {parsedResult.action === 'record_expense' && (
                  <span className="text-[11px] text-rose-300">
                    Subtracted from take-home profits
                  </span>
                )}
              </div>
            </div>
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          </div>
        )}

        {/* Voice Samples / One-Tap Fallbacks */}
        <div className="pt-2 border-t border-slate-800 text-left">
          <span className="text-[11px] font-semibold text-slate-400 block mb-2 flex items-center gap-1">
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Or tap a simulated voice command to test:</span>
          </span>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {SAMPLE_VOICE_COMMANDS.map((cmd) => (
              <button
                key={cmd.text}
                type="button"
                onClick={() => handleSimulateVoiceCommand(cmd.text)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] border transition-all font-mono active:scale-95 ${
                  cmd.text.includes('CNG') || cmd.text.includes('सीएनजी') || cmd.text.includes('Toll')
                    ? 'bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border-rose-800 hover:border-rose-600'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 hover:border-cyan-500/40'
                }`}
              >
                "{cmd.label}"
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
