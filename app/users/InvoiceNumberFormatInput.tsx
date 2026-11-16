"use client";

import { useState } from "react";
import {
  DEFAULT_INVOICE_NUMBER_FORMAT,
  formatInvoiceNumber,
  validateInvoiceNumberFormat,
} from "@/lib/invoiceNumber";
import { inputBase, labelBase } from "../components/ui";
import Select from "../components/Select";

/**
 * Ready-made formats. The first one is the default (stored as null/""), so
 * existing users without a format keep today's numbering, e.g. 26-27/01.
 */
const PRESETS = [
  DEFAULT_INVOICE_NUMBER_FORMAT,
  "{FY}/{N3}",
  "{FY4}/{N3}",
  "{FY4}/{N4}",
  "INV/{FY}/{N3}",
  "{YY}/{N3}",
];
const CUSTOM = "__custom__";

/** Current Indian financial year, e.g. "2026-27" (Apr 1 - Mar 31). */
function currentFinancialYear(): string {
  const now = new Date();
  const start = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return `${start}-${String(start + 1).slice(-2)}`;
}

/** Invoice number format picker with a Custom option. `value` "" = default. */
export default function InvoiceNumberFormatInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const format = value.trim() || DEFAULT_INVOICE_NUMBER_FORMAT;
  const [custom, setCustom] = useState(() => !PRESETS.includes(format));
  const fy = currentFinancialYear();
  const error = validateInvoiceNumberFormat(format);

  function handleSelect(selected: string) {
    if (selected === CUSTOM) {
      setCustom(true);
      return;
    }
    setCustom(false);
    onChange(selected === DEFAULT_INVOICE_NUMBER_FORMAT ? "" : selected);
  }

  return (
    <div className="sm:col-span-2">
      <label className={labelBase}>Invoice Number Format</label>
      <Select
        value={custom ? CUSTOM : format}
        onChange={handleSelect}
        ariaLabel="Invoice Number Format"
        options={[
          ...PRESETS.map((preset) => ({
            value: preset,
            label: (
              <>
                {formatInvoiceNumber(preset, fy, 1)}
                {preset === DEFAULT_INVOICE_NUMBER_FORMAT && (
                  <span className="ml-1.5 text-xs text-slate-400">(Default)</span>
                )}
              </>
            ),
          })),
          { value: CUSTOM, label: "Custom..." },
        ]}
      />

      {custom && (
        <>
          <input
            className={`${inputBase} mt-2 font-mono`}
            value={value}
            placeholder="e.g. KE/{FY}/{N3}"
            onChange={(e) => onChange(e.target.value)}
            autoFocus
          />
          <p className="mt-1 text-xs text-slate-500">
            Tokens: <code>{"{FY}"}</code> 26-27, <code>{"{FY4}"}</code> 2026-27,{" "}
            <code>{"{YY}"}</code> 26, <code>{"{N}"}</code> 01, <code>{"{N3}"}</code> 001,{" "}
            <code>{"{N4}"}</code> 0001. Must include one year token and one number token.
          </p>
        </>
      )}

      {error ? (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      ) : (
        <p className="mt-1 text-xs text-slate-600">
          Preview:{" "}
          <span className="font-mono font-semibold text-slate-900">
            {formatInvoiceNumber(format, fy, 1)}, {formatInvoiceNumber(format, fy, 2)}, ...
          </span>{" "}
          <span className="text-slate-500">
            (restarts every financial year, separate for each user)
          </span>
        </p>
      )}
    </div>
  );
}
