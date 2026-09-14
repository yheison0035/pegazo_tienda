import { CreditCardIcon, BanknotesIcon } from "@heroicons/react/24/outline";
import { useWebsiteContext } from "@/context/websiteContext";

// Los métodos de pago que se muestran los decide el DUEÑO desde el CRM
// (company.storePaymentMethods: ['COD','ONLINE','ADDI']) — es la ÚNICA fuente de
// verdad: lo que active aparece, lo que desactive no. Si está vacío (tienda sin
// configurar aún) se muestran ambos por defecto para no dejarla sin pagos.
//
// Nota: el "Pago en línea" se muestra si está activo aunque el dueño no haya
// terminado de conectar Wompi; si el cliente lo elige y la pasarela no está
// lista, el checkout muestra un mensaje amable en vez de fallar.
export default function PaymentMethods({ value, onChange }) {
  const { website } = useWebsiteContext();
  const company = website?.company;

  const configured = Array.isArray(company?.storePaymentMethods)
    ? company.storePaymentMethods
    : [];
  const hasConfig = configured.length > 0;

  // ¿Qué mostrar? Con config, respeta lo elegido por el dueño; sin config, ambos.
  // El pago en línea aparece aunque no haya Wompi configurado (ver nota arriba).
  const showOnline = hasConfig ? configured.includes("ONLINE") : true;
  const showCod = hasConfig ? configured.includes("COD") : true;
  // ADDI: el dueño puede habilitarlo en el CRM, pero aún no hay integración de
  // financiación operativa, así que todavía no se ofrece en el checkout.

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
              subtitle="Tarjeta, PSE, Nequi, Daviplata"
              badge="Recomendado"
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

function Option({ active, icon, title, subtitle, badge, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full flex items-center gap-4 p-4 rounded-xl border cursor-pointer text-left
        ${active ? "border-(--brand-accent) bg-(--bg-soft) ring-1 ring-(--brand-accent)" : "border-(--border-soft) hover:border-(--border-strong)"}
        transition
      `}
    >
      {/* Radio visual */}
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
          active ? "border-(--brand-accent)" : "border-(--border-strong)"
        }`}
      >
        {active && (
          <span className="h-2.5 w-2.5 rounded-full bg-(--brand-accent)" />
        )}
      </span>

      <div className="text-(--brand-primary)">{icon}</div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold">{title}</p>
          {badge && (
            <span className="rounded-full bg-(--success)/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-(--success)">
              {badge}
            </span>
          )}
        </div>
        <p className="text-sm text-(--text-muted)">{subtitle}</p>
      </div>
    </button>
  );
}
