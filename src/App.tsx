import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  BookmarkCheck,
  Check,
  Download,
  FilePlus2,
  Printer,
  RotateCcw,
} from 'lucide-react';
import { CatalogPanel } from './components/CatalogPanel';
import { CompanyProfilePanel } from './components/CompanyProfilePanel';
import { InvoicePreview } from './components/InvoicePreview';
import { OrderEditor } from './components/OrderEditor';
import { SavedInvoicesPanel } from './components/SavedInvoicesPanel';
import {
  calculateInvoiceTotals,
  createNewItem,
  createReferenceDraft,
  getTodayISO,
  incrementInvoiceNumber,
} from './data/defaults';
import {
  CatalogItem,
  CompanyProfile,
  InvoiceDraft,
  InvoiceItem,
  SavedInvoice,
} from './types/invoice';
import {
  loadActiveDraft,
  loadCatalogItems,
  loadCompanyProfile,
  loadSavedInvoices,
  saveActiveDraft,
  saveCatalogItems,
  saveCompanyProfile,
  saveSavedInvoices,
} from './utils/storage';

type WorkspaceTab = 'editor' | 'saved' | 'catalog' | 'profile';
type MobilePane = 'panel' | 'preview';

export default function App() {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('editor');
  const [mobilePane, setMobilePane] = useState<MobilePane>('panel');

  const [invoice, setInvoice] = useState<InvoiceDraft>(() => loadActiveDraft());
  const [profile, setProfile] = useState<CompanyProfile>(() =>
    loadCompanyProfile()
  );
  const [savedInvoices, setSavedInvoices] = useState<SavedInvoice[]>(() =>
    loadSavedInvoices()
  );
  const [catalog, setCatalog] = useState<CatalogItem[]>(() =>
    loadCatalogItems()
  );

  const [lastSavedTime, setLastSavedTime] = useState<string>(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Preview auto-scaling
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [fitScale, setFitScale] = useState(0.72);
  const [zoomMode, setZoomMode] = useState<'fit' | '75' | '100'>('fit');

  const notify = useCallback((message: string) => {
    setToastMessage(message);
    window.setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 2400);
  }, []);

  // Auto-save active draft
  useEffect(() => {
    saveActiveDraft(invoice);
    setLastSavedTime(
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  }, [invoice]);

  // Auto-save saved invoices library
  useEffect(() => {
    saveSavedInvoices(savedInvoices);
  }, [savedInvoices]);

  // Auto-save catalog
  useEffect(() => {
    saveCatalogItems(catalog);
  }, [catalog]);

  // Responsive A4 preview scaling
  useEffect(() => {
    const el = previewContainerRef.current;
    if (!el) return;

    const updateScale = () => {
      const availableWidth = Math.max(260, el.clientWidth - 48);
      const next = Math.min(0.84, availableWidth / 794);
      setFitScale(Number(next.toFixed(3)));
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(el);
    window.addEventListener('resize', updateScale);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, [mobilePane]);

  const effectiveScale =
    zoomMode === 'fit' ? fitScale : zoomMode === '75' ? 0.75 : 1;

  const upsertSavedInvoice = useCallback(
    (draftToSave: InvoiceDraft, profileToSave: CompanyProfile) => {
      const totals = calculateInvoiceTotals(draftToSave);
      const now = new Date().toISOString();
      setSavedInvoices((prev) => {
        const existingIndex = prev.findIndex(
          (item) => item.invoice.id === draftToSave.id
        );
        const record: SavedInvoice = {
          id:
            existingIndex >= 0
              ? prev[existingIndex].id
              : `saved-${draftToSave.id}`,
          invoice: draftToSave,
          profileSnapshot: profileToSave,
          grandTotal: totals.grandTotal,
          savedAt: now,
        };
        if (existingIndex >= 0) {
          const copy = [...prev];
          copy[existingIndex] = record;
          return copy;
        }
        return [record, ...prev];
      });
    },
    []
  );

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    try {
      const { generateInvoicePDF } = await import('./utils/pdfGenerator');
      await generateInvoicePDF(invoice, profile);
      upsertSavedInvoice(invoice, profile);
      notify(`Downloaded ${invoice.invoiceNumber || 'Invoice'}.pdf & saved`);
    } catch {
      notify('Could not generate the invoice PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveCopy = () => {
    upsertSavedInvoice(invoice, profile);
    notify(`Saved ${invoice.invoiceNumber || 'Invoice'} to Saved Invoices`);
  };

  const handleNewInvoice = () => {
    const nextNumber = incrementInvoiceNumber(invoice.invoiceNumber || 'INV-5043');
    const fresh: InvoiceDraft = {
      id: `inv-${Date.now()}`,
      invoiceNumber: nextNumber,
      dateISO: getTodayISO(),
      customerName: '',
      customerCity: '',
      customerPhone: '',
      items: [createNewItem('', 0)],
      discountType: 'percent',
      discountValue: 0,
      deliveryCharges: 0,
      taxPercent: 0,
      isPaid: false,
      thankYouText: profile.defaultThankYouText,
      notes: '',
      updatedAt: new Date().toISOString(),
    };
    setInvoice(fresh);
    setActiveTab('editor');
    setMobilePane('panel');
    notify(`Started new invoice ${nextNumber}`);
  };

  const handleResetReferenceSample = () => {
    setInvoice(createReferenceDraft());
    setActiveTab('editor');
    setMobilePane('panel');
    notify('Loaded TKM reference invoice (INV-5043)');
  };

  const handleLoadSaved = (saved: SavedInvoice) => {
    setInvoice({
      ...saved.invoice,
      updatedAt: new Date().toISOString(),
    });
    setActiveTab('editor');
    setMobilePane('panel');
    notify(`Loaded ${saved.invoice.invoiceNumber}`);
  };

  const handleDuplicateSaved = (saved: SavedInvoice) => {
    const nextNumber = incrementInvoiceNumber(
      saved.invoice.invoiceNumber || invoice.invoiceNumber
    );
    setInvoice({
      ...saved.invoice,
      id: `inv-${Date.now()}`,
      invoiceNumber: nextNumber,
      dateISO: getTodayISO(),
      items: saved.invoice.items.map((item) => ({
        ...item,
        id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      })),
      updatedAt: new Date().toISOString(),
    });
    setActiveTab('editor');
    setMobilePane('panel');
    notify(`Duplicated as ${nextNumber}`);
  };

  const handleDeleteSaved = (id: string) => {
    setSavedInvoices((prev) => prev.filter((item) => item.id !== id));
    notify('Removed saved invoice');
  };

  const handleImportInvoices = (imported: SavedInvoice[]) => {
    setSavedInvoices((prev) => {
      const existingIds = new Set(prev.map((x) => x.id));
      const merged = [...prev];
      for (const item of imported) {
        if (!existingIds.has(item.id)) {
          merged.push(item);
          existingIds.add(item.id);
        }
      }
      return merged;
    });
    notify(`Restored ${imported.length} invoice(s)`);
  };

  const handleSaveItemToCatalog = (item: InvoiceItem) => {
    setCatalog((prev) => {
      const exists = prev.some(
        (c) => c.name.trim().toLowerCase() === item.name.trim().toLowerCase()
      );
      if (exists) {
        return prev.map((c) =>
          c.name.trim().toLowerCase() === item.name.trim().toLowerCase()
            ? { ...c, defaultPrice: item.price }
            : c
        );
      }
      return [
        {
          id: `cat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: item.name.trim(),
          defaultPrice: item.price,
        },
        ...prev,
      ];
    });
  };

  const handleAddCatalogItemToOrder = (cat: CatalogItem) => {
    setInvoice((prev) => ({
      ...prev,
      items: [...prev.items, createNewItem(cat.name, cat.defaultPrice)],
      updatedAt: new Date().toISOString(),
    }));
    setActiveTab('editor');
    notify(`Added ${cat.name}`);
  };

  const navTabs: { id: WorkspaceTab; label: string }[] = [
    { id: 'editor', label: 'Order Details' },
    {
      id: 'saved',
      label:
        savedInvoices.length > 0
          ? `Saved Invoices (${savedInvoices.length})`
          : 'Saved Invoices',
    },
    { id: 'catalog', label: 'Catalog' },
    { id: 'profile', label: 'Company Profile' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F8] text-slate-900">
      {/* Top Bar: 3-Zone Contract */}
      <header className="no-print sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Title */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('editor');
            setMobilePane('panel');
          }}
          className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          Invoice Studio
        </a>

        {/* Zone 2: Clean Single-Line Nav Links */}
        <nav
          aria-label="Workspace navigation"
          className="hidden md:flex items-center gap-7 h-full"
        >
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative h-full inline-flex items-center text-sm font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  isActive
                    ? 'text-slate-900'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute inset-x-0 bottom-0 h-[2px] bg-[#0E7C86]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary CTA */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="h-10 px-4 text-sm font-semibold text-white bg-[#0E7C86] hover:bg-[#0B666F] disabled:opacity-60 rounded-md transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      </header>

      {/* Mobile Navigation & Pane Toggle */}
      <div className="no-print md:hidden bg-white border-b border-slate-200 px-4 py-2 space-y-2">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobilePane('panel');
                }}
                className={`py-1.5 text-xs font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors ${
                  isActive
                    ? 'border-[#0E7C86] text-slate-900'
                    : 'border-transparent text-slate-500'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 p-0.5 bg-slate-100 rounded-md">
          <button
            type="button"
            onClick={() => setMobilePane('panel')}
            className={`h-8 text-xs font-medium rounded transition-colors ${
              mobilePane === 'panel'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600'
            }`}
          >
            Edit Order
          </button>
          <button
            type="button"
            onClick={() => setMobilePane('preview')}
            className={`h-8 text-xs font-medium rounded transition-colors ${
              mobilePane === 'preview'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600'
            }`}
          >
            Invoice Preview
          </button>
        </div>
      </div>

      {/* Workspace Action Toolbar */}
      <div className="no-print bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Check className="w-3.5 h-3.5 text-[#0E7C86] shrink-0" />
          <span className="tabular-nums">
            Auto-saved locally · {lastSavedTime}
          </span>
          {toastMessage && (
            <>
              <span aria-hidden="true">·</span>
              <span className="font-medium text-slate-800">{toastMessage}</span>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleNewInvoice}
            className="h-8 px-3 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <FilePlus2 className="w-3.5 h-3.5" />
            New Invoice
          </button>
          <button
            type="button"
            onClick={() => {
              const nextPaid = !invoice.isPaid;
              setInvoice((prev) => ({
                ...prev,
                isPaid: nextPaid,
                updatedAt: new Date().toISOString(),
              }));
              notify(
                nextPaid
                  ? 'Marked as PAID — stamp shown & payment details hidden'
                  : 'Marked as Unpaid — payment details restored'
              );
            }}
            className={`h-8 px-3 text-xs font-medium rounded border transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              invoice.isPaid
                ? 'text-red-700 bg-red-50 border-red-300 hover:bg-red-100'
                : 'text-slate-700 bg-white border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            {invoice.isPaid ? 'Paid Invoice' : 'Mark Paid'}
          </button>
          <button
            type="button"
            onClick={handleSaveCopy}
            className="h-8 px-3 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <BookmarkCheck className="w-3.5 h-3.5" />
            Save Copy
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="h-8 px-3 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </button>
          <button
            type="button"
            onClick={handleResetReferenceSample}
            className="h-8 px-3 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Load Sample
          </button>
        </div>
      </div>

      {/* Main Split Workbench */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 max-w-[1600px] w-full mx-auto">
        {/* Left Pane: Order / Library / Catalog / Profile */}
        <div
          className={`no-print lg:col-span-5 xl:col-span-5 bg-white border-r border-slate-200 ${
            mobilePane === 'panel' ? 'block' : 'hidden md:block'
          }`}
        >
          {activeTab === 'editor' && (
            <OrderEditor
              invoice={invoice}
              profile={profile}
              catalog={catalog}
              onChange={setInvoice}
              onSaveItemToCatalog={handleSaveItemToCatalog}
            />
          )}

          {activeTab === 'saved' && (
            <SavedInvoicesPanel
              savedInvoices={savedInvoices}
              activeInvoiceId={invoice.id}
              profile={profile}
              onSaveCurrent={handleSaveCopy}
              onLoadInvoice={handleLoadSaved}
              onDuplicateInvoice={handleDuplicateSaved}
              onDownloadSavedPdf={async (entry) => {
                try {
                  const { generateInvoicePDF } = await import('./utils/pdfGenerator');
                  await generateInvoicePDF(
                    entry.invoice,
                    entry.profileSnapshot || profile
                  );
                  notify(`Downloaded ${entry.invoice.invoiceNumber}.pdf`);
                } catch {
                  notify('Could not generate the invoice PDF. Please try again.');
                }
              }}
              onDeleteInvoice={handleDeleteSaved}
              onImportInvoices={handleImportInvoices}
            />
          )}

          {activeTab === 'catalog' && (
            <CatalogPanel
              catalog={catalog}
              profile={profile}
              onChangeCatalog={setCatalog}
              onAddToInvoice={handleAddCatalogItemToOrder}
            />
          )}

          {activeTab === 'profile' && (
            <CompanyProfilePanel
              profile={profile}
              onSave={() => saveCompanyProfile(profile)}
              onChange={(updatedProfile) => {
                if (
                  updatedProfile.defaultThankYouText !==
                  profile.defaultThankYouText
                ) {
                  setInvoice((prev) => ({
                    ...prev,
                    thankYouText: updatedProfile.defaultThankYouText,
                    updatedAt: new Date().toISOString(),
                  }));
                }
                setProfile(updatedProfile);
              }}
            />
          )}
        </div>

        {/* Right Pane: Live A4 Invoice Sheet Preview */}
        <div
          ref={previewContainerRef}
          className={`invoice-preview-pane lg:col-span-7 xl:col-span-7 min-w-0 p-4 sm:p-6 lg:p-8 flex-col items-center-safe overflow-x-auto ${
            mobilePane === 'preview' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {/* Preview Controls Bar */}
          <div className="no-print w-full max-w-[700px] mb-4 flex items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              Live A4 Preview ·{' '}
              <span className="font-mono-num text-slate-700 font-medium">
                {invoice.invoiceNumber || 'INV-0001'}
              </span>
            </div>

            <div className="flex items-center gap-1 p-0.5 bg-white border border-slate-200 rounded-md">
              {(
                [
                  { id: 'fit', label: 'Fit' },
                  { id: '75', label: '75%' },
                  { id: '100', label: '100%' },
                ] as const
              ).map((z) => (
                <button
                  key={z.id}
                  type="button"
                  onClick={() => setZoomMode(z.id)}
                  className={`px-2.5 h-7 text-xs font-medium rounded transition-colors cursor-pointer ${
                    zoomMode === z.id
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {z.label}
                </button>
              ))}
            </div>
          </div>

          {/* A4 Sheet */}
          <div className="pb-10">
            <InvoicePreview
              invoice={invoice}
              profile={profile}
              scale={effectiveScale}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
