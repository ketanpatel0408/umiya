import { Receipt, CheckCircle2 } from "lucide-react";

/**
 * Two-panel layout for signed-out screens (login, forgot/reset password):
 * a brand panel on large screens and the form on the right.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 bg-white">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-900 p-12 text-white lg:flex">
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 shadow-lg shadow-indigo-500/30">
            <Receipt size={20} />
          </div>
          <span className="text-lg font-semibold">Umiya GST Portal</span>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight">
            GST invoicing, simplified for your business.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-300">
            Create compliant tax invoices, track every bill by financial year,
            and print professional PDFs in seconds.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-slate-200">
            {[
              "Automatic CGST / SGST / IGST calculation",
              "Financial-year wise invoice numbering",
              "Saved buyer details for faster billing",
            ].map((f) => (
              <li key={f} className="flex items-center gap-3">
                <CheckCircle2 size={18} className="shrink-0 text-indigo-400" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Umiya GST Portal
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center bg-slate-50 px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <Receipt size={20} />
            </div>
            <span className="text-lg font-semibold text-slate-900">Umiya GST Portal</span>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
