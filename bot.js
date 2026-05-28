// ──────────────────────────────────────────
// BOT DE CHAT - DEOSOLUCIONES v5.0
// ──────────────────────────────────────────

const TELEFONO = '324 260 0709';
const EMAIL    = 'deosoluciones1@gmail.com';

// ── UMBRALES Y PUNTAJES ──
const SCORE_EXACT_MATCH   = 10;
const SCORE_MIN_THRESHOLD = 10.0;
const SCORE_SECOND_MIN    = 4;
const SIM_LEV_THRESHOLD   = 0.85;
const SIM_NGRAM_THRESHOLD = 0.70;

// ── RESPUESTAS VARIABLES ──
const saludosVariables = [
  `👋 ¡Hola! Bienvenido a DEOSOLUCIONES.\n\nSoy tu asistente virtual. ¿En qué te puedo ayudar?\n\n• 🔐 Control de acceso facial\n• 🔧 Servicio técnico\n• 💰 Cotización\n• 📋 Dejar mis datos\n\nEscribe "inicio" para ver el menú completo.`,
  `😊 ¡Hola! Gracias por contactar a DEOSOLUCIONES.\n\n¿Qué necesitas hoy?\n\n• 🔐 HikVision y control de acceso\n• 🔧 Reparación de equipos\n• 💰 Precios y cotizaciones\n• 📍 Información general\n\nEscribe "inicio" para ver todas las opciones.`,
  `🤖 ¡Hola! Soy el asistente de DEOSOLUCIONES.\n\nEstoy aquí para ayudarte con:\n\n• 🔐 Sistemas de acceso biométrico\n• 🔧 Servicio técnico especializado\n• 🛒 Venta de equipos\n• 💰 Cotizaciones personalizadas\n\n¿Por dónde empezamos?`
];

const despedidasVariables = [
  `😊 ¡Con mucho gusto! Fue un placer ayudarte.\n\n📱 WhatsApp: ${TELEFONO}\n\n¡Hasta pronto! 👋`,
  `👋 ¡Hasta luego! Recuerda que estamos aquí cuando nos necesites.\n\n📱 ${TELEFONO}`,
  `😊 ¡Que tengas un excelente día! Cualquier cosa no dudes en escribirnos.\n\n📱 WhatsApp: ${TELEFONO}`
];

const afirmacionesVariables = [
  `😊 ¡Perfecto!\n\n¿Cómo quieres continuar?\n\n• 📋 Escribe "datos" → te contactamos nosotros\n• 📱 WhatsApp directo: ${TELEFONO}\n• 🏠 Escribe "inicio" → ver todas las opciones`,
  `✅ ¡Genial! Estamos listos para ayudarte.\n\n• 📋 Déjanos tus datos → escribe "datos"\n• 📱 Escríbenos directo: ${TELEFONO}`,
  `🙌 ¡Excelente! Podemos continuar de dos formas:\n\n• Escribe "datos" y te llamamos nosotros\n• O contáctanos directo: ${TELEFONO}`
];

// Aleatorio sin repetir el último elegido de cada arreglo (evita ver el mismo
// saludo/despedida dos veces seguidas). Recuerda el índice previo por arreglo.
const _ultimoIdx = new WeakMap();
function aleatorio(arr) {
  if (arr.length <= 1) return arr[0];
  const prev = _ultimoIdx.get(arr);
  let i;
  do { i = Math.floor(Math.random() * arr.length); } while (i === prev);
  _ultimoIdx.set(arr, i);
  return arr[i];
}

// ── BASE DE CONOCIMIENTO ──
// prioridad: 1=urgencias, 2=informacional, 3=cortesía
const intenciones = [

  // ── PRIORIDAD 1: URGENCIAS ──
  {
    prioridad: 1,
    grupo: 'urgente',
    palabras: ['urgente', 'urgencia', 'emergencia', 'rapido rápido', 'ya mismo', 'ahora mismo',
      'hoy mismo', 'es urgente', 'lo mas pronto', 'inmediato', 'se daño ya', 'se cayó el servidor',
      'todo parado', 'cayó el sistema', 'necesito ayuda urgente', 'es una emergencia'],
    respuesta: () => `🚨 ¡Atención Urgente!\n\nEntendemos que es importante y lo atendemos con prioridad.\n\n📱 Escríbenos YA al WhatsApp:\n${TELEFONO}\n\n⏱️ En horario laboral respondemos en menos de 30 minutos.\n🕗 Lunes a Viernes 8AM - 5PM\n\nSi es fuera de horario, escríbenos igual y te atendemos lo antes posible.`
  },

  // ── PRIORIDAD 1: ASESOR HUMANO ──
  {
    prioridad: 1,
    grupo: 'urgente',
    palabras: ['asesor', 'humano', 'persona', 'agente', 'quiero hablar con alguien',
      'hablar con una persona', 'no quiero bot', 'atiéndeme', 'atiendeme',
      'necesito ayuda real', 'quiero un asesor', 'me comunicas', 'con quien hablo'],
    respuesta: () => `👨‍💼 ¡Claro! Te conecto con un asesor ahora mismo.\n\nNuestro equipo está disponible:\n🕗 Lunes a Viernes 8AM - 5PM\n\n📱 Escríbenos directamente:\nWhatsApp: ${TELEFONO}\n📧 ${EMAIL}\n\nO si prefieres, déjame tus datos y nosotros te llamamos. Escribe "datos" para el formulario.`
  },

  // ── PRIORIDAD 1: RECUPERACIÓN DE DATOS ──
  {
    prioridad: 1,
    grupo: 'rep',
    palabras: ['perdi datos', 'perdí datos', 'se borraron', 'archivos borrados',
      'recuperar datos', 'recuperar archivos', 'formatee sin querer', 'borre todo',
      'disco no abre', 'usb no abre', 'disco dañado', 'perdí todo', 'no reconoce el disco'],
    respuesta: () => `💾 ¡Actúa rápido!\n\n⚠️ NO uses el equipo — entre menos lo uses, más posibilidades de recuperar todo.\n\nRecuperamos datos de:\n→ 💿 Discos duros dañados o formateados\n→ ⚡ SSD\n→ 🔌 Memorias USB\n→ 📷 Tarjetas SD\n→ 🗑️ Archivos eliminados por error\n→ 💻 Equipos que no encienden\n\n📱 Llámanos URGENTE: ${TELEFONO}`
  },

  // ── PRIORIDAD 2: HIKVISION / CONTROL DE ACCESO ──
  {
    prioridad: 2,
    grupo: 'producto',
    palabras: ['hikvision', 'hik vision', 'reconocimiento facial', 'control de acceso',
      'biometrico', 'biométrico', 'asistencia facial', 'torniquete', 'control personal',
      'face id', 'camara', 'camaras', 'cctv', 'videovigilancia', 'vigilancia',
      'camara seguridad', 'cámara de seguridad', 'camara de seguridad', 'acceso facial',
      'control de asistencia', 'registro facial', 'huella dactilar', 'huella digital'],
    respuesta: () => `🔐 Sistema HikVision - Control de Acceso Facial\n\n✅ Reconocimiento en menos de 0.5 segundos\n✅ Funciona con mascarilla y baja iluminación\n✅ Reportes automáticos de asistencia\n✅ Integración con torniquetes y cerraduras\n✅ App móvil para gestión remota\n✅ Instalación y capacitación incluida\n✅ Garantía de 6 meses\n\nIdeal para:\n→ Empresas con control de personal\n→ Edificios y conjuntos residenciales\n→ Colegios y universidades\n\n📱 Demo gratuita: ${TELEFONO}`
  },

  // ── PRIORIDAD 2: SERVICIO TÉCNICO ──
  {
    prioridad: 2,
    grupo: 'rep',
    palabras: ['servicio tecnico', 'servicio técnico', 'reparacion', 'reparación', 'reparar',
      'arreglar', 'dañado', 'no funciona', 'no sirve', 'tecnico', 'técnico',
      'descompuesto', 'falla', 'falla el equipo', 'dejo de funcionar', 'tiene problemas'],
    respuesta: () => `🔧 Servicio Técnico Especializado\n\nReparamos:\n• 💻 Computadores y portátiles\n• 🖥️ Servidores\n• 💾 NAS y QNAP\n• 🖨️ Impresoras\n• 📺 Monitores\n\nProblemas frecuentes:\n→ No enciende\n→ Pantalla azul o negra\n→ Muy lento\n→ Virus o malware\n→ Cambio de piezas\n→ Problemas de red\n\n✅ Diagnóstico GRATIS\n✅ Garantía 3 meses\n⏱️ Respuesta en menos de 2 horas\n\n📱 ${TELEFONO}`
  },

  // ── PRIORIDAD 2: PC / LAPTOP ──
  {
    prioridad: 2,
    grupo: 'rep',
    palabras: ['computador', 'computadora', 'compu', 'pc', 'portatil', 'portátil', 'laptop', 'notebook',
      'no prende', 'no enciende', 'lento', 'lenta', 'virus', 'pantalla azul', 'pantalla negra',
      'se congela', 'se traba', 'se apaga', 'bateria', 'batería', 'teclado dañado',
      'pantalla rota', 'se reinicia', 'hace ruido', 'ventilador', 'overclocking',
      'se recalienta', 'se calienta mucho'],
    respuesta: () => `💻 ¡Te ayudamos con tu equipo!\n\nSolucionamos:\n• 🔧 Lento → limpieza y optimización\n• 🦠 Virus → eliminación completa\n• 🔌 No prende → diagnóstico\n• 💀 Pantalla azul → reparación\n• 💾 Disco lleno → ampliación\n• 🌡️ Sobrecalentamiento → limpieza + pasta térmica\n• ⌨️ Teclado o pantalla → reemplazo\n• 🔋 Batería → cambio\n• 🔊 Ruidos raros → diagnóstico de hardware\n\n✅ Diagnóstico GRATIS\n⏱️ Mayoría listos el mismo día\n\n📱 ${TELEFONO}`
  },

  // ── PRIORIDAD 2: COMPONENTES DE HARDWARE ──
  {
    prioridad: 2,
    grupo: 'rep',
    palabras: ['ram', 'memoria ram', 'memoria', 'disco duro', 'ssd', 'procesador', 'cpu',
      'tarjeta de video', 'grafica', 'gráfica', 'fuente de poder', 'placa madre',
      'motherboard', 'cambiar ram', 'ampliar memoria', 'cambiar disco', 'actualizar equipo',
      'componentes', 'partes'],
    respuesta: () => `🔩 Actualización y Cambio de Componentes\n\nInstalamos y cambiamos:\n• 🧠 RAM → más velocidad y multitarea\n• 💾 Disco duro → SSD para arranque ultrarrápido\n• ⚡ SSD NVMe → máximo rendimiento\n• 🎮 Tarjeta gráfica\n• 🔌 Fuente de poder\n• 🖥️ Placa madre\n• ❄️ Sistemas de enfriamiento\n\n💡 Actualizamos tu equipo viejo para que dure 3-5 años más.\n\n✅ Diagnóstico GRATIS de qué necesitas\n✅ Garantía en piezas y mano de obra\n\n📱 ${TELEFONO}`
  },

  // ── PRIORIDAD 2: SERVIDORES / NAS ──
  {
    prioridad: 2,
    grupo: 'rep',
    palabras: ['nas', 'qnap', 'synology', 'servidor', 'servidores', 'almacenamiento',
      'backup', 'respaldo', 'nube privada', 'disco en red', 'storage', 'raid',
      'servidor de archivos', 'compartir archivos', 'red interna'],
    respuesta: () => `🖥️ Servidores y Almacenamiento NAS\n\nEspecialistas en:\n• 💾 NAS (almacenamiento en red)\n• 🏢 QNAP empresarial\n• 🔵 Synology\n• 🖥️ Servidores físicos\n• 🔄 Backup automático programado\n• 🔒 Seguridad y permisos por usuario\n• ☁️ Nube privada sin mensualidad\n\nIdeal para:\n→ Compartir archivos entre empleados\n→ Backup automático de todos los equipos\n→ Acceso remoto seguro desde cualquier lugar\n\n📱 Asesoría gratis: ${TELEFONO}`
  },

  // ── PRIORIDAD 2: RED / WIFI / INTERNET ──
  {
    prioridad: 2,
    grupo: 'rep',
    palabras: ['red', 'wifi', 'internet', 'router', 'enrutador', 'switch', 'cableado',
      'red lenta', 'no hay wifi', 'no conecta', 'red caida', 'red empresarial',
      'configurar red', 'punto de acceso', 'access point', 'vpn', 'fibra optica',
      'cableado estructurado', 'red de datos', 'lan', 'wan', 'ping alto',
      'internet lento', 'se cae el internet'],
    respuesta: () => `🌐 Redes e Internet Empresarial\n\nSolucionamos:\n• 📶 WiFi lento o con caídas\n• 🔌 Diseño de red cableada\n• 🏢 Redes empresariales\n• 🔒 VPN y acceso remoto seguro\n• 📡 Puntos de acceso WiFi\n• 🔀 Configuración de switches\n• 🌐 Optimización de internet\n\nInstalamos:\n→ Cableado estructurado certificado\n→ Routers y switches empresariales\n→ Sistemas WiFi para toda la oficina\n\n✅ Diagnóstico GRATIS\n📱 ${TELEFONO}`
  },

  // ── PRIORIDAD 2: VIRUS / MALWARE / SEGURIDAD ──
  {
    prioridad: 2,
    grupo: 'rep',
    palabras: ['virus', 'malware', 'ransomware', 'hackearon', 'hackeo', 'me hackearon',
      'spyware', 'troyano', 'encriptaron', 'archivos encriptados', 'piden rescate',
      'antivirus', 'seguridad informatica', 'contraseña robada', 'me robaron datos',
      'phishing', 'correo falso', 'eliminar virus', 'limpieza virus'],
    respuesta: () => `🦠 Eliminación de Virus y Seguridad\n\n⚠️ Si sospechas de ransomware, APAGA el equipo ya.\n\nSolucionamos:\n• 🦠 Virus y malware de todo tipo\n• 🔐 Ransomware (archivos encriptados)\n• 🕵️ Spyware y troyanos\n• 📧 Phishing y correos maliciosos\n• 🔑 Recuperación de contraseñas\n\nTambién instalamos:\n→ Antivirus empresarial\n→ Políticas de seguridad\n→ Capacitación al equipo\n\n✅ Diagnóstico GRATIS\n📱 Llámanos: ${TELEFONO}`
  },

  // ── PRIORIDAD 2: IMPRESORAS ──
  {
    prioridad: 2,
    grupo: 'rep',
    palabras: ['impresora', 'impresor', 'printer', 'no imprime', 'atasco papel',
      'tinta', 'toner', 'cartucho', 'imprime mal', 'borroso', 'manchas',
      'impresora en red', 'compartir impresora', 'plotter'],
    respuesta: () => `🖨️ Servicio para Impresoras\n\nSolucionamos:\n• 🔧 No imprime o da error\n• 📄 Atasco de papel\n• 🎨 Impresión borrosa o con manchas\n• 🌐 Configurar impresora en red\n• 🔌 Instalación de drivers\n• 🖨️ Mantenimiento y limpieza\n\nTambién suministramos:\n→ Tóner y cartuchos originales\n→ Repuestos\n\n✅ Diagnóstico GRATIS\n📱 ${TELEFONO}`
  },

  // ── PRIORIDAD 2: MANTENIMIENTO ──
  {
    prioridad: 2,
    grupo: 'rep',
    palabras: ['mantenimiento', 'preventivo', 'correctivo', 'limpieza equipo',
      'formatear', 'formato', 'instalar windows', 'windows', 'optimizar',
      'pasta termica', 'pasta térmica', 'limpieza interna', 'actualizacion windows',
      'drivers', 'controladores'],
    respuesta: () => `🛠️ Mantenimiento de Equipos\n\n🔍 Preventivo (cada 6 meses):\n→ Limpieza interna completa\n→ Cambio pasta térmica\n→ Actualización de Windows y drivers\n→ Optimización del sistema\n→ Verificación de disco y RAM\n\n🔧 Correctivo:\n→ Formateo e instalación Windows\n→ Recuperación del sistema\n→ Cambio de piezas dañadas\n\n✅ Garantía 3 meses\n💰 Desde $80.000\n\n📱 ${TELEFONO}`
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
    grupo: 'comercial',
    palabras: ['precio', 'presio', 'costo', 'cuanto vale', 'cuanto cuesta', 'cuánto cuesta',
      'tarifa', 'cobran', 'cotizacion', 'cotización', 'cotizar', 'presupuesto',
      'cuanto cobran', 'que vale', 'valor', 'cuanto me sale'],
    respuesta: () => `💰 Nuestros Precios\n\n🔧 Diagnóstico: GRATIS ✅\n🛠️ Mantenimiento PC: desde $80.000\n💻 Formateo + Windows: desde $120.000\n🖥️ Mantenimiento servidor: desde $150.000\n🌐 Configuración de red: desde $100.000\n🔐 HikVision: cotización personalizada\n🛒 Equipos: precios del mercado\n\n💡 Siempre empieza por el diagnóstico GRATIS.\n\n📱 WhatsApp: ${TELEFONO}\n📧 ${EMAIL}`
  },

  // ── PRIORIDAD 2: GARANTÍA ──
  {
    prioridad: 2,
    grupo: 'info',
    palabras: ['garantia', 'garantía', 'garantizan', 'tienen garantia', 'cuanto tiempo garantia',
      'que pasa si vuelve a fallar', 'se daña de nuevo'],
    respuesta: () => `✅ Garantía en Todo\n\n🔧 Servicio técnico: 3 meses\n🛒 Equipos vendidos: 1 año\n🔐 HikVision: 6 meses\n📦 Instalación: 30 días\n🌐 Configuración de red: 30 días\n\nSi el problema regresa dentro del período, lo resolvemos SIN COSTO adicional.\n\n📱 ${TELEFONO}`
  },

  // ── PRIORIDAD 2: DIAGNÓSTICO GRATIS ──
  {
    prioridad: 2,
    grupo: 'info',
    palabras: ['diagnostico', 'diagnóstico', 'gratis', 'gratuito', 'sin costo',
      'promocion', 'oferta', 'descuento', 'no cobran revisar', 'lo pueden revisar',
      'pueden revisar', 'hay costo por revisar'],
    respuesta: () => `🎉 Diagnóstico 100% GRATIS\n\n¿Cómo funciona?\n1️⃣ Nos contactas\n2️⃣ Llevas el equipo o lo recogemos\n3️⃣ Lo revisamos gratis\n4️⃣ Te damos informe detallado\n5️⃣ Tú decides si lo reparas\n\n💡 Si NO reparas → no pagas nada\n💡 Si reparas → precio justo + garantía 3 meses\n\n📱 Agenda ya: ${TELEFONO}`
  },

  // ── PRIORIDAD 2: HORARIO ──
  {
    prioridad: 2,
    grupo: 'info',
    palabras: ['horario', 'hora', 'atienden', 'que dia', 'abren', 'cierran',
      'disponible', 'sabado', 'domingo', 'festivo', 'cuando atienden', 'a que hora'],
    respuesta: () => `🕗 Horario de Atención\n\n📅 Lunes a Viernes\n⏰ 8:00 AM - 5:00 PM\n\n❌ Sábados, domingos y festivos: cerrado\n\n💬 Fuera de horario escríbenos de todas formas — te respondemos al abrir.\n\n📱 ${TELEFONO}`
  },

  // ── PRIORIDAD 2: UBICACIÓN ──
  {
    prioridad: 2,
    grupo: 'info',
    palabras: ['donde estan', 'donde queda', 'ubicacion', 'ubicación', 'direccion',
      'medellin', 'antioquia', 'valle de aburra', 'domicilio', 'van a mi casa',
      'recogen', 'cobertura', 'llegan a', 'atienden en'],
    respuesta: () => `📍 Cobertura DEOSOLUCIONES\n\n🌆 Sede: Medellín\n\n✅ Medellín\n✅ Bello\n✅ Itagüí\n✅ Envigado\n✅ Sabaneta\n✅ La Estrella\n✅ Copacabana\n✅ Caldas\n✅ Girardota\n\n🚗 Vamos hasta donde estás\n💼 O puedes traer tu equipo a nuestra sede\n\n📱 Coordinamos: ${TELEFONO}`
  },

  // ── PRIORIDAD 2: PAGO ──
  {
    prioridad: 2,
    grupo: 'info',
    palabras: ['pago', 'pagar', 'efectivo', 'tarjeta', 'transferencia', 'nequi',
      'daviplata', 'bancolombia', 'cuotas', 'formas de pago', 'medios de pago',
      'como pago', 'aceptan tarjeta'],
    respuesta: () => `💳 Medios de Pago\n\n💵 Efectivo\n💳 Débito y crédito (todas las franquicias)\n📱 Nequi y Daviplata\n📱 QR Bancolombia\n🏦 Transferencia bancaria\n\n💡 Hasta 12 cuotas con tarjeta de crédito.\n\n📱 Cualquier duda: ${TELEFONO}`
  },

  // ── PRIORIDAD 2: CONTACTO / WHATSAPP ──
  {
    prioridad: 2,
    grupo: 'info',
    palabras: ['contacto', 'contactar', 'whatsapp', 'wsp', 'wasap', 'telefono',
      'teléfono', 'numero', 'llamar', 'correo', 'email', 'como los contacto',
      'un numero', 'dame el numero'],
    respuesta: () => `📞 Contacto DEOSOLUCIONES\n\n📱 WhatsApp: ${TELEFONO}\n📧 ${EMAIL}\n🌐 deosoluciones.com\n🕗 Lunes a Viernes 8AM - 5PM\n\n⏱️ Respondemos en menos de 2 horas en horario laboral.`
  },

  // ── PRIORIDAD 2: DEJAR DATOS (CRÍTICO — faltaba) ──
  {
    prioridad: 2,
    grupo: 'info',
    palabras: ['datos', 'mis datos', 'dejar datos', 'dejar mis datos', 'me llaman',
      'llamenme', 'llámenme', 'me contactan', 'quiero que me llamen',
      'quiero que me contacten', 'formulario', 'registrar', 'registrarme'],
    respuesta: () => `📋 Déjanos tus datos\n\nPor favor escríbenos por WhatsApp con:\n\n1️⃣ Tu nombre\n2️⃣ Tu teléfono\n3️⃣ ¿Qué necesitas? (ej: servicio técnico, cotización HikVision...)\n4️⃣ Ciudad donde estás\n\n📱 WhatsApp: ${TELEFONO}\n\n¡Te contactamos en menos de 2 horas en horario laboral! 🕗`
  },

  // ── PRIORIDAD 2: COMPRAR EQUIPO ──
  {
    prioridad: 2,
    grupo: 'comercial',
    palabras: ['quiero comprar', 'venden equipos', 'venta de equipos', 'tienen equipos',
      'tienen computadores', 'precio de un computador', 'donde compro', 'venta',
      'quiero uno', 'quiero un equipo', 'me venden'],
    respuesta: () => `🛒 Venta de Equipos\n\n• 💻 Computadores y portátiles (nuevos y reacondicionados)\n• 🖥️ Servidores\n• 💾 NAS y discos\n• 🔐 Equipos HikVision\n• 🖨️ Impresoras\n• 🔌 Periféricos y accesorios\n\n✅ Garantía 1 año\n✅ Asesoría sin costo\n✅ Financiación disponible\n💳 Todos los medios de pago\n\n📱 ${TELEFONO}`
  },

  // ── PRIORIDAD 2: AGENDAR ──
  {
    prioridad: 2,
    grupo: 'info',
    palabras: ['agendar', 'cita', 'visita', 'cuando pueden venir', 'programar',
      'reservar', 'quiero una cita', 'necesito una visita', 'pueden venir hoy',
      'pueden venir mañana'],
    respuesta: () => `📅 Agendar Servicio\n\n1️⃣ Escríbenos por WhatsApp\n2️⃣ Cuéntanos qué necesitas\n3️⃣ Confirmamos día y hora\n4️⃣ ¡Listo!\n\n📱 ${TELEFONO}\n\n💬 O escribe "datos" y nosotros te contactamos.`
  },

  // ── PRIORIDAD 2: INSTALACIÓN ──
  {
    prioridad: 2,
    grupo: 'comercial',
    palabras: ['instalacion', 'instalación', 'instalar', 'configurar', 'montar',
      'cablear', 'red empresarial', 'poner', 'configuracion', 'configuración'],
    respuesta: () => `📦 Instalación y Configuración\n\n• 🖥️ Computadores y equipos nuevos\n• 🔐 Sistemas HikVision\n• 🌐 Redes y WiFi empresarial\n• 💾 Servidores y NAS\n• 🔌 Cableado estructurado\n• 🖨️ Impresoras en red\n\n✅ Capacitación incluida\n✅ Garantía 30 días\n\n📱 ${TELEFONO}`
  },

  // ── PRIORIDAD 2: SOBRE LA EMPRESA ──
  {
    prioridad: 2,
    grupo: 'info',
    palabras: ['quienes son', 'sobre la empresa', 'experiencia', 'son confiables',
      'referencias', 'resenas', 'reseñas', 'son buenos', 'que tal son', 'empresa'],
    respuesta: () => `🏢 Sobre DEOSOLUCIONES\n\nEmpresa de Medellín especializada en:\n→ 🔐 Control de acceso biométrico\n→ 🔧 Servicio técnico profesional\n→ 🌐 Redes e internet empresarial\n→ 🛒 Venta y reparación de equipos\n\n✅ Personal certificado\n✅ Garantía en todo el trabajo\n✅ Diagnóstico siempre GRATIS\n✅ Cobertura Valle de Aburrá\n\n📱 ${TELEFONO}`
  },

  // ── PRIORIDAD 2: SERVICIOS GENERALES / MENÚ ──
  {
    prioridad: 2,
    grupo: 'info',
    palabras: ['que hacen', 'que ofrecen', 'servicios', 'que son', 'catalogo',
      'portafolio', 'inicio', 'menu', 'menú', 'volver', 'regresar', 'info', 'informacion',
      'empezar', 'ayuda', 'opciones', 'que puedes hacer', 'que sabes'],
    respuesta: () => `🏠 Menú Principal\n\n¿Qué necesitas?\n\n🔐 "hikvision" → Control de acceso facial\n🔧 "servicio" → Servicio técnico\n🛠️ "mantenimiento" → Mantenimiento\n💾 "nas" → Servidores y almacenamiento\n🌐 "red" → Redes y WiFi\n🦠 "virus" → Virus y seguridad\n🔩 "ram" → Actualización de hardware\n🖨️ "impresora" → Soporte impresoras\n💰 "precio" → Precios\n📍 "ubicacion" → Dónde estamos\n🕗 "horario" → Horarios\n💳 "pago" → Medios de pago\n✅ "garantia" → Garantías\n📞 "contacto" → Datos de contacto\n📋 "datos" → Quiero que me contacten`
  },

  // ── PRIORIDAD 3: SALUDOS ──
  {
    prioridad: 3,
    grupo: 'cortesia',
    palabras: ['hola', 'holaa', 'buenas', 'buenos dias', 'buenas tardes', 'buenas noches',
      'hey', 'saludos', 'que tal', 'ola', 'hi', 'epa', 'quiubo', 'que mas',
      'buenas tardes', 'buen dia', 'good morning', 'como estan'],
    respuesta: () => aleatorio(saludosVariables)
  },

  // ── PRIORIDAD 3: DESPEDIDAS ──
  {
    prioridad: 3,
    grupo: 'cortesia',
    palabras: ['gracias', 'muchas gracias', 'chao', 'adios', 'hasta luego',
      'bye', 'hasta pronto', 'listo gracias', 'ok gracias', 'gracias por todo',
      'fue todo', 'eso era todo'],
    respuesta: () => aleatorio(despedidasVariables)
  },

  // ── PRIORIDAD 3: AFIRMACIONES ──
  {
    prioridad: 3,
    grupo: 'cortesia',
    palabras: ['si', 'sí', 'claro', 'dale', 'ok', 'listo', 'perfecto', 'bueno',
      'entendido', 'me interesa', 'chevere', 'excelente', 'genial', 'de acuerdo',
      'con gusto', 'claro que si', 'claro que sí', 'por supuesto'],
    respuesta: () => aleatorio(afirmacionesVariables)
  },

  // ── PRIORIDAD 3: NEGACIONES ──
  {
    prioridad: 3,
    grupo: 'cortesia',
    palabras: ['no gracias', 'no por ahora', 'luego', 'despues', 'después',
      'en otro momento', 'no necesito nada mas', 'ya está', 'ya estuvo'],
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
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

function scoreIntención(mensajePalabras, kPalabras) {
  let score = 0;
  for (const kp of kPalabras) {
    for (const mp of mensajePalabras) {
      if (mp.length < 3) continue;
      if (mp === kp) { score += 3; continue; }
      const sl = simLev(mp, kp);
      if (sl >= SIM_LEV_THRESHOLD) { score += sl * 2; continue; }
      const sn = simNgrama(mp, kp);
      if (sn >= SIM_NGRAM_THRESHOLD) score += sn;
    }
  }
  return score;
}

// Precomputar las keywords normalizadas UNA sola vez (no en cada mensaje):
// para cada intención guardamos, por keyword, su forma normalizada, si es frase
// y sus palabras de scoring. Acelera ~4x el matching sin cambiar resultados.
for (const intencion of intenciones) {
  intencion._kw = intencion.palabras.map(keyword => {
    const norm = normalizar(keyword);
    return {
      norm,
      esFrase: norm.includes(' '),
      parts: norm.split(' ').filter(p => p.length > 2)
    };
  });
}

// ──────────────────────────────────────────
// DETECCIÓN DE INTENCIONES
// ──────────────────────────────────────────
function detectarIntenciones(mensaje) {
  const norm = normalizar(mensaje);
  const todas = norm.split(' ').filter(Boolean);
  const palabras = todas.filter(p => p.length > 2);
  const resultados = [];

  for (const intencion of intenciones) {
    let scoreTotal = 0;

    // Nivel 1: coincidencia exacta o casi-exacta (tolerante a errores de tipeo).
    // - Frases (varias palabras): se buscan como substring.
    // - Palabras sueltas: deben coincidir como palabra COMPLETA (o su plural),
    //   para evitar falsos positivos por substring (ej: "programa" contiene
    //   "ram", "credito" contiene "red").
    // - Typos: una palabra clave larga (≥5) cuenta como exacta si una palabra
    //   del mensaje es muy similar (Levenshtein ≥0.80 o n-grama ≥0.72). Los
    //   umbrales separan limpiamente typos reales (≥0.71) de falsos (≤0.50).
    let exacta = false;
    for (const { norm: k, esFrase } of intencion._kw) {
      if (esFrase) {
        if (norm.includes(k)) { exacta = true; break; }
      } else if (todas.includes(k) || todas.includes(k + 's') || todas.includes(k + 'es')) {
        exacta = true; break;
      } else if (k.length >= 5 && palabras.some(mp =>
          mp.length >= 4 && (simLev(mp, k) >= 0.80 || simNgrama(mp, k) >= 0.72))) {
        exacta = true; break;
      }
    }
    if (exacta) scoreTotal += SCORE_EXACT_MATCH;

    // Nivel 2: scoring por palabras individuales
    for (const { parts } of intencion._kw) {
      scoreTotal += scoreIntención(palabras, parts);
    }

    if (scoreTotal > 0) {
      resultados.push({ intencion, score: scoreTotal, exacta });
    }
  }

  // Filtrar por umbral ANTES de ordenar por prioridad.
  // Así un intent de prioridad alta con score bajo no bloquea
  // un intent de prioridad baja con score alto.
  const calificados = resultados.filter(r => r.score >= SCORE_MIN_THRESHOLD);

  // Orden: las coincidencias exactas mandan sobre la mera acumulación de
  // palabras sueltas (evita que un intent de prioridad alta gane por casualidad
  // al juntar palabras genéricas como "necesito"+"ayuda"). Luego prioridad y score.
  calificados.sort((a, b) => {
    if (a.exacta !== b.exacta) return a.exacta ? -1 : 1;
    if (a.intencion.prioridad !== b.intencion.prioridad) {
      return a.intencion.prioridad - b.intencion.prioridad;
    }
    return b.score - a.score;
  });

  return calificados;
}

// ──────────────────────────────────────────
// SUGERENCIAS CONTEXTUALES (botones rápidos)
// La clave es la PRIMERA palabra de cada intención (estable).
// ──────────────────────────────────────────
const TEXTO_NO_ENTENDI = `🤔 No entendí bien, pero puedo ayudarte con:\n\n🔐 Control de acceso → "hikvision"\n🔧 Servicio técnico → "servicio"\n🌐 Redes y WiFi → "red"\n💰 Precios → "precio"\n📍 Ubicación → "ubicacion"\n📞 Contacto → "contacto"\n📋 Dejar datos → "datos"\n\n📱 O escríbenos directo: ${TELEFONO}`;

// Acciones especiales que NO envían texto al bot (las maneja el cliente).
const ACC = {
  datos:    { label: '📋 Dejar mis datos', accion: 'datos' },
  whatsapp: { label: '💬 WhatsApp',        accion: 'whatsapp' },
  menu:     { label: '🏠 Menú',            tema: 'menu' }
};

// Etiqueta visible de cada tema cuando se ofrece como botón (envía 'tema' al bot).
const TEMA = {
  'hikvision':        '🔐 Control de acceso',
  'servicio tecnico': '🔧 Servicio técnico',
  'computador':       '💻 Reparación de PC',
  'ram':              '🔩 Hardware',
  'nas':              '💾 Servidores/NAS',
  'red':              '🌐 Redes/WiFi',
  'virus':            '🦠 Virus',
  'impresora':        '🖨️ Impresoras',
  'mantenimiento':    '🛠️ Mantenimiento',
  'software':         '💿 Software',
  'precio':           '💰 Precios',
  'garantia':         '✅ Garantía',
  'diagnostico':      '🎉 Diagnóstico gratis',
  'horario':          '🕗 Horario',
  'donde estan':      '📍 Ubicación',
  'pago':             '💳 Medios de pago',
  'quiero comprar':   '🛒 Comprar equipos',
  'agendar':          '📅 Agendar',
  'instalacion':      '📦 Instalación'
};

// Qué ofrecer DESPUÉS de cada intención (empuja al cliente a contactar).
const SEGUIMIENTO = {
  'hikvision':        ['precio', 'datos', 'whatsapp'],
  'servicio tecnico': ['precio', 'agendar', 'whatsapp'],
  'computador':       ['precio', 'datos', 'whatsapp'],
  'ram':              ['precio', 'datos', 'whatsapp'],
  'nas':              ['precio', 'datos', 'whatsapp'],
  'red':              ['precio', 'datos', 'whatsapp'],
  'virus':            ['diagnostico', 'datos', 'whatsapp'],
  'impresora':        ['precio', 'datos', 'whatsapp'],
  'mantenimiento':    ['precio', 'agendar', 'whatsapp'],
  'software':         ['precio', 'datos', 'whatsapp'],
  'precio':           ['diagnostico', 'agendar', 'whatsapp'],
  'garantia':         ['servicio tecnico', 'datos', 'whatsapp'],
  'diagnostico':      ['agendar', 'datos', 'whatsapp'],
  'horario':          ['donde estan', 'datos', 'whatsapp'],
  'donde estan':      ['horario', 'datos', 'whatsapp'],
  'pago':             ['precio', 'datos', 'whatsapp'],
  'contacto':         ['datos', 'whatsapp'],
  'datos':            ['whatsapp'],
  'quiero comprar':   ['precio', 'datos', 'whatsapp'],
  'agendar':          ['datos', 'whatsapp'],
  'instalacion':      ['precio', 'datos', 'whatsapp'],
  'quienes son':      ['servicio tecnico', 'datos', 'whatsapp'],
  'que hacen':        ['datos', 'whatsapp'],
  'urgente':          ['whatsapp', 'datos'],
  'asesor':           ['whatsapp', 'datos'],
  'perdi datos':      ['whatsapp', 'datos'],
  'hola':             ['servicio tecnico', 'hikvision', 'precio'],
  'gracias':          ['whatsapp'],
  'si':               ['datos', 'whatsapp'],
  'no gracias':       ['whatsapp']
};

const SEGUIMIENTO_DEFAULT = ['menu', 'datos', 'whatsapp'];

// Construye los objetos de botón a partir de una lista de claves (de ACC o TEMA).
function construirSugerencias(claves) {
  const out = [];
  for (const k of claves) {
    if (ACC[k]) out.push(ACC[k]);
    else if (TEMA[k]) out.push({ label: TEMA[k], tema: k });
  }
  return out;
}

// ──────────────────────────────────────────
// FUNCIÓN PRINCIPAL
// ──────────────────────────────────────────
// Devuelve { respuesta, sugerencias }. En vez de pegar dos respuestas largas
// (muro de texto), responde la principal y ofrece la segunda como botón.
function responder(mensaje) {
  if (!mensaje || mensaje.trim().length < 1) {
    return { respuesta: '🤔 No recibí ningún mensaje. ¿En qué te puedo ayudar?',
             sugerencias: construirSugerencias(SEGUIMIENTO_DEFAULT) };
  }

  const dets = detectarIntenciones(mensaje);

  if (dets.length === 0) {
    return { respuesta: TEXTO_NO_ENTENDI, sugerencias: construirSugerencias(SEGUIMIENTO_DEFAULT) };
  }

  const top     = dets[0];
  const segunda = dets[1];
  const clave   = top.intencion.palabras[0];
  let claves    = (SEGUIMIENTO[clave] || SEGUIMIENTO_DEFAULT).slice();

  // Si hay una segunda intención relevante de OTRO grupo (ej. "precio hikvision"),
  // la ofrecemos como primer botón en lugar de concatenar su respuesta completa.
  if (segunda && segunda.score >= SCORE_SECOND_MIN &&
      top.intencion.prioridad <= 2 && segunda.intencion.prioridad <= 2 &&
      top.intencion.grupo !== segunda.intencion.grupo) {
    const k2 = segunda.intencion.palabras[0];
    if (TEMA[k2]) claves = [k2, ...claves.filter(c => c !== k2)];
  }

  claves = [...new Set(claves)].slice(0, 4);
  return { respuesta: top.intencion.respuesta(), sugerencias: construirSugerencias(claves) };
}

// Compat: versión que solo devuelve el texto.
function obtenerRespuesta(mensaje) {
  return responder(mensaje).respuesta;
}

if (typeof module !== 'undefined') {
  module.exports = { obtenerRespuesta, responder };
}
