// Invoice Store - Zustand state management

import { create } from 'zustand';
import { 
  Invoice, 
  InvoiceItem, 
  InvoiceStatus, 
  DiscountType,
  createEmptyInvoice 
} from '@/types/invoice';
import { 
  getInvoices, 
  getInvoiceById, 
  saveInvoice, 
  deleteInvoice as deleteFromStorage,
  duplicateInvoice as duplicateInStorage,
  searchInvoices,
  generateInvoiceNumber
} from '@/utils/storage';
import { calculateLineTotal, calculateInvoiceSummary, recalculateItems } from '@/utils/calculations';

interface InvoiceStore {
  // State
  invoices: Invoice[];
  currentInvoice: Invoice | null;
  isLoading: boolean;
  searchQuery: string;
  statusFilter: InvoiceStatus | 'all';
  
  // Actions
  loadInvoices: () => void;
  loadInvoice: (id: string) => boolean;
  createNewInvoice: () => Invoice;
  updateCurrentInvoice: (updates: Partial<Invoice>) => void;
  updateIssuer: (updates: Partial<Invoice['issuer']>) => void;
  updateClient: (updates: Partial<Invoice['client']>) => void;
  updateDates: (updates: Partial<Invoice['dates']>) => void;
  updatePayment: (updates: Partial<Invoice['payment']>) => void;
  addItem: () => void;
  updateItem: (id: string, updates: Partial<InvoiceItem>) => void;
  removeItem: (id: string) => void;
  reorderItems: (items: InvoiceItem[]) => void;
  updateDiscount: (type: DiscountType, value: number) => void;
  updateTaxRate: (rate: number) => void;
  updateFee: (fee: number) => void;
  updateNotes: (notes: string) => void;
  updateTerms: (terms: string) => void;
  updateStatus: (status: InvoiceStatus) => void;
  saveCurrentInvoice: () => void;
  deleteInvoice: (id: string) => void;
  duplicateCurrentInvoice: () => Invoice | null;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: InvoiceStatus | 'all') => void;
  clearCurrentInvoice: () => void;
}

export const useInvoiceStore = create<InvoiceStore>((set, get) => ({
  // Initial state
  invoices: [],
  currentInvoice: null,
  isLoading: false,
  searchQuery: '',
  statusFilter: 'all',
  
  // Load all invoices
  loadInvoices: () => {
    set({ isLoading: true });
    const invoices = getInvoices();
    set({ invoices, isLoading: false });
  },
  
  // Load a single invoice
  loadInvoice: (id: string) => {
    const invoice = getInvoiceById(id);
    if (invoice) {
      set({ currentInvoice: invoice });
      return true;
    }
    return false;
  },
  
  // Create new invoice
  createNewInvoice: () => {
    const id = crypto.randomUUID();
    const invoice = createEmptyInvoice(id);
    invoice.invoiceNumber = generateInvoiceNumber();
    set({ currentInvoice: invoice });
    return invoice;
  },
  
  // Update current invoice
  updateCurrentInvoice: (updates) => {
    set((state) => ({
      currentInvoice: state.currentInvoice
        ? { ...state.currentInvoice, ...updates, updatedAt: new Date().toISOString() }
        : null,
    }));
  },
  
  // Update issuer info
  updateIssuer: (updates) => {
    set((state) => ({
      currentInvoice: state.currentInvoice
        ? {
            ...state.currentInvoice,
            issuer: { ...state.currentInvoice.issuer, ...updates },
            updatedAt: new Date().toISOString(),
          }
        : null,
    }));
  },
  
  // Update client info
  updateClient: (updates) => {
    set((state) => ({
      currentInvoice: state.currentInvoice
        ? {
            ...state.currentInvoice,
            client: { ...state.currentInvoice.client, ...updates },
            updatedAt: new Date().toISOString(),
          }
        : null,
    }));
  },
  
  // Update dates
  updateDates: (updates) => {
    set((state) => ({
      currentInvoice: state.currentInvoice
        ? {
            ...state.currentInvoice,
            dates: { ...state.currentInvoice.dates, ...updates },
            updatedAt: new Date().toISOString(),
          }
        : null,
    }));
  },
  
  // Update payment info
  updatePayment: (updates) => {
    set((state) => ({
      currentInvoice: state.currentInvoice
        ? {
            ...state.currentInvoice,
            payment: { ...state.currentInvoice.payment, ...updates },
            updatedAt: new Date().toISOString(),
          }
        : null,
    }));
  },
  
  // Add new item
  addItem: () => {
    set((state) => {
      if (!state.currentInvoice) return state;
      
      const newItem: InvoiceItem = {
        id: crypto.randomUUID(),
        description: '',
        qty: 1,
        unitPrice: 0,
        discountType: 'fixed',
        discountValue: 0,
        taxRate: 0,
        lineTotal: 0,
      };
      
      const newItems = [...state.currentInvoice.items, newItem];
      const summary = calculateInvoiceSummary(
        newItems,
        state.currentInvoice.summary.discountType,
        state.currentInvoice.summary.discountValue,
        state.currentInvoice.summary.taxRate,
        state.currentInvoice.summary.fee
      );
      
      return {
        currentInvoice: {
          ...state.currentInvoice,
          items: newItems,
          summary,
          updatedAt: new Date().toISOString(),
        },
      };
    });
  },
  
  // Update item
  updateItem: (id, updates) => {
    set((state) => {
      if (!state.currentInvoice) return state;
      
      const items = state.currentInvoice.items.map((item) => {
        if (item.id !== id) return item;
        
        const updatedItem = { ...item, ...updates };
        // Recalculate line total
        updatedItem.lineTotal = calculateLineTotal(updatedItem);
        return updatedItem;
      });
      
      const summary = calculateInvoiceSummary(
        items,
        state.currentInvoice.summary.discountType,
        state.currentInvoice.summary.discountValue,
        state.currentInvoice.summary.taxRate,
        state.currentInvoice.summary.fee
      );
      
      return {
        currentInvoice: {
          ...state.currentInvoice,
          items,
          summary,
          updatedAt: new Date().toISOString(),
        },
      };
    });
  },
  
  // Remove item
  removeItem: (id) => {
    set((state) => {
      if (!state.currentInvoice) return state;
      
      const items = state.currentInvoice.items.filter((item) => item.id !== id);
      const summary = calculateInvoiceSummary(
        items,
        state.currentInvoice.summary.discountType,
        state.currentInvoice.summary.discountValue,
        state.currentInvoice.summary.taxRate,
        state.currentInvoice.summary.fee
      );
      
      return {
        currentInvoice: {
          ...state.currentInvoice,
          items,
          summary,
          updatedAt: new Date().toISOString(),
        },
      };
    });
  },
  
  // Reorder items
  reorderItems: (items) => {
    set((state) => {
      if (!state.currentInvoice) return state;
      
      return {
        currentInvoice: {
          ...state.currentInvoice,
          items,
          updatedAt: new Date().toISOString(),
        },
      };
    });
  },
  
  // Update discount
  updateDiscount: (type, value) => {
    set((state) => {
      if (!state.currentInvoice) return state;
      
      const summary = calculateInvoiceSummary(
        state.currentInvoice.items,
        type,
        value,
        state.currentInvoice.summary.taxRate,
        state.currentInvoice.summary.fee
      );
      
      return {
        currentInvoice: {
          ...state.currentInvoice,
          summary: { ...summary, discountType: type, discountValue: value },
          updatedAt: new Date().toISOString(),
        },
      };
    });
  },
  
  // Update tax rate
  updateTaxRate: (rate) => {
    set((state) => {
      if (!state.currentInvoice) return state;
      
      const summary = calculateInvoiceSummary(
        state.currentInvoice.items,
        state.currentInvoice.summary.discountType,
        state.currentInvoice.summary.discountValue,
        rate,
        state.currentInvoice.summary.fee
      );
      
      return {
        currentInvoice: {
          ...state.currentInvoice,
          summary: { ...summary, taxRate: rate },
          updatedAt: new Date().toISOString(),
        },
      };
    });
  },
  
  // Update fee
  updateFee: (fee) => {
    set((state) => {
      if (!state.currentInvoice) return state;
      
      const summary = calculateInvoiceSummary(
        state.currentInvoice.items,
        state.currentInvoice.summary.discountType,
        state.currentInvoice.summary.discountValue,
        state.currentInvoice.summary.taxRate,
        fee
      );
      
      return {
        currentInvoice: {
          ...state.currentInvoice,
          summary: { ...summary, fee },
          updatedAt: new Date().toISOString(),
        },
      };
    });
  },
  
  // Update notes
  updateNotes: (notes) => {
    set((state) => ({
      currentInvoice: state.currentInvoice
        ? { ...state.currentInvoice, notes, updatedAt: new Date().toISOString() }
        : null,
    }));
  },
  
  // Update terms
  updateTerms: (terms) => {
    set((state) => ({
      currentInvoice: state.currentInvoice
        ? { ...state.currentInvoice, terms, updatedAt: new Date().toISOString() }
        : null,
    }));
  },
  
  // Update status
  updateStatus: (status) => {
    set((state) => ({
      currentInvoice: state.currentInvoice
        ? { ...state.currentInvoice, status, updatedAt: new Date().toISOString() }
        : null,
    }));
  },
  
  // Save current invoice
  saveCurrentInvoice: () => {
    const { currentInvoice } = get();
    if (currentInvoice) {
      saveInvoice(currentInvoice);
      get().loadInvoices();
    }
  },
  
  // Delete invoice
  deleteInvoice: (id) => {
    deleteFromStorage(id);
    get().loadInvoices();
  },
  
  // Duplicate current invoice
  duplicateCurrentInvoice: () => {
    const { currentInvoice } = get();
    if (!currentInvoice) return null;
    
    const newInvoice = duplicateInStorage(currentInvoice.id);
    if (newInvoice) {
      get().loadInvoices();
    }
    return newInvoice;
  },
  
  // Set search query
  setSearchQuery: (query) => {
    set({ searchQuery: query });
    const { statusFilter } = get();
    const filtered = searchInvoices(query, statusFilter);
    set({ invoices: filtered });
  },
  
  // Set status filter
  setStatusFilter: (status) => {
    set({ statusFilter: status });
    const { searchQuery } = get();
    const filtered = searchInvoices(searchQuery, status);
    set({ invoices: filtered });
  },
  
  // Clear current invoice
  clearCurrentInvoice: () => {
    set({ currentInvoice: null });
  },
}));
