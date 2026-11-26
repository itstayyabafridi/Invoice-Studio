import React, { useEffect, useState } from 'react';
import {
  BookmarkPlus,
  ChevronDown,
  Hash,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  calculateInvoiceTotals,
  createNewItem,
  formatMoney,
  incrementInvoiceNumber,
} from '../data/defaults';
import {
  CatalogItem,
  CompanyProfile,
  DiscountType,
  InvoiceDraft,
  InvoiceItem,
} from '../types/invoice';
import { getCleanPaidStampDataUrl } from '../utils/paidStamp';

interface OrderEditorProps {
  invoice: InvoiceDraft;
  profile: CompanyProfile;
  catalog: CatalogItem[];
  onChange: (updated: InvoiceDraft) => void;
  onSaveItemToCatalog: (item: InvoiceItem) => void;
}

export const OrderEditor: React.FC<OrderEditorProps> = ({
  invoice,
  profile,
  catalog,
  onChange,
  onSaveItemToCatalog,
}) => {
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [savedNoticeId, setSavedNoticeId] = useState<string | null>(null);
  const [paidStampPreview, setPaidStampPreview] = useState<string | null>(null);
  const totals = calculateInvoiceTotals(invoice);

  useEffect(() => {
    let active = true;
    getCleanPaidStampDataUrl().then((url) => {
      if (active) setPaidStampPreview(url);
    });
    return () => {
      active = false;
    };
  }, []);

  const updateField = <K extends keyof InvoiceDraft>(
    key: K,
    value: InvoiceDraft[K]
  ) => {
    onChange({
      ...invoice,
      [key]: value,
      updatedAt: new Date().toISOString(),
    });
  };

  const updateItem = (
    id: string,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    const nextItems = invoice.items.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    updateField('items', nextItems);
  };

  const removeItem = (id: string) => {
    updateField(
      'items',
      invoice.items.filter((item) => item.id !== id)
    );
  };

  const addEmptyItem = () => {
    updateField('items', [...invoice.items, createNewItem('', 0)]);
  };

  const addCatalogItem = (cat: CatalogItem) => {
    updateField('items', [
      ...invoice.items,
      createNewItem(cat.name, cat.defaultPrice),
    ]);
    setCatalogOpen(false);
  };

  const handleBookmarkItem = (item: InvoiceItem) => {
    if (!item.name.trim()) return;
    onSaveItemToCatalog(item);
    setSavedNoticeId(item.id);
    window.setTimeout(() => setSavedNoticeId(null), 1600);
  };

  return (
    <div className="divide-y divide-slate-200">
      {/* Section 1: Document Metadata */}
      <section className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
            Invoice Metadata
          </h2>
          <span className="text-xs text-slate-500">Auto-saved locally</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="invoice-number"
              className="block text-xs font-medium text-slate-700 mb-1.5"
            >
              Invoice Number
            </label>
            <div className="flex">
              <input
                id="invoice-number"
                type="text"
                value={invoice.invoiceNumber}
                onChange={(e) => updateField('invoiceNumber', e.target.value)}
                placeholder="INV-5043"
                className="w-full h-10 px-3 text-sm font-mono-num bg-white border border-slate-300 rounded-l-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/25 focus:border-[#0E7C86]"
              />
              <button
                type="button"
                onClick={() =>
                  updateField(
                    'invoiceNumber',
                    incrementInvoiceNumber(invoice.invoiceNumber)
                  )
                }
                title="Increment invoice number"
                className="px-3 h-10 bg-slate-50 border border-l-0 border-slate-300 rounded-r-md text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Hash className="w-3.5 h-3.5" />
                Next
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="invoice-date"
              className="block text-xs font-medium text-slate-700 mb-1.5"
            >
              Issue Date
            </label>
            <input
              id="invoice-date"
              type="date"
              value={invoice.dateISO}
              onChange={(e) => updateField('dateISO', e.target.value)}
              className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/25 focus:border-[#0E7C86]"
            />
          </div>
        </div>

        {/* Paid Invoice Stamp Option */}
        <div className="pt-1">
          <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-md">
            <div className="flex items-center gap-3 min-w-0">
              {paidStampPreview && (
                <img
                  src={paidStampPreview}
                  alt="PAID stamp preview"
                  className={`w-12 h-auto shrink-0 transition-opacity ${
                    invoice.isPaid ? 'opacity-100' : 'opacity-35 grayscale'
                  }`}
                />
              )}
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-900">
                  Paid Invoice Stamp
                </div>
                <p className="text-[11px] text-slate-500">
                  Shows the red PAID stamp and hides payment account details on the preview and PDF.
                </p>
              </div>
            </div>

            <div className="flex p-0.5 bg-slate-200/80 rounded-md shrink-0">
              <button
                type="button"
                onClick={() => updateField('isPaid', false)}
                className={`px-3 h-8 text-xs font-medium rounded transition-colors cursor-pointer ${
                  !invoice.isPaid
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Unpaid
              </button>
              <button
                type="button"
                onClick={() => updateField('isPaid', true)}
                className={`px-3 h-8 text-xs font-semibold rounded transition-colors cursor-pointer ${
                  invoice.isPaid
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Paid
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Customer Details */}
      <section className="p-6 space-y-4">
        <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
          Customer Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="customer-name"
              className="block text-xs font-medium text-slate-700 mb-1.5"
            >
              Customer Name
            </label>
            <input
              id="customer-name"
              type="text"
              value={invoice.customerName}
              onChange={(e) => updateField('customerName', e.target.value)}
              placeholder="Furqan Hassan"
              className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/25 focus:border-[#0E7C86]"
            />
          </div>

          <div>
            <label
              htmlFor="customer-city"
              className="block text-xs font-medium text-slate-700 mb-1.5"
            >
              City
            </label>
            <input
              id="customer-city"
              type="text"
              value={invoice.customerCity}
              onChange={(e) => updateField('customerCity', e.target.value)}
              placeholder="Peshawar"
              className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/25 focus:border-[#0E7C86]"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="customer-phone"
            className="block text-xs font-medium text-slate-700 mb-1.5"
          >
            Phone (Optional)
          </label>
          <input
            id="customer-phone"
            type="text"
            value={invoice.customerPhone}
            onChange={(e) => updateField('customerPhone', e.target.value)}
            placeholder="Leave blank to omit from invoice"
            className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/25 focus:border-[#0E7C86]"
          />
        </div>
      </section>

      {/* Section 3: Product Details */}
      <section className="p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
            Product Details
          </h2>

          {catalog.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setCatalogOpen((prev) => !prev)}
                className="h-8 px-3 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Quick Add from Catalog
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {catalogOpen && (
                <div className="absolute right-0 mt-1.5 w-72 bg-white border border-slate-200 rounded-md shadow-lg z-30 py-1 max-h-64 overflow-y-auto">
                  {catalog.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => addCatalogItem(cat)}
                      className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between gap-2 text-xs transition-colors cursor-pointer"
                    >
                      <span className="font-medium text-slate-800 truncate">
                        {cat.name}
                      </span>
                      <span className="font-mono-num text-slate-500 shrink-0">
                        {formatMoney(cat.defaultPrice, profile)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-3">
          {invoice.items.length === 0 ? (
            <div className="py-8 px-4 text-center border border-dashed border-slate-300 rounded-md bg-slate-50/50">
              <p className="text-sm text-slate-600 mb-3">
                No items in this order yet.
              </p>
              <button
                type="button"
                onClick={addEmptyItem}
                className="h-9 px-4 text-xs font-medium text-white bg-[#0E7C86] hover:bg-[#0B666F] rounded-md transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add First Item
              </button>
            </div>
          ) : (
            invoice.items.map((item, idx) => {
              const lineAmount = (item.quantity || 0) * (item.price || 0);
              const isJustSaved = savedNoticeId === item.id;
              return (
                <div
                  key={item.id}
                  className="p-3 bg-slate-50/70 border border-slate-200 rounded-md space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Product Name {invoice.items.length > 1 ? `#${idx + 1}` : ''}
                      </label>
                      <input
                        type="text"
                        aria-label="Product Name"
                        value={item.name}
                        onChange={(e) =>
                          updateItem(item.id, 'name', e.target.value)
                        }
                        placeholder="e.g. Muslim Shower (Gray)"
                        className="w-full h-9 px-2.5 text-sm bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/25 focus:border-[#0E7C86]"
                      />
                    </div>

                    <div className="flex items-center gap-1 pt-5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleBookmarkItem(item)}
                        title="Save item to catalog for future orders"
                        className="w-8 h-9 inline-flex items-center justify-center rounded text-slate-500 hover:text-[#0E7C86] hover:bg-white transition-colors cursor-pointer"
                      >
                        <BookmarkPlus className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        title="Remove item"
                        className="w-8 h-9 inline-flex items-center justify-center rounded text-slate-500 hover:text-red-600 hover:bg-white transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={1}
                        aria-label="Quantity"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            'quantity',
                            e.target.value === '' ? 0 : Number(e.target.value)
                          )
                        }
                        className="w-full h-9 px-2 text-sm text-center font-mono-num bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/25 focus:border-[#0E7C86]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Unit Price
                      </label>
                      <input
                        type="number"
                        min={0}
                        step="any"
                        aria-label="Unit Price"
                        value={item.price}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            'price',
                            e.target.value === '' ? 0 : Number(e.target.value)
                          )
                        }
                        className="w-full h-9 px-2.5 text-sm text-right font-mono-num bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/25 focus:border-[#0E7C86]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5">
                    <span>
                      {isJustSaved ? (
                        <span className="text-[#0E7C86] font-medium">
                          Saved to catalog
                        </span>
                      ) : (
                        'Line amount (Qty × Unit Price)'
                      )}
                    </span>
                    <span className="font-mono-num font-semibold text-slate-800">
                      {formatMoney(lineAmount, profile)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <button
          type="button"
          onClick={addEmptyItem}
          className="w-full h-10 border border-dashed border-slate-300 rounded-md text-xs font-semibold text-slate-700 hover:border-[#0E7C86] hover:text-[#0E7C86] hover:bg-[#0E7C86]/[0.03] transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Product Item
        </button>
      </section>

      {/* Section 4: Discount, Delivery, Tax & Summary */}
      <section className="p-6 space-y-4">
        <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
          Discounts, Delivery & Summary
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Discount
            </label>
            <div className="flex gap-1.5">
              <div className="flex p-0.5 bg-slate-100 rounded-md shrink-0">
                {(['percent', 'fixed'] as DiscountType[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => updateField('discountType', mode)}
                    className={`px-2.5 h-9 text-xs font-medium rounded transition-colors cursor-pointer ${
                      invoice.discountType === mode
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {mode === 'percent' ? '%' : 'Fixed'}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min={0}
                step="any"
                aria-label="Discount value"
                value={invoice.discountValue}
                onChange={(e) =>
                  updateField(
                    'discountValue',
                    e.target.value === '' ? 0 : Number(e.target.value)
                  )
                }
                className="w-full h-10 px-3 text-sm text-right font-mono-num bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/25 focus:border-[#0E7C86]"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="delivery-charges"
              className="block text-xs font-medium text-slate-700 mb-1.5"
            >
              Delivery Charges (After Discount)
            </label>
            <input
              id="delivery-charges"
              type="number"
              min={0}
              step="any"
              value={invoice.deliveryCharges ?? 0}
              onChange={(e) =>
                updateField(
                  'deliveryCharges',
                  e.target.value === '' ? 0 : Number(e.target.value)
                )
              }
              className="w-full h-10 px-3 text-sm text-right font-mono-num bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/25 focus:border-[#0E7C86]"
            />
          </div>

          <div>
            <label
              htmlFor="tax-percent"
              className="block text-xs font-medium text-slate-700 mb-1.5"
            >
              Tax (%)
            </label>
            <input
              id="tax-percent"
              type="number"
              min={0}
              step="any"
              value={invoice.taxPercent}
              onChange={(e) =>
                updateField(
                  'taxPercent',
                  e.target.value === '' ? 0 : Number(e.target.value)
                )
              }
              className="w-full h-10 px-3 text-sm text-right font-mono-num bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/25 focus:border-[#0E7C86]"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="invoice-notes"
            className="block text-xs font-medium text-slate-700 mb-1.5"
          >
            Optional Notes (Footer)
          </label>
          <textarea
            id="invoice-notes"
            rows={2}
            value={invoice.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            placeholder="Delivery terms or thank-you message (leave blank to match clean layout)"
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/25 focus:border-[#0E7C86]"
          />
        </div>

        {/* Summary Readout */}
        <div className="pt-3 border-t border-slate-200 space-y-1.5 text-sm">
          <div className="flex items-center justify-between text-slate-700 font-medium">
            <span>Total</span>
            <span className="font-mono-num text-slate-900">
              {formatMoney(totals.subtotal, profile)}
            </span>
          </div>
          {totals.discountAmount > 0 && (
            <div className="flex items-center justify-between text-slate-600">
              <span>
                Discount{' '}
                {invoice.discountType === 'percent'
                  ? `(${invoice.discountValue}%)`
                  : ''}
              </span>
              <span className="font-mono-num text-slate-900">
                -{formatMoney(totals.discountAmount, profile)}
              </span>
            </div>
          )}
          {totals.deliveryCharges > 0 && (
            <div className="flex items-center justify-between text-slate-600">
              <span>Delivery Charges</span>
              <span className="font-mono-num font-medium text-slate-900">
                +{formatMoney(totals.deliveryCharges, profile)}
              </span>
            </div>
          )}
          {totals.taxAmount > 0 && (
            <div className="flex items-center justify-between text-slate-600">
              <span>Tax ({invoice.taxPercent}%)</span>
              <span className="font-mono-num text-slate-900">
                +{formatMoney(totals.taxAmount, profile)}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-base font-bold text-slate-900">
            <span>Grand Total</span>
            <span className="font-mono-num text-[#0E7C86]">
              {formatMoney(totals.grandTotal, profile)}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
