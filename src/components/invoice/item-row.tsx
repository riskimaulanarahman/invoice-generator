// Invoice Item Row Component

'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { InvoiceItem } from '@/types/invoice';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatRupiah, parseRupiah } from '@/utils/currency';
import { Trash2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ItemRowProps {
  item: InvoiceItem;
  index: number;
  onUpdate: (id: string, updates: Partial<InvoiceItem>) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}

export function ItemRow({ item, index, onUpdate, onRemove, canRemove }: ItemRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });
  const baseTotal = item.qty * item.unitPrice;
  const safeDiscountValue = Math.max(0, item.discountValue || 0);
  const discountAmount = item.discountType === 'percentage'
    ? Math.round(baseTotal * (Math.min(safeDiscountValue, 100) / 100))
    : Math.min(safeDiscountValue, baseTotal);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'rounded-md border border-border/70 bg-background p-3 shadow-sm',
        isDragging && 'opacity-80 ring-2 ring-primary/30'
      )}
    >
      <div className="space-y-3">
        {/* Primary row */}
        <div className="grid grid-cols-12 gap-2 items-start">
          <div className="col-span-12 md:col-span-8 flex items-start gap-2">
            <button
              type="button"
              className="mt-2 h-6 w-6 shrink-0 rounded text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing touch-none"
              aria-label={`Geser item ${index + 1} untuk ubah urutan`}
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4 mx-auto" />
            </button>
            <div className="min-w-0 flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">
                Deskripsi Item #{index + 1}
              </label>
              <Input
                value={item.description}
                onChange={(e) => onUpdate(item.id, { description: e.target.value })}
                placeholder="Contoh: Jasa desain logo / Produk A"
                className="h-9"
              />
            </div>
          </div>

          <div className="col-span-4 md:col-span-2">
            <label className="text-xs text-muted-foreground mb-1 block">Qty</label>
            <Input
              type="number"
              min={1}
              value={item.qty}
              onChange={(e) => {
                const qty = parseInt(e.target.value) || 0;
                if (qty > 0) onUpdate(item.id, { qty });
              }}
              className="h-9 text-center"
            />
          </div>

          <div className="col-span-8 md:col-span-2">
            <label className="text-xs text-muted-foreground mb-1 block">Harga Satuan</label>
            <Input
              value={item.unitPrice === 0 ? '' : formatRupiah(item.unitPrice, false)}
              onChange={(e) => {
                const price = parseRupiah(e.target.value);
                if (price >= 0) onUpdate(item.id, { unitPrice: price });
              }}
              placeholder="Rp 0"
              className="h-9"
            />
          </div>
        </div>

        {/* Optional row */}
        <div className="rounded-md border border-amber-200 bg-amber-50/60 p-2.5">
          <div className="grid grid-cols-12 gap-2 items-start">
            <div className="col-span-12 md:col-span-5">
              <label className="text-xs text-muted-foreground mb-1 block">Diskon</label>
              <div className="flex gap-1 items-start">
                <Input
                  type="number"
                  min={0}
                  max={item.discountType === 'percentage' ? 100 : undefined}
                  value={item.discountValue || ''}
                  onChange={(e) => {
                    const rawValue = parseFloat(e.target.value) || 0;
                    const safeValue = Math.max(0, rawValue);
                    const value = item.discountType === 'percentage'
                      ? Math.min(100, safeValue)
                      : safeValue;
                    onUpdate(item.id, { discountValue: value });
                  }}
                  placeholder={item.discountType === 'percentage' ? '0 - 100' : '0'}
                  className="h-9 flex-1"
                />
                <Select
                  value={item.discountType || 'fixed'}
                  onValueChange={(v) => onUpdate(item.id, { discountType: v as 'fixed' | 'percentage' })}
                >
                  <SelectTrigger className="h-9 w-14 px-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Rp</SelectItem>
                    <SelectItem value="percentage">%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {safeDiscountValue > 0
                  ? `Potongan: ${item.discountType === 'percentage'
                    ? `${Math.min(safeDiscountValue, 100)}% (~${formatRupiah(discountAmount, false)})`
                    : formatRupiah(discountAmount, false)}`
                  : 'Opsional'}
              </p>
            </div>

            <div className="col-span-4 md:col-span-2">
              <label className="text-xs text-muted-foreground mb-1 block">Pajak %</label>
              <Input
                type="number"
                min={0}
                max={100}
                value={item.taxRate || ''}
                onChange={(e) => {
                  const rate = parseFloat(e.target.value) || 0;
                  onUpdate(item.id, { taxRate: Math.min(100, rate) });
                }}
                placeholder="0"
                className="h-9 text-center"
              />
            </div>

            <div className="col-span-6 md:col-span-3">
              <label className="text-xs text-muted-foreground mb-1 block">Total</label>
              <div className="h-9 px-2 py-1.5 bg-muted rounded-md text-sm font-medium truncate">
                {formatRupiah(item.lineTotal, false)}
              </div>
              {baseTotal > 0 && (
                <p className="mt-1 text-[11px] text-muted-foreground truncate">
                  {item.qty} x {formatRupiah(item.unitPrice, false)}
                </p>
              )}
            </div>

            <div className="col-span-2 md:col-span-2 flex items-end justify-end">
              <div className="h-[18px] hidden md:block" />
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 text-muted-foreground hover:text-red-500"
                onClick={() => onRemove(item.id)}
                disabled={!canRemove}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Desktop Table Header
export function ItemTableHeader() {
  return null;
}
