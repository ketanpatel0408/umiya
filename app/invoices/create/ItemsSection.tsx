import { Plus, Trash2, Package } from "lucide-react";
import { CardHeader, btnSmall } from "../../components/ui";
import { formatCurrency } from "../utils";
import type { ItemForm } from "./formHelpers";

type Props = {
  items: ItemForm[];
  updateItem: (index: number, patch: Partial<ItemForm>) => void;
  addItem: () => void;
  removeItem: (index: number) => void;
};

const cellInputClass =
  "w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-sm leading-5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

const cellLabel =
  "mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500";

/** Taxable value of one line (qty x rate), shown before GST. */
function lineAmount(item: ItemForm): number {
  return (Number(item.quantity) || 0) * (Number(item.rate) || 0);
}

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
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <CardHeader
        title="Items"
        description={`${items.length} ${items.length === 1 ? "line item" : "line items"}`}
        icon={Package}
        actions={
          <button onClick={addItem} type="button" className={btnSmall}>
            <Plus size={14} />
            Add Item
          </button>
        }
      />

      <div className="flex flex-col gap-3 p-5">
        {items.map((item, index) => (
          <div
            key={index}
            className="rounded-lg border border-slate-200 bg-slate-50/50 p-3"
          >
            <div className="flex items-end gap-3">
              <span className="mb-2.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-semibold text-indigo-700">
                {index + 1}
              </span>
              <label className="min-w-0 flex-1">
                <span className={cellLabel}>Description</span>
                <input
                  className={cellInputClass}
                  placeholder="Item description"
                  value={item.description}
                  onChange={(e) =>
                    updateItem(index, { description: e.target.value })
                  }
                />
              </label>
              <div className="mb-2 hidden shrink-0 text-right sm:block">
                <span className={cellLabel}>Amount</span>
                <span className="text-sm font-semibold text-slate-900 tabular-nums">
                  {formatCurrency(lineAmount(item))}
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeItem(index)}
                disabled={items.length === 1}
                className="mb-0.5 inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                title="Remove item"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 sm:ml-9 sm:grid-cols-5">
              <label>
                <span className={cellLabel}>HSN</span>
                <input
                  className={cellInputClass}
                  value={item.hsn}
                  onChange={(e) => updateItem(index, { hsn: e.target.value })}
                />
              </label>
              <label>
                <span className={cellLabel}>Qty</span>
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
              </label>
              <label>
                <span className={cellLabel}>Unit</span>
                <input
                  className={cellInputClass}
                  value={item.unit}
                  onChange={(e) => updateItem(index, { unit: e.target.value })}
                />
              </label>
              <label>
                <span className={cellLabel}>Rate</span>
                <input
                  type="number"
                  className={cellInputClass}
                  value={item.rate}
                  onChange={(e) => updateItem(index, { rate: e.target.value })}
                />
              </label>
              <label>
                <span className={cellLabel}>GST %</span>
                <input
                  type="number"
                  className={cellInputClass}
                  value={item.gstRate}
                  onChange={(e) =>
                    updateItem(index, { gstRate: e.target.value })
                  }
                />
              </label>
            </div>

            <div className="mt-2 flex justify-between text-sm sm:hidden">
              <span className="text-slate-500">Amount</span>
              <span className="font-semibold text-slate-900 tabular-nums">
                {formatCurrency(lineAmount(item))}
              </span>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addItem}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:border-indigo-400 hover:bg-indigo-50/50 hover:text-indigo-600"
        >
          <Plus size={16} />
          Add another item
        </button>
      </div>
    </div>
  );
}
