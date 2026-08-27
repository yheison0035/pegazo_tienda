# Pegazo Tienda

Tienda online multi‑vertical de **Pegazo**. Es el frente público (storefront) que se
alimenta del CRM de cada negocio: el mismo código sirve a cualquier cliente al que se
le habilite la tienda desde Pegazo, adaptándose por **tipo de negocio** (restaurante,
comida rápida, ropa, droguería, supermercado, etc.).

- **Stack:** Next.js 16 + React 19.
- **Cómo identifica al negocio:** por el dominio (`X-Website-Domain`), que el backend de
  Pegazo resuelve a la empresa y su local de ecommerce.
- **Vista previa de verticales:** `?vertical=RESTAURANTE` (y `?vertical=none` para volver
  al real).

## Desarrollo

```bash
npm run dev     # entorno local (http://localhost:3000)
npm run build   # build de producción
npm run start   # servir el build
```

Variables en `.env.local`:

- `NEXT_PUBLIC_API_URL` — URL del backend de Pegazo.
- `NEXT_PUBLIC_WEBSITE_DOMAIN` — dominio del negocio a servir en local (en producción se
  toma del hostname).
