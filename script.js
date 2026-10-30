/* ==========================================================================
   FATURAMENTO NO COPO - INTERAÇÕES & ALTA CONVERSÃO
   - Atribuição da campanha no checkout
   - FAQ Acordeão retrátil
   - Barra CTA Flutuante Inteligente (Sticky Mobile)
   - Scroll suave para a oferta
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Encaminhar a atribuição da campanha ao checkout oficial
  initCheckoutAttribution();

  // 2. Acordeão do FAQ
  initFaqAccordion();

  // 3. Barra Sticky CTA no Scroll (Mobile & Desktop)
  initStickyCta();

  // 4. Smooth scroll nos links internos
  initSmoothScroll();
});

/**
 * Preserve campaign attribution on the official checkout, without redirecting
 * or delaying the visitor. Only known campaign parameters are forwarded.
 */
function initCheckoutAttribution() {
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content',
    'utm_term', 'utm_id', 'campaign_id', 'adset_id', 'ad_id', 'fbclid', 'sck', 'src'];
  const storageKey = 'fnc_checkout_attribution';
  let saved = {};
  try { saved = JSON.parse(sessionStorage.getItem(storageKey) || '{}') || {}; } catch (_) {}
  const query = new URLSearchParams(window.location.search);
  // A new campaign replaces the previous campaign, avoiding mixed attribution.
  if (['utm_source', 'utm_campaign', 'campaign_id', 'ad_id'].some(key => query.has(key))) saved = {};
  const values = {};
  keys.forEach(key => {
    const value = query.has(key) ? query.get(key) : saved[key];
    if (typeof value === 'string' && value && value.length <= 500 && !value.includes('{{')
      && !(key === 'fbclid' && value === 'fbclid')) values[key] = value;
  });
  try { sessionStorage.setItem(storageKey, JSON.stringify(values)); } catch (_) {}
  document.querySelectorAll('a[href]').forEach(link => {
    try {
      const target = new URL(link.href);
      if (target.origin !== 'https://pay.cakto.com.br' || target.pathname !== '/pv6mh3a_1167035') return;
      keys.forEach(key => { if (values[key]) target.searchParams.set(key, values[key]); });
      link.href = target.toString();
    } catch (_) { /* Invalid links must never prevent the page from loading. */ }
  });
}

/**
 * FAQ Acordeão Interativo
 */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (!questionBtn) return;

    questionBtn.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');

      // Fecha os outros
      faqItems.forEach(other => {
        if (other !== item) {
          other.classList.remove('active');
        }
      });

      // Alterna o atual
      if (isOpen) {
        item.classList.remove('active');
      } else {
        item.classList.add('active');
      }
    });
  });
}

/**
 * Sticky CTA no Scroll (aparece quando o usuário passa do primeiro botão)
 */
function initStickyCta() {
  const stickyBar = document.getElementById('stickyMobileCta');
  const heroCtaBtn = document.getElementById('heroCtaBtn');

  if (!stickyBar || !heroCtaBtn) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // Quando o botão principal sai da tela superior, mostra a barra
      if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
        stickyBar.classList.add('visible');
      } else {
        stickyBar.classList.remove('visible');
      }
    });
  }, {
    threshold: 0
  });

  observer.observe(heroCtaBtn);
}

/**
 * Scroll Suave para a âncora de checkout
 */
function initSmoothScroll() {
  const scrollLinks = document.querySelectorAll('a[href^="#"]');
  scrollLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });
}
