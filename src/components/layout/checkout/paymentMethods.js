import { CreditCardIcon, BanknotesIcon } from "@heroicons/react/24/outline";
import { useWebsiteContext } from "@/context/websiteContext";

export default function PaymentMethods({ value, onChange }) {
  const { website } = useWebsiteContext();
  const company = website?.company;
  // Pago en línea solo si el negocio conectó su cuenta Wompi.
  const wompiReady = !!(company?.wompiEnabled && company?.wompiPublicKey);

  return (
    <div className="bg-(--bg-page) rounded-xl p-6 shadow-(--shadow-sm)">
      <h3 className="text-lg font-semibold mb-4">Método de pago</h3>

      <div className="space-y-3">
        {wompiReady && (
          <Option
            active={value === "online"}
            onClick={() => onChange("online")}
            icon={<CreditCardIcon className="w-6 h-6" />}
            title="Pago en línea"
            subtitle="Tarjeta, PSE, Nequi, Daviplata (Wompi)"
          />
        )}

        <Option
          active={value === "cod"}
          onClick={() => onChange("cod")}
          icon={<BanknotesIcon className="w-6 h-6" />}
          title="Pago contra entrega"
          subtitle="Paga cuando recibas tu pedido"
        />
      </div>
    </div>
  );
}

function Option({ active, icon, title, subtitle, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-start gap-4 p-4 rounded-xl border cursor-pointer
        ${active ? "border-(--brand-accent) bg-(--bg-soft)" : "border-(--border-soft)"}
        transition
      `}
    >
      <div className="text-(--brand-primary)">{icon}</div>
      <div className="text-left">
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-(--text-muted)">{subtitle}</p>
      </div>
    </button>
  );
}
