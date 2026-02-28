// LocalStorage utilities for Invoice data persistence

import { Invoice, InvoiceStatus } from '@/types/invoice';

const STORAGE_KEY = 'invoice_builder_invoices';

/**
 * Get all invoices from localStorage
 * @returns Array of invoices
 */
export function getInvoices(): Invoice[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const invoices: Invoice[] = JSON.parse(data);
    return invoices.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } catch (error) {
    console.error('Error reading invoices from localStorage:', error);
    return [];
  }
}

/**
 * Get a single invoice by ID
 * @param id - Invoice ID
 * @returns Invoice or undefined
 */
export function getInvoiceById(id: string): Invoice | undefined {
  const invoices = getInvoices();
  return invoices.find((inv) => inv.id === id);
}

/**
 * Save all invoices to localStorage
 * @param invoices - Array of invoices to save
 */
export function saveInvoices(invoices: Invoice[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
  } catch (error) {
    console.error('Error saving invoices to localStorage:', error);
    throw new Error('Gagal menyimpan invoice. Storage penuh.');
  }
}

/**
 * Save a single invoice (create or update)
 * @param invoice - Invoice to save
 */
export function saveInvoice(invoice: Invoice): void {
  const invoices = getInvoices();
  const existingIndex = invoices.findIndex((inv) => inv.id === invoice.id);
  
  if (existingIndex >= 0) {
    // Update existing
    invoices[existingIndex] = {
      ...invoice,
      updatedAt: new Date().toISOString(),
    };
  } else {
    // Create new
    invoices.unshift({
      ...invoice,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  
  saveInvoices(invoices);
}

/**
 * Delete an invoice by ID
 * @param id - Invoice ID to delete
 */
export function deleteInvoice(id: string): void {
  const invoices = getInvoices();
  const filtered = invoices.filter((inv) => inv.id !== id);
  saveInvoices(filtered);
}

/**
 * Duplicate an invoice
 * @param id - Invoice ID to duplicate
 * @returns New duplicated invoice
 */
export function duplicateInvoice(id: string): Invoice | null {
  const invoice = getInvoiceById(id);
  if (!invoice) return null;
  
  const newInvoice: Invoice = {
    ...invoice,
    id: crypto.randomUUID(),
    invoiceNumber: generateInvoiceNumber(),
    status: 'Draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  saveInvoice(newInvoice);
  return newInvoice;
}

/**
 * Update invoice status
 * @param id - Invoice ID
 * @param status - New status
 */
export function updateInvoiceStatus(id: string, status: InvoiceStatus): void {
  const invoice = getInvoiceById(id);
  if (!invoice) return;
  
  invoice.status = status;
  invoice.updatedAt = new Date().toISOString();
  saveInvoice(invoice);
}

/**
 * Search invoices
 * @param query - Search query
 * @param status - Status filter
 * @returns Filtered invoices
 */
export function searchInvoices(
  query: string,
  status?: InvoiceStatus | 'all'
): Invoice[] {
  let invoices = getInvoices();
  
  // Filter by status
  if (status && status !== 'all') {
    invoices = invoices.filter((inv) => inv.status === status);
  }
  
  // Filter by query
  if (query.trim()) {
    const lowerQuery = query.toLowerCase();
    invoices = invoices.filter(
      (inv) =>
        inv.invoiceNumber.toLowerCase().includes(lowerQuery) ||
        inv.client.name.toLowerCase().includes(lowerQuery)
    );
  }
  
  return invoices;
}

/**
 * Generate a new invoice number
 * Format: INV-YYYYMMDD-XXXX
 * @returns Generated invoice number
 */
export function generateInvoiceNumber(): string {
  const date = new Date();
  const dateStr = format(new Date(), 'yyyyMMdd');
  
  // Get existing invoices to determine next number
  const invoices = getInvoices();
  const todayInvoices = invoices.filter((inv) =>
    inv.invoiceNumber.includes(dateStr)
  );
  
  const nextNum = todayInvoices.length + 1;
  const numStr = nextNum.toString().padStart(4, '0');
  
  return `INV-${dateStr}-${numStr}`;
}

// Simple format function to avoid date-fns locale issues
function format(date: Date, formatStr: string): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return formatStr
    .replace('yyyy', String(year))
    .replace('MM', month)
    .replace('dd', day);
}

/**
 * Export invoice data as JSON
 * @returns JSON string of all invoices
 */
export function exportInvoicesAsJson(): string {
  const invoices = getInvoices();
  return JSON.stringify(invoices, null, 2);
}

/**
 * Import invoices from JSON
 * @param jsonString - JSON string to import
 * @returns Number of invoices imported
 */
export function importInvoicesFromJson(jsonString: string): number {
  try {
    const invoices: Invoice[] = JSON.parse(jsonString);
    if (!Array.isArray(invoices)) {
      throw new Error('Invalid format');
    }
    
    // Validate and add IDs if missing
    const validInvoices = invoices.map((inv) => ({
      ...inv,
      id: inv.id || crypto.randomUUID(),
      updatedAt: new Date().toISOString(),
    }));
    
    saveInvoices(validInvoices);
    return validInvoices.length;
  } catch (error) {
    console.error('Error importing invoices:', error);
    throw new Error('Gagal mengimpor invoice. Format tidak valid.');
  }
}
