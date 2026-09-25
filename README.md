# Central Compras · Precios (V1)

Web app Next.js para subir tarifas, vincular artículos a un catálogo propio y comparar precios válidos entre proveedores.

## Ejecutar

```bash
npm install
npm run dev
```

Abrir http://localhost:3000. Sin variables de entorno funciona en modo local y guarda los datos en este navegador. El botón «Cargar datos reales de ejemplo» incorpora los dos adjuntos: J. C. Viñas (20–26 mayo de 2026) y Hotelsa (julio de 2026). No son tarifas actuales. El archivo de gastos no se importa en esta fase.

## Supabase y Vercel

1. Crear un proyecto Supabase y ejecutar `supabase/schema.sql` en SQL Editor. Activar la autenticación por email según la política deseada.
2. Copiar `.env.example` a `.env.local` y poner la URL del proyecto y la clave **publishable** (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`). Nunca usar una clave secreta en variables `NEXT_PUBLIC_`.
3. Subir este proyecto a GitHub y conectar el repositorio en Vercel. Configurar las dos variables anteriores en Vercel y desplegar.
4. En el entorno conectado, iniciar sesión o crear usuario. Las políticas RLS limitan cada espacio de trabajo a su titular.

La V1 guarda los datos del espacio de trabajo en un documento JSON de Supabase. Así conserva proveedores, versiones de tarifas, artículos y equivalencias con controles de acceso. Antes de acceso multiusuario concurrente o grandes volúmenes conviene migrar a tablas relacionales y añadir control de versiones.

## Reglas de comparación

- Coincidencia automática solo con **nombre normalizado exactamente igual y misma unidad**; cualquier otra equivalencia se confirma en Artículos.
- Se compara la tarifa más reciente por proveedor y código, según fecha de vigencia, entre artículos vinculados con la misma unidad.
- `UK` de J. C. Viñas se interpreta como kg y `UP` como unidad. En Hotelsa, los precios de caja/bolsa/saco quedan en `ud` y requieren revisión de presentación antes de compararse por kg. El nombre comercial y el precio de caja se conservan como referencia.
- El lector PDF reconoce la estructura de texto de la tarifa adjunta. PDF escaneado o con otra distribución puede requerir conversión a Excel/CSV.
- Una tarifa posterior no borra la anterior. El usuario puede revisar vínculos; esta V1 no incluye albaranes ni pedidos.
