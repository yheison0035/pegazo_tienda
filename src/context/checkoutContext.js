"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import useVertical from "@/hooks/useVertical";
import { useWebsiteContext } from "@/context/websiteContext";
import { useCart } from "@/context/cartContext";
import { availableDeliveryModes, shippingFor } from "@/utils/shipping";
import { quoteShipping } from "@/lib/utils/api/routes/shipping";

const CheckoutContext = createContext(null);

export function CheckoutProvider({ children, wompiReady = false }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const vertical = useVertical();
  const { website } = useWebsiteContext();
  // Envíos configurados por el dueño (si los hay).
  const storeShipping = website?.company?.storeShipping || null;
  // Modos de entrega disponibles: los que el dueño activó, o los del vertical.
  const modes = availableDeliveryModes(storeShipping, vertical.fulfillment);

  const [formData, setFormData] = useState({
    email: "",
    department: "",
    city: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    addressDetail: "",
    neighborhood: "",
    isHardToAccess: false,
    billingSameAsShipping: true,
    documentNumber: "",
    billingFirstName: "",
    billingLastName: "",
    billingPhone: "",
    billingAddress: "",
    // Instrucciones del cliente (referencias, nº de mesa, etc.)
    notes: "",
  });

  // Modo de entrega elegido (por defecto el primero que ofrece el vertical).
  const [deliveryMethod, setDeliveryMethod] = useState(modes[0]);
  useEffect(() => {
    if (!modes.includes(deliveryMethod)) setDeliveryMethod(modes[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modes.join(",")]);
  // ¿Este modo necesita dirección de entrega?
  const needsAddress =
    deliveryMethod === "shipping" || deliveryMethod === "local_delivery";

  // Pago en línea seleccionado por defecto.
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [isLocked, setIsLocked] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  // Campos "tocados" para validar en tiempo real (sin esperar al botón).
  const [touched, setTouched] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ---- Envío dinámico por transportadora ----
  const { items: cartItems } = useCart();
  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  // Las transportadoras aplican SOLO al "Envío nacional" (shipping). El
  // "Domicilio local" usa la tarifa plana del dueño (mensajero propio), y
  // recoger/mesa no cobran. Así no se mezclan los modos de entrega.
  const carrierMode =
    deliveryMethod === "shipping" &&
    Array.isArray(storeShipping?.carriers) &&
    storeShipping.carriers.some((c) => c && c.enabled !== false);
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedCarrierId, setSelectedCarrierId] = useState(null);
  const [shippingLoading, setShippingLoading] = useState(false);

  // Al elegir departamento/ciudad (o cambiar el carrito), cotiza el envío por
  // transportadora en el backend. Debounce para no consultar en cada tecla.
  useEffect(() => {
    if (!carrierMode || !needsAddress || !formData.department || subtotal <= 0) {
      setShippingOptions([]);
      return;
    }
    let alive = true;
    setShippingLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await quoteShipping({
          department: formData.department,
          city: formData.city,
          subtotal,
        });
        if (!alive) return;
        const opts = res?.data || [];
        setShippingOptions(opts);
        setSelectedCarrierId((prev) =>
          prev && opts.some((o) => o.carrierId === prev)
            ? prev
            : opts[0]?.carrierId || null,
        );
      } catch {
        if (alive) setShippingOptions([]);
      } finally {
        if (alive) setShippingLoading(false);
      }
    }, 350);
    return () => {
      alive = false;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carrierMode, needsAddress, formData.department, formData.city, subtotal]);

  // Resultado de envío que consume el checkout (costo, tiempo, etiqueta).
  const shipping = (() => {
    if (carrierMode && needsAddress) {
      const opt =
        shippingOptions.find((o) => o.carrierId === selectedCarrierId) ||
        shippingOptions[0] ||
        null;
      if (!opt) {
        return {
          mode: "carrier",
          ready: false,
          cost: 0,
          free: false,
          days: null,
          carrierName: null,
          options: shippingOptions,
          loading: shippingLoading,
          label: shippingLoading ? "Calculando…" : "Elige tu ciudad",
          message: "",
        };
      }
      return {
        mode: "carrier",
        ready: true,
        cost: opt.cost,
        free: opt.free,
        days: opt.days,
        carrierName: opt.name,
        options: shippingOptions,
        loading: shippingLoading,
        label: opt.cost === 0 ? "Gratis" : `$${opt.cost.toLocaleString()}`,
        message: "",
      };
    }
    const legacy = shippingFor(storeShipping, deliveryMethod, subtotal);
    return {
      mode: "legacy",
      ready: true,
      cost: legacy.cost,
      free: legacy.cost === 0,
      days: null,
      carrierName: null,
      options: [],
      loading: false,
      label: legacy.label,
      message: legacy.message,
    };
  })();

  // "Recordar lo ya escrito": el checkout guarda el formulario en el navegador y
  // lo restaura en la próxima visita/compra (en ESTE dispositivo). Se hace en
  // efecto (no en SSR) para no romper la hidratación.
  const STORAGE_KEY = "pegazo_checkout";
  const hydrated = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && typeof saved === "object") {
          setFormData((prev) => ({ ...prev, ...saved }));
        }
      }
    } catch {
      /* localStorage bloqueado/privado: se ignora */
    }
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    } catch {
      /* ignore */
    }
  }, [formData]);

  useEffect(() => {
    const urlMethod = searchParams.get("payment");
    if (urlMethod && !paymentMethod) {
      setPaymentMethod(urlMethod);
    }
  }, []);

  useEffect(() => {
    // Solo sincroniza el método en la URL cuando se está EN el checkout. En otras
    // páginas del grupo (p. ej. /checkout/result) NO debe redirigir a /checkout,
    // o se rompe la pantalla de confirmación.
    if (paymentMethod && pathname === "/checkout") {
      router.replace(`/checkout?payment=${paymentMethod}`, {
        scroll: false,
      });
    }
  }, [paymentMethod, pathname]);

  // Campos que se guardan SIEMPRE en MAYÚSCULA (nombres y dirección).
  const UPPER_FIELDS = new Set([
    "firstName",
    "lastName",
    "address",
    "neighborhood",
    "addressDetail",
    "billingFirstName",
    "billingLastName",
    "billingAddress",
  ]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    let v = type === "checkbox" ? checked : value;
    if (typeof v === "string" && UPPER_FIELDS.has(name)) v = v.toUpperCase();

    setFormData((prev) => ({ ...prev, [name]: v }));
    // Validación en tiempo real: al escribir, el campo queda "tocado".
    setTouched((prev) => (prev[name] ? prev : { ...prev, [name]: true }));
  }

  function handleBlur(e) {
    const name = e?.target?.name;
    if (name) setTouched((prev) => (prev[name] ? prev : { ...prev, [name]: true }));
  }

  // ¿Se debe mostrar el error de este campo? (tras tocarlo o intentar enviar)
  function fieldError(name, errors) {
    return (touched[name] || showErrors) && errors?.[name] ? errors[name] : "";
  }

  // Rellena datos del cliente logueado SOLO en los campos que estén vacíos, para
  // no pisar lo que el usuario ya haya escrito.
  function prefill(values = {}) {
    setFormData((prev) => {
      const next = { ...prev };
      for (const [k, v] of Object.entries(values)) {
        if (v && !String(prev[k] || "").trim()) next[k] = v;
      }
      return next;
    });
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function isFormValid() {
    const errors = {};

    if (!formData.email) {
      errors.email = "El correo es obligatorio";
    } else if (!isValidEmail(formData.email)) {
      errors.email = "Ingresa un correo válido";
    }

    if (needsAddress && formData.address.length < 6) {
      errors.address = "La dirección parece incompleta";
    }

    if (!formData.phone) {
      errors.phone = "Este campo es obligatorio";
    } else if (!/^\d{7,10}$/.test(formData.phone)) {
      errors.phone = "Ingresa un teléfono válido";
    }

    // Campos siempre requeridos + los de dirección solo si el modo la necesita.
    const required = ["email", "firstName", "lastName", "phone"];
    if (needsAddress) {
      required.push(
        "department",
        "city",
        "address",
        "neighborhood",
        "documentNumber"
      );
    }

    required.forEach((key) => {
      if (!formData[key]) {
        errors[key] = "Este campo es obligatorio";
      }
    });

    if (!formData.billingSameAsShipping) {
      const billingRequired = [
        "billingFirstName",
        "billingLastName",
        "billingPhone",
        "billingAddress",
      ];

      billingRequired.forEach((key) => {
        if (!formData[key]) {
          errors[key] = "Este campo es obligatorio";
        }
      });
    }

    if (!paymentMethod) {
      errors.paymentMethod = "Selecciona un método de pago";
    }

    const isBlockingError = (key) => !["addressDetail"].includes(key);

    return {
      valid: Object.keys(errors).filter(isBlockingError).length === 0,
      errors,
    };
  }

  return (
    <CheckoutContext.Provider
      value={{
        formData,
        setFormData,
        handleChange,
        handleBlur,
        fieldError,
        touched,
        prefill,
        deliveryMethod,
        setDeliveryMethod,
        deliveryModes: modes,
        storeShipping,
        needsAddress,
        // Envío dinámico por transportadora
        subtotal,
        shipping,
        selectedCarrierId,
        setSelectedCarrierId,
        paymentMethod,
        setPaymentMethod,
        isLocked,
        setIsLocked,
        showErrors,
        setShowErrors,
        showConfirm,
        setShowConfirm,
        isSubmitting,
        setIsSubmitting,
        isFormValid,
        wompiReady,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);

  if (!context) {
    throw new Error("useCheckout debe usarse dentro de <CheckoutProvider />");
  }

  return context;
}
