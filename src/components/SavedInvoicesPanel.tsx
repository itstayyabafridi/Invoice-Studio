import React, { useMemo, useRef, useState } from 'react';
import {
  Copy,
  Download,
  FileDown,
  FolderOpen,
  Search,
  Trash2,
  Upload,
} from 'lucide-react';
import { formatInvoiceDate, formatMoney } from '../data/defaults';
import { CompanyProfile, SavedInvoice } from '../types/invoice';

interface SavedInvoicesPanelProps {
  savedInvoices: SavedInvoice[];
  activeInvoiceId: string;
  profile: CompanyProfile;
  onSaveCurrent: () => void;
  onLoadInvoice: (saved: SavedInvoice) => void;
  onDuplicateInvoice: (saved: SavedInvoice) => void;
  onDownloadSavedPdf: (saved: SavedInvoice) => void;
  onDeleteInvoice: (id: string) => void;
  onImportInvoices: (imported: SavedInvoice[]) => void;
}

export const SavedInvoicesPanel: React.FC<SavedInvoicesPanelProps> = ({
  savedInvoices,
  activeInvoiceId,
  profile,
  onSaveCurrent,
  onLoadInvoice,
  onDuplicateInvoice,
  onDownloadSavedPdf,
  onDeleteInvoice,
  onImportInvoices,
}) => {
  const [query, setQuery] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return savedInvoices;
    return savedInvoices.filter(
      (entry) =>
        entry.invoice.invoiceNumber.toLowerCase().includes(q) ||
        entry.invoice.customerName.toLowerCase().includes(q) ||
        entry.invoice.customerCity.toLowerCase().includes(q)
    );
  }, [savedInvoices, query]);

  const handleExportBackup = () => {
    const blob = new Blob([JSON.stringify(savedInvoices, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `saved-invoices-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!Array.isArray(parsed)) {
          setImportError('Invalid backup format. Expected a JSON array.');
          return;
        }
        const valid = parsed.filter(
          (item) =>
            item &&
            typeof item.id === 'string' &&
            item.invoice &&
            Array.isArray(item.invoice.items)
        ) as SavedInvoice[];
        onImportInvoices(valid);
      } catch {
        setImportError('Could not parse backup file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Saved Invoices
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Stored in your browser for future reuse, duplication, or PDF export.
          </p>
        </div>

        <button
          type="button"
          onClick={onSaveCurrent}
          className="h-9 px-3.5 text-xs font-semibold text-white bg-[#0E7C86] hover:bg-[#0B666F] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Save Current
        </button>
      </div>

      {/* Search & Backup Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by invoice #, customer, or city..."
            className="w-full h-9 pl-9 pr-3 text-sm bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/25 focus:border-[#0E7C86]"
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleExportBackup}
            disabled={savedInvoices.length === 0}
            className="h-9 px-3 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-40 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5" />
            Backup
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-9 px-3 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            Restore
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleImportFile}
            className="hidden"
          />
        </div>
      </div>

      {importError && (
        <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md">
          {importError}
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="py-12 px-4 text-center border border-dashed border-slate-300 rounded-md bg-slate-50/50">
          <p className="text-sm font-medium text-slate-800">
            {savedInvoices.length === 0
              ? 'No saved invoices yet'
              : 'No matching invoices found'}
          </p>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            {savedInvoices.length === 0
              ? 'Click "Save Current" or download a PDF to archive an invoice for future reference.'
              : 'Try clearing your search query to see all saved records.'}
          </p>
          {savedInvoices.length === 0 && (
            <button
              type="button"
              onClick={onSaveCurrent}
              className="mt-4 h-9 px-4 text-xs font-semibold text-white bg-[#0E7C86] hover:bg-[#0B666F] rounded-md transition-colors cursor-pointer"
            >
              Save Current Invoice
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-slate-200 border border-slate-200 rounded-md bg-white overflow-hidden">
          {filtered.map((entry) => {
            const isCurrent = entry.invoice.id === activeInvoiceId;
            return (
              <div
                key={entry.id}
                className={`p-3.5 transition-colors ${
                  isCurrent ? 'bg-[#0E7C86]/[0.04]' : 'hover:bg-slate-50/80'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 font-mono-num">
                        {entry.invoice.invoiceNumber}
                      </span>
                      {entry.invoice.isPaid && (
                        <span className="text-[11px] font-semibold text-red-600">
                          · Paid
                        </span>
                      )}
                      {isCurrent && (
                        <span className="text-[11px] font-medium text-[#0E7C86]">
                          · Active
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5 truncate">
                      {entry.invoice.customerName || 'Unnamed Customer'}
                      {entry.invoice.customerCity
                        ? ` · ${entry.invoice.customerCity}`
                        : ''}
                      {' · '}
                      {formatInvoiceDate(entry.invoice.dateISO)}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-slate-900 font-mono-num">
                      {formatMoney(entry.grandTotal, entry.profileSnapshot || profile)}
                    </div>
                    <div className="text-[11px] text-slate-500 tabular-nums">
                      {entry.invoice.items.length}{' '}
                      {entry.invoice.items.length === 1 ? 'item' : 'items'}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onLoadInvoice(entry)}
                    className="h-8 px-2.5 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    Load
                  </button>
                  <button
                    type="button"
                    onClick={() => onDuplicateInvoice(entry)}
                    className="h-8 px-2.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Duplicate
                  </button>
                  <button
                    type="button"
                    onClick={() => onDownloadSavedPdf(entry)}
                    className="h-8 px-2.5 text-xs font-medium text-[#0E7C86] bg-white border border-[#0E7C86]/30 hover:bg-[#0E7C86]/5 rounded transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteInvoice(entry.id)}
                    title="Delete saved invoice"
                    className="ml-auto h-8 w-8 inline-flex items-center justify-center text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
