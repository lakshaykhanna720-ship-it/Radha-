import React, { useState } from 'react';
import { X, QrCode, Smartphone, Sparkles, Volume2, Copy, Check } from 'lucide-react';
import { DriverSettings, PaymentMethod } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: DriverSettings;
  onSimulateCustomerPayment: (amount: number, method: PaymentMethod, sender: string) => void;
}

export const DriverQrModal: React.FC<Props> = ({
  isOpen,
  onClose,
  settings,
  onSimulateCustomerPayment,
}) => {
  const [copied, setCopied] = useState(false);
  const [customSimAmount, setCustomSimAmount] = useState('180');

  if (!isOpen) return null;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(settings.upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulate = (amount: number, method: PaymentMethod, sender: string) => {
    onSimulateCustomerPayment(amount, method, sender);
    onClose();
  };

  // Generate UPI payment link: upi://pay?pa=...&pn=...&mc=...
  const upiUrl = `upi://pay?pa=${encodeURIComponent(settings.upiId)}&pn=${encodeURIComponent(settings.driverName)}&cu=INR`;
  // Safe SVG-rendered QR API using standard SVG image
  const qrImgSrc = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiUrl)}&bgcolor=ffffff&color=020617&margin=1`;

  return (
    <div
      id="driver-qr-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div
        id="driver-qr-card"
        className="relative w-full max-w-sm bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-6 shadow-2xl text-center overflow-hidden"
      >
        {/* Close */}
        <button
          id="btn-close-qr-modal"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-center gap-1.5 mb-2">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wider uppercase">
            Passanger Scan QR
          </span>
        </div>
        <h2 className="text-xl font-bold text-white mb-0.5">{settings.driverName}</h2>
        <p className="text-xs text-emerald-400 font-mono font-medium">{settings.vehicleNumber}</p>

        {/* QR Code Container */}
        <div className="my-4 p-4 bg-white rounded-2xl shadow-xl inline-block mx-auto border-4 border-emerald-500/30">
          <img
            src={qrImgSrc}
            alt="Driver UPI QR Code"
            className="w-48 h-48 mx-auto"
            loading="eager"
          />
          <div className="mt-2 flex items-center justify-center gap-2 text-[11px] font-bold text-slate-900 uppercase">
            <span className="text-[#00baf2]">Paytm</span> •{' '}
            <span className="text-[#5f259f]">PhonePe</span> •{' '}
            <span className="text-emerald-600">GPay</span>
          </div>
        </div>

        {/* UPI ID */}
        <div className="mb-4 flex items-center justify-center gap-2">
          <span className="text-xs text-slate-400 font-mono bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            {settings.upiId}
          </span>
          <button
            onClick={handleCopyUpi}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
            title="Copy UPI ID"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Customer simulation panel */}
        <div className="pt-3 border-t border-slate-800 text-left">
          <span className="text-xs font-semibold text-slate-300 block mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulate Customer Scan & Pay:</span>
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleSimulate(150, 'paytm', 'Ankit Verma')}
              className="p-2 rounded-xl bg-[#002e6e]/60 hover:bg-[#002e6e] border border-[#00baf2]/40 text-left transition-all group"
            >
              <span className="text-[10px] text-[#00baf2] font-bold block">Paytm</span>
              <span className="text-xs font-extrabold text-white font-mono">₹150</span>
            </button>
            <button
              type="button"
              onClick={() => handleSimulate(280, 'phonepe', 'Saurabh Roy')}
              className="p-2 rounded-xl bg-[#5f259f]/60 hover:bg-[#5f259f] border border-purple-400/40 text-left transition-all group"
            >
              <span className="text-[10px] text-purple-200 font-bold block">PhonePe</span>
              <span className="text-xs font-extrabold text-white font-mono">₹280</span>
            </button>
            <button
              type="button"
              onClick={() => handleSimulate(350, 'gpay', 'Ritu Sharma')}
              className="p-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 text-left transition-all group"
            >
              <span className="text-[10px] text-emerald-400 font-bold block">Google Pay</span>
              <span className="text-xs font-extrabold text-white font-mono">₹350</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
