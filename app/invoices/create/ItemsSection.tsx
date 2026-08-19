import { Plus, Trash2 } from "lucide-react";
import type { ItemForm } from "./formHelpers";

type Props = {
  items: ItemForm[];
  updateItem: (index: number, patch: Partial<ItemForm>) => void;
  addItem: () => void;
  removeItem: (index: number) => void;
};

const cellInputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-500";

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

      <div className="overflow-x-auto lg:overflow-x-visible">
        <table className="w-full min-w-[720px] table-fixed text-left text-sm lg:min-w-0">
          <colgroup>
            <col className="w-auto" />
            <col className="w-[12%]" />
            <col className="w-[8%]" />
            <col className="w-[8%]" />
            <col className="w-[12%]" />
            <col className="w-[9%]" />
            <col className="w-[7%]" />
          </colgroup>
          <thead className="text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-2 py-2 font-medium">Description</th>
              <th className="px-2 py-2 font-medium">HSN</th>
              <th className="px-2 py-2 font-medium">Qty</th>
              <th className="px-2 py-2 font-medium">Unit</th>
              <th className="px-2 py-2 font-medium">Rate</th>
              <th className="px-2 py-2 font-medium">GST %</th>
              <th className="px-2 py-2 font-medium text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {items.map((item, index) => (
              <tr key={index}>
                <td className="px-2 py-2">
                  <input
                    className={cellInputClass}
                    value={item.description}
                    onChange={(e) =>
                      updateItem(index, { description: e.target.value })
                    }
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    className={cellInputClass}
                    value={item.hsn}
                    onChange={(e) => updateItem(index, { hsn: e.target.value })}
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    className={cellInputClass}
                    value={item.quantity}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (QUANTITY_PATTERN.test(value)) {
                        updateItem(index, { quantity: value });
                      }
                    }}
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    className={cellInputClass}
                    value={item.unit}
                    onChange={(e) => updateItem(index, { unit: e.target.value })}
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    type="number"
                    className={cellInputClass}
                    value={item.rate}
                    onChange={(e) => updateItem(index, { rate: e.target.value })}
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    type="number"
                    className={cellInputClass}
                    value={item.gstRate}
                    onChange={(e) =>
                      updateItem(index, { gstRate: e.target.value })
                    }
                  />
                </td>
                <td className="px-2 py-2 text-center">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    className="inline-flex items-center justify-center rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
