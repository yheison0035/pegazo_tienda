"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  getCustomerMe,
  loginCustomer,
  registerCustomer,
  updateCustomerMe,
} from "@/lib/utils/api/routes/customer";

const CustomerContext = createContext(null);

const TOKEN_KEY = "token";

function readToken() {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function writeToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* almacenamiento no disponible */
  }
}

export function CustomerProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  // loading = comprobando la sesión guardada al arrancar.
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!readToken()) {
      setCustomer(null);
      setOrders([]);
      return null;
    }
    try {
      const res = await getCustomerMe();
      setCustomer(res?.data?.customer || null);
      setOrders(res?.data?.orders || []);
      return res?.data?.customer || null;
    } catch {
      // Token inválido/expirado → cerrar sesión silenciosamente.
      writeToken(null);
      setCustomer(null);
      setOrders([]);
      return null;
    }
  }, []);

  useEffect(() => {
    (async () => {
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  const login = useCallback(async ({ email, password }) => {
    const res = await loginCustomer({ email, password });
    const token = res?.data?.access_token;
    if (token) writeToken(token);
    setCustomer(res?.data?.customer || null);
    await refresh();
    return res?.data?.customer || null;
  }, [refresh]);

  const register = useCallback(
    async (payload) => {
      const res = await registerCustomer(payload);
      const token = res?.data?.access_token;
      if (token) writeToken(token);
      setCustomer(res?.data?.customer || null);
      await refresh();
      return res?.data?.customer || null;
    },
    [refresh],
  );

  const updateProfile = useCallback(async (payload) => {
    const res = await updateCustomerMe(payload);
    setCustomer(res?.data?.customer || null);
    return res?.data?.customer || null;
  }, []);

  const logout = useCallback(() => {
    writeToken(null);
    setCustomer(null);
    setOrders([]);
  }, []);

  return (
    <CustomerContext.Provider
      value={{
        customer,
        orders,
        loading,
        isAuthenticated: !!customer,
        login,
        register,
        updateProfile,
        logout,
        refresh,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  const ctx = useContext(CustomerContext);
  if (!ctx) {
    throw new Error("useCustomer debe usarse dentro de CustomerProvider");
  }
  return ctx;
}
