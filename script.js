/* ==========================================================================
   FATURAMENTO NO COPO - INTERAÇÕES & ALTA CONVERSÃO
   - Contador de escassez regressivo
   - FAQ Acordeão retrátil
   - Barra CTA Flutuante Inteligente (Sticky Mobile)
   - Scroll suave para a oferta
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Contador Regressivo da Tarja de Alerta (15 minutos renováveis)
  initCountdownTimer();

  // 2. Acordeão do FAQ
  initFaqAccordion();

  // 3. Barra Sticky CTA no Scroll (Mobile & Desktop)
  initStickyCta();

  // 4. Smooth scroll nos links internos
  initSmoothScroll();
});

/**
 * Contador Regressivo Inteligente
 */
function initCountdownTimer() {
  const timerElement = document.getElementById('promoTimer');
  if (!timerElement) return;

  const STORAGE_KEY = 'fnc_promo_endtime';
  let endTime = localStorage.getItem(STORAGE_KEY);

  const now = new Date().getTime();
  const DURATION_MS = 14 * 60 * 1000 + 45 * 1000; // 14 min e 45s

  if (!endTime || parseInt(endTime, 10) < now) {
    endTime = now + DURATION_MS;
    localStorage.setItem(STORAGE_KEY, endTime);
  } else {
    endTime = parseInt(endTime, 10);
  }

  function update() {
    const current = new Date().getTime();
    const remaining = Math.max(0, endTime - current);

    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

    const formattedMin = String(minutes).padStart(2, '0');
    const formattedSec = String(seconds).padStart(2, '0');

    timerElement.textContent = `${formattedMin}:${formattedSec}`;

    if (remaining <= 0) {
      // Renova suavemente caso expire para manter sempre alta urgência
      endTime = new Date().getTime() + DURATION_MS;
      localStorage.setItem(STORAGE_KEY, endTime);
    }
  }

  update();
  setInterval(update, 1000);
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
