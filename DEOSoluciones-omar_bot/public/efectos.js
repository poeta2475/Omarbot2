// ════════════════════════════════════════
// EFECTOS - DEOSOLUCIONES
// Animaciones al scroll + Botón subir arriba
// ════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {

  // ───── ANIMACIONES AL SCROLL ─────
  // Detecta cuando un elemento es visible en pantalla
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  // Observar TODAS las secciones automáticamente
  const sections = document.querySelectorAll('section');
  sections.forEach((section, index) => {
    // El hero (primera sección) no necesita animación de scroll
    if (index === 0) return;

    // Aplicar fade-up al título de la sección
    const titles = section.querySelectorAll('h2, h3');
    titles.forEach(t => {
      t.classList.add('scroll-fade');
      observer.observe(t);
    });

    // Aplicar fade-up a tarjetas y elementos importantes
    const cards = section.querySelectorAll('.bg-white, .bg-gray-50, .bg-gray-100');
    cards.forEach((card, i) => {
      // Alternar lados para dar variedad
      if (i % 2 === 0) {
        card.classList.add('scroll-fade-left');
      } else {
        card.classList.add('scroll-fade-right');
      }
      // Pequeño delay escalonado
      card.style.transitionDelay = `${i * 0.1}s`;
      observer.observe(card);
    });
  });

  // ───── BOTÓN SUBIR ARRIBA ─────
  // Crear el botón dinámicamente
  const btnSubir = document.createElement('button');
  btnSubir.id = 'btn-subir';
  btnSubir.title = 'Subir arriba';
  btnSubir.innerHTML = '<span class="material-symbols-outlined">arrow_upward</span>';
  document.body.appendChild(btnSubir);

  // Mostrar/ocultar al hacer scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btnSubir.classList.add('visible');
    } else {
      btnSubir.classList.remove('visible');
    }
  });

  // Scroll suave al hacer clic
  btnSubir.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

});
