import { Plus, Trash2 } from "lucide-react";
import type { ItemForm } from "./formHelpers";

type Props = {
  items: ItemForm[];
  updateItem: (index: number, patch: Partial<ItemForm>) => void;
  addItem: () => void;
  removeItem: (index: number) => void;
};

const cellInputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-2.5 py-2 text-sm leading-5 text-zinc-900 outline-none transition-colors focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500";

// Positive decimal with up to 3 decimal places (e.g. "1", "62.774").
// Also allows transient states like "" and "62." while typing.
const QUANTITY_PATTERN = /^\d*(\.\d{0,3})?$/;

export default function ItemsSection({
  items,
  updateItem,
  addItem,
  removeItem,
}: Props) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Items
        </h2>
        <button
          onClick={addItem}
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
        >
          <Plus size={14} />
          Add Item
        </button>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          {/* Column header labels, aligned to the same grid as each item row. */}
          <div className="grid grid-cols-[minmax(220px,1fr)_110px_100px_100px_120px_90px_60px] gap-3 px-1 pb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
            <span>Description</span>
            <span>HSN</span>
            <span>Qty</span>
            <span>Unit</span>
            <span>Rate</span>
            <span>GST %</span>
            <span className="text-center">Action</span>
          </div>

          <div className="divide-y divide-zinc-100">
            {items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-[minmax(220px,1fr)_110px_100px_100px_120px_90px_60px] items-center gap-3 px-1 py-2"
              >
                <input
                  className={cellInputClass}
                  value={item.description}
                  onChange={(e) =>
                    updateItem(index, { description: e.target.value })
                  }
                />
                <input
                  className={cellInputClass}
                  value={item.hsn}
                  onChange={(e) => updateItem(index, { hsn: e.target.value })}
                />
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0.000"
                  className={cellInputClass}
                  value={item.quantity}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (QUANTITY_PATTERN.test(value)) {
                      updateItem(index, { quantity: value });
                    }
                  }}
                />
                <input
                  className={cellInputClass}
                  value={item.unit}
                  onChange={(e) => updateItem(index, { unit: e.target.value })}
                />
                <input
                  type="number"
                  className={cellInputClass}
                  value={item.rate}
                  onChange={(e) => updateItem(index, { rate: e.target.value })}
                />
                <input
                  type="number"
                  className={cellInputClass}
                  value={item.gstRate}
                  onChange={(e) =>
                    updateItem(index, { gstRate: e.target.value })
                  }
                />
                <div className="flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    className="inline-flex items-center justify-center rounded-md p-2 text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
