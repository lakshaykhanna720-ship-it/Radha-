import React from 'react';
import { PaymentMethod } from '../types';
import { QrCode, Banknote, Smartphone } from 'lucide-react';

interface Props {
  method: PaymentMethod;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ProviderBadge: React.FC<Props> = ({ method, size = 'md', showLabel = true }) => {
  const configs: Record<PaymentMethod, { label: string; bg: string; text: string; border: string; icon: any; glow: string }> = {
    paytm: {
      label: 'Paytm',
      bg: 'bg-[#002e6e]',
      text: 'text-[#00baf2]',
      border: 'border-[#00baf2]/30',
      icon: Smartphone,
      glow: 'shadow-[#00baf2]/20',
    },
    phonepe: {
      label: 'PhonePe',
      bg: 'bg-[#5f259f]',
      text: 'text-white',
      border: 'border-purple-400/30',
      icon: Smartphone,
      glow: 'shadow-purple-500/20',
    },
    gpay: {
      label: 'Google Pay',
      bg: 'bg-slate-900',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      icon: Smartphone,
      glow: 'shadow-emerald-500/20',
    },
    cash: {
      label: 'Cash 💰',
      bg: 'bg-amber-950/80',
      text: 'text-amber-400',
      border: 'border-amber-500/40',
      icon: Banknote,
      glow: 'shadow-amber-500/20',
    },
    other_upi: {
      label: 'UPI QR',
      bg: 'bg-blue-950',
      text: 'text-cyan-400',
      border: 'border-cyan-500/30',
      icon: QrCode,
      glow: 'shadow-cyan-500/20',
    },
  };

  const cfg = configs[method] || configs.other_upi;
  const Icon = cfg.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs md:text-sm gap-1.5 font-medium',
    lg: 'px-3.5 py-1.5 text-base gap-2 font-semibold',
  };

  return (
    <span
      id={`provider-badge-${method}`}
      className={`inline-flex items-center rounded-full border shadow-sm ${cfg.bg} ${cfg.text} ${cfg.border} ${sizeClasses[size]}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
      {showLabel && <span>{cfg.label}</span>}
    </span>
  );
};
