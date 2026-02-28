'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useInvoiceStore } from '@/store/invoice-store';
import { InvoiceStatus, Invoice } from '@/types/invoice';
import { formatRupiah } from '@/utils/currency';
import { formatDate, getTodayISO, getDefaultDueDate } from '@/utils/date';
import { searchInvoices, duplicateInvoice as duplicateInvoiceStorage } from '@/utils/storage';
import { InvoicePreview } from '@/components/invoice/invoice-preview';
import { InvoiceCard } from '@/components/invoice/invoice-card';
import { StatusBadge } from '@/components/invoice/status-badge';
import { ItemRow, ItemTableHeader } from '@/components/invoice/item-row';
import { BottomNav } from '@/components/invoice/bottom-nav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { useReactToPrint } from 'react-to-print';
import { cn } from '@/lib/utils';
import {
  Plus,
  Search,
  FileText,
  ArrowLeft,
  Save,
  Download,
  Printer,
  Trash2,
  Copy,
  Building2,
  User,
  Calendar,
  CreditCard,
  FileEdit,
  Upload,
  X,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  LayoutGrid,
  List,
} from 'lucide-react';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

export default function InvoiceBuilder() {
  const { toast } = useToast();
  const {
    invoices,
    currentInvoice,
    isLoading,
    loadInvoices,
    loadInvoice,
    createNewInvoice,
    updateCurrentInvoice,
    updateIssuer,
    updateClient,
    updateDates,
    updatePayment,
    addItem,
    updateItem,
    removeItem,
    updateDiscount,
    updateTaxRate,
    updateFee,
    updateNotes,
    updateTerms,
    updateStatus,
    saveCurrentInvoice,
    deleteInvoice,
    setSearchQuery,
    setStatusFilter,
    clearCurrentInvoice,
  } = useInvoiceStore();

  // Local state
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [editorTab, setEditorTab] = useState<'form' | 'preview'>('form');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilterLocal, setStatusFilterLocal] = useState<InvoiceStatus | 'all'>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Print ref
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: currentInvoice 
      ? `INVOICE_${currentInvoice.invoiceNumber}_${currentInvoice.client.name.replace(/\s+/g, '_')}`
      : 'invoice',
  });

  // Debounced autosave
  const debouncedInvoice = useDebounce(currentInvoice, 1500);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load invoices on mount
  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  // Autosave
  useEffect(() => {
    if (debouncedInvoice && view === 'editor') {
      saveCurrentInvoice();
      // Don't show toast for autosave to avoid spam
    }
  }, [debouncedInvoice, view]);

  // Search handler
  useEffect(() => {
    setSearchQuery(searchInput);
  }, [searchInput, setSearchQuery]);

  // Handle navigation
  const handleCreateNew = () => {
    createNewInvoice();
    setValidationErrors([]);
    setView('editor');
    setEditorTab('form');
  };

  const handleEdit = (id: string) => {
    if (loadInvoice(id)) {
      setValidationErrors([]);
      setView('editor');
      setEditorTab('form');
    }
  };

  const handleView = (id: string) => {
    if (loadInvoice(id)) {
      setPreviewDialogOpen(true);
    }
  };

  const handleBack = () => {
    if (currentInvoice) {
      saveCurrentInvoice();
      toast({
        title: 'Tersimpan',
        description: 'Invoice berhasil disimpan',
      });
    }
    clearCurrentInvoice();
    setView('list');
    loadInvoices();
  };

  const handleDeleteClick = (id: string) => {
    setInvoiceToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (invoiceToDelete) {
      deleteInvoice(invoiceToDelete);
      toast({
        title: 'Berhasil',
        description: 'Invoice berhasil dihapus',
      });
    }
    setDeleteDialogOpen(false);
    setInvoiceToDelete(null);
  };

  const handleDuplicate = (id: string) => {
    const newInvoice = duplicateInvoiceStorage(id);
    if (newInvoice) {
      loadInvoices();
      toast({
        title: 'Berhasil',
        description: `Invoice ${newInvoice.invoiceNumber} berhasil dibuat`,
      });
    }
  };

  // Validate before save/export
  const validateInvoice = (): boolean => {
    const errors: string[] = [];
    
    if (!currentInvoice) {
      errors.push('Tidak ada invoice untuk divalidasi');
      setValidationErrors(errors);
      return false;
    }

    if (!currentInvoice.invoiceNumber.trim()) {
      errors.push('Nomor invoice harus diisi');
    }

    if (!currentInvoice.issuer.name.trim()) {
      errors.push('Nama usaha/pengirim harus diisi');
    }

    if (!currentInvoice.client.name.trim()) {
      errors.push('Nama klien harus diisi');
    }

    if (!currentInvoice.client.email.trim()) {
      errors.push('Email klien harus diisi');
    }

    if (!currentInvoice.dates.issueDate) {
      errors.push('Tanggal invoice harus diisi');
    }

    if (!currentInvoice.dates.dueDate) {
      errors.push('Tanggal jatuh tempo harus diisi');
    }

    if (currentInvoice.dates.dueDate < currentInvoice.dates.issueDate) {
      errors.push('Tanggal jatuh tempo tidak boleh sebelum tanggal invoice');
    }

    if (currentInvoice.items.length === 0) {
      errors.push('Minimal harus ada 1 item');
    }

    currentInvoice.items.forEach((item, index) => {
      if (!item.description.trim()) {
        errors.push(`Item ${index + 1}: Deskripsi harus diisi`);
      }
      if (item.qty <= 0) {
        errors.push(`Item ${index + 1}: Qty harus lebih dari 0`);
      }
      if (item.unitPrice < 0) {
        errors.push(`Item ${index + 1}: Harga tidak boleh negatif`);
      }
    });

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSave = () => {
    if (validateInvoice()) {
      saveCurrentInvoice();
      loadInvoices();
      toast({
        title: 'Berhasil',
        description: 'Invoice berhasil disimpan',
        action: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Validasi Gagal',
        description: 'Mohon periksa kembali data invoice',
      });
    }
  };

  const handleExportPDF = () => {
    if (validateInvoice()) {
      handlePrint();
    } else {
      toast({
        variant: 'destructive',
        title: 'Validasi Gagal',
        description: 'Mohon lengkapi data sebelum export PDF',
      });
    }
  };

  // Logo upload handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500000) {
        toast({
          variant: 'destructive',
          title: 'File terlalu besar',
          description: 'Maksimal ukuran file 500KB',
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        updateIssuer({ logoBase64: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Filter invoices by status
  const filteredInvoices = invoices.filter((inv) => 
    statusFilterLocal === 'all' ? true : inv.status === statusFilterLocal
  );

  // Stats
  const stats = {
    total: invoices.length,
    draft: invoices.filter((i) => i.status === 'Draft').length,
    sent: invoices.filter((i) => i.status === 'Sent').length,
    paid: invoices.filter((i) => i.status === 'Paid').length,
    overdue: invoices.filter((i) => i.status === 'Overdue').length,
  };

  // RENDER LIST VIEW
  if (view === 'list') {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="container max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl md:text-2xl font-bold">Invoice Builder</h1>
                <p className="text-sm text-muted-foreground hidden md:block">
                  Kelola dan buat invoice dengan mudah
                </p>
              </div>
              <Button onClick={handleCreateNew} className="gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Buat Invoice</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="container max-w-6xl mx-auto px-4 py-4 md:py-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            <Card className="p-3">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-xl font-bold">{stats.total}</p>
            </Card>
            <Card className="p-3">
              <p className="text-xs text-muted-foreground">Draft</p>
              <p className="text-xl font-bold">{stats.draft}</p>
            </Card>
            <Card className="p-3">
              <p className="text-xs text-muted-foreground">Terkirim</p>
              <p className="text-xl font-bold">{stats.sent}</p>
            </Card>
            <Card className="p-3">
              <p className="text-xs text-muted-foreground">Lunas</p>
              <p className="text-xl font-bold">{stats.paid}</p>
            </Card>
            <Card className="p-3">
              <p className="text-xs text-muted-foreground">Jatuh Tempo</p>
              <p className="text-xl font-bold text-red-500">{stats.overdue}</p>
            </Card>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Cari invoice atau klien..."
                className="pl-10"
              />
            </div>
            <Select value={statusFilterLocal} onValueChange={(v) => setStatusFilterLocal(v as InvoiceStatus | 'all')}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Sent">Terkirim</SelectItem>
                <SelectItem value="Paid">Lunas</SelectItem>
                <SelectItem value="Overdue">Jatuh Tempo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Invoice List */}
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Memuat...
            </div>
          ) : filteredInvoices.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Belum ada invoice</h3>
              <p className="text-muted-foreground mb-4">
                {searchInput || statusFilterLocal !== 'all' 
                  ? 'Tidak ada invoice yang sesuai filter'
                  : 'Klik tombol "Buat Invoice" untuk membuat invoice pertama Anda'}
              </p>
              {!searchInput && statusFilterLocal === 'all' && (
                <Button onClick={handleCreateNew} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Buat Invoice
                </Button>
              )}
            </Card>
          ) : (
            <div className={cn(
              "gap-4",
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                : "flex flex-col"
            )}>
              {filteredInvoices.map((invoice) => (
                <InvoiceCard
                  key={invoice.id}
                  invoice={invoice}
                  onEdit={handleEdit}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDeleteClick}
                  onView={handleView}
                />
              ))}
            </div>
          )}
        </main>

        {/* Bottom Nav */}
        <BottomNav currentPage="list" onNavigate={setView} />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Invoice?</AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini tidak dapat dibatalkan. Invoice akan dihapus permanen dari penyimpanan lokal.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Preview Dialog */}
        <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Preview Invoice</DialogTitle>
            </DialogHeader>
            <div className="scale-50 origin-top-left w-[200%]">
              <InvoicePreview ref={printRef} invoice={currentInvoice} />
            </div>
          </DialogContent>
        </Dialog>

        <Toaster />
      </div>
    );
  }

  // RENDER EDITOR VIEW
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold">
                  {currentInvoice?.invoiceNumber || 'Invoice Baru'}
                </h1>
                <p className="text-xs text-muted-foreground hidden md:block">
                  {currentInvoice?.client.name || 'Klien belum dipilih'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Select 
                value={currentInvoice?.status || 'Draft'} 
                onValueChange={(v) => updateStatus(v as InvoiceStatus)}
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Sent">Terkirim</SelectItem>
                  <SelectItem value="Paid">Lunas</SelectItem>
                  <SelectItem value="Overdue">Jatuh Tempo</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleSave} className="gap-2">
                <Save className="h-4 w-4" />
                <span className="hidden sm:inline">Simpan</span>
              </Button>
              <Button onClick={handleExportPDF} className="gap-2">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export PDF</span>
              </Button>
            </div>
          </div>

          {/* Mobile Tabs */}
          <Tabs value={editorTab} onValueChange={(v) => setEditorTab(v as 'form' | 'preview')} className="mt-3 md:hidden">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="form">Form</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="container max-w-7xl mx-auto px-4 py-3">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside">
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Content */}
      <main className="container max-w-7xl mx-auto px-4 py-4 md:py-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Form Section */}
          <div className={cn("space-y-6", editorTab === 'preview' && 'hidden md:block')}>
            {/* Issuer Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Informasi Pengirim
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                      {currentInvoice?.issuer.logoBase64 ? (
                        <img 
                          src={currentInvoice.issuer.logoBase64} 
                          alt="Logo" 
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Building2 className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center cursor-pointer">
                      <Upload className="h-3 w-3" />
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleLogoUpload}
                      />
                    </label>
                    {currentInvoice?.issuer.logoBase64 && (
                      <button
                        onClick={() => updateIssuer({ logoBase64: '' })}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <Label className="text-xs">Nama Usaha *</Label>
                      <Input
                        value={currentInvoice?.issuer.name || ''}
                        onChange={(e) => updateIssuer({ name: e.target.value })}
                        placeholder="PT Contoh Perusahaan"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Alamat</Label>
                    <Input
                      value={currentInvoice?.issuer.address || ''}
                      onChange={(e) => updateIssuer({ address: e.target.value })}
                      placeholder="Jl. Contoh No. 123"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Email</Label>
                    <Input
                      type="email"
                      value={currentInvoice?.issuer.email || ''}
                      onChange={(e) => updateIssuer({ email: e.target.value })}
                      placeholder="email@perusahaan.com"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Telepon</Label>
                  <Input
                    value={currentInvoice?.issuer.phone || ''}
                    onChange={(e) => updateIssuer({ phone: e.target.value })}
                    placeholder="+62 812 3456 7890"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Client Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Informasi Klien
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Nama Klien/Perusahaan *</Label>
                  <Input
                    value={currentInvoice?.client.name || ''}
                    onChange={(e) => updateClient({ name: e.target.value })}
                    placeholder="PT Klien Contoh"
                  />
                </div>
                <div>
                  <Label className="text-xs">Alamat</Label>
                  <Input
                    value={currentInvoice?.client.address || ''}
                    onChange={(e) => updateClient({ address: e.target.value })}
                    placeholder="Alamat klien"
                  />
                </div>
                <div>
                  <Label className="text-xs">Email *</Label>
                  <Input
                    type="email"
                    value={currentInvoice?.client.email || ''}
                    onChange={(e) => updateClient({ email: e.target.value })}
                    placeholder="klien@email.com"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Invoice Meta */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Detail Invoice
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">Nomor Invoice *</Label>
                    <Input
                      value={currentInvoice?.invoiceNumber || ''}
                      onChange={(e) => updateCurrentInvoice({ invoiceNumber: e.target.value })}
                      placeholder="INV-001"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Tanggal Invoice *</Label>
                    <Input
                      type="date"
                      value={currentInvoice?.dates.issueDate || getTodayISO()}
                      onChange={(e) => updateDates({ issueDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Jatuh Tempo *</Label>
                    <Input
                      type="date"
                      value={currentInvoice?.dates.dueDate || getDefaultDueDate()}
                      onChange={(e) => updateDates({ dueDate: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Items */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileEdit className="h-4 w-4" />
                    Item/Jasa
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={addItem} className="gap-1">
                    <Plus className="h-4 w-4" />
                    Tambah
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {currentInvoice?.items.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <p className="mb-3">Belum ada item</p>
                    <Button variant="outline" size="sm" onClick={addItem}>
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Item
                    </Button>
                  </div>
                ) : (
                  <>
                    <ItemTableHeader />
                    <div className="border rounded-md p-2">
                      {currentInvoice?.items.map((item, index) => (
                        <ItemRow
                          key={item.id}
                          item={item}
                          index={index}
                          onUpdate={updateItem}
                          onRemove={removeItem}
                          canRemove={currentInvoice.items.length > 1}
                        />
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Ringkasan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">Diskon Invoice</Label>
                    <div className="flex gap-1">
                      <Input
                        type="number"
                        min={0}
                        value={currentInvoice?.summary.discountValue || ''}
                        onChange={(e) => updateDiscount(
                          currentInvoice?.summary.discountType || 'fixed',
                          parseFloat(e.target.value) || 0
                        )}
                        placeholder="0"
                      />
                      <Select
                        value={currentInvoice?.summary.discountType || 'fixed'}
                        onValueChange={(v) => updateDiscount(
                          v as 'fixed' | 'percentage',
                          currentInvoice?.summary.discountValue || 0
                        )}
                      >
                        <SelectTrigger className="w-16">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixed">Rp</SelectItem>
                          <SelectItem value="percentage">%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">PPN (%)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={currentInvoice?.summary.taxRate ?? 11}
                      onChange={(e) => updateTaxRate(parseFloat(e.target.value) || 0)}
                      placeholder="11"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Biaya Lainnya</Label>
                    <Input
                      type="number"
                      min={0}
                      value={currentInvoice?.summary.fee || ''}
                      onChange={(e) => updateFee(parseFloat(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatRupiah(currentInvoice?.summary.subTotal || 0)}</span>
                  </div>
                  {currentInvoice?.summary.discountValue ? (
                    <div className="flex justify-between text-green-600">
                      <span>Diskon</span>
                      <span>- {formatRupiah(currentInvoice.summary.discountAmount)}</span>
                    </div>
                  ) : null}
                  {currentInvoice?.summary.taxRate ? (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">PPN ({currentInvoice.summary.taxRate}%)</span>
                      <span>{formatRupiah(currentInvoice.summary.taxAmount)}</span>
                    </div>
                  ) : null}
                  {currentInvoice?.summary.fee ? (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Biaya</span>
                      <span>{formatRupiah(currentInvoice.summary.fee)}</span>
                    </div>
                  ) : null}
                  <Separator className="my-2" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Grand Total</span>
                    <span className="text-primary">{formatRupiah(currentInvoice?.summary.grandTotal || 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Informasi Pembayaran
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Metode Pembayaran</Label>
                  <Select
                    value={currentInvoice?.payment.method || 'bank_transfer'}
                    onValueChange={(v) => updatePayment({ method: v as 'bank_transfer' | 'e_wallet' | 'cash' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">Transfer Bank</SelectItem>
                      <SelectItem value="e_wallet">E-Wallet</SelectItem>
                      <SelectItem value="cash">Tunai</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {currentInvoice?.payment.method !== 'cash' && (
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs">Nama Bank/E-Wallet</Label>
                      <Input
                        value={currentInvoice?.payment.bankName || ''}
                        onChange={(e) => updatePayment({ bankName: e.target.value })}
                        placeholder="BCA / GoPay"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">No. Rekening</Label>
                      <Input
                        value={currentInvoice?.payment.accountNumber || ''}
                        onChange={(e) => updatePayment({ accountNumber: e.target.value })}
                        placeholder="1234567890"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Atas Nama</Label>
                      <Input
                        value={currentInvoice?.payment.accountName || ''}
                        onChange={(e) => updatePayment({ accountName: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes & Terms */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Catatan & Syarat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Catatan</Label>
                  <Textarea
                    value={currentInvoice?.notes || ''}
                    onChange={(e) => updateNotes(e.target.value)}
                    placeholder="Catatan untuk klien..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label className="text-xs">Syarat & Ketentuan</Label>
                  <Textarea
                    value={currentInvoice?.terms || ''}
                    onChange={(e) => updateTerms(e.target.value)}
                    placeholder="Syarat dan ketentuan pembayaran..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Section */}
          <div className={cn(
            "md:sticky md:top-24 md:self-start",
            editorTab === 'form' && 'hidden md:block'
          )}>
            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/50 py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Preview Invoice (A4)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-200px)]">
                  <div className="p-4 bg-gray-100">
                    <div className="scale-[0.5] origin-top-left w-[200%]">
                      <InvoicePreview ref={printRef} invoice={currentInvoice} />
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Bottom Nav */}
      <BottomNav currentPage="editor" onNavigate={setView} />

      <Toaster />
    </div>
  );
}
