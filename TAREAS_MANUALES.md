# Tareas manuales pendientes — DEOSOLUCIONES

> Todo lo que NO puede hacer el código solo y requiere tu acción directa.

---

## 1. Desplegar reglas de Firestore (Obligatorio)

Las reglas de seguridad de la base de datos están escritas pero NO activas todavía.

```bash
firebase deploy --only firestore:rules
```

Sin esto, cualquier usuario puede escribir en `productos` directamente desde el navegador.

---

## 2. Variables de entorno en producción (Obligatorio)

En tu plataforma de hosting (Railway, Render, VPS, etc.) debes configurar estas variables:

| Variable | Descripción |
|----------|-------------|
| `NODE_ENV` | Poner `production` |
| `ADMIN_EMAIL` | Email del administrador. Ej: `admin@deosoluciones.com` |
| `ADMIN_PASSWORD` | Contraseña segura (mín. 16 caracteres, con números y símbolos) |
| `JWT_SECRET` | Cadena aleatoria larga (mín. 32 caracteres). Generar con: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `RESEND_API_KEY` | Tu clave de Resend. Ej: `re_XXXXXXXXXXXXXXXX` |
| `CONTACT_EMAIL_TO` | Correos que reciben los contactos. Ej: `omarsena2475@gmail.com,asesor@deosoluciones.com` |
| `FIREBASE_SERVICE_ACCOUNT` | Contenido completo del JSON del service account (ver tarea #3) |

---

## 3. Rotar clave del Service Account de Firebase (Urgente si el JSON estuvo en git)

Verificar si el archivo de claves estuvo expuesto:
```bash
git log --all --full-history -- "*.json" | head -20
```

Si aparece `deosoluciones-29141-firebase-adminsdk-fbsvc-922ff09da1.json` en el historial:

1. Ir a **Firebase Console → Project Settings → Service Accounts**
2. Clic en **"Generate new private key"**
3. Descargar el nuevo JSON
4. Copiar el contenido completo y pegarlo en la variable de entorno `FIREBASE_SERVICE_ACCOUNT`
5. Revocar la clave antigua desde Google Cloud Console → IAM → Service Accounts

---

## 4. Verificar dominio en Resend y corregir remitente de correos

Actualmente los correos salen de `onboarding@resend.dev` (dominio de prueba de Resend). Para usar tu propio dominio:

**Paso 1 — Verificar dominio en Resend:**
1. Ir a [resend.com](https://resend.com) → **Domains → Add Domain**
2. Ingresar `deosoluciones.com`
3. Agregar los registros DNS que indica Resend en tu proveedor de dominio (Namecheap, GoDaddy, Cloudflare, etc.)
4. Esperar verificación (puede tardar hasta 48 horas)

**Paso 2 — Cambiar el remitente en el código:**

En `server.js`, línea ~291, cambiar:
```javascript
// ANTES
from: 'onboarding@resend.dev',

// DESPUÉS
from: 'DEOSOLUCIONES <noreply@deosoluciones.com>',
```

---

## 5. Firebase App Check con reCAPTCHA v3 (Recomendado)

Protege tu base de datos para que solo tu sitio web pueda acceder.

**Paso 1 — Crear Site Key en Google:**
1. Ir a [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Crear un nuevo sitio → Tipo: **reCAPTCHA v3**
3. Dominio: `deosoluciones.com` y `www.deosoluciones.com`
4. Copiar la **Site Key**

**Paso 2 — Activar App Check en Firebase:**
1. Ir a **Firebase Console → App Check**
2. Seleccionar tu app web → **reCAPTCHA v3** → pegar la Site Key
3. Una vez probado: clic en **"Enforce"** para Firestore y Auth

**Paso 3 — Agregar la clave al código:**

En `public/src/firebase_config.js`, reemplazar:
```javascript
const RECAPTCHA_SITE_KEY = 'REEMPLAZAR_CON_SITE_KEY_RECAPTCHA_V3';
```
por tu Site Key real.

---

## 6. Contraseña admin: verificar que sea fuerte

La contraseña en `ADMIN_PASSWORD` debe cumplir:
- Mínimo 16 caracteres
- Letras mayúsculas, minúsculas, números y símbolos
- No usarla en ningún otro sitio

Generar una segura:
```bash
node -e "console.log(require('crypto').randomBytes(24).toString('base64'))"
```

---

## Resumen rápido — orden sugerido

1. ✅ Variables de entorno en el servidor de producción
2. ✅ Desplegar reglas de Firestore: `firebase deploy --only firestore:rules`
3. ✅ Rotar Service Account si estuvo en git
4. ✅ Verificar dominio en Resend → cambiar `from` en server.js
5. ✅ Agregar Site Key de reCAPTCHA en firebase_config.js → activar App Check
