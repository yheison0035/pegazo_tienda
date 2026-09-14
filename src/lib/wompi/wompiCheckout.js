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
    throw new Error(
      "No pudimos iniciar el pago en línea en este momento. Intenta de nuevo más tarde o elige otro método de pago.",
    );
  }

  const data = await res.json();
  const { signature } = data;

  // Llave pública AUTORITATIVA desde el servidor (no depende de datos cacheados
  // en el navegador). Si por compatibilidad no llegara, usa la del config o la
  // global.
  const pubKey =
    data.publicKey || publicKey || process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY;

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
