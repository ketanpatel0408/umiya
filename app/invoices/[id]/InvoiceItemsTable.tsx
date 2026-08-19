import type { InvoiceItem } from "../types";

/** Column widths/alignment, mirroring the original div-based item grid. */
const COLUMNS = [
  { width: "w-[6%]", align: "text-center" },
  { width: "w-[37%]", align: "text-left" },
  { width: "w-[8%]", align: "text-center" },
  { width: "w-[10%]", align: "text-right" },
  { width: "w-[6%]", align: "text-center" },
  { width: "w-[13%]", align: "text-right" },
  { width: "w-[7%]", align: "text-right" },
  { width: "w-[13%]", align: "text-right" },
] as const;

const HEADERS = [
  "SrNo.",
  "Description",
  "HSN",
  "Qty",
  "Unit",
  "Rate",
  "GST %",
  "Amount",
];

export default function InvoiceItemsTable({ items }: { items: InvoiceItem[] }) {
  return (
    <div className="table-auto w-full border-collapse border-b border-current text-sm">
      <div className="header flex">
        {HEADERS.map((label, i) => (
          <div
            key={label}
            className={`font-bold ${COLUMNS[i].align === "text-left" ? "text-center" : "text-center"} p-1 ${COLUMNS[i].width} border-current border-b ${
              i < HEADERS.length - 1 ? "border-r" : ""
            }`}
          >
            {label}
          </div>
        ))}
      </div>

      <div className="body flex h-[250px] flex-col overflow-hidden">
        {items.map((item, index) => (
          <div key={item.id} className="flex">
            <Cell col={0}>{index + 1}</Cell>
            <Cell col={1}>{item.description}</Cell>
            <Cell col={2}>{item.hsn ?? ""}</Cell>
            <Cell col={3}>{Number(item.quantity).toFixed(3)}</Cell>
            <Cell col={4}>{item.unit ?? ""}</Cell>
            <Cell col={5}>{Number(item.rate).toFixed(2)}</Cell>
            <Cell col={6}>{Number(item.gstRate).toFixed(2)}</Cell>
            <Cell col={7} last>
              {Number(item.taxableAmount).toFixed(2)}
            </Cell>
          </div>
        ))}

        {/* Filler keeps the column divider lines running to the bottom of
            the fixed-height body, matching the original blank item area. */}
        <div className="flex flex-1">
          {COLUMNS.map((col, i) => (
            <div
              key={i}
              className={`${col.width} ${i < COLUMNS.length - 1 ? "border-r border-current" : ""}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Cell({
  col,
  last,
  children,
}: {
  col: number;
  last?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${COLUMNS[col].width} p-1 ${COLUMNS[col].align} ${
        last ? "" : "border-r border-current"
      }`}
    >
      {children}
    </div>
  );
}
