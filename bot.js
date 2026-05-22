// ──────────────────────────────────────────
// BOT DE CHAT - DEOSOLUCIONES v4.0
// Sistema inteligente con múltiples intenciones,
// detección de urgencia, respuestas variables y contexto
// ──────────────────────────────────────────

const TELEFONO = '324 260 0709';
const EMAIL = 'deosoluciones1@gmail.com';

// ── RESPUESTAS VARIABLES (aleatorias para sonar más humano) ──
const saludosVariables = [
  '👋 ¡Hola! Bienvenido a DEOSOLUCIONES.\n\nSoy tu asistente virtual. ¿En qué te puedo ayudar hoy?\n\n• 🔐 Control de acceso facial\n• 🔧 Servicio técnico\n• 💰 Cotización\n• 📋 Dejar mis datos\n\nEscribe "inicio" para ver el menú completo.',
  '😊 ¡Hola! Gracias por contactar a DEOSOLUCIONES.\n\n¿Qué necesitas hoy?\n\n• 🔐 HikVision y control de acceso\n• 🔧 Reparación de equipos\n• 💰 Precios y cotizaciones\n• 📍 Información general\n\nEscribe "inicio" para ver todas las opciones.',
  '🤖 ¡Hola! Soy el asistente de DEOSOLUCIONES.\n\nEstoy aquí para ayudarte con:\n\n• 🔐 Sistemas de acceso biométrico\n• 🔧 Servicio técnico especializado\n• 🛒 Venta de equipos\n• 💰 Cotizaciones personalizadas\n\n¿Por dónde empezamos?'
];

const despedidasVariables = [
  `😊 ¡Con mucho gusto! Fue un placer ayudarte.\n\n📱 WhatsApp: ${TELEFONO}\n\n¡Hasta pronto! 👋`,
  `👋 ¡Hasta luego! Recuerda que estamos aquí cuando nos necesites.\n\n📱 ${TELEFONO}`,
  `😊 ¡Que tengas un excelente día! Cualquier cosa no dudes en escribirnos.\n\n📱 WhatsApp: ${TELEFONO}`
];

function aleatorio(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── BASE DE CONOCIMIENTO CON PRIORIDADES ──
// prioridad: 1=alta (urgencias), 2=media, 3=baja (saludos)
const intenciones = [

  // ── PRIORIDAD 1: URGENCIAS ──
  {
    prioridad: 1,
    palabras: ['urgente', 'urgencia', 'emergencia', 'rapido', 'rápido', 'ya mismo', 'ahora mismo', 'hoy mismo', 'es urgente', 'lo mas pronto', 'inmediato', 'se daño ya', 'se cayó el servidor', 'no funciona nada'],
    respuesta: () => `🚨 ¡Atención Urgente!\n\nEntendemos que es importante y lo atendemos con prioridad.\n\n📱 Escríbenos YA al WhatsApp:\n${TELEFONO}\n\n⏱️ En horario laboral respondemos en menos de 30 minutos.\n🕗 Lunes a Viernes 8AM - 5PM\n\nSi es fuera de horario, escríbenos igual y te atendemos lo antes posible.`
  },

  // ── PRIORIDAD 1: ASESOR HUMANO ──
  {
    prioridad: 1,
    palabras: ['asesor', 'humano', 'persona', 'agente', 'quiero hablar con alguien', 'hablar con una persona', 'no quiero bot', 'atiéndeme', 'atiendeme', 'necesito ayuda real', 'quiero un asesor'],
    respuesta: () => `👨‍💼 ¡Claro! Te conecto con un asesor ahora mismo.\n\nNuestro equipo está disponible:\n🕗 Lunes a Viernes 8AM - 5PM\n\n📱 Escríbenos directamente:\nWhatsApp: ${TELEFONO}\n📧 ${EMAIL}\n\nO si prefieres, déjame tus datos y nosotros te llamamos. Escribe "datos" para el formulario.`
  },

  // ── PRIORIDAD 1: RECUPERACIÓN DE DATOS ──
  {
    prioridad: 1,
    palabras: ['perdi datos', 'perdí datos', 'se borraron', 'archivos borrados', 'recuperar datos', 'recuperar archivos', 'formatee sin querer', 'borre todo', 'disco no abre', 'usb no abre'],
    respuesta: () => `💾 ¡Actúa rápido!\n\n⚠️ NO uses el equipo — entre menos lo uses, más posibilidades de recuperar todo.\n\nRecuperamos datos de:\n→ 💿 Discos duros dañados\n→ ⚡ SSD\n→ 🔌 Memorias USB\n→ 📷 Tarjetas SD\n→ 🗑️ Archivos eliminados por error\n\n📱 Llámanos URGENTE: ${TELEFONO}`
  },

  // ── PRIORIDAD 2: HIKVISION ──
  {
    prioridad: 2,
    palabras: ['hikvision', 'hik vision', 'reconocimiento facial', 'control de acceso', 'biometrico', 'biométrico', 'asistencia facial', 'torniquete', 'control personal', 'face id', 'camara seguridad'],
    respuesta: () => `🔐 Sistema HikVision - Control de Acceso Facial\n\n✅ Reconocimiento en menos de 0.5 segundos\n✅ Funciona con mascarilla y baja iluminación\n✅ Reportes automáticos de asistencia\n✅ Integración con torniquetes y cerraduras\n✅ App móvil para gestión remota\n✅ Instalación y capacitación incluida\n✅ Garantía de 6 meses\n\nIdeal para:\n→ Empresas con control de personal\n→ Edificios y conjuntos\n→ Colegios y universidades\n\n📱 Demo gratuita: ${TELEFONO}`
  },

  // ── PRIORIDAD 2: SERVICIO TÉCNICO ──
  {
    prioridad: 2,
    palabras: ['servicio tecnico', 'servicio técnico', 'reparacion', 'reparación', 'reparar', 'arreglar', 'daño', 'dañado', 'no funciona', 'no sirve', 'tecnico', 'técnico', 'descompuesto'],
    respuesta: () => `🔧 Servicio Técnico Especializado\n\nReparamos:\n• 💻 Computadores y portátiles\n• 🖥️ Servidores\n• 💾 NAS y QNAP\n• 📺 Monitores\n\nProblemas frecuentes:\n→ No enciende\n→ Pantalla azul o negra\n→ Muy lento\n→ Virus o malware\n→ Cambio de piezas\n\n✅ Diagnóstico GRATIS\n✅ Garantía 3 meses\n⏱️ Respuesta en menos de 2 horas\n\n📱 ${TELEFONO}`
  },

  // ── PRIORIDAD 2: PC / LAPTOP ESPECÍFICA ──
  {
    prioridad: 2,
    palabras: ['computador', 'computadora', 'pc', 'portatil', 'portátil', 'laptop', 'no prende', 'no enciende', 'lento', 'lenta', 'virus', 'pantalla azul', 'pantalla negra', 'se congela', 'se traba', 'se apaga', 'bateria', 'teclado dañado', 'pantalla rota'],
    respuesta: () => `💻 ¡Te ayudamos con tu equipo!\n\nSolucionamos:\n• 🔧 Lento → limpieza y optimización\n• 🦠 Virus → eliminación completa\n• 🔌 No prende → diagnóstico\n• 💀 Pantalla azul → reparación\n• 💾 Disco lleno → ampliación\n• 🌡️ Sobrecalentamiento → limpieza\n• ⌨️ Teclado o pantalla → reemplazo\n• 🔋 Batería → cambio\n\n✅ Diagnóstico GRATIS\n⏱️ Mayoría listos el mismo día\n\n📱 ${TELEFONO}`
  },

  // ── PRIORIDAD 2: SERVIDORES / NAS ──
  {
    prioridad: 2,
    palabras: ['nas', 'qnap', 'synology', 'servidor', 'servidores', 'almacenamiento', 'backup', 'respaldo', 'nube privada', 'disco en red', 'storage'],
    respuesta: () => `🖥️ Servidores y Almacenamiento\n\nEspecialistas en:\n• 💾 NAS (almacenamiento en red)\n• 🏢 QNAP empresarial\n• 🖥️ Servidores físicos\n• 🔄 Backup automático\n• 🔒 Seguridad y permisos\n• ☁️ Nube privada\n\nIdeal para:\n→ Compartir archivos entre equipos\n→ Backup automático\n→ Acceso remoto seguro\n\n📱 Asesoría gratis: ${TELEFONO}`
  },

  // ── PRIORIDAD 2: MANTENIMIENTO ──
  {
    prioridad: 2,
    palabras: ['mantenimiento', 'preventivo', 'correctivo', 'limpieza equipo', 'formatear', 'formato', 'instalar windows', 'windows', 'optimizar', 'pasta termica'],
    respuesta: () => `🛠️ Mantenimiento de Equipos\n\n🔍 Preventivo (cada 6 meses):\n→ Limpieza interna\n→ Cambio pasta térmica\n→ Actualización drivers\n→ Optimización del sistema\n\n🔧 Correctivo:\n→ Formateo e instalación Windows\n→ Cambio de piezas\n→ Recuperación de datos\n\n✅ Garantía 3 meses\n💰 Desde $80.000\n\n📱 ${TELEFONO}`
  },

  // ── PRIORIDAD 2: SOFTWARE / PROGRAMAS / APLICACIONES ──
  {
    prioridad: 2,
    grupo: 'rep',
    palabras: ['software', 'programa', 'programas', 'aplicacion', 'aplicación', 'app',
      'no abre el programa', 'no abre', 'office', 'word', 'excel', 'powerpoint', 'outlook',
      'chrome', 'browser', 'navegador', 'instalar programa', 'instalar software',
      'desinstalar', 'actualizacion programa', 'actualizar programa', 'programa lento',
      'se cierra solo', 'error al abrir', 'no responde', 'licencia', 'activar windows',
      'activar office', 'clave de producto', 'pantallazo de error', 'error de aplicacion'],
    respuesta: () => `💿 Soporte de Software y Programas\n\nSolucionamos:\n• 🚫 Programa que no abre o se cierra solo\n• ⚠️ Errores al abrir aplicaciones\n• 🐢 Programas lentos o que no responden\n• 📥 Instalación y desinstalación de software\n• 🔄 Actualizaciones de programas\n• 🌐 Navegadores (Chrome, Edge, Firefox)\n\nTambién:\n→ Instalación de Office (Word, Excel, PowerPoint)\n→ Activación de Windows y Office\n→ Licencias originales\n→ Configuración de correo y aplicaciones\n\n✅ Diagnóstico GRATIS\n📱 ${TELEFONO}`
  },

  // ── PRIORIDAD 2: PRECIOS ──
  {
    prioridad: 2,
    palabras: ['precio', 'presio', 'costo', 'cuanto vale', 'cuanto cuesta', 'cuánto cuesta', 'tarifa', 'cobran', 'cotizacion', 'cotización', 'cotizar', 'presupuesto', 'cuanto cobran'],
    respuesta: () => `💰 Nuestros Precios\n\n🔧 Diagnóstico: GRATIS ✅\n🛠️ Mantenimiento: desde $80.000\n💻 Formateo + Windows: desde $120.000\n🖥️ Mantenimiento servidor: desde $150.000\n🔐 HikVision: cotización personalizada\n🛒 Equipos: precios del mercado\n\n💡 Siempre empieza por el diagnóstico GRATIS.\n\n📱 WhatsApp: ${TELEFONO}\n📧 ${EMAIL}`
  },

  // ── PRIORIDAD 2: GARANTÍA ──
  {
    prioridad: 2,
    palabras: ['garantia', 'garantía', 'garantizan', 'tienen garantia', 'cuanto tiempo garantia'],
    respuesta: () => `✅ Garantía en Todo\n\n🔧 Servicio técnico: 3 meses\n🛒 Equipos vendidos: 1 año\n🔐 HikVision: 6 meses\n📦 Instalación: 30 días\n\nSi el problema regresa dentro del período, lo resolvemos SIN COSTO adicional.\n\n📱 ${TELEFONO}`
  },

  // ── PRIORIDAD 2: DIAGNÓSTICO GRATIS ──
  {
    prioridad: 2,
    palabras: ['diagnostico', 'diagnóstico', 'gratis', 'gratuito', 'sin costo', 'promocion', 'oferta', 'descuento', 'no cobran revisar'],
    respuesta: () => `🎉 Diagnóstico 100% GRATIS\n\n¿Cómo funciona?\n1️⃣ Nos contactas\n2️⃣ Llevas el equipo o lo recogemos\n3️⃣ Lo revisamos gratis\n4️⃣ Te damos informe detallado\n5️⃣ Tú decides\n\n💡 Si NO reparas → no pagas nada\n💡 Si reparas → precio justo + garantía\n\n📱 Agenda: ${TELEFONO}`
  },

  // ── PRIORIDAD 2: HORARIO ──
  {
    prioridad: 2,
    palabras: ['horario', 'hora', 'atienden', 'que dia', 'abren', 'cierran', 'disponible', 'sabado', 'domingo', 'festivo'],
    respuesta: () => '🕗 Horario de Atención\n\n📅 Lunes a Viernes\n⏰ 8:00 AM - 5:00 PM\n\n❌ Sábados, domingos y festivos: cerrado\n\n💬 Fuera de horario escríbenos de todas formas, te respondemos al abrir.'
  },

  // ── PRIORIDAD 2: UBICACIÓN ──
  {
    prioridad: 2,
    palabras: ['donde estan', 'donde queda', 'ubicacion', 'ubicación', 'direccion', 'medellin', 'antioquia', 'valle de aburra', 'domicilio', 'van a mi casa', 'recogen', 'cobertura'],
    respuesta: () => `📍 Cobertura DEOSOLUCIONES\n\n🌆 Sede: Medellín\n\n✅ Medellín\n✅ Bello\n✅ Itagüí\n✅ Envigado\n✅ Sabaneta\n✅ La Estrella\n✅ Copacabana\n✅ Caldas\n✅ Girardota\n\n🚗 Vamos hasta donde estás\n💼 O puedes traer tu equipo\n\n📱 Coordinamos: ${TELEFONO}`
  },

  // ── PRIORIDAD 2: PAGO ──
  {
    prioridad: 2,
    palabras: ['pago', 'pagar', 'efectivo', 'tarjeta', 'transferencia', 'nequi', 'daviplata', 'bancolombia', 'cuotas', 'formas de pago'],
    respuesta: () => '💳 Medios de Pago\n\n💵 Efectivo\n💳 Débito y crédito (todas)\n📱 Nequi y Daviplata\n📱 QR Bancolombia\n🏦 Transferencia bancaria\n\n💡 Hasta 12 cuotas con tarjeta de crédito.'
  },

  // ── PRIORIDAD 2: CONTACTO / WHATSAPP ──
  {
    prioridad: 2,
    palabras: ['contacto', 'contactar', 'whatsapp', 'wsp', 'wasap', 'telefono', 'teléfono', 'numero', 'llamar', 'correo', 'email', 'como los contacto'],
    respuesta: () => `📞 Contacto DEOSOLUCIONES\n\n📱 WhatsApp: ${TELEFONO}\n📧 ${EMAIL}\n🌐 deosoluciones.com\n🕗 Lunes a Viernes 8AM - 5PM\n\n⏱️ Respondemos en menos de 2 horas.`
  },

  // ── PRIORIDAD 2: COMPRAR EQUIPO ──
  {
    prioridad: 2,
    palabras: ['quiero comprar', 'venden equipos', 'venta de equipos', 'tienen equipos', 'tienen computadores', 'precio de un computador', 'donde compro'],
    respuesta: () => `🛒 Venta de Equipos\n\n• 💻 Computadores y portátiles\n• 🖥️ Servidores\n• 💾 NAS y discos\n• 🔐 Equipos HikVision\n• 🔌 Periféricos\n\n✅ Garantía 1 año\n✅ Asesoría sin costo\n✅ Financiación disponible\n💳 Todos los medios de pago\n\n📱 ${TELEFONO}`
  },

  // ── PRIORIDAD 2: AGENDAR ──
  {
    prioridad: 2,
    palabras: ['agendar', 'cita', 'visita', 'cuando pueden venir', 'programar', 'reservar'],
    respuesta: () => `📅 Agendar Servicio\n\n1️⃣ Escríbenos por WhatsApp\n2️⃣ Cuéntanos qué necesitas\n3️⃣ Confirmamos día y hora\n4️⃣ ¡Listo!\n\n📱 ${TELEFONO}\n\n💬 O escribe "datos" y nosotros te contactamos.`
  },

  // ── PRIORIDAD 2: SOBRE LA EMPRESA ──
  {
    prioridad: 2,
    palabras: ['quienes son', 'sobre la empresa', 'experiencia', 'son confiables', 'referencias', 'resenas', 'reseñas', 'son buenos'],
    respuesta: () => `🏢 Sobre DEOSOLUCIONES\n\nEmpresa de Medellín especializada en:\n→ 🔐 Control de acceso biométrico\n→ 🔧 Servicio técnico profesional\n→ 🛒 Venta de equipos\n\n✅ Personal certificado\n✅ Garantía en todo\n✅ Diagnóstico siempre GRATIS\n✅ Cobertura Valle de Aburrá\n\n📱 ${TELEFONO}`
  },

  // ── PRIORIDAD 2: SERVICIOS GENERALES ──
  {
    prioridad: 2,
    palabras: ['que hacen', 'que ofrecen', 'servicios', 'que son', 'catalogo', 'portafolio'],
    respuesta: () => '💡 En DEOSOLUCIONES ofrecemos:\n\n🔐 Control de acceso facial (HikVision)\n🔧 Servicio técnico especializado\n🛠️ Mantenimiento preventivo y correctivo\n🖥️ Servidores, NAS y QNAP\n🛒 Venta de equipos con garantía\n📦 Instalación y configuración\n\nEscribe "inicio" para ver el menú completo.'
  },

  // ── PRIORIDAD 2: INSTALACIÓN ──
  {
    prioridad: 2,
    palabras: ['instalacion', 'instalación', 'instalar', 'configurar', 'montar', 'cablear', 'red empresarial'],
    respuesta: () => `📦 Instalación y Configuración\n\n• 🖥️ Computadores nuevos\n• 🔐 Sistemas HikVision\n• 🌐 Redes empresariales\n• 💾 Servidores y NAS\n• 🔌 Cableado estructurado\n\n✅ Capacitación incluida\n✅ Garantía 30 días\n\n📱 ${TELEFONO}`
  },

  // ── PRIORIDAD 2: INICIO / MENÚ ──
  {
    prioridad: 2,
    palabras: ['inicio', 'menu', 'menú', 'volver', 'regresar', 'empezar', 'ayuda', 'opciones', 'que puedes hacer', 'que sabes'],
    respuesta: () => '🏠 Menú Principal\n\n¿Qué necesitas?\n\n🔐 "hikvision" → Control de acceso\n🔧 "servicio" → Servicio técnico\n🛠️ "mantenimiento" → Mantenimiento\n💾 "nas" → Servidores\n💰 "precio" → Precios\n📍 "ubicacion" → Dónde estamos\n🕗 "horario" → Horarios\n💳 "pago" → Medios de pago\n✅ "garantia" → Garantías\n📞 "contacto" → Datos de contacto\n📋 "datos" → Dejar mis datos'
  },

  // ── PRIORIDAD 3: SALUDOS ──
  {
    prioridad: 3,
    palabras: ['hola', 'holaa', 'buenas', 'buenos dias', 'buenas tardes', 'buenas noches', 'hey', 'saludos', 'que tal', 'ola', 'hi', 'epa', 'quiubo', 'que mas'],
    respuesta: () => aleatorio(saludosVariables)
  },

  // ── PRIORIDAD 3: DESPEDIDAS ──
  {
    prioridad: 3,
    palabras: ['gracias', 'muchas gracias', 'chao', 'adios', 'hasta luego', 'bye', 'hasta pronto'],
    respuesta: () => aleatorio(despedidasVariables)
  },

  // ── PRIORIDAD 3: AFIRMACIONES ──
  {
    prioridad: 3,
    palabras: ['si', 'sí', 'claro', 'dale', 'ok', 'listo', 'perfecto', 'bueno', 'entendido', 'me interesa', 'chevere', 'excelente', 'genial'],
    respuesta: () => `😊 ¡Perfecto!\n\n¿Cómo quieres continuar?\n\n• 📋 Escribe "datos" → te contactamos nosotros\n• 📱 WhatsApp directo: ${TELEFONO}\n• 🏠 Escribe "inicio" → ver todas las opciones`
  },

  // ── PRIORIDAD 3: NEGACIONES ──
  {
    prioridad: 3,
    palabras: ['no gracias', 'no por ahora', 'luego', 'despues', 'después', 'en otro momento'],
    respuesta: () => aleatorio(despedidasVariables)
  }
];

// ──────────────────────────────────────────
// ALGORITMOS DE NLP
// ──────────────────────────────────────────

function levenshtein(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] = b[i-1] === a[j-1]
        ? matrix[i-1][j-1]
        : Math.min(matrix[i-1][j-1] + 1, matrix[i][j-1] + 1, matrix[i-1][j] + 1);
    }
  }
  return matrix[b.length][a.length];
}

function simLev(a, b) {
  const longer = Math.max(a.length, b.length);
  if (longer === 0) return 1;
  return (longer - levenshtein(a, b)) / longer;
}

function ngramas(texto, n = 2) {
  const grams = [];
  for (let i = 0; i <= texto.length - n; i++) grams.push(texto.substring(i, i + n));
  return grams;
}

function simNgrama(a, b, n = 2) {
  if (a.length < n || b.length < n) return simLev(a, b);
  const ga = new Set(ngramas(a, n));
  const gb = new Set(ngramas(b, n));
  const inter = [...ga].filter(g => gb.has(g)).length;
  return (2 * inter) / (ga.size + gb.size);
}

function normalizar(txt) {
  return txt.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[¿?¡!.,;:'"()\-_]/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

function scoreIntención(mensajePalabras, keyword) {
  const kNorm = normalizar(keyword);
  const kPalabras = kNorm.split(' ').filter(p => p.length > 1);
  let score = 0;
  for (const kp of kPalabras) {
    if (kp.length < 2) continue;
    for (const mp of mensajePalabras) {
      if (mp.length < 2) continue;
      if (mp === kp) { score += 3; continue; }
      const sl = simLev(mp, kp);
      if (sl >= SIM_LEV_THRESHOLD) { score += sl * 2; continue; }
      const sn = simNgrama(mp, kp);
      if (sn >= SIM_NGRAM_THRESHOLD) score += sn;
    }
  }
  return score;
}

// ──────────────────────────────────────────
// DETECCIÓN DE MÚLTIPLES INTENCIONES
// ──────────────────────────────────────────
function detectarIntenciones(mensaje) {
  const norm = normalizar(mensaje);
  const palabras = norm.split(' ').filter(p => p.length > 1);

  const resultados = [];

  for (const intencion of intenciones) {
    let scoreTotal = 0;

    // Nivel 1: coincidencia exacta de frase
    for (const keyword of intencion.palabras) {
      if (norm.includes(normalizar(keyword))) {
        scoreTotal += SCORE_EXACT_MATCH; // bonus por coincidencia exacta
        break;
      }
    }

    // Nivel 2: scoring por palabras
    for (const keyword of intencion.palabras) {
      scoreTotal += scoreIntención(palabras, keyword);
    }

    if (scoreTotal > 0) {
      resultados.push({ intencion, score: scoreTotal });
    }
  }

  // Ordenar: primero por prioridad (1 > 2 > 3), luego por score
  resultados.sort((a, b) => {
    if (a.intencion.prioridad !== b.intencion.prioridad) {
      return a.intencion.prioridad - b.intencion.prioridad;
    }
    return b.score - a.score;
  });

  return resultados;
}

// ──────────────────────────────────────────
// UMBRALES Y PUNTAJES (named constants)
// ──────────────────────────────────────────
const SCORE_EXACT_MATCH   = 10;
const SCORE_MIN_THRESHOLD = 10.0;
const SCORE_SECOND_MIN    = 3;
const SIM_LEV_THRESHOLD   = 0.85;
const SIM_NGRAM_THRESHOLD = 0.7;

// ──────────────────────────────────────────
// FUNCIÓN PRINCIPAL
// ──────────────────────────────────────────
function obtenerRespuesta(mensaje) {
  if (!mensaje || mensaje.trim().length < 1) {
    return '🤔 No recibí ningún mensaje. ¿En qué te puedo ayudar?';
  }

  const intencionesDet = detectarIntenciones(mensaje);

  if (intencionesDet.length === 0 || intencionesDet[0].score < SCORE_MIN_THRESHOLD) {
    // Fallback con opciones
    return `🤔 No entendí bien, pero puedo ayudarte con:\n\n🔐 Control de acceso → escribe "hikvision"\n🔧 Servicio técnico → escribe "servicio"\n💰 Precios → escribe "precio"\n📍 Ubicación → escribe "ubicacion"\n📞 Contacto → escribe "contacto"\n📋 Dejar datos → escribe "datos"\n\n📱 O escríbenos directo: ${TELEFONO}`;
  }

  // Si hay múltiples intenciones de alta relevancia, combinar respuestas
  const top = intencionesDet[0];
  const segunda = intencionesDet[1];

  // Combinar si hay segunda intención relevante de diferente tipo
  if (
    segunda &&
    segunda.score >= SCORE_SECOND_MIN &&
    segunda.intencion.prioridad <= 2 &&
    top.intencion.prioridad !== segunda.intencion.prioridad
  ) {
    return top.intencion.respuesta() + '\n\n─────────────────\n\n' + segunda.intencion.respuesta();
  }

  return top.intencion.respuesta();
}

if (typeof module !== 'undefined') {
  module.exports = { obtenerRespuesta };
}
