// Invoice Card Component for List View

'use client';

import { Invoice } from '@/types/invoice';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './status-badge';
import { formatRupiah } from '@/utils/currency';
import { formatDate, formatDateShort, getDaysUntilDue } from '@/utils/date';
import { 
  MoreVertical, 
  Pencil, 
  Copy, 
  Trash2, 
  FileText,
  Clock,
  Calendar
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface InvoiceCardProps {
  invoice: Invoice;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

export function InvoiceCard({ invoice, onEdit, onDuplicate, onDelete, onView }: InvoiceCardProps) {
  const daysUntilDue = getDaysUntilDue(invoice.dates.dueDate);
  const isOverdue = daysUntilDue < 0 && invoice.status !== 'Paid';
  
  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-sm truncate">
                {invoice.invoiceNumber}
              </h3>
              <StatusBadge status={isOverdue ? 'Overdue' : invoice.status} />
            </div>
            
            {/* Client */}
            <p className="font-medium text-sm mb-1 truncate">
              {invoice.client.name}
            </p>
            
            {/* Amount */}
            <p className="text-lg font-bold text-primary mb-2">
              {formatRupiah(invoice.summary.grandTotal)}
            </p>
            
            {/* Dates */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDateShort(invoice.dates.issueDate)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span className={isOverdue ? 'text-red-500 font-medium' : ''}>
                  {isOverdue 
                    ? `Terlambat ${Math.abs(daysUntilDue)} hari`
                    : daysUntilDue === 0 
                      ? 'Jatuh tempo hari ini'
                      : `${daysUntilDue} hari lagi`
                  }
                </span>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onView(invoice.id)}
            >
              <FileText className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(invoice.id)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate(invoice.id)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplikat
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDelete(invoice.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
