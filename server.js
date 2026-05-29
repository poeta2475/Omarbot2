const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { Resend } = require('resend');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY no definida en variables de entorno');
const resend = new Resend(process.env.RESEND_API_KEY);

// ──────────────────────────────────────────
// SECURITY HEADERS
// ──────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      scriptSrc:   ["'self'", "'unsafe-inline'",
                    "cdn.tailwindcss.com", "unpkg.com",
                    "www.gstatic.com", "apis.google.com",
                    "*.firebaseapp.com",
                    "www.google.com"],
      // scriptSrcAttr queda en 'none' (default de Helmet): ya no hay manejadores
      // inline (onclick, etc.) — todos migrados a delegación en src/ui-common.js.
      styleSrc:    ["'self'", "'unsafe-inline'",
                    "fonts.googleapis.com", "unpkg.com"],
      fontSrc:     ["'self'", "fonts.gstatic.com"],
      imgSrc:      ["'self'", "data:", "https:"],
      connectSrc:  ["'self'",
                    "*.googleapis.com", "*.firebaseio.com",
                    "*.firebaseapp.com", "www.gstatic.com",
                    "identitytoolkit.googleapis.com",
                    "securetoken.googleapis.com",
                    "www.google.com"],
      // Firebase Auth (signInWithPopup) carga un iframe del dominio de auth y de Google.
      // www.google.com es necesario para Firebase App Check (reCAPTCHA v3).
      frameSrc:    ["'self'", "*.firebaseapp.com",
                    "accounts.google.com", "apis.google.com",
                    "www.google.com"],
      objectSrc:   ["'none'"],
      baseUri:     ["'self'"],
      formAction:  ["'self'"],
    }
  },
  crossOriginEmbedderPolicy: false,
  // Firebase signInWithPopup necesita window.opener para devolver el resultado.
  // COOP 'same-origin' (default de Helmet) lo rompe → "Inicio de sesión cancelado".
  // 'same-origin-allow-popups' mantiene la protección pero permite los popups propios.
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  permissionsPolicy: {
    features: {
      geolocation:  [],
      microphone:   [],
      camera:       [],
    }
  }
}));

// CORS
const allowedOrigins = [
  'https://deosoluciones.com',
  'https://www.deosoluciones.com',
  ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()) : []),
  ...(process.env.NODE_ENV !== 'production'
    ? ['http://localhost:3000', 'http://127.0.0.1:3000']
    : [])
];
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(Object.assign(new Error('CORS: origen no permitido'), { status: 403 }));
  },
  methods:        ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials:    true,
  maxAge:         86400
};
app.use(cors(corsOptions));

if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(301, 'https://' + req.get('host') + req.url);
    }
    next();
  });
}

app.use(morgan('combined'));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ──────────────────────────────────────────
// FIREBASE
// ──────────────────────────────────────────
let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try { serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT); }
  catch { throw new Error('FIREBASE_SERVICE_ACCOUNT no es JSON válido'); }
} else {
  // Busca automáticamente cualquier clave de servicio de Firebase en la raíz,
  // así no hay que renombrar el archivo descargado con un nombre exacto.
  // Patrón típico del archivo de Firebase: *-firebase-adminsdk-*.json
  const fs = require('fs');
  const keyFile = fs.readdirSync(__dirname)
    .find(f => /firebase-adminsdk.*\.json$/i.test(f));
  if (keyFile) {
    try {
      serviceAccount = require(path.join(__dirname, keyFile));
      console.log(`🔑 Credenciales de Firebase cargadas desde: ${keyFile}`);
    } catch {
      throw new Error(`No se pudo leer el archivo de credenciales ${keyFile} (¿JSON corrupto?).`);
    }
  } else {
    throw new Error(
      'Faltan credenciales de Firebase.\n' +
      'Opción A: Coloca el archivo *-firebase-adminsdk-*.json (el que descargas de\n' +
      '          Firebase → Configuración → Cuentas de servicio → Generar clave) en la raíz del proyecto.\n' +
      'Opción B: Define la variable de entorno FIREBASE_SERVICE_ACCOUNT con el contenido JSON del service account.'
    );
  }
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// ──────────────────────────────────────────
// RATE LIMITING
// ──────────────────────────────────────────
const contactoLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Límite de mensajes alcanzado. Intenta en 1 hora.' }
});
const botLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes. Espera un momento.' }
});

// ──────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────
const CAMPOS_PRODUCTO = ['nombre', 'descripcion', 'precio', 'stock', 'categoria', 'imagen_url'];
function sanitizarProducto(body) {
  const data = {};
  for (const campo of CAMPOS_PRODUCTO) {
    if (body[campo] !== undefined) data[campo] = body[campo];
  }
  return data;
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

const emailDestinatarios = process.env.CONTACT_EMAIL_TO
  ? process.env.CONTACT_EMAIL_TO.split(',').map(e => e.trim())
  : ['omarsena2475@gmail.com'];

// Remitente de los correos. En producción debe ser una dirección de un dominio
// verificado en Resend (ej: contacto@deosoluciones.com). El valor por defecto
// 'onboarding@resend.dev' es el sandbox de Resend: solo entrega al correo de la
// cuenta y NO sirve para enviar a destinatarios reales.
const emailRemitente = process.env.CONTACT_EMAIL_FROM || 'onboarding@resend.dev';

// ──────────────────────────────────────────
// API - Health check
// ──────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ──────────────────────────────────────────
// RUTAS HTML
// ──────────────────────────────────────────
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/nosotros', (req, res) => res.sendFile(path.join(__dirname, 'public', 'nosotros.html')));
app.get('/productos', (req, res) => res.sendFile(path.join(__dirname, 'public', 'productos.html')));
app.get('/contacto', (req, res) => res.sendFile(path.join(__dirname, 'public', 'contacto.html')));
app.get('/servicios', (req, res) => res.sendFile(path.join(__dirname, 'public', 'servicios.html')));
app.get('/gestion-usuarios', (req, res) => res.sendFile(path.join(__dirname, 'public', 'gestion_usuarios.html')));

// ──────────────────────────────────────────
// Middleware de autenticación
// ──────────────────────────────────────────
// Verifica un ID token de Firebase y que el usuario tenga rol de admin en Firestore.
async function verificarAdminFirebase(req, res, next) {
  const authHeader = req.headers['authorization'];
  const idToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken) return res.status(401).json({ error: 'Token requerido' });
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const userDoc = await db.collection('usuarios').doc(decoded.uid).get();
    const rol = userDoc.exists ? userDoc.data().rol : null;
    if (rol !== 'admin' && rol !== 'administrador') {
      return res.status(403).json({ error: 'Requiere permisos de administrador' });
    }
    req.user = { uid: decoded.uid, email: decoded.email, rol };
    next();
  } catch {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
}

// ──────────────────────────────────────────
// API - PRODUCTOS (CRUD completo con Firebase)
// ──────────────────────────────────────────

// Obtener todos los productos
app.get('/api/productos', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const page  = Math.max(parseInt(req.query.page,  10) || 1, 1);

    let query = db.collection('productos').orderBy('fecha_creacion', 'desc');
    const totalSnap = await db.collection('productos').count().get();
    const total = totalSnap.data().count;

    if (page > 1) {
      const prevSnap = await db.collection('productos')
        .orderBy('fecha_creacion', 'desc')
        .limit((page - 1) * limit)
        .get();
      if (!prevSnap.empty) {
        const lastDoc = prevSnap.docs[prevSnap.docs.length - 1];
        query = query.startAfter(lastDoc);
      }
    }

    const snapshot = await query.limit(limit).get();
    const productos = [];
    snapshot.forEach(doc => productos.push({ docId: doc.id, ...doc.data() }));
    res.json({ productos, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// Agregar producto
app.post('/api/productos', verificarAdminFirebase, async (req, res) => {
  try {
    const nuevoProducto = sanitizarProducto(req.body);
    if (!nuevoProducto.nombre) return res.status(400).json({ error: 'El nombre es requerido' });
    if (nuevoProducto.precio !== undefined && (isNaN(Number(nuevoProducto.precio)) || Number(nuevoProducto.precio) < 0)) {
      return res.status(400).json({ error: 'El precio debe ser un número positivo' });
    }
    if (nuevoProducto.stock !== undefined && (isNaN(Number(nuevoProducto.stock)) || Number(nuevoProducto.stock) < 0)) {
      return res.status(400).json({ error: 'El stock debe ser un número positivo' });
    }
    const docRef = await db.collection('productos').add({
      ...nuevoProducto,
      fecha_creacion: admin.firestore.FieldValue.serverTimestamp()
    });
    res.status(201).json({ message: 'Producto guardado', id: docRef.id });
  } catch (error) {
    console.error('Error al guardar producto:', error);
    res.status(500).json({ error: 'Error al guardar producto' });
  }
});

// Actualizar producto
app.put('/api/productos/:id', verificarAdminFirebase, async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizados = sanitizarProducto(req.body);
    if (Object.keys(datosActualizados).length === 0) return res.status(400).json({ error: 'No hay campos válidos para actualizar' });
    const docRef = db.collection('productos').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: `Producto con ID ${id} no existe` });
    await docRef.update({ ...datosActualizados, fecha_actualizacion: admin.firestore.FieldValue.serverTimestamp() });
    const docActualizado = await docRef.get();
    res.json({ message: 'Producto actualizado correctamente', data: docActualizado.data() });
  } catch (error) {
    console.error('Error al actualizar:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar producto
app.delete('/api/productos/:id', verificarAdminFirebase, async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection('productos').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: `Producto con ID ${id} no existe` });
    await docRef.delete();
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

// ──────────────────────────────────────────
// API - Contacto (Firebase + correo)
// ──────────────────────────────────────────
const serviciosTexto = {
  'control-acceso': 'Control de acceso con reconocimiento facial',
  'servicio-tecnico': 'Servicio técnico de equipos',
  'red-wifi': 'Red / WiFi',
  'malware': 'Eliminación de malware / virus',
  'hardware': 'Actualización de hardware (RAM, SSD, etc.)',
  'impresora': 'Soporte de impresoras',
  'venta-equipos': 'Compra de equipos tecnológicos',
  'instalacion': 'Instalación de equipos',
  'otro': 'Otro'
};
const motivosTexto = {
  'cotizacion': 'Quiero una cotización',
  'equipo-danado': 'Tengo un equipo dañado',
  'info-acceso': 'Quiero información del sistema de acceso',
  'comprar-equipo': 'Quiero comprar un equipo',
  'otro': 'Otro'
};

app.post('/api/contacto', contactoLimiter, async (req, res) => {
  const { nombre, telefono, correo, empresa, servicio, motivo, acepto } = req.body;
  if (!nombre || !telefono || !correo || !servicio || !motivo) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  // Ley 1581/2012: se requiere autorización expresa para tratar datos personales
  if (acepto !== true) {
    return res.status(400).json({ error: 'Debes autorizar el tratamiento de datos personales' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(correo)) return res.status(400).json({ error: 'Correo electrónico no válido' });
  if (!/^[\d\s\+\-\(\)]{7,20}$/.test(telefono)) return res.status(400).json({ error: 'Teléfono no válido' });
  if (String(nombre).length > 100 || String(motivo).length > 1000 ||
      String(correo).length > 150 || String(empresa || '').length > 150) {
    return res.status(400).json({ error: 'Uno de los campos excede la longitud permitida' });
  }
  // Evita inyección de cabeceras (CRLF) en el asunto del correo
  const nombreAsunto = String(nombre).replace(/[\r\n]+/g, ' ').trim();

  // 1) Guardar el contacto en Firestore (operación principal).
  try {
    await db.collection('contactos').add({
      nombre, telefono, correo,
      empresa: empresa || '',
      servicio, motivo,
      autorizacionDatos: true,
      fechaAutorizacion: admin.firestore.FieldValue.serverTimestamp(),
      fecha: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Error guardando contacto en Firestore:', error);
    return res.status(500).json({
      error: process.env.NODE_ENV === 'production'
        ? 'No pudimos guardar tu mensaje. Intenta de nuevo o escríbenos al 324 260 0709.'
        : 'Firestore: ' + (error.message || 'error desconocido')
    });
  }

  // 2) Enviar el email de notificación (secundario): si falla, el contacto
  //    ya quedó guardado, así que NO devolvemos error al usuario.
  try {
    await resend.emails.send({
      from: emailRemitente,
      to: emailDestinatarios,
      subject: `📩 Nuevo contacto de ${nombreAsunto} - DEOSOLUCIONES`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px;">
          <div style="background: #0057ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; font-size: 22px;">📩 Nuevo mensaje de contacto</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0;">DEOSOLUCIONES</p>
          </div>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 10px; background: #f5f7ff; font-weight: bold; width: 140px;">👤 Nombre</td><td style="padding: 10px;">${escapeHtml(nombre)}</td></tr>
            <tr><td style="padding: 10px; font-weight: bold;">📱 Teléfono</td><td style="padding: 10px;">${escapeHtml(telefono)}</td></tr>
            <tr><td style="padding: 10px; background: #f5f7ff; font-weight: bold;">📧 Correo</td><td style="padding: 10px;">${escapeHtml(correo)}</td></tr>
            <tr><td style="padding: 10px; font-weight: bold;">🏢 Empresa</td><td style="padding: 10px;">${escapeHtml(empresa || 'No indicó')}</td></tr>
            <tr><td style="padding: 10px; background: #f5f7ff; font-weight: bold;">🔧 Servicio</td><td style="padding: 10px;">${escapeHtml(serviciosTexto[servicio] || servicio)}</td></tr>
            <tr><td style="padding: 10px; font-weight: bold;">💬 Motivo</td><td style="padding: 10px;">${escapeHtml(motivosTexto[motivo] || motivo)}</td></tr>
          </table>
          <div style="margin-top: 20px; padding: 15px; background: #f0f4ff; border-radius: 8px; text-align: center;">
            <p style="margin: 0; color: #555; font-size: 13px;">⏱️ Recuerda responder en menos de 2 horas</p>
          </div>
        </div>
      `
    });
  } catch (error) {
    // El correo de notificación falló (p. ej. Resend en sandbox o clave inválida),
    // pero el contacto ya se guardó. Lo registramos y seguimos con éxito.
    console.error('Aviso: el contacto se guardó pero falló el envío del email:', error?.message || error);
  }

  res.json({ message: 'Contacto guardado correctamente' });
});

// ──────────────────────────────────────────
// API - Bot
// ──────────────────────────────────────────
const { responder } = require('./bot.js');

app.post('/api/bot', botLimiter, async (req, res) => {
  const { mensaje } = req.body;
  if (!mensaje || typeof mensaje !== 'string') return res.status(400).json({ error: 'Mensaje requerido' });
  if (mensaje.length > 500) return res.status(400).json({ error: 'Mensaje demasiado largo' });
  const { respuesta, sugerencias } = responder(mensaje);

  // Guardar en Firebase si el bot no entendió
  if (respuesta.includes('No entendí')) {
    try {
      await db.collection('bot_no_entendidos').add({
        mensaje,
        fecha: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (e) {
      console.error('Error guardando analytics:', e);
    }
  }

  res.json({ respuesta, sugerencias });
});

// ──────────────────────────────────────────
// Ruta 404
// ──────────────────────────────────────────
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Ruta no encontrada' });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ──────────────────────────────────────────
// Iniciar servidor
// ──────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Servidor DEOSoluciones corriendo en http://localhost:${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM recibido. Cerrando servidor...');
  process.exit(0);
});
process.on('SIGINT', () => {
  console.log('SIGINT recibido. Cerrando servidor...');
  process.exit(0);
});