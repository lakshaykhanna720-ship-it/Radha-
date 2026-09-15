import React, { useState } from 'react';
import { usePWAInstall } from '../utils/usePWAInstall';
import { Download, Smartphone, CheckCircle, Apple, Radio, HelpCircle, ExternalLink, ShieldCheck, X } from 'lucide-react';

interface Props {
  className?: string;
  variant?: 'compact' | 'full';
}

export const RealWorldPublishModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [activeStep, setActiveStep] = useState<number>(1);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      id="publish-guide-backdrop"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div
        id="publish-guide-card"
        className="w-full max-w-xl bg-slate-900 border border-emerald-500/40 rounded-t-3xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Publish to Real World & Auto-Read UPI</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  REAL-TIME GUIDE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                How to run on phone, read real UPI SMS messages, and publish as a native app
              </p>
            </div>
          </div>
          <button
            id="btn-close-publish-guide"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Real World Methods Tabs */}
        <div className="flex gap-2 border-b border-slate-800 pb-3 mb-4 text-xs font-bold">
          <button
            onClick={() => setActiveStep(1)}
            className={`flex-1 py-2 px-3 rounded-xl border transition-all ${
              activeStep === 1
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-950'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            1. Install on Phone (PWA)
          </button>
          <button
            onClick={() => setActiveStep(2)}
            className={`flex-1 py-2 px-3 rounded-xl border transition-all ${
              activeStep === 2
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-950'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            2. Real UPI SMS Reading
          </button>
          <button
            onClick={() => setActiveStep(3)}
            className={`flex-1 py-2 px-3 rounded-xl border transition-all ${
              activeStep === 3
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-950'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            3. Play Store APK / TWA
          </button>
        </div>

        {/* Step 1: Install as PWA on Phone */}
        {activeStep === 1 && (
          <div className="space-y-4 text-xs text-slate-300">
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40">
              <h3 className="text-sm font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Instant Phone Installation (No Play Store delay)</span>
              </h3>
              <p className="text-slate-300 leading-relaxed">
                This app is already configured with modern PWA (Progressive Web App) specifications with offline service workers, app icons, and standalone fullscreen display!
              </p>

              {isInstallable && (
                <button
                  type="button"
                  onClick={install}
                  className="mt-3 w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Install Cab Soundbox on this Device Now</span>
                </button>
              )}

              {isInstalled && (
                <div className="mt-3 p-2.5 rounded-xl bg-emerald-900/60 text-emerald-200 font-semibold text-center flex items-center justify-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Installed & Running in Standalone Native Mode!</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-white flex items-center gap-1.5 mb-2">
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  <span>On Android (Chrome)</span>
                </span>
                <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px] leading-relaxed">
                  <li>Open this URL in Google Chrome on your phone.</li>
                  <li>Tap the <strong>Three Dots Menu (⋮)</strong> top right.</li>
                  <li>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                  <li>It now opens like a 100% native Android app with sound!</li>
                </ol>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-white flex items-center gap-1.5 mb-2">
                  <Apple className="w-4 h-4 text-amber-400" />
                  <span>On iPhone (Safari)</span>
                </span>
                <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px] leading-relaxed">
                  <li>Open this URL in <strong>Safari</strong> on iPhone.</li>
                  <li>Tap the <strong>Share (square with arrow)</strong> button.</li>
                  <li>Scroll down and tap <strong>"Add to Home Screen"</strong>.</li>
                  <li>Launch from your home screen for full soundbox access.</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: How real SMS reading works in browser / Android */}
        {activeStep === 2 && (
          <div className="space-y-3.5 text-xs text-slate-300">
            <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/40">
              <h3 className="text-sm font-bold text-cyan-400 mb-1 flex items-center gap-1.5">
                <Radio className="w-4 h-4" />
                <span>How Real-World UPI Message Reading Operates</span>
              </h3>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Due to mobile banking security guidelines, browsers and operating systems restrict silent background SMS access to prevent rogue apps from stealing OTPs. Here are the <strong>3 real-world ways</strong> cab drivers use this app on the road:
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center">1</span>
                  <span className="font-bold text-white">Live Clipboard Auto-Paste (Easiest & Fastest)</span>
                </div>
                <p className="text-slate-400 text-[11px] ml-7">
                  When a passenger pays via Paytm, PhonePe, or GPay, an SMS or notification pops down on your phone. Tap <strong>"Copy"</strong> on that notification banner. The app detects the clipboard, extracts the exact amount and sender, and triggers the loud voice announcement immediately.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center">2</span>
                  <span className="font-bold text-white">Web SMS Receiver API (OTPCredential / WebSMS)</span>
                </div>
                <p className="text-slate-400 text-[11px] ml-7">
                  Supported on Android Chrome. When your bank sends a structured verification SMS containing your web origin hash, Android displays a native bottom sheet asking <em>"Verify transaction with Cab Soundbox?"</em>. One tap auto-announces it.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center">3</span>
                  <span className="font-bold text-white">Drive Hands-Free Voice ("Cash 250" or "CNG 500")</span>
                </div>
                <p className="text-slate-400 text-[11px] ml-7">
                  While steering with two hands on the wheel, you don't even need to touch the phone! Tap the steering mic or leave drive mode open and say <em>"PhonePe 200"</em> or <em>"CNG 500"</em>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Google Play Store APK / Bubblewrap TWA */}
        {activeStep === 3 && (
          <div className="space-y-3.5 text-xs text-slate-300">
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40">
              <h3 className="text-sm font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Publishing to Google Play Store as Native APK</span>
              </h3>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Because this app has a complete PWA Manifest, service worker, and 512x512 maskable icons, you can convert it into an official Android <strong>.APK / .AAB</strong> in 2 minutes using Google's official <strong>Bubblewrap CLI</strong> or <strong>PWABuilder</strong>.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-white block">Step-by-step Play Store packaging:</span>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-400 text-[11px] leading-relaxed">
                <li>
                  Go to <strong className="text-cyan-400">PWABuilder.com</strong> or run <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300 font-mono">npx @bubblewrap/cli init --manifest=...</code>.
                </li>
                <li>Enter your published web URL.</li>
                <li>
                  PWABuilder verifies the manifest and generates an Android Studio project with <code className="bg-slate-900 px-1 py-0.5 rounded text-slate-300 font-mono">NotificationListenerService</code> or <code className="bg-slate-900 px-1 py-0.5 rounded text-slate-300 font-mono">SMS_RECEIVED</code> background broadcast receiver.
                </li>
                <li>Download your signed <strong>.AAB (Android App Bundle)</strong> and upload to Google Play Console.</li>
              </ol>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px]">
              <div>
                <span className="font-bold text-white block">Export Full Source Code</span>
                <span className="text-slate-400">Export via AI Studio settings menu or GitHub anytime</span>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono text-xs">
                Vite + PWA Ready
              </span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
          >
            Got It, Back to Soundbox
          </button>
        </div>
      </div>
    </div>
  );
};

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [showModal, setShowModal] = useState(false);

  if (isInstalled || dismissed) {
    return (
      <>
        <RealWorldPublishModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-cyan-950/80 border-b border-emerald-500/30 px-3.5 sm:px-6 py-2">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 truncate text-[11px] sm:text-xs">
              <strong className="text-white">Real-World Ready:</strong> Install on your phone for full-screen Soundbox & real UPI auto-announcements
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isInstallable && (
              <button
                type="button"
                onClick={install}
                className="py-1 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 shadow-sm active:scale-95 transition-all"
              >
                <Download className="w-3 h-3" />
                <span>Install on Phone</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="py-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-[11px] font-semibold flex items-center gap-1 transition-colors"
            >
              <HelpCircle className="w-3 h-3 text-cyan-400" />
              <span>Real UPI Guide</span>
            </button>

            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-200 transition-colors"
              title="Dismiss banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <RealWorldPublishModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
};
