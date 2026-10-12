"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type PasswordInputProps = {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
  id?: string;
  className?: string;
};

/**
 * Reusable password field with a Lucide Eye/EyeOff visibility toggle.
 * Used by every password input across the app (login, create user,
 * change password, etc.) so behavior stays consistent.
 */
export default function PasswordInput({
  label,
  placeholder,
  value,
  onChange,
  error,
  disabled,
  required,
  autoComplete,
  id,
  className,
}: PasswordInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [visible, setVisible] = useState(false);

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          className={`w-full rounded-lg border bg-white px-3 py-2 pr-10 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-60 ${
            error
              ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
              : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20"
          }`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          disabled={disabled}
          tabIndex={-1}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 flex cursor-pointer items-center px-3 text-slate-400 hover:text-slate-700 disabled:cursor-not-allowed"
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
