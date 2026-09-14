import { CreditCardIcon, BanknotesIcon } from "@heroicons/react/24/outline";
import { useWebsiteContext } from "@/context/websiteContext";

// Los métodos de pago que se muestran los decide el DUEÑO desde el CRM
// (company.storePaymentMethods: ['COD','ONLINE','ADDI']). Si está vacío, se usa
// el comportamiento legado (contra entrega siempre + online si hay Wompi) para
// no afectar las tiendas ya activas.
export default function PaymentMethods({ value, onChange }) {
  const { website } = useWebsiteContext();
  const company = website?.company;
  // Pago en línea solo si el negocio conectó su cuenta Wompi.
  const wompiReady = !!(company?.wompiEnabled && company?.wompiPublicKey);

  const configured = Array.isArray(company?.storePaymentMethods)
    ? company.storePaymentMethods
    : [];
  const hasConfig = configured.length > 0;

  // ¿Qué mostrar? Con config, respeta lo elegido por el dueño; sin config, legado.
  const showOnline = (hasConfig ? configured.includes("ONLINE") : true) && wompiReady;
  const showCod = hasConfig ? configured.includes("COD") : true;
  // ADDI: el dueño puede habilitarlo en el CRM, pero aún no hay integración de
  // financiación operativa, así que todavía no se ofrece en el checkout.
  // (Cuando exista la integración se activa aquí.)

  const none = !showOnline && !showCod;

  return (
    <div className="bg-(--bg-page) rounded-xl p-6 shadow-(--shadow-sm)">
      <h3 className="text-lg font-semibold mb-4">Método de pago</h3>

      {none ? (
        <p className="text-sm text-(--text-muted)">
          Esta tienda aún no tiene métodos de pago disponibles. Escríbenos para
          completar tu pedido.
        </p>
      ) : (
        <div className="space-y-3">
          {showOnline && (
            <Option
              active={value === "online"}
              onClick={() => onChange("online")}
              icon={<CreditCardIcon className="w-6 h-6" />}
              title="Pago en línea"
              subtitle="Tarjeta, PSE, Nequi, Daviplata (Wompi)"
            />
          )}

          {showCod && (
            <Option
              active={value === "cod"}
              onClick={() => onChange("cod")}
              icon={<BanknotesIcon className="w-6 h-6" />}
              title="Pago contra entrega"
              subtitle="Paga cuando recibas tu pedido"
            />
          )}
        </div>
      )}
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
