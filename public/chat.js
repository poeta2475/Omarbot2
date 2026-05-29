// ════════════════════════════════════════
//  CHAT WIDGET - DEOSOLUCIONES
//  Lógica compartida (index.html, productos.html, ...)
//  Se auto-desactiva si la página no tiene el widget.
// ════════════════════════════════════════
(function () {
  const btnAbrir = document.getElementById('chat-btn');
  const chatBox = document.getElementById('chat-box');
  const btnCerrar = document.getElementById('chat-cerrar');
  const mensajesDiv = document.getElementById('chat-mensajes');
  const inputChat = document.getElementById('chat-input');
  const btnEnviar = document.getElementById('chat-enviar');

  // Si falta cualquier pieza del widget, no hacemos nada.
  if (!btnAbrir || !chatBox || !btnCerrar || !mensajesDiv || !inputChat || !btnEnviar) return;

  let iniciado = false;
  let esperandoFormulario = false;

  function escHTML(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function ahora() {
    return new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  }

  function guardarChat() {
    const msgs = [];
    mensajesDiv.childNodes.forEach(node => {
      if (!node.classList) return;
      if (node.classList.contains('msg') && node.classList.contains('sistema')) {
        msgs.push({ tipo: 'sistema', texto: node.textContent });
      } else if (node.classList.contains('msg-row')) {
        const msgEl = node.querySelector('.msg');
        if (msgEl) {
          const tipo = msgEl.classList.contains('bot') ? 'bot' : 'usuario';
          msgs.push({ tipo, texto: msgEl.innerText });
        }
      }
    });
    sessionStorage.setItem('deo_chat', JSON.stringify(msgs));
  }

  function restaurarChat() {
    const guardado = sessionStorage.getItem('deo_chat');
    if (!guardado) return false;
    try {
      JSON.parse(guardado).forEach(m => agregarMensaje(m.tipo, m.texto));
      return true;
    } catch {
      return false;
    }
  }

  btnAbrir.addEventListener('click', () => {
    chatBox.classList.add('abierto');
    if (!iniciado) {
      const restaurado = restaurarChat();
      if (!restaurado) setTimeout(() => mostrarBienvenida(), 400);
      iniciado = true;
    }
    inputChat.focus();
  });
  btnCerrar.addEventListener('click', () => chatBox.classList.remove('abierto'));
  btnEnviar.addEventListener('click', enviarMensaje);
  inputChat.addEventListener('keypress', (e) => { if (e.key === 'Enter') enviarMensaje(); });

  function mostrarBienvenida() {
    agregarMensaje('bot', '👋 ¡Hola! Bienvenido a DEOSOLUCIONES.\n\nSoy tu asistente virtual. ¿En qué te puedo ayudar?');
    setTimeout(() => {
      agregarBotonesRapidos(['🔐 Control de acceso', '🔧 Servicio técnico', '💰 Precios', '📋 Dejar mis datos']);
    }, 600);
  }

  function irAlMenu() {
    agregarMensaje('bot', '¿En qué más te puedo ayudar?');
    setTimeout(() => agregarBotonesRapidos(['🔐 Control de acceso', '🔧 Servicio técnico', '💰 Precios', '📋 Dejar mis datos']), 400);
  }

  function mostrarMenuFlotante() {
    const div = document.createElement('div');
    div.className = 'menu-flotante';
    const items = [
      { label: '🏠 Menú', cls: 'home', fn: () => { div.remove(); irAlMenu(); } },
      { label: '📋 Dejar datos', cls: '', fn: () => { div.remove(); mostrarTyping(800, () => mostrarFormulario()); } },
      { label: '💬 WhatsApp', cls: '', fn: () => { div.remove(); abrirWhatsapp(); } }
    ];
    items.forEach(({ label, cls, fn }) => {
      const btn = document.createElement('button');
      btn.className = 'menu-btn' + (cls ? ' ' + cls : '');
      btn.textContent = label;
      btn.onclick = fn;
      div.appendChild(btn);
    });
    mensajesDiv.appendChild(div);
    mensajesDiv.scrollTop = mensajesDiv.scrollHeight;
  }

  // Botones de seguimiento contextuales que envía el bot ({label, tema|accion}).
  function mostrarSugerencias(sugerencias) {
    if (!Array.isArray(sugerencias) || sugerencias.length === 0) {
      mostrarMenuFlotante();
      return;
    }
    // Garantizar que SIEMPRE se pueda volver al menú principal.
    const lista = sugerencias.slice();
    if (!lista.some(s => s.tema === 'menu')) {
      lista.push({ label: '🏠 Menú', tema: 'menu' });
    }
    const div = document.createElement('div');
    div.className = 'menu-flotante';
    lista.forEach(s => {
      const btn = document.createElement('button');
      // Destacar acciones de conversión (datos/WhatsApp) y el botón de menú.
      btn.className = 'menu-btn' + (s.accion || s.tema === 'menu' ? ' home' : '');
      btn.textContent = s.label;
      btn.onclick = () => {
        div.remove();
        if (s.accion === 'datos') {
          mostrarTyping(800, () => mostrarFormulario());
        } else if (s.accion === 'whatsapp') {
          abrirWhatsapp();
        } else if (s.tema === 'menu') {
          irAlMenu();
        } else if (s.tema) {
          agregarMensaje('usuario', s.label);
          procesarMensaje(s.tema);
        }
      };
      div.appendChild(btn);
    });
    mensajesDiv.appendChild(div);
    mensajesDiv.scrollTop = mensajesDiv.scrollHeight;
  }

  function abrirWhatsapp() {
    agregarMensaje('bot', '📱 Puedes escribirnos directamente por WhatsApp:');
    setTimeout(() => {
      const wDiv = document.createElement('div');
      wDiv.className = 'quick-btns';
      const a = document.createElement('a');
      a.href = 'https://wa.me/573242600709?text=Hola,%20vengo%20de%20la%20p%C3%A1gina%20web%20de%20DEOSOLUCIONES';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.className = 'quick-btn';
      a.style.cssText = 'background:#25D366;color:white;border-color:#25D366;text-decoration:none;';
      a.textContent = '💬 Abrir WhatsApp';
      wDiv.appendChild(a);
      mensajesDiv.appendChild(wDiv);
      mensajesDiv.scrollTop = mensajesDiv.scrollHeight;
      setTimeout(() => mostrarMenuFlotante(), 300);
    }, 400);
  }

  function agregarBotonesRapidos(opciones) {
    const div = document.createElement('div');
    div.className = 'quick-btns';
    opciones.forEach(op => {
      const btn = document.createElement('button');
      btn.className = 'quick-btn';
      btn.textContent = op;
      btn.onclick = () => {
        div.remove();
        agregarMensaje('usuario', op);
        procesarMensaje(op);
      };
      div.appendChild(btn);
    });
    mensajesDiv.appendChild(div);
    mensajesDiv.scrollTop = mensajesDiv.scrollHeight;
  }

  function enviarMensaje() {
    const texto = inputChat.value.trim();
    if (!texto || esperandoFormulario) return;
    agregarMensaje('usuario', texto);
    inputChat.value = '';
    procesarMensaje(texto);
  }

  function procesarMensaje(texto) {
    const textoNorm = texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const triggerFormulario = ['datos', 'dejar mis datos', 'cotizacion', 'formulario',
      'me llamen', 'quiero que me contacten', 'mas informacion', 'quiero info'];

    const triggerWhatsapp = ['whatsapp', 'wsp', 'wasap', 'contacto', 'contactar', 'llamar', 'hablar con alguien', 'asesor', 'humano'];

    if (triggerWhatsapp.some(t => textoNorm.includes(t))) {
      mostrarTyping(600, () => abrirWhatsapp());
      return;
    }
    if (triggerFormulario.some(t => textoNorm.includes(t))) {
      mostrarTyping(800, () => mostrarFormulario());
      return;
    }

    mostrarTyping(600, () => {
      fetch('/api/bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: texto })
      })
        .then(r => r.json())
        .then(data => {
          agregarMensaje('bot', data.respuesta);
          setTimeout(() => mostrarSugerencias(data.sugerencias), 300);
        })
        .catch(() => agregarMensaje('bot', '😕 Hubo un error. Contáctanos al 📱 324 260 0709'));
    });
  }

  function mostrarFormulario() {
    agregarMensaje('bot', '¡Perfecto! Déjame tus datos y te contactamos en menos de 2 horas 😊');
    setTimeout(() => {
      const form = document.createElement('div');
      form.className = 'chat-form';
      form.innerHTML = `
        <div class="chat-form-title">📋 Formulario de contacto</div>
        <label>Nombre completo *</label>
        <input type="text" id="cf-nombre" placeholder="Tu nombre"/>
        <label>Teléfono *</label>
        <input type="tel" id="cf-telefono" placeholder="300 000 0000"/>
        <label>Correo *</label>
        <input type="email" id="cf-correo" placeholder="tu@correo.com"/>
        <label>Empresa (opcional)</label>
        <input type="text" id="cf-empresa" placeholder="Nombre de tu empresa"/>
        <label>Servicio de interés *</label>
        <select id="cf-servicio">
          <option value="">Selecciona...</option>
          <option value="control-acceso">🔐 Control de acceso facial</option>
          <option value="servicio-tecnico">🔧 Servicio técnico</option>
          <option value="red-wifi">🌐 Red / WiFi</option>
          <option value="malware">🛡️ Eliminación de malware/virus</option>
          <option value="hardware">💾 Actualización de hardware</option>
          <option value="impresora">🖨️ Impresoras</option>
          <option value="venta-equipos">🛒 Compra de equipos</option>
          <option value="instalacion">📦 Instalación de equipos</option>
          <option value="otro">Otro</option>
        </select>
        <label>Motivo *</label>
        <select id="cf-motivo">
          <option value="">Selecciona...</option>
          <option value="cotizacion">💰 Quiero una cotización</option>
          <option value="equipo-danado">🔧 Tengo un equipo dañado</option>
          <option value="info-acceso">🔐 Info del sistema de acceso</option>
          <option value="comprar-equipo">🛒 Quiero comprar un equipo</option>
          <option value="otro">Otro</option>
        </select>
        <label class="cf-consent">
          <input type="checkbox" id="cf-acepto"/>
          <span>Autorizo el tratamiento de mis datos según la <a href="politica-privacidad.html" target="_blank">Política de Datos</a> (Ley 1581/2012). *</span>
        </label>
        <button class="chat-form-btn" id="cf-enviar" data-action="chat-send">Enviar mensaje 📩</button>
        <button class="chat-form-cancel" data-action="chat-cancel">Cancelar</button>
      `;
      mensajesDiv.appendChild(form);
      mensajesDiv.scrollTop = mensajesDiv.scrollHeight;
      esperandoFormulario = true;
    }, 500);
  }

  window.enviarFormularioChat = async function () {
    const nombre = document.getElementById('cf-nombre').value.trim();
    const telefono = document.getElementById('cf-telefono').value.trim();
    const correo = document.getElementById('cf-correo').value.trim();
    const empresa = document.getElementById('cf-empresa').value.trim();
    const servicio = document.getElementById('cf-servicio').value;
    const motivo = document.getElementById('cf-motivo').value;
    const acepto = document.getElementById('cf-acepto').checked;
    const btn = document.getElementById('cf-enviar');

    if (!nombre || !telefono || !correo || !servicio || !motivo) {
      btn.style.background = '#ef4444';
      btn.textContent = '⚠️ Completa todos los campos';
      setTimeout(() => { btn.style.background = ''; btn.textContent = 'Enviar mensaje 📩'; }, 2000);
      return;
    }

    if (!acepto) {
      btn.style.background = '#ef4444';
      btn.textContent = '⚠️ Autoriza el uso de datos';
      setTimeout(() => { btn.style.background = ''; btn.textContent = 'Enviar mensaje 📩'; }, 2000);
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Enviando...';

    try {
      const res = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, telefono, correo, empresa, servicio, motivo, acepto: true })
      });
      if (res.ok) {
        btn.closest('.chat-form').remove();
        esperandoFormulario = false;
        agregarMensaje('sistema', '✅ Mensaje enviado correctamente');
        agregarMensaje('bot', `¡Gracias ${nombre}! 🎉\n\nRecibimos tu mensaje. Te contactaremos al ${telefono} en menos de 2 horas.\n\n¿Hay algo más en lo que te pueda ayudar?`);
        setTimeout(() => mostrarMenuFlotante(), 600);
      } else { throw new Error(); }
    } catch {
      btn.disabled = false;
      btn.style.background = '#ef4444';
      btn.textContent = '❌ Error, intenta de nuevo';
      setTimeout(() => { btn.style.background = ''; btn.textContent = 'Enviar mensaje 📩'; }, 3000);
    }
  };

  window.cancelarFormulario = function (el) {
    el.closest('.chat-form').remove();
    esperandoFormulario = false;
    agregarMensaje('bot', 'No hay problema. ¿En qué más te puedo ayudar?');
    setTimeout(() => mostrarMenuFlotante(), 300);
  };

  function mostrarTyping(delay, callback) {
    const row = document.createElement('div');
    row.className = 'typing-row';
    row.innerHTML = '<div class="bot-ico">🤖</div><div class="typing"><span></span><span></span><span></span></div>';
    mensajesDiv.appendChild(row);
    mensajesDiv.scrollTop = mensajesDiv.scrollHeight;
    setTimeout(() => { row.remove(); callback(); }, delay);
  }

  function agregarMensaje(tipo, texto) {
    if (tipo === 'sistema') {
      const div = document.createElement('div');
      div.className = 'msg sistema';
      div.textContent = texto;
      mensajesDiv.appendChild(div);
      mensajesDiv.scrollTop = mensajesDiv.scrollHeight;
      guardarChat();
      return;
    }
    const row = document.createElement('div');
    row.className = tipo === 'bot' ? 'msg-row bot-row' : 'msg-row user-row';
    const html = escHTML(texto).replace(/\n/g, '<br>');
    const time = ahora();
    if (tipo === 'bot') {
      row.innerHTML = `<div class="bot-ico">🤖</div><div class="msg bot">${html}</div><span class="msg-time">${time}</span>`;
    } else {
      row.innerHTML = `<span class="msg-time">${time}</span><div class="msg usuario">${html}</div>`;
    }
    mensajesDiv.appendChild(row);
    mensajesDiv.scrollTop = mensajesDiv.scrollHeight;
    guardarChat();
  }
})();
