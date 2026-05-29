// ════════════════════════════════════════
//  UI COMÚN - DEOSOLUCIONES
//  Funciones compartidas + enrutador de eventos por delegación.
//  Reemplaza los onclick="" inline (bloqueados por CSP script-src-attr).
//  Se incluye en todas las páginas como <script src="src/ui-common.js" defer>.
// ════════════════════════════════════════

// ── Modo oscuro ──
function toggleDarkMode() {
  document.documentElement.classList.toggle('dark');
  const icon = document.getElementById('dark-icon');
  const isDark = document.documentElement.classList.contains('dark');
  if (icon) icon.textContent = isDark ? 'light_mode' : 'dark_mode';
  try { localStorage.setItem('theme', isDark ? 'dark' : 'light'); } catch (e) {}
}

// Sincroniza el icono con el tema ya aplicado (el <head> añade .dark sin parpadeo).
(function initDarkIcon() {
  try {
    const icon = document.getElementById('dark-icon');
    if (icon && document.documentElement.classList.contains('dark')) {
      icon.textContent = 'light_mode';
    }
  } catch (e) {}
})();

// ── Menú móvil ──
function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  if (!menu) return;
  if (menu.classList.contains('hidden')) {
    menu.classList.add('menu-enter');
    menu.classList.remove('hidden');
    requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.remove('menu-enter')));
  } else {
    menu.classList.add('menu-enter');
    setTimeout(() => { menu.classList.add('hidden'); menu.classList.remove('menu-enter'); }, 300);
  }
}

// ── Modal de login ──
function toggleLoginModal() {
  const modal = document.getElementById('loginModal');
  if (!modal) return;
  if (modal.classList.contains('hidden')) {
    modal.classList.add('modal-enter');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    requestAnimationFrame(() => requestAnimationFrame(() => modal.classList.remove('modal-enter')));
  } else {
    modal.classList.add('modal-enter');
    setTimeout(() => { modal.classList.add('hidden'); modal.classList.remove('flex', 'modal-enter'); }, 250);
  }
}

// Exponer en window para que otros scripts (auth.js, etc.) reutilicen la misma lógica.
window.toggleDarkMode = toggleDarkMode;
window.toggleMobileMenu = toggleMobileMenu;
window.toggleLoginModal = toggleLoginModal;

// ── Tecla Escape: cierra modal y menú abiertos ──
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  const modal = document.getElementById('loginModal');
  if (modal && !modal.classList.contains('hidden')) toggleLoginModal();
  const menu = document.getElementById('mobileMenu');
  if (menu && !menu.classList.contains('hidden')) toggleMobileMenu();
});

// ── Enrutador de eventos por delegación ──
// Sustituye los onclick="" inline. Cada elemento usa data-action="..." y,
// opcionalmente, data-filter / data-index / data-id.
function call(name, ...args) {
  if (typeof window[name] === 'function') window[name](...args);
}

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;

  switch (action) {
    case 'dark-toggle':     toggleDarkMode(); break;
    case 'menu-toggle':     toggleMobileMenu(); break;
    case 'login-toggle':    toggleLoginModal(); break;
    case 'login-close':     e.stopPropagation(); toggleLoginModal(); break;
    case 'login-and-menu':  toggleLoginModal(); toggleMobileMenu(); break;
    case 'stop':            e.stopPropagation(); break;
    case 'google-login':    call('handleGoogleLogin'); break;
    case 'logout':          call('handleLogout'); break;
    case 'modal-open':      call('openProductModal'); break;
    case 'modal-close':     call('closeProductModal'); break;
    case 'filter':          call('setFilter', el.dataset.filter); break;
    case 'carousel-prev':   call('carouselPrev'); break;
    case 'carousel-next':   call('carouselNext'); break;
    case 'carousel-goto':   call('moveCarousel', Number(el.dataset.index)); break;
    case 'product-edit':    call('editProduct', el.dataset.id); break;
    case 'product-delete':  call('deleteProduct', el.dataset.id); break;
    case 'file-pick':       document.getElementById('productImage')?.click(); break;
    case 'notif-close':     el.closest('.deo-notification')?.remove(); break;
    case 'contacto-send':   call('enviarContacto'); break;
    case 'chat-send':       call('enviarFormularioChat'); break;
    case 'chat-cancel':     call('cancelarFormulario', el); break;
  }
});
