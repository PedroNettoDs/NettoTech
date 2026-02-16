const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

const splitClasses = (value) => String(value || '').trim().split(/\s+/).filter(Boolean);

function createCarousel(root, { getCards } = {}) {
  const rail = $('[data-carousel-rail]', root);
  if (!rail) return null;

  const prevBtn = $('[data-carousel-prev]', root);
  const nextBtn = $('[data-carousel-next]', root);

  const activeClass = splitClasses(root.dataset.carouselActiveClass);
  const inactiveClass = splitClasses(root.dataset.carouselInactiveClass);

  const autoMs = Number(root.dataset.carouselAutoMs || '');
  const shouldAuto = Number.isFinite(autoMs) && autoMs > 0;
  const shouldPause = root.dataset.carouselPause !== 'false';
  const shouldLoop = root.dataset.carouselLoop !== 'false';

  let cards = [];
  let activeIndex = 0;
  let rafPending = false;
  let autoTimer = null;

  const refresh = () => {
    cards = (getCards ? getCards() : Array.from(rail.children)).filter((el) => el && el.nodeType === 1);
    applyActiveClasses();
  };

  const applyActiveClasses = () => {
    if (!cards.length || (!activeClass.length && !inactiveClass.length)) return;
    cards.forEach((card, index) => {
      const isActive = index === activeIndex;

      inactiveClass.forEach((cls) => card.classList.toggle(cls, !isActive));
      activeClass.forEach((cls) => card.classList.toggle(cls, isActive));
    });
  };

  const updateActiveFromScroll = () => {
    if (!cards.length) return;

    const railRect = rail.getBoundingClientRect();
    const railCenterX = railRect.left + railRect.width / 2;
    let bestIndex = 0;
    let bestDistance = Infinity;

    cards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const distance = Math.abs(centerX - railCenterX);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });

    activeIndex = bestIndex;
    applyActiveClasses();
  };

  const scrollToIndex = (nextIndex, behavior = 'smooth') => {
    if (!cards.length) return;
    const normalized = shouldLoop ? (nextIndex + cards.length) % cards.length : Math.max(0, Math.min(nextIndex, cards.length - 1));
    const card = cards[normalized];
    const targetLeft = card.offsetLeft - (rail.clientWidth - card.clientWidth) / 2;
    rail.scrollTo({ left: targetLeft, behavior });
    activeIndex = normalized;
    applyActiveClasses();
  };

  const stopAuto = () => {
    if (!autoTimer) return;
    window.clearInterval(autoTimer);
    autoTimer = null;
  };

  const startAuto = () => {
    if (!shouldAuto || prefersReducedMotion()) return;
    if (autoTimer) return;
    autoTimer = window.setInterval(() => scrollToIndex(activeIndex + 1), autoMs);
  };

  prevBtn?.addEventListener('click', () => scrollToIndex(activeIndex - 1));
  nextBtn?.addEventListener('click', () => scrollToIndex(activeIndex + 1));

  rail.addEventListener('scroll', () => {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
      rafPending = false;
      updateActiveFromScroll();
    });
  }, { passive: true });

  window.addEventListener('resize', updateActiveFromScroll);

  if (shouldPause) {
    rail.addEventListener('pointerenter', stopAuto);
    rail.addEventListener('pointerleave', startAuto);
    rail.addEventListener('focusin', stopAuto);
    rail.addEventListener('focusout', startAuto);
    prevBtn?.addEventListener('pointerdown', stopAuto);
    nextBtn?.addEventListener('pointerdown', stopAuto);
  }

  refresh();
  scrollToIndex(0, 'auto');
  requestAnimationFrame(updateActiveFromScroll);
  startAuto();

  return { refresh, scrollToIndex, stopAuto, startAuto };
}

function initImageModal() {
  const modal = $('[data-stories-modal]');
  if (!modal) return;

  const metaEl = $('[data-stories-meta]', modal);
  const titleEl = $('[data-stories-title]', modal);
  const bodyEl = $('[data-stories-body]', modal);
  const imgEl = $('[data-stories-img]', modal);
  const closeEls = $$('[data-stories-close]', modal);

  const closeModal = () => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    modal.setAttribute('aria-hidden', 'true');
  };

  const openModal = (triggerEl) => {
    if (!imgEl) return;

    const isImageOnly = triggerEl.dataset.modal === 'image-only';
    metaEl?.classList.toggle('hidden', isImageOnly);

    if (titleEl) titleEl.textContent = isImageOnly ? '' : triggerEl.dataset.title || '';
    if (bodyEl) bodyEl.textContent = isImageOnly ? '' : triggerEl.dataset.body || '';

    imgEl.src = triggerEl.dataset.img || '';
    imgEl.alt = triggerEl.dataset.title || 'Imagem';

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    modal.setAttribute('aria-hidden', 'false');
  };

  document.addEventListener('click', (event) => {
    const triggerEl = event.target.closest('[data-modal][data-img], [data-story][data-img]');
    if (!triggerEl) return;

    if (triggerEl.tagName === 'A') {
      const allowNavigation = event.metaKey || event.ctrlKey || event.shiftKey || event.button === 1;
      if (!allowNavigation) event.preventDefault();
    }

    openModal(triggerEl);
  });

  closeEls.forEach((el) => el.addEventListener('click', closeModal));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal();
  });
}

function initReveal() {
  if (prefersReducedMotion()) return;

  const revealTargets = $$('[data-reveal]');
  if (!revealTargets.length) return;

  const timersByEl = new WeakMap();
  const clearTimers = (el) => {
    const timers = timersByEl.get(el);
    if (!timers) return;
    timers.forEach((t) => window.clearTimeout(t));
    timersByEl.delete(el);
  };

  const resetGroup = (groupEl) => {
    clearTimers(groupEl);
    groupEl.classList.remove('is-visible');
    $$('[data-reveal-item]', groupEl).forEach((item) => item.classList.remove('is-visible'));
  };

  const playGroup = (groupEl) => {
    groupEl.classList.add('reveal', 'is-visible');

    const stagger = groupEl.getAttribute('data-reveal-stagger');
    if (!stagger) return;

    clearTimers(groupEl);
    const items = $$('[data-reveal-item]', groupEl);
    if (!items.length) return;

    items.forEach((item) => item.classList.add('reveal'));
    items.forEach((item) => item.classList.remove('is-visible'));

    const ordered = stagger === 'reverse' ? items.slice().reverse() : items;
    const timers = ordered.map((item, idx) => window.setTimeout(() => item.classList.add('is-visible'), idx * 140));
    timersByEl.set(groupEl, timers);
  };

  revealTargets.forEach((el) => el.classList.add('reveal'));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const el = entry.target;

        if (entry.isIntersecting) {
          playGroup(el);
          return;
        }

        const vh = window.innerHeight || 0;
        const fullyOut = entry.boundingClientRect.bottom < 0 || entry.boundingClientRect.top > vh;
        if (fullyOut) resetGroup(el);
      });
    },
    { threshold: 0.18 }
  );

  revealTargets.forEach((el) => observer.observe(el));
}

function initExperienceToggle() {
  const toggleBtn = $('[data-exp-toggle]');
  const extras = $$('[data-exp-extra]');
  const label = $('[data-exp-toggle-label]');
  if (!toggleBtn || !extras.length) return;

  const setExpanded = (expanded) => {
    toggleBtn.setAttribute('aria-expanded', String(expanded));
    if (label) label.textContent = expanded ? 'Ver menos' : 'Ver mais';

    const icon = $('.material-icons', toggleBtn);
    if (icon) icon.textContent = expanded ? 'expand_less' : 'expand_more';

    extras.forEach((el, idx) => {
      el.classList.toggle('hidden', !expanded);
      if (!expanded) {
        el.classList.remove('is-visible');
        return;
      }

      el.classList.add('reveal');
      el.classList.remove('is-visible');
      window.setTimeout(() => el.classList.add('is-visible'), idx * 120);
    });
  };

  setExpanded(false);
  toggleBtn.addEventListener('click', () => {
    const expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    setExpanded(!expanded);
  });
}

function renderStories() {
  const root = $('[data-carousel-root="stories"]');
  if (!root) return;

  const rail = $('[data-carousel-rail]', root);
  if (!rail) return;

  const stories = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, coverUrl: `img/storys${i + 1}.png`, href: '#' }));

  const baseCardClass =
    'group snap-center shrink-0 w-[68vw] sm:w-[220px] lg:w-[170px] aspect-[9/16] rounded-2xl overflow-hidden border bg-graphite/35 transition-all duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-electric/70 hover:scale-[1.02]';

  rail.innerHTML = stories
    .map(
      (story) => `
        <a
          href="${story.href}"
          data-story
          data-modal="image-only"
          data-title=""
          data-body=""
          data-img="${story.coverUrl}"
          class="${baseCardClass} border-slate-800 opacity-70 scale-[0.92]"
          aria-label="Abrir story ${String(story.id).padStart(2, '0')}"
        >
          <div class="relative w-full h-full">
            <img src="${story.coverUrl}" alt="Story ${String(story.id).padStart(2, '0')}" class="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
            <div class="absolute inset-0 bg-gradient-to-t from-deep/70 via-transparent to-transparent opacity-80"></div>
          </div>
        </a>
      `
    )
    .join('');

  createCarousel(root, { getCards: () => $$('a', rail) });
}

function renderCerts() {
  const root = $('[data-carousel-root="certs"]');
  if (!root) return;

  const rail = $('[data-carousel-rail]', root);
  if (!rail) return;

  const certs = [
    {
      id: 1,
      title: 'AWS Knowledge: Cloud Essentials',
      issuer: 'Amazon Web Services Training and Certification',
      issued: '2024-10-15',
      kind: 'Training Badge',
      imageUrl: '',
      verifyUrl: '',
    },
    { id: 2, title: 'CCNA: Introduction to Networks', issuer: 'Cisco', issued: '2023-12-18', kind: 'Certificado', imageUrl: '', verifyUrl: '' },
    { id: 3, title: 'CCNA: Switching, Routing, and Wireless Essentials', issuer: 'Cisco', issued: '2023-12-18', kind: 'Certificado', imageUrl: '', verifyUrl: '' },
    { id: 4, title: 'CCNA: Enterprise Networking, Security, and Automation', issuer: 'Cisco', issued: '2023-12-22', kind: 'Certificado', imageUrl: '', verifyUrl: '' },
    { id: 5, title: 'Introduction to Data Science', issuer: 'Cisco', issued: '2024-08-13', kind: 'Certificado', imageUrl: '', verifyUrl: '' },
    { id: 6, title: 'Computer Network', issuer: 'Huawei', issued: '2024-10-14', kind: 'Certificado', imageUrl: '', verifyUrl: '' },
    { id: 7, title: 'IT Essentials', issuer: 'Cisco', issued: '2024-12-04', kind: 'Certificado', imageUrl: '', verifyUrl: '' },
  ];

  const formatIssued = (isoDate) => {
    const date = new Date(`${isoDate}T00:00:00`);
    if (Number.isNaN(date.getTime())) return isoDate;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  rail.innerHTML = certs
    .map(
      (c) => `
        <article class="snap-center shrink-0 w-[78vw] sm:w-[360px] lg:w-[300px] soft-glow rounded-xl border border-slate-700 bg-graphite/45 p-6">
          <div class="flex items-start gap-4">
            <div class="shrink-0 w-14 h-14 rounded-xl overflow-hidden border border-slate-800 bg-deep/60">
              ${
                c.imageUrl
                  ? `<img src="${c.imageUrl}" alt="Imagem do certificado" class="w-full h-full object-cover" loading="lazy" decoding="async" />`
                  : `<div class="w-full h-full grid place-items-center text-slate-400"><span class="material-icons">verified</span></div>`
              }
            </div>
            <div class="min-w-0 flex-1">
              <span class="inline-flex items-center rounded-full border border-electric/60 px-3 py-1 text-xs uppercase tracking-[0.18em] text-blue-300 mb-4">${c.kind}</span>
              <h4 class="text-white font-semibold leading-snug">${c.title}</h4>
              <p class="mt-2 text-sm text-slate-300">${c.issuer}</p>
              <p class="mt-1 text-xs text-slate-500">Emitido em ${formatIssued(c.issued)}</p>
              ${
                c.verifyUrl
                  ? `<a href="${c.verifyUrl}" target="_blank" rel="noopener noreferrer" class="mt-3 inline-flex items-center gap-2 text-sm text-blue-300 hover:text-blue-200 underline decoration-electric/60 underline-offset-4">
                      <span class="material-icons text-[18px]">open_in_new</span>
                      Verificar certificado
                    </a>`
                  : `<p class="mt-3 text-xs text-slate-500">Adicione um link de verificação para comprovar.</p>`
              }
            </div>
          </div>
        </article>
      `
    )
    .join('');

  createCarousel(root);
}

document.addEventListener('DOMContentLoaded', () => {
  initImageModal();
  initReveal();
  initExperienceToggle();

  renderStories();
  renderCerts();
});
