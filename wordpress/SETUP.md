# Imprelapp WordPress — Guía de Setup Completa

## Stack
- WordPress + Elementor Pro + WooCommerce (ya instalados)
- Tema: Hello Elementor
- País: Colombia | Moneda: COP
- Pagos: MercadoPago Colombia + Contra entrega

---

## PASO 1 — Instalar Hello Elementor

1. WordPress Admin → Apariencia → Temas → Agregar nuevo
2. Buscar `Hello Elementor` → Instalar → Activar
3. Apariencia → Personalizar → elimina cualquier CSS extra heredado

---

## PASO 2 — Configurar WooCommerce Colombia

1. **WooCommerce → Ajustes → General**
   - País / Estado de venta: `Colombia`
   - Moneda: `Peso colombiano (COP)`
   - Posición del símbolo: `Izquierda`
   - Miles separados por: `.`
   - Decimales: `0`

2. **WooCommerce → Ajustes → Envío**
   - Crear zona: `Colombia`
   - Agregar método: `Tarifa fija` (configura precio según tu operador)
   - Agregar método: `Recogida en tienda` (si aplica)

3. **WooCommerce → Ajustes → Avanzado → Páginas**
   - Asegúrate que Carrito, Tienda, Cuenta y Finalizar compra están asignadas

---

## PASO 3 — Instalar Plugin MercadoPago

1. WordPress Admin → Plugins → Agregar nuevo
2. Buscar `Mercado Pago payments for WooCommerce` (plugin oficial de MercadoPago)
3. Instalar → Activar
4. WooCommerce → Ajustes → Pagos → MercadoPago
5. Click en **Configurar**
6. Conectar cuenta: click `Obtener credenciales` → Inicia sesión en tu cuenta MercadoPago Colombia
7. Copiar **Public Key** y **Access Token** (producción) en los campos correspondientes
8. Activar métodos: `Checkout Pro` (recomendado) o `Checkout Transparente`
9. **Modo de prueba**: activar durante desarrollo, desactivar en producción

**Checkout Transparente** (pago sin salir del sitio):
- Requiere validación extra de MercadoPago Colombia
- Acepta: tarjetas débito/crédito, PSE, efectivo (Efecty)

---

## PASO 4 — Configurar Contra Entrega / Transferencia

1. WooCommerce → Ajustes → Pagos
2. **Contra reembolso (COD)** → Activar → Configurar
   - Título: `Contra entrega`
   - Instrucciones: `Paga en efectivo al recibir tu pedido.`

3. Para **Transferencia bancaria**:
   - Activar `Transferencia bancaria directa (BACS)`
   - Agregar datos bancarios: banco, cuenta, titular, NIT

---

## PASO 5 — Instalar Plugin "Código del Vendedor"

1. Copiar archivo `plugins/imprelapp-vendor-code.php` a la carpeta:
   ```
   /wp-content/plugins/imprelapp-vendor-code/imprelapp-vendor-code.php
   ```
   > Crea la carpeta `imprelapp-vendor-code` dentro de `/plugins/`

2. WordPress Admin → Plugins → busca `Imprelapp - Código del Vendedor` → Activar

3. El campo aparecerá automáticamente en el carrito de compras.

**¿Qué hace?**
- Muestra campo "¿Tienes un código de vendedor?" en el carrito
- Guarda el código en el pedido (meta `_imprelapp_vendor_code`)
- Visible en el panel admin de cada pedido
- Aparece en el email de confirmación al cliente y al admin
- Columna extra en el listado de pedidos de WooCommerce

---

## PASO 6 — Importar Template Home Page

1. Crear página nueva: Páginas → Agregar nueva
   - Título: `Inicio`
   - Template de página: `Elementor Canvas` (sin header/footer del tema, si usas header de Elementor)
   - Publicar

2. Abrir con Elementor → clic en ícono de carpeta (arriba a la izquierda)
3. Pestaña `Mis Plantillas` → `Importar plantilla`
4. Subir archivo `templates/home-page.json`
5. Insertar plantilla

6. **Reemplazar placeholders**:
   - `REEMPLAZAR_CON_URL_LOGO` → subir logo al Media Library → copiar URL
   - `REEMPLAZAR_NUMERO` → número WhatsApp Colombia (ej. `573001234567`)

7. WordPress Admin → Ajustes → Lectura → Página principal: seleccionar `Inicio`

---

## PASO 7 — Importar Template Carrito

1. Ir a: Páginas → buscar la página `Carrito` (creada automáticamente por WooCommerce)
2. Abrir con Elementor
3. Importar `templates/cart-page.json` (mismo proceso)
4. El shortcode `[woocommerce_cart]` ya incluye todo el carrito de WooCommerce
5. El plugin del Paso 5 inyecta el campo "Código del vendedor" automáticamente antes de los totales

---

## PASO 8 — Tipografía Global (Inter)

1. Elementor → Site Settings (ícono hamburguesa → Site Settings)
2. Global Fonts:
   - Primary: `Inter` (Google Fonts) — Regular 400
   - Secondary: `Inter` — Bold 700
3. Global Colors:
   - Primary: `#08428C`
   - Secondary: `#034C8C`
   - Text: `#1A1A1A`
   - Accent: `#EEF4FF`

---

## PASO 9 — Header y Footer globales (Elementor Pro)

1. Elementor → Crear → Nuevo → Header
   - Agrega: Logo (imagen), menú de navegación, ícono de carrito WC
   - Colores: fondo `#08428C`, texto/links `#FFFFFF`
   - Publicar → asignar a "Todo el sitio"

2. Elementor → Crear → Nuevo → Footer
   - Agrega: logo, datos de contacto, links útiles, redes sociales
   - Fondo: `#034C8C`, texto: `#FFFFFF`
   - Publicar → asignar a "Todo el sitio"

---

## PASO 10 — Categorías de Productos

Antes de cargar productos, crea las categorías en WooCommerce:
- Productos → Categorías

Categorías sugeridas (ajustar según tu catálogo):
- Rodamientos
- Piñones
- Correas
- Cadenas
- Ferretería General
- Lubricantes

---

## Checklist Final

- [ ] Hello Elementor instalado y activo
- [ ] WooCommerce configurado: COP, Colombia, zonas de envío
- [ ] MercadoPago conectado con credenciales de producción
- [ ] Contra entrega y transferencia activados
- [ ] Plugin `imprelapp-vendor-code` activo
- [ ] Logo subido al Media Library
- [ ] Template Home importado y logo/WhatsApp reemplazados
- [ ] Template Carrito importado
- [ ] Tipografía Inter y colores globales configurados en Elementor
- [ ] Header y Footer creados en Elementor Pro
- [ ] Página de inicio asignada en Ajustes → Lectura
- [ ] Prueba de compra completa: agregar producto → carrito → checkout → pedido recibido
- [ ] Verificar código de vendedor se guarda en pedido admin

---

## Notas MercadoPago Colombia

- Plugin oficial: `Mercado Pago payments for WooCommerce` (Mercado Pago S.A.)
- PSE (débito directo) disponible en Checkout Transparente
- Efecty y Baloto disponibles como métodos adicionales
- Modo sandbox: usar credenciales de prueba de tu cuenta MercadoPago → Developer → Credentials
- Comisión MercadoPago Colombia: ~3.49% + IVA por transacción (verificar en tu cuenta)
