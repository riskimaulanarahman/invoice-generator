// Status Badge Component

'use client';

import { Badge } from '@/components/ui/badge';
import { InvoiceStatus } from '@/types/invoice';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: InvoiceStatus;
  className?: string;
}

const statusConfig: Record<InvoiceStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string; label: string }> = {
  Draft: {
    variant: 'secondary',
    className: 'bg-gray-100 text-gray-700 hover:bg-gray-100',
    label: 'Draft',
  },
  Sent: {
    variant: 'default',
    className: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
    label: 'Terkirim',
  },
  Paid: {
    variant: 'default',
    className: 'bg-green-100 text-green-700 hover:bg-green-100',
    label: 'Lunas',
  },
  Overdue: {
    variant: 'destructive',
    className: 'bg-red-100 text-red-700 hover:bg-red-100',
    label: 'Jatuh Tempo',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge
      variant={config.variant}
      className={cn(config.className, 'font-medium', className)}
    >
      {config.label}
    </Badge>
  );
}

export function getStatusConfig(status: InvoiceStatus) {
  return statusConfig[status];
}
