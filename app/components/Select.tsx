"use client";

import MuiSelect from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputBase from "@mui/material/InputBase";
import { Check, ChevronDown } from "lucide-react";

function SelectIcon({ className }: { className?: string }) {
  return (
    <ChevronDown
      size={16}
      className={`${className ?? ""} pointer-events-none !right-2.5 !text-slate-400 transition-transform`}
    />
  );
}

export type SelectOption<T extends string> = { value: T; label: React.ReactNode };

/**
 * App-wide dropdown, built on MUI's Select and styled to match the Tailwind
 * inputs (inputBase): slate border, indigo focus ring, rounded corners, and
 * a floating menu that marks the selected option with a check.
 */
export default function Select<T extends string>({
  value,
  onChange,
  options,
  disabled,
  size = "md",
  className,
  ariaLabel,
}: {
  value: T;
  onChange: (value: T) => void;
  options: readonly SelectOption<T>[];
  disabled?: boolean;
  /** "sm" is the compact variant used inside table rows. */
  size?: "sm" | "md";
  /** Extra classes for the wrapper, e.g. a width like "sm:w-40". */
  className?: string;
  ariaLabel?: string;
}) {
  const compact = size === "sm";

  return (
    <div className={className ?? "w-full"}>
      <MuiSelect<T>
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as T)}
        input={<InputBase />}
        inputProps={{ "aria-label": ariaLabel }}
        IconComponent={SelectIcon}
        renderValue={(selected) => options.find((o) => o.value === selected)?.label}
        fullWidth
        sx={{
          fontFamily: "inherit",
          fontSize: compact ? "0.8125rem" : "0.875rem",
          color: "#0f172a",
          backgroundColor: "#fff",
          border: "1px solid #cbd5e1",
          borderRadius: compact ? "0.375rem" : "0.5rem",
          boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
          transition: "border-color 150ms, box-shadow 150ms",
          "&:hover:not(.Mui-disabled)": { borderColor: "#94a3b8" },
          "&.Mui-focused": {
            borderColor: "#6366f1",
            boxShadow: "0 0 0 3px rgb(99 102 241 / 0.2)",
          },
          "&.Mui-disabled": { backgroundColor: "#f1f5f9", cursor: "not-allowed" },
          "& .MuiSelect-select": {
            padding: compact ? "4px 32px 4px 8px" : "8px 36px 8px 12px",
            minHeight: "unset",
            lineHeight: "1.25rem",
            borderRadius: "inherit",
          },
          "& .MuiSelect-select:focus": { backgroundColor: "transparent" },
          "& .Mui-disabled": { WebkitTextFillColor: "#64748b", cursor: "not-allowed" },
          "& .MuiSelect-iconOpen": { transform: "rotate(180deg)" },
        }}
        MenuProps={{
          anchorOrigin: { vertical: "bottom", horizontal: "left" },
          transformOrigin: { vertical: "top", horizontal: "left" },
          slotProps: {
            paper: {
              sx: {
                mt: 0.75,
                borderRadius: "0.625rem",
                border: "1px solid #e2e8f0",
                boxShadow:
                  "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
                maxHeight: 320,
              },
            },
            list: { sx: { p: 0.5 } },
          },
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            sx={{
              fontFamily: "inherit",
              fontSize: "0.875rem",
              color: "#334155",
              borderRadius: "0.375rem",
              px: 1.25,
              py: 0.875,
              minHeight: "unset",
              gap: 1.5,
              justifyContent: "space-between",
              "&:hover": { backgroundColor: "#f1f5f9" },
              "&.Mui-focusVisible": { backgroundColor: "#f1f5f9" },
              "&.Mui-selected, &.Mui-selected:hover, &.Mui-selected.Mui-focusVisible": {
                backgroundColor: "#eef2ff",
                color: "#4338ca",
                fontWeight: 500,
              },
              "& .select-check": { visibility: "hidden" },
              "&.Mui-selected .select-check": { visibility: "visible" },
            }}
          >
            <span>{option.label}</span>
            <Check size={15} className="select-check shrink-0" />
          </MenuItem>
        ))}
      </MuiSelect>
    </div>
  );
}
