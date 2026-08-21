"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useVertical from "@/hooks/useVertical";

const CheckoutContext = createContext(null);

export function CheckoutProvider({ children, wompiReady = false }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const vertical = useVertical();
  const modes = vertical.fulfillment?.length ? vertical.fulfillment : ["shipping"];

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

  const [paymentMethod, setPaymentMethod] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const urlMethod = searchParams.get("payment");
    if (urlMethod && !paymentMethod) {
      setPaymentMethod(urlMethod);
    }
  }, []);

  useEffect(() => {
    if (paymentMethod) {
      router.replace(`/checkout?payment=${paymentMethod}`, {
        scroll: false,
      });
    }
  }, [paymentMethod]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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

    if (needsAddress && formData.isHardToAccess && !formData.addressDetail) {
      errors.addressDetail = "Agrega una referencia para facilitar la entrega";
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
        handleChange,
        deliveryMethod,
        setDeliveryMethod,
        deliveryModes: modes,
        needsAddress,
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
