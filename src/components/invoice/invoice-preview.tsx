// Invoice Preview Component - A4 Layout for Print/PDF

'use client';

import { forwardRef } from 'react';
import { Invoice } from '@/types/invoice';
import { formatRupiah } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import { Separator } from '@/components/ui/separator';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Building2,
  Calendar,
  Clock,
  CreditCard,
  Banknote
} from 'lucide-react';

interface InvoicePreviewProps {
  invoice: Invoice | null;
  className?: string;
}

export const InvoicePreview = forwardRef<HTMLDivElement, InvoicePreviewProps>(
  ({ invoice, className }, ref) => {
    if (!invoice) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <p>Preview invoice akan muncul di sini</p>
        </div>
      );
    }

    const { issuer, client, dates, items, summary, notes, terms, payment } = invoice;
    const paymentMethodLabels: Record<string, string> = {
      bank_transfer: 'Transfer Bank',
      e_wallet: 'E-Wallet',
      cash: 'Tunai',
    };

    return (
      <div 
        ref={ref} 
        data-invoice-preview
        className={className}
        style={{
          width: '210mm',
          minHeight: '297mm',
          padding: '15mm',
          backgroundColor: 'white',
          color: '#1f2937',
          fontFamily: 'Arial, sans-serif',
          fontSize: '11pt',
          lineHeight: 1.5,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8mm' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4mm' }}>
            {issuer.logoBase64 ? (
              <img 
                src={issuer.logoBase64} 
                alt="Logo" 
                style={{ width: '20mm', height: '20mm', objectFit: 'contain' }} 
              />
            ) : (
              <div 
                style={{ 
                  width: '20mm', 
                  height: '20mm', 
                  backgroundColor: '#f3f4f6',
                  borderRadius: '2mm',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '8pt',
                  color: '#9ca3af'
                }}
              >
                Logo
              </div>
            )}
            <div>
              <h1 style={{ fontSize: '16pt', fontWeight: 'bold', margin: 0, color: '#111827' }}>
                {issuer.name || 'Nama Usaha'}
              </h1>
              <p style={{ fontSize: '9pt', margin: 0, color: '#6b7280' }}>{issuer.address}</p>
              <p style={{ fontSize: '9pt', margin: 0, color: '#6b7280' }}>
                {issuer.email}{issuer.phone && ` • ${issuer.phone}`}
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ fontSize: '24pt', fontWeight: 'bold', margin: 0, color: '#1f2937' }}>
              INVOICE
            </h2>
            <p style={{ fontSize: '11pt', fontWeight: '600', margin: '2mm 0 0 0' }}>
              {invoice.invoiceNumber}
            </p>
          </div>
        </div>

        <Separator style={{ marginBottom: '6mm' }} />

        {/* Client & Dates Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6mm' }}>
          <div style={{ width: '48%' }}>
            <h3 style={{ fontSize: '10pt', fontWeight: '600', color: '#6b7280', marginBottom: '2mm' }}>
              TAGIHAN KEPADA:
            </h3>
            <p style={{ fontSize: '12pt', fontWeight: '600', margin: '0 0 1mm 0' }}>{client.name}</p>
            <p style={{ fontSize: '10pt', margin: 0, color: '#4b5563' }}>{client.address}</p>
            <p style={{ fontSize: '10pt', margin: 0, color: '#4b5563' }}>{client.email}</p>
          </div>
          <div style={{ width: '48%', textAlign: 'right' }}>
            <div style={{ marginBottom: '2mm' }}>
              <span style={{ fontSize: '10pt', color: '#6b7280' }}>Tanggal Invoice: </span>
              <span style={{ fontSize: '10pt', fontWeight: '600' }}>{formatDate(dates.issueDate)}</span>
            </div>
            <div style={{ marginBottom: '2mm' }}>
              <span style={{ fontSize: '10pt', color: '#6b7280' }}>Jatuh Tempo: </span>
              <span style={{ fontSize: '10pt', fontWeight: '600' }}>{formatDate(dates.dueDate)}</span>
            </div>
            <div>
              <span style={{ fontSize: '10pt', color: '#6b7280' }}>Status: </span>
              <span style={{ 
                fontSize: '10pt', 
                fontWeight: '600',
                padding: '1mm 3mm',
                borderRadius: '1mm',
                backgroundColor: 
                  invoice.status === 'Paid' ? '#dcfce7' :
                  invoice.status === 'Sent' ? '#dbeafe' :
                  invoice.status === 'Overdue' ? '#fee2e2' : '#f3f4f6',
                color: 
                  invoice.status === 'Paid' ? '#16a34a' :
                  invoice.status === 'Sent' ? '#2563eb' :
                  invoice.status === 'Overdue' ? '#dc2626' : '#4b5563'
              }}>
                {invoice.status === 'Draft' ? 'Draft' :
                 invoice.status === 'Sent' ? 'Terkirim' :
                 invoice.status === 'Paid' ? 'Lunas' : 'Jatuh Tempo'}
              </span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse', 
          marginBottom: '6mm',
          fontSize: '10pt'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6' }}>
              <th style={{ padding: '3mm', textAlign: 'left', borderBottom: '1px solid #e5e7eb', width: '8%' }}>No</th>
              <th style={{ padding: '3mm', textAlign: 'left', borderBottom: '1px solid #e5e7eb', width: '40%' }}>Deskripsi</th>
              <th style={{ padding: '3mm', textAlign: 'center', borderBottom: '1px solid #e5e7eb', width: '10%' }}>Qty</th>
              <th style={{ padding: '3mm', textAlign: 'right', borderBottom: '1px solid #e5e7eb', width: '18%' }}>Harga Satuan</th>
              <th style={{ padding: '3mm', textAlign: 'right', borderBottom: '1px solid #e5e7eb', width: '12%' }}>Diskon</th>
              <th style={{ padding: '3mm', textAlign: 'right', borderBottom: '1px solid #e5e7eb', width: '12%' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id}>
                <td style={{ padding: '2.5mm', borderBottom: '1px solid #f3f4f6' }}>{index + 1}</td>
                <td style={{ padding: '2.5mm', borderBottom: '1px solid #f3f4f6' }}>
                  {item.description || '-'}
                  {(item.discountValue > 0 || item.taxRate > 0) && (
                    <div style={{ fontSize: '8pt', color: '#6b7280' }}>
                      {item.discountValue > 0 && (
                        <span>Diskon: {item.discountType === 'percentage' ? `${item.discountValue}%` : formatRupiah(item.discountValue)}</span>
                      )}
                      {item.taxRate > 0 && (
                        <span> | Pajak: {item.taxRate}%</span>
                      )}
                    </div>
                  )}
                </td>
                <td style={{ padding: '2.5mm', textAlign: 'center', borderBottom: '1px solid #f3f4f6' }}>{item.qty}</td>
                <td style={{ padding: '2.5mm', textAlign: 'right', borderBottom: '1px solid #f3f4f6' }}>{formatRupiah(item.unitPrice)}</td>
                <td style={{ padding: '2.5mm', textAlign: 'right', borderBottom: '1px solid #f3f4f6' }}>
                  {item.discountValue > 0 
                    ? (item.discountType === 'percentage' ? `${item.discountValue}%` : formatRupiah(item.discountValue))
                    : '-'}
                </td>
                <td style={{ padding: '2.5mm', textAlign: 'right', borderBottom: '1px solid #f3f4f6', fontWeight: '500' }}>
                  {formatRupiah(item.lineTotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '6mm' }}>
          <div style={{ width: '55%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5mm 0' }}>
              <span style={{ color: '#6b7280' }}>Subtotal</span>
              <span>{formatRupiah(summary.subTotal)}</span>
            </div>
            
            {summary.discountValue > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5mm 0', color: '#16a34a' }}>
                <span>
                  Diskon {summary.discountType === 'percentage' ? `(${summary.discountValue}%)` : ''}
                </span>
                <span>- {formatRupiah(summary.discountAmount)}</span>
              </div>
            )}
            
            {summary.taxRate > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5mm 0' }}>
                <span>PPN ({summary.taxRate}%)</span>
                <span>{formatRupiah(summary.taxAmount)}</span>
              </div>
            )}
            
            {summary.fee > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5mm 0' }}>
                <span>Biaya Lainnya</span>
                <span>{formatRupiah(summary.fee)}</span>
              </div>
            )}
            
            <Separator style={{ margin: '3mm 0' }} />
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '3mm 0',
              fontSize: '14pt',
              fontWeight: 'bold',
              backgroundColor: '#f3f4f6',
              paddingInline: '3mm',
              borderRadius: '1mm'
            }}>
              <span>TOTAL</span>
              <span style={{ color: '#1f2937' }}>{formatRupiah(summary.grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div style={{ 
          backgroundColor: '#f8fafc', 
          padding: '4mm', 
          borderRadius: '2mm',
          marginBottom: '6mm'
        }}>
          <h3 style={{ fontSize: '10pt', fontWeight: '600', color: '#6b7280', marginBottom: '2mm' }}>
            INFORMASI PEMBAYARAN
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2mm' }}>
            <div>
              <span style={{ fontSize: '9pt', color: '#6b7280' }}>Metode: </span>
              <span style={{ fontSize: '10pt', fontWeight: '500' }}>{paymentMethodLabels[payment.method]}</span>
            </div>
            {payment.method !== 'cash' && (
              <>
                <div>
                  <span style={{ fontSize: '9pt', color: '#6b7280' }}>Bank: </span>
                  <span style={{ fontSize: '10pt', fontWeight: '500' }}>{payment.bankName}</span>
                </div>
                <div>
                  <span style={{ fontSize: '9pt', color: '#6b7280' }}>No. Rekening: </span>
                  <span style={{ fontSize: '10pt', fontWeight: '500' }}>{payment.accountNumber}</span>
                </div>
                <div>
                  <span style={{ fontSize: '9pt', color: '#6b7280' }}>Atas Nama: </span>
                  <span style={{ fontSize: '10pt', fontWeight: '500' }}>{payment.accountName}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Notes & Terms */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4mm' }}>
          {notes && (
            <div>
              <h3 style={{ fontSize: '10pt', fontWeight: '600', color: '#6b7280', marginBottom: '2mm' }}>
                CATATAN
              </h3>
              <p style={{ fontSize: '9pt', color: '#4b5563', margin: 0, whiteSpace: 'pre-wrap' }}>{notes}</p>
            </div>
          )}
          {terms && (
            <div>
              <h3 style={{ fontSize: '10pt', fontWeight: '600', color: '#6b7280', marginBottom: '2mm' }}>
                SYARAT & KETENTUAN
              </h3>
              <p style={{ fontSize: '9pt', color: '#4b5563', margin: 0, whiteSpace: 'pre-wrap' }}>{terms}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ 
          marginTop: '8mm', 
          textAlign: 'center', 
          fontSize: '8pt', 
          color: '#9ca3af',
          borderTop: '1px solid #e5e7eb',
          paddingTop: '3mm'
        }}>
          <p style={{ margin: 0 }}>Invoice ini dibuat secara elektronik dan sah tanpa tanda tangan.</p>
          <p style={{ margin: 0 }}>Dibuat pada: {formatDate(invoice.createdAt, 'dd MMMM yyyy HH:mm')}</p>
        </div>
      </div>
    );
  }
);

InvoicePreview.displayName = 'InvoicePreview';
