"use client";

import { useRef, useState } from "react";
import { MAX_SIGNATURE_LENGTH } from "@/lib/signature";
import { btnSmall, labelBase } from "../components/ui";

const MAX_WIDTH = 600;
const MAX_HEIGHT = 200;

/** Loads an image file and returns a downscaled data URL small enough to store. */
async function resizeImage(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Could not read image"));
      el.src = url;
    });
    const scale = Math.min(1, MAX_WIDTH / img.width, MAX_HEIGHT / img.height);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    // PNG keeps a transparent background; fall back to WebP if it's too big.
    let dataUrl = canvas.toDataURL("image/png");
    if (dataUrl.length > MAX_SIGNATURE_LENGTH) {
      dataUrl = canvas.toDataURL("image/webp", 0.85);
    }
    if (dataUrl.length > MAX_SIGNATURE_LENGTH) {
      throw new Error("Image is too large");
    }
    return dataUrl;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Optional signature upload with preview. `value` is a data URL or "". */
export default function SignatureInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
      setError("Please choose a PNG, JPG or WebP image.");
      return;
    }
    try {
      onChange(await resizeImage(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read image");
    }
  }

  return (
    <div className="sm:col-span-2">
      <label className={labelBase}>Signature (optional)</label>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-16 w-48 items-center justify-center rounded-md border border-dashed border-slate-300 bg-white">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element -- data: URL preview
            <img src={value} alt="Signature preview" className="max-h-14 max-w-44 object-contain" />
          ) : (
            <span className="text-xs text-slate-400">No signature</span>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleFile}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className={btnSmall}
        >
          {value ? "Change" : "Upload"}
        </button>
        {value && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange("")}
            className={btnSmall}
          >
            Remove
          </button>
        )}
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Shown above the seller name at the bottom of this user&apos;s invoices.
      </p>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
