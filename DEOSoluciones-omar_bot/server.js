const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Resend } = require('resend');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'deosoluciones_secret_key';
const resend = new Resend(process.env.RESEND_API_KEY);

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ──────────────────────────────────────────
// FIREBASE
// ──────────────────────────────────────────
const serviceAccount = require('./deosoluciones-29141-firebase-adminsdk-fbsvc-922ff09da1.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// ──────────────────────────────────────────
// RUTAS HTML
// ──────────────────────────────────────────
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/nosotros', (req, res) => res.sendFile(path.join(__dirname, 'public', 'nosotros.html')));
app.get('/productos', (req, res) => res.sendFile(path.join(__dirname, 'public', 'productos.html')));
app.get('/contacto', (req, res) => res.sendFile(path.join(__dirname, 'public', 'contacto.html')));

// ──────────────────────────────────────────
// API - Autenticación
// ──────────────────────────────────────────
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@deosoluciones.com';
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) return res.status(500).json({ error: 'Servidor no configurado correctamente' });
    if (email === adminEmail && password === adminPassword) {
      const token = jwt.sign({ email, role: 'admin' }, JWT_SECRET, { expiresIn: '8h' });
      return res.json({ token, message: 'Login exitoso' });
    }
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/admin-login', (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return res.status(500).json({ error: 'Servidor no configurado correctamente' });
  if (password === adminPassword) {
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '8h' });
    return res.json({ token });
  }
  return res.status(401).json({ error: 'Contraseña incorrecta' });
});

// ──────────────────────────────────────────
// Middleware JWT
// ──────────────────────────────────────────
function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requerido' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
}

// ──────────────────────────────────────────
// API - PRODUCTOS (CRUD completo con Firebase)
// ──────────────────────────────────────────

// Obtener todos los productos
app.get('/api/productos', async (req, res) => {
  try {
    const snapshot = await db.collection('productos').orderBy('fecha_creacion', 'desc').get();
    const productos = [];
    snapshot.forEach(doc => productos.push({ docId: doc.id, ...doc.data() }));
    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// Agregar producto
app.post('/api/productos', async (req, res) => {
  try {
    const nuevoProducto = req.body;
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
app.put('/api/productos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizados = req.body;
    if (datosActualizados.docId) delete datosActualizados.docId;
    const docRef = db.collection('productos').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: `Producto con ID ${id} no existe` });
    await docRef.update({ ...datosActualizados, fecha_actualizacion: admin.firestore.FieldValue.serverTimestamp() });
    const docActualizado = await docRef.get();
    res.json({ message: 'Producto actualizado correctamente', data: docActualizado.data() });
  } catch (error) {
    console.error('Error al actualizar:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
});

// Eliminar producto
app.delete('/api/productos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('productos').doc(id).delete();
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

app.post('/api/contacto', async (req, res) => {
  const { nombre, telefono, correo, empresa, servicio, motivo } = req.body;
  if (!nombre || !telefono || !correo || !servicio || !motivo) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  try {
    await db.collection('contactos').add({
      nombre, telefono, correo,
      empresa: empresa || '',
      servicio, motivo,
      fecha: admin.firestore.FieldValue.serverTimestamp()
    });

    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: ['omarsena2475@gmail.com', 'asesor.ventas@deosoluciones.com'],
      subject: `📩 Nuevo contacto de ${nombre} - DEOSOLUCIONES`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px;">
          <div style="background: #0057ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; font-size: 22px;">📩 Nuevo mensaje de contacto</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0;">DEOSOLUCIONES</p>
          </div>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 10px; background: #f5f7ff; font-weight: bold; width: 140px;">👤 Nombre</td><td style="padding: 10px;">${nombre}</td></tr>
            <tr><td style="padding: 10px; font-weight: bold;">📱 Teléfono</td><td style="padding: 10px;">${telefono}</td></tr>
            <tr><td style="padding: 10px; background: #f5f7ff; font-weight: bold;">📧 Correo</td><td style="padding: 10px;">${correo}</td></tr>
            <tr><td style="padding: 10px; font-weight: bold;">🏢 Empresa</td><td style="padding: 10px;">${empresa || 'No indicó'}</td></tr>
            <tr><td style="padding: 10px; background: #f5f7ff; font-weight: bold;">🔧 Servicio</td><td style="padding: 10px;">${serviciosTexto[servicio] || servicio}</td></tr>
            <tr><td style="padding: 10px; font-weight: bold;">💬 Motivo</td><td style="padding: 10px;">${motivosTexto[motivo] || motivo}</td></tr>
          </table>
          <div style="margin-top: 20px; padding: 15px; background: #f0f4ff; border-radius: 8px; text-align: center;">
            <p style="margin: 0; color: #555; font-size: 13px;">⏱️ Recuerda responder en menos de 2 horas</p>
          </div>
        </div>
      `
    });

    res.json({ message: 'Contacto guardado correctamente' });
  } catch (error) {
    console.error('Error guardando contacto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ──────────────────────────────────────────
// API - Bot
// ──────────────────────────────────────────
const { obtenerRespuesta } = require('./bot.js');

app.post('/api/bot', async (req, res) => {
  const { mensaje } = req.body;
  if (!mensaje) return res.status(400).json({ error: 'Mensaje requerido' });
  const respuesta = obtenerRespuesta(mensaje);

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

  res.json({ respuesta });
});

// ──────────────────────────────────────────
// Ruta 404
// ──────────────────────────────────────────
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ──────────────────────────────────────────
// Iniciar servidor
// ──────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Servidor DEOSoluciones corriendo en http://localhost:${PORT}`);
});