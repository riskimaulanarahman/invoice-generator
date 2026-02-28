// Invoice calculation utilities

import { InvoiceItem, InvoiceSummary, DiscountType } from '@/types/invoice';

/**
 * Calculate line total for a single invoice item
 */
export function calculateLineTotal(item: Omit<InvoiceItem, 'id' | 'lineTotal'>): number {
  let total = item.qty * item.unitPrice;
  
  // Apply item discount
  if (item.discountValue && item.discountValue > 0) {
    if (item.discountType === 'percentage') {
      total = total * (1 - item.discountValue / 100);
    } else {
      total = total - item.discountValue;
    }
  }
  
  // Apply item tax
  if (item.taxRate && item.taxRate > 0) {
    total = total * (1 + item.taxRate / 100);
  }
  
  return Math.max(0, Math.round(total));
}

/**
 * Calculate subtotal from all items (before global discount/tax)
 */
export function calculateSubTotal(items: InvoiceItem[]): number {
  return items.reduce((sum, item) => sum + item.lineTotal, 0);
}

/**
 * Calculate discount amount based on type and value
 */
export function calculateDiscountAmount(
  subTotal: number,
  discountType: DiscountType,
  discountValue: number
): number {
  if (discountValue <= 0) return 0;
  
  if (discountType === 'percentage') {
    return Math.round(subTotal * (discountValue / 100));
  }
  
  return Math.min(discountValue, subTotal); // Cap at subtotal
}

/**
 * Calculate tax amount
 */
export function calculateTaxAmount(amountAfterDiscount: number, taxRate: number): number {
  if (taxRate <= 0) return 0;
  return Math.round(amountAfterDiscount * (taxRate / 100));
}

/**
 * Calculate complete invoice summary
 */
export function calculateInvoiceSummary(
  items: InvoiceItem[],
  discountType: DiscountType,
  discountValue: number,
  taxRate: number,
  fee: number
): InvoiceSummary {
  const subTotal = calculateSubTotal(items);
  const discountAmount = calculateDiscountAmount(subTotal, discountType, discountValue);
  const afterDiscount = subTotal - discountAmount;
  const taxAmount = calculateTaxAmount(afterDiscount, taxRate);
  const grandTotal = afterDiscount + taxAmount + fee;
  
  return {
    subTotal,
    discountType,
    discountValue,
    discountAmount,
    taxRate,
    taxAmount,
    fee,
    grandTotal: Math.max(0, grandTotal),
  };
}

/**
 * Recalculate all item line totals and return updated items
 */
export function recalculateItems(
  items: Omit<InvoiceItem, 'lineTotal'>[]
): InvoiceItem[] {
  return items.map((item) => ({
    ...item,
    lineTotal: calculateLineTotal(item),
  }));
}

/**
 * Validate invoice item
 */
export function validateInvoiceItem(item: Partial<InvoiceItem>): string[] {
  const errors: string[] = [];
  
  if (!item.description || item.description.trim() === '') {
    errors.push('Deskripsi item harus diisi');
  }
  
  if (item.qty === undefined || item.qty === null) {
    errors.push('Qty harus diisi');
  } else if (item.qty <= 0) {
    errors.push('Qty harus lebih dari 0');
  }
  
  if (item.unitPrice === undefined || item.unitPrice === null) {
    errors.push('Harga satuan harus diisi');
  } else if (item.unitPrice < 0) {
    errors.push('Harga satuan tidak boleh negatif');
  }
  
  if (item.discountValue !== undefined && item.discountValue < 0) {
    errors.push('Diskon tidak boleh negatif');
  }
  
  if (item.taxRate !== undefined && item.taxRate < 0) {
    errors.push('Pajak tidak boleh negatif');
  }
  
  return errors;
}

/**
 * Validate invoice form
 */
export function validateInvoiceForm(data: {
  invoiceNumber: string;
  issuer: { name: string };
  client: { name: string; email: string };
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
}): string[] {
  const errors: string[] = [];
  
  if (!data.invoiceNumber.trim()) {
    errors.push('Nomor invoice harus diisi');
  }
  
  if (!data.issuer.name.trim()) {
    errors.push('Nama usaha/pengirim harus diisi');
  }
  
  if (!data.client.name.trim()) {
    errors.push('Nama klien harus diisi');
  }
  
  if (!data.client.email.trim()) {
    errors.push('Email klien harus diisi');
  }
  
  if (!data.issueDate) {
    errors.push('Tanggal invoice harus diisi');
  }
  
  if (!data.dueDate) {
    errors.push('Tanggal jatuh tempo harus diisi');
  }
  
  if (data.issueDate && data.dueDate && data.dueDate < data.issueDate) {
    errors.push('Tanggal jatuh tempo tidak boleh sebelum tanggal invoice');
  }
  
  if (data.items.length === 0) {
    errors.push('Minimal harus ada 1 item');
  }
  
  data.items.forEach((item, index) => {
    const itemErrors = validateInvoiceItem(item);
    itemErrors.forEach((err) => {
      errors.push(`Item ${index + 1}: ${err}`);
    });
  });
  
  return errors;
}
