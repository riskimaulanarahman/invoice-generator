// Invoice Item Row Component

'use client';

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
  return (
    <div className="grid grid-cols-12 gap-2 items-start py-2 border-b last:border-b-0">
      {/* Drag Handle + Description */}
      <div className="col-span-12 sm:col-span-4 flex items-start gap-2">
        <GripVertical className="h-4 w-4 text-muted-foreground mt-2.5 cursor-grab hidden sm:block" />
        <div className="flex-1">
          <label className="text-xs text-muted-foreground mb-1 block sm:hidden">
            Deskripsi
          </label>
          <Input
            value={item.description}
            onChange={(e) => onUpdate(item.id, { description: e.target.value })}
            placeholder="Deskripsi item/jasa"
            className="h-9"
          />
        </div>
      </div>

      {/* Quantity */}
      <div className="col-span-4 sm:col-span-1">
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

      {/* Unit Price */}
      <div className="col-span-8 sm:col-span-2">
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

      {/* Discount */}
      <div className="col-span-6 sm:col-span-2">
        <label className="text-xs text-muted-foreground mb-1 block">Diskon</label>
        <div className="flex gap-1">
          <Input
            type="number"
            min={0}
            value={item.discountValue || ''}
            onChange={(e) => {
              const value = parseFloat(e.target.value) || 0;
              onUpdate(item.id, { discountValue: value });
            }}
            placeholder="0"
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
      </div>

      {/* Tax */}
      <div className="col-span-4 sm:col-span-1">
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

      {/* Line Total */}
      <div className="col-span-6 sm:col-span-1">
        <label className="text-xs text-muted-foreground mb-1 block">Total</label>
        <div className="h-9 px-2 py-1.5 bg-muted rounded-md text-sm font-medium truncate">
          {formatRupiah(item.lineTotal, false)}
        </div>
      </div>

      {/* Remove Button */}
      <div className="col-span-2 sm:col-span-1 flex items-end justify-end pb-1">
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
  );
}

// Desktop Table Header
export function ItemTableHeader() {
  return (
    <div className="hidden sm:grid grid-cols-12 gap-2 py-2 border-b bg-muted/50 text-xs font-medium text-muted-foreground rounded-t-md px-2">
      <div className="col-span-4 pl-6">Deskripsi</div>
      <div className="col-span-1 text-center">Qty</div>
      <div className="col-span-2">Harga Satuan</div>
      <div className="col-span-2">Diskon</div>
      <div className="col-span-1 text-center">Pajak</div>
      <div className="col-span-1 text-right">Total</div>
      <div className="col-span-1"></div>
    </div>
  );
}
