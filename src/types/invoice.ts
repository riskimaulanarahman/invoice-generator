// Invoice Types

export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Overdue';

export type DiscountType = 'fixed' | 'percentage';

export type PaymentMethod = 'bank_transfer' | 'e_wallet' | 'cash';

export interface Issuer {
  name: string;
  address: string;
  email: string;
  phone: string;
  logoBase64?: string;
}

export interface Client {
  name: string;
  address: string;
  email: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
  discountType?: DiscountType;
  discountValue?: number;
  taxRate?: number; // percentage, e.g., 11 for PPN
  lineTotal: number;
}

export interface InvoiceSummary {
  subTotal: number;
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;
  taxRate: number; // percentage
  taxAmount: number;
  fee: number;
  grandTotal: number;
}

export interface PaymentInfo {
  method: PaymentMethod;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
}

export interface InvoiceDates {
  issueDate: string; // ISO date string
  dueDate: string; // ISO date string
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  issuer: Issuer;
  client: Client;
  dates: InvoiceDates;
  items: InvoiceItem[];
  summary: InvoiceSummary;
  notes: string;
  terms: string;
  payment: PaymentInfo;
  createdAt: string;
  updatedAt: string;
}

// Form State for Editor
export interface InvoiceFormData {
  invoiceNumber: string;
  status: InvoiceStatus;
  issuer: Issuer;
  client: Client;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  discountType: DiscountType;
  discountValue: number;
  taxRate: number;
  fee: number;
  notes: string;
  terms: string;
  payment: PaymentInfo;
}

// Default values
export const defaultIssuer: Issuer = {
  name: '',
  address: '',
  email: '',
  phone: '',
  logoBase64: '',
};

export const defaultClient: Client = {
  name: '',
  address: '',
  email: '',
};

export const defaultInvoiceItem: Omit<InvoiceItem, 'id'> = {
  description: '',
  qty: 1,
  unitPrice: 0,
  discountType: 'fixed',
  discountValue: 0,
  taxRate: 0,
  lineTotal: 0,
};

export const defaultPaymentInfo: PaymentInfo = {
  method: 'bank_transfer',
  bankName: '',
  accountNumber: '',
  accountName: '',
};

export const defaultSummary: InvoiceSummary = {
  subTotal: 0,
  discountType: 'fixed',
  discountValue: 0,
  discountAmount: 0,
  taxRate: 11,
  taxAmount: 0,
  fee: 0,
  grandTotal: 0,
};

export function createEmptyInvoice(id: string): Invoice {
  const now = new Date().toISOString();
  const issueDate = new Date();
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30); // 30 days from now

  return {
    id,
    invoiceNumber: '',
    status: 'Draft',
    issuer: { ...defaultIssuer },
    client: { ...defaultClient },
    dates: {
      issueDate: issueDate.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
    },
    items: [],
    summary: { ...defaultSummary },
    notes: '',
    terms: '',
    payment: { ...defaultPaymentInfo },
    createdAt: now,
    updatedAt: now,
  };
}
