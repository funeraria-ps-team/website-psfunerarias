/**
 * BorderGlow - Vanilla JavaScript
 * Efecto lumínico reactivo al cursor para todas las tarjetas del sitio (Funeraria Perpetuo Socorro)
 * Sigue las coordenadas cartesianas exactas del cursor (x, y), iluminando el perímetro
 * completo de cualquier tarjeta rectangular (incluyendo esquinas y extremo derecho).
 */

(function () {
  'use strict';

  // Selectores de todas las tarjetas en index.html, detalles.html, nosotros.html, 404.html, politica-de-privacidad.html
  const CARD_SELECTORS = [
    '.package-card',
    '.casket-card',
    '.prevision-card',
    '.story-card',
    '.about-pillar-card',
    '.guide-step-card',
    '.vehiculo-feature-item',
    '.inclusion-card',
    '.nosotros-metric-card',
    '.bento-card',
    '.value-card',
    '.team-hero-card',
    '.team-role-card',
    '.guarantee-card',
    '.nosotros-cta-box',
    '.contact-card',
    '.carousel article'
  ].join(', ');

  const initializedCards = new WeakSet();

  function setupCard(card) {
    if (initializedCards.has(card)) return;
    initializedCards.add(card);
    card.dataset.borderGlowInit = 'true';

    // Agregar clase de activación
    card.classList.add('border-glow-card');

    // Si existía un span .edge-light anterior, removerlo para no interferir con la maquetación
    const oldEdgeLight = card.querySelector(':scope > .edge-light');
    if (oldEdgeLight) {
      oldEdgeLight.remove();
    }

    let rafId = null;

    function onPointerMove(e) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        card.style.setProperty('--mouse-x', `${x.toFixed(1)}px`);
        card.style.setProperty('--mouse-y', `${y.toFixed(1)}px`);
        card.style.setProperty('--mouse-opacity', '1');
      });
    }

    function onPointerLeave() {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        card.style.setProperty('--mouse-opacity', '0');
      });
    }

    card.addEventListener('pointermove', onPointerMove, { passive: true });
    card.addEventListener('pointerleave', onPointerLeave, { passive: true });
  }

  function initBorderGlow() {
    const cards = document.querySelectorAll(CARD_SELECTORS);
    cards.forEach(setupCard);
  }

  // Inicializar en DOM listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBorderGlow);
  } else {
    initBorderGlow();
  }

  // Soporte para tarjetas inyectadas dinámicamente o cambios en el DOM
  if ('MutationObserver' in window) {
    const observer = new MutationObserver((mutations) => {
      let shouldScan = false;
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          shouldScan = true;
          break;
        }
      }
      if (shouldScan) initBorderGlow();
    });

    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  window.initBorderGlow = initBorderGlow;
})();
