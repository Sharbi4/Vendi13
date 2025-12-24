import React from 'react';
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Shield, AlertCircle } from 'lucide-react';

export default function VerificationBadge({ status, size = 'default', showLabel = true }) {
  if (!status || status === 'pending') return null;

  const config = {
    verified: {
      icon: ShieldCheck,
      text: 'Verified',
      className: 'bg-green-100 text-green-800 border-green-200'
    },
    unverified: {
      icon: AlertCircle,
      text: 'Not Verified',
      className: 'bg-gray-100 text-gray-600 border-gray-200'
    }
  };

  const { icon: Icon, text, className } = config[status] || config.unverified;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    default: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  return (
    <Badge className={`${className} border flex items-center gap-1 ${sizeClasses[size]}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      {showLabel && <span>{text}</span>}
    </Badge>
  );
}