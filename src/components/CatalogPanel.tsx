import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { formatMoney } from '../data/defaults';
import { CatalogItem, CompanyProfile } from '../types/invoice';

interface CatalogPanelProps {
  catalog: CatalogItem[];
  profile: CompanyProfile;
  onChangeCatalog: (items: CatalogItem[]) => void;
  onAddToInvoice: (item: CatalogItem) => void;
}

export const CatalogPanel: React.FC<CatalogPanelProps> = ({
  catalog,
  profile,
  onChangeCatalog,
  onAddToInvoice,
}) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [sku, setSku] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const numericPrice = Number(price) || 0;
    const newItem: CatalogItem = {
      id: `cat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      defaultPrice: Math.max(0, numericPrice),
      sku: sku.trim() || undefined,
    };
    onChangeCatalog([newItem, ...catalog]);
    setName('');
    setPrice('');
    setSku('');
  };

  const handleDelete = (id: string) => {
    onChangeCatalog(catalog.filter((c) => c.id !== id));
  };

  return (
    <div className="p-6 space-y-5">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">
          Reusable Item Catalog
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Save frequent products and unit prices to add them to orders in one click.
        </p>
      </div>

      {/* Add Form */}
      <form
        onSubmit={handleAdd}
        className="p-4 bg-slate-50 border border-slate-200 rounded-md space-y-3"
      >
        <div>
          <label
            htmlFor="cat-name"
            className="block text-xs font-medium text-slate-700 mb-1"
          >
            Item Name
          </label>
          <input
            id="cat-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Bath Set Piano (Silver)"
            className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/25 focus:border-[#0E7C86]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="cat-price"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Default Price
            </label>
            <input
              id="cat-price"
              type="number"
              min={0}
              step="any"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="28500"
              className="w-full h-9 px-3 text-sm text-right font-mono-num bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/25 focus:border-[#0E7C86]"
            />
          </div>
          <div>
            <label
              htmlFor="cat-sku"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              SKU (Optional)
            </label>
            <input
              id="cat-sku"
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="BSP-SLV"
              className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/25 focus:border-[#0E7C86]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!name.trim()}
          className="w-full h-9 px-4 text-xs font-semibold text-white bg-[#0E7C86] hover:bg-[#0B666F] disabled:opacity-40 rounded transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Save to Catalog
        </button>
      </form>

      {/* Catalog List */}
      {catalog.length === 0 ? (
        <div className="py-10 text-center border border-dashed border-slate-300 rounded-md">
          <p className="text-sm text-slate-600">Your item catalog is empty.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-200 border border-slate-200 rounded-md bg-white overflow-hidden">
          {catalog.map((item) => (
            <div
              key={item.id}
              className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium text-slate-900 truncate">
                  {item.name}
                </div>
                <div className="text-xs text-slate-500 mt-0.5 font-mono-num">
                  {formatMoney(item.defaultPrice, profile)}
                  {item.sku ? ` · ${item.sku}` : ''}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onAddToInvoice(item)}
                  className="h-8 px-3 text-xs font-medium text-[#0E7C86] bg-white border border-[#0E7C86]/35 hover:bg-[#0E7C86]/5 rounded transition-colors whitespace-nowrap cursor-pointer"
                >
                  Add to Order
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  title="Remove from catalog"
                  className="h-8 w-8 inline-flex items-center justify-center text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
