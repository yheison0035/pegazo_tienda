// Abre el checkout de Wompi de la TIENDA. La llave pública y la firma son de la
// empresa dueña del dominio (Wompi por empresa): el dinero cae en SU banco.
export async function openWompiCheckout({
  amount,
  currency = "COP",
  reference,
  customerEmail,
  publicKey,
}) {
  const amountInCents = Math.round(Number(amount) * 100);

  // Dominio con el que el backend identifica la empresa (igual que apiFetch).
  const websiteDomain =
    process.env.NEXT_PUBLIC_WEBSITE_DOMAIN ||
    (typeof window !== "undefined" ? window.location.hostname : "");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/wompi/signature`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Website-Domain": websiteDomain,
      },
      body: JSON.stringify({
        reference,
        amountInCents,
        currency,
      }),
    },
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      err?.message ||
        "Esta tienda aún no tiene pagos en línea configurados.",
    );
  }

  const { signature } = await res.json();

  // Llave pública de la empresa (viene del config de la tienda); si no llega,
  // se cae a la global por compatibilidad.
  const pubKey = publicKey || process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY;

  const url =
    `https://checkout.wompi.co/p/?` +
    `public-key=${pubKey}` +
    `&currency=${currency}` +
    `&amount-in-cents=${amountInCents}` +
    `&reference=${reference}` +
    `&signature:integrity=${signature}` +
    // Cada tienda vuelve a SU dominio; la env solo sirve para forzarlo.
    `&redirect-url=${encodeURIComponent(
      process.env.NEXT_PUBLIC_WOMPI_REDIRECT_URL ||
        `${window.location.origin}/checkout/result`,
    )}` +
    `&customer-data:email=${encodeURIComponent(customerEmail)}`;

  window.location.href = url;
}
