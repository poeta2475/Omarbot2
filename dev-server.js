// ════════════════════════════════════════
//  SERVIDOR DE PREVIEW (SOLO DESARROLLO)
//  Sirve la web + el bot SIN Firebase ni .env.
//  Úsalo solo para ver el chat localmente:  node dev-server.js
//  El servidor real de producción es server.js
// ════════════════════════════════════════
const express = require('express');
const path = require('path');
const { responder } = require('./bot.js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Bot real (usa bot.js)
app.post('/api/bot', (req, res) => {
  const { mensaje } = req.body || {};
  if (!mensaje || typeof mensaje !== 'string') {
    return res.status(400).json({ error: 'Mensaje requerido' });
  }
  res.json(responder(mensaje));
});

// Contacto simulado (no envía correo ni guarda en Firebase)
app.post('/api/contacto', (req, res) => {
  console.log('📩 [PREVIEW] Formulario recibido:', req.body);
  res.json({ message: 'Contacto recibido (modo preview)' });
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', mode: 'preview' }));

app.listen(PORT, () => {
  console.log(`\n  🔍 PREVIEW DEOSOLUCIONES (sin Firebase)`);
  console.log(`  ➜  http://localhost:${PORT}\n`);
  console.log(`  El chat y el bot funcionan. Login/Google y guardado real`);
  console.log(`  requieren el servidor de producción (node server.js).\n`);
});
