# Memoria de Errores — DEOSoluciones / Omarbot2

Registro de errores encontrados en el proyecto, su causa raíz y la solución aplicada.
El objetivo es no volver a tropezar con el mismo problema. Añade una entrada nueva
arriba del todo cada vez que resuelvas un error.

---

## 2026-05-23 — Login con Google roto por CSP `frame-src 'none'`

**Síntomas**
- Al pulsar "Continuar con Google" el popup no completaba el inicio de sesión
  (se quedaba colgado o fallaba silenciosamente).

**Causa raíz**
Firebase Auth (`signInWithPopup`) carga un iframe oculto del dominio de
autenticación (`*.firebaseapp.com`) y de Google para la comunicación segura
entre ventanas. La directiva CSP `frame-src 'none'` bloqueaba ese iframe.
Es el mismo tipo de error que el de los `onclick`: la política de seguridad
impedía algo que el código necesitaba.

**Solución** (`server.js`, CSP)
Cambiar `frameSrc: ["'none'"]` por
`["'self'", "*.firebaseapp.com", "accounts.google.com", "apis.google.com"]`.

**Hallazgo relacionado (pendiente de decisión, NO es un bug de código)**
El correo de contacto usa `from: 'onboarding@resend.dev'` (remitente sandbox de
Resend). En producción Resend solo entrega a la dirección verificada de la
cuenta. Para enviar a destinatarios reales hay que verificar un dominio propio
en Resend y cambiar el `from`.

---

## 2026-05-23 — Botones inertes: modo oscuro, login y cierre de modal no funcionaban

**Síntomas**
- El botón de modo oscuro no cambiaba el tema.
- El botón de login no abría el modal.
- Una vez abierto, el modal no se podía cerrar (ni con la X, ni clic afuera).
- Consola llena de errores CSP y `.js.map` de Firebase bloqueados.

**Causa raíz**
Helmet activa por defecto la directiva CSP `script-src-attr 'none'`, que **bloquea
todos los manejadores de eventos inline** (`onclick="..."`, `onchange="..."`, etc.).
El HTML del sitio usa `onclick` directamente en los botones, así que el navegador
se negaba a ejecutarlos. El código JavaScript estaba bien; lo bloqueaba la política
de seguridad.

Además, los source maps de Firebase servidos desde `www.gstatic.com` se bloqueaban
porque ese dominio no estaba en la directiva `connect-src` (solo en `script-src`).

**Solución** (`server.js`, config de Helmet CSP)
- Añadir `scriptSrcAttr: ["'unsafe-inline'"]` para permitir los `onclick` inline.
- Añadir `www.gstatic.com` a `connectSrc` para los source maps.

Commit: `50804ec` — *fix(csp): permitir event handlers inline y source maps de Firebase*

**Mejora futura (deuda técnica)**
Permitir `'unsafe-inline'` en handlers reduce la protección contra XSS. Lo ideal es
mover los `onclick="..."` del HTML a `addEventListener(...)` en archivos `.js`
externos y luego retirar `scriptSrcAttr: 'unsafe-inline'`.

---
