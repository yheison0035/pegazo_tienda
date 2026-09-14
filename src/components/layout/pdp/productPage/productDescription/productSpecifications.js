"use client";

import RichHtml from "@/components/ui/richHtml";

export default function ProductSpecifications({ specifications }) {
  return (
    <div>
      <h3 className="text-lg sm:text-xl font-semibold mb-4">
        Especificaciones técnicas
      </h3>

      <div className="overflow-hidden rounded-xl border border-(--border-soft)">
        <table className="w-full text-sm">
          <tbody>
            {specifications.map((s, index) => (
              <tr
                key={s.id}
                className={index % 2 === 0 ? "bg-(--bg-soft)" : "bg-white"}
              >
                <td className="w-1/2 px-4 py-3 text-(--text-muted) font-medium">
                  {s.key}
                </td>
                <td className="w-1/2 px-4 py-3 text-(--text-primary)">
                  <RichHtml html={s.value} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
