# DEOSOLUCIONES — Instalación local

## Requisitos previos

- [Node.js](https://nodejs.org) v18 o superior
- Cuenta en [Firebase](https://firebase.google.com) (proyecto ya creado)
- Cuenta en [Resend](https://resend.com) (para envío de correos)

---

## Pasos para instalar en tu PC

### 1. Clonar el repositorio

```bash
git clone https://gitea.tu-servidor.com/poeta2475/Omarbot2.git
cd Omarbot2
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Abre el archivo `.env` y llena los valores:

| Variable | Qué poner |
|----------|-----------|
| `NODE_ENV` | `development` (en tu PC) |
| `ADMIN_EMAIL` | Tu correo de admin |
| `ADMIN_PASSWORD` | Contraseña segura (mín. 16 caracteres) |
| `JWT_SECRET` | Cadena aleatoria larga — generar con el comando de abajo |
| `RESEND_API_KEY` | Tu clave de Resend |
| `CONTACT_EMAIL_TO` | Correo donde llegan los contactos |

**Generar JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 4. Agregar credenciales de Firebase

Descarga el archivo de Service Account desde Firebase:

1. Ve a **Firebase Console → Configuración del proyecto → Cuentas de servicio**
2. Clic en **"Generar nueva clave privada"**
3. Descarga el archivo JSON
4. Renómbralo a `deosoluciones-29141-firebase-adminsdk-fbsvc-922ff09da1.json`
5. Colócalo en la **raíz del proyecto** (junto a `server.js`)

> El archivo está en `.gitignore` — nunca se sube al repositorio.

### 5. Iniciar el servidor

```bash
npm start
```

O en modo desarrollo (se reinicia automáticamente al editar):

```bash
npm run dev
```

Abre tu navegador en: **http://localhost:3000**

---

## Estructura del proyecto

```
├── server.js              # Servidor Express (backend)
├── bot.js                 # Lógica del chatbot
├── public/
│   ├── index.html         # Página principal
│   ├── servicios.html
│   ├── nosotros.html
│   ├── productos.html
│   ├── contacto.html
│   ├── admin.html         # Panel de administración
│   ├── gestion_usuarios.html
│   ├── src/
│   │   ├── firebase_config.js
│   │   ├── auth.js
│   │   └── gestion_usuarios.js
│   └── images/
├── firestore.rules        # Reglas de seguridad de Firestore
├── .env.example           # Plantilla de variables de entorno
└── TAREAS_MANUALES.md     # Tareas de configuración en Firebase/Resend
```

---

## Variables de entorno completas

Ver `.env.example` para la lista completa con descripciones.

---

## Desplegar reglas de Firestore

Después de cualquier cambio en `firestore.rules`:

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

---

## Solución de problemas comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `JWT_SECRET no definida` | Falta el `.env` | Crear `.env` desde `.env.example` |
| `Faltan credenciales de Firebase` | JSON de service account no encontrado | Ver paso 4 |
| CORS error en el navegador | `NODE_ENV=production` en local | Cambiar a `NODE_ENV=development` en `.env` |
| Puerto 3000 ocupado | Otro proceso usa ese puerto | Cambiar `PORT=3001` en `.env` |
