"use client";

import RichHtml from "@/components/ui/richHtml";

export default function ProductFeatures({ features }) {
  return (
    <div>
      <h3 className="text-lg sm:text-xl font-semibold mb-4">
        Características principales
      </h3>

      <div className="grid sm:grid-cols-2 gap-3">
        {features.map((f) => (
          <div
            key={f.id}
            className="
              flex items-start gap-2
              bg-(--bg-soft)
              border border-(--border-soft)
              rounded-lg
              p-3
              text-sm
            "
          >
            <span className="text-(--brand-accent) font-bold">•</span>
            <RichHtml
              html={f.title}
              className="text-(--text-secondary)"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
