import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

export function Input({ label, required, error, helperText, ...props }) {
  return (
    <div className="flex flex-col" data-error={error ? "true" : undefined}>
      <label className="text-sm mb-1 text-(--text-muted)">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        <input
          {...props}
          className={`
            w-full
            border rounded-lg px-4 py-2
            outline-none
            transition
            ${
              error
                ? "border-(--danger) focus:ring-2 focus:ring-(--danger)"
                : "border-(--border-soft) focus:ring-2 focus:ring-(--brand-accent)"
            }
          `}
        />

        {error && (
          <ExclamationCircleIcon className="w-5 h-5 text-(--danger) absolute right-3 top-1/2 -translate-y-1/2" />
        )}
      </div>

      {error && (
        <p className="text-xs text-(--danger) mt-1">
          {helperText || "Este campo es obligatorio"}
        </p>
      )}
    </div>
  );
}
