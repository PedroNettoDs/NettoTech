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

  const stories = Array.from({ length: 15 }, (_, i) => ({ id: i + 1, coverUrl: `img/storys${i + 1}.png`, href: '#' }));

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
      title: 'CCNA: Introduction to Networks',
      issuer: 'Cisco',
      issued: '2023-12-18',
      kind: 'Certificado',
      imageUrl: 'https://images.credly.com/size/340x340/images/70d71df5-f3dc-4380-9b9d-f22513a70417/CCNAITN__1_.png',
      verifyUrl: 'https://www.credly.com/badges/3dee7804-554c-4868-ba70-3f0d0a5bfea8',
    },
    {
      title: 'CCNA: Switching, Routing, and Wireless Essentials',
      issuer: 'Cisco',
      issued: '2023-12-18',
      kind: 'Certificado',
      imageUrl: 'https://images.credly.com/size/340x340/images/f4ccdba9-dd65-4349-baad-8f05df116443/CCNASRWE__1_.png',
      verifyUrl: 'https://www.credly.com/badges/a6d10622-e238-4ddc-a47a-ecc6c7c61935',
    },
    {
      title: 'CCNA: Enterprise Networking, Security, and Automation',
      issuer: 'Cisco',
      issued: '2023-12-22',
      kind: 'Certificado',
      imageUrl: 'https://images.credly.com/size/340x340/images/0a6d331e-8abf-4272-a949-33f754569a76/CCNAENSA__1_.png',
      verifyUrl: 'https://www.credly.com/badges/883eb270-a7eb-44cb-a0f3-19a1f8cfe019',
    },
    {
      title: 'AWS Knowledge: Cloud Essentials',
      issuer: 'Amazon Web Services Training and Certification',
      issued: '2024-10-15',
      kind: 'Training Badge',
      imageUrl: 'https://images.credly.com/size/340x340/images/7cf036b0-c609-4378-a7be-9969e1dea7ab/blob',
      verifyUrl: 'https://www.credly.com/badges/eaa33ec3-74e7-4784-9e60-d1fd389f5b7f',
    },
    {
      title: 'Computer Network',
      issuer: 'Huawei',
      issued: '2024-10-14',
      kind: 'Certificado',
      imageUrl: 'https://images.credly.com/size/340x340/images/f0486748-58d5-468d-ab92-b7e85bed0517/image.png',
      verifyUrl: 'https://www.credly.com/badges/ac3bff27-909e-4aa5-8c35-cb0b2fa37a23',
    },
    {
      title: 'IT Essentials',
      issuer: 'Cisco',
      issued: '2024-12-04',
      kind: 'Certificado',
      imageUrl: 'https://images.credly.com/size/340x340/images/04e8034c-81f5-4f7f-ab23-e8b428c31ce9/ITE.png',
      verifyUrl: 'https://www.credly.com/badges/866df61a-2ab3-471e-80d3-f864148e6eab',
    },
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
              <span class="inline-flex items-center rounded-full border border-electric/60 px-3 py-1 text-xs uppercase tracking-[0.18em] text-orange-400 mb-4">${c.kind}</span>
              <h4 class="text-white font-semibold leading-snug">${c.title}</h4>
              <p class="mt-2 text-sm text-slate-300">${c.issuer}</p>
              <p class="mt-1 text-xs text-slate-500">Emitido em ${formatIssued(c.issued)}</p>
              ${
                c.verifyUrl
                  ? `<a href="${c.verifyUrl}" target="_blank" rel="noopener noreferrer" class="mt-3 inline-flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300 underline decoration-electric/60 underline-offset-4">
                      <span class="material-icons text-[18px]">open_in_new</span>
                      Verificar certificado
                    </a>`
                  : ''
              }
            </div>
          </div>
        </article>
      `
    )
    .join('');

  createCarousel(root);
}

function initKeywordRain() {
  const canvas = document.getElementById('keyword-rain');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const keywords = [
    'Linux', 'Python', 'Cloud', 'CI/CD', 'LLMs', 'Agents de IA',
    'Automações', 'Gestão de projetos', 'GitHub Actions', 'Docker',
    'Scrum', 'Backup', 'Git', 'GitHub', 'Active Directory',
    'Microsoft 365', 'Governança', 'Grafana', 'FortiGate', 'Elastic',
    'ARIA', 'ERP', 'PDV', 'Banco de dados', 'ITIL', 'ServiceNow',
  ];

  let drops = [];

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const count = Math.max(18, Math.floor(canvas.width / 100));
    drops = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      word: keywords[Math.floor(Math.random() * keywords.length)],
      speed: 0.25 + Math.random() * 0.45,
      opacity: 0.035 + Math.random() * 0.07,
      size: 10 + Math.floor(Math.random() * 5),
    }));
  };

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drops.forEach((drop) => {
      ctx.font = `${drop.size}px Inter, sans-serif`;
      ctx.fillStyle = `rgba(251, 146, 60, ${drop.opacity})`;
      ctx.fillText(drop.word, drop.x, drop.y);
      drop.y += drop.speed;
      if (drop.y > canvas.height + 20) {
        drop.y = -20;
        drop.x = Math.random() * canvas.width;
        drop.word = keywords[Math.floor(Math.random() * keywords.length)];
      }
    });
    requestAnimationFrame(draw);
  };

  resize();
  window.addEventListener('resize', resize);

  if (!prefersReducedMotion()) draw();
}

function initThemeToggle() {
  const html = document.documentElement;
  const toggleBtns = $$('[data-theme-toggle]');
  if (!toggleBtns.length) return;

  // Restore persisted preference (anti-FOUC script already applied it to html)
  if (localStorage.getItem('theme') === 'light') {
    html.classList.remove('dark');
  }

  const updateIcons = () => {
    const isDark = html.classList.contains('dark');
    toggleBtns.forEach((btn) => {
      const icon = $('.material-icons', btn);
      if (icon) icon.textContent = isDark ? 'light_mode' : 'dark_mode';
      btn.setAttribute('aria-label', isDark ? 'Ativar tema claro' : 'Ativar tema escuro');
    });
  };

  const toggle = () => {
    html.classList.add('theme-transitioning');
    html.classList.toggle('dark');
    localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
    updateIcons();
    window.setTimeout(() => html.classList.remove('theme-transitioning'), 420);
  };

  toggleBtns.forEach((btn) => btn.addEventListener('click', toggle));
  updateIcons();
}

function initScrollSpy() {
  const progressFill = $('[data-progress-fill]');
  const sectionLabel = $('[data-section-label]');
  const navLinks = $$('[data-nav-link]');

  const sectionMap = {
    sobre:        'Sobre',
    projetos:     'Projetos',
    experiencia:  'Experiência',
    certificados: 'Certificados',
    educacao:     'Educação',
    storys:       'Trajetória',
    matchnetto:   'Compatibilidade',
    contatos:     'Contato',
  };
  const sectionIds = Object.keys(sectionMap);

  const getSectionEls = () =>
    sectionIds.map((id) => document.getElementById(id)).filter(Boolean);

  const setActive = (id) => {
    navLinks.forEach((link) => {
      const isActive = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('is-nav-active', isActive);
    });
    if (sectionLabel) {
      const label = sectionMap[id] || '';
      sectionLabel.textContent = label;
      sectionLabel.classList.toggle('visible', Boolean(label));
    }
  };

  const HEADER_H = 88;

  const onScroll = () => {
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const pct = maxScroll > 0 ? Math.min(100, (scrollY / maxScroll) * 100) : 0;
    if (progressFill) progressFill.style.width = pct + '%';

    const sectionEls = getSectionEls();
    let current = sectionIds[0];
    for (const el of sectionEls) {
      if (el.getBoundingClientRect().top <= HEADER_H + 24) current = el.id;
    }
    setActive(current);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  // Delay initial call so components are painted
  window.requestAnimationFrame(onScroll);
}

function initMobileMenu() {
  const toggleBtn = $('[data-mobile-menu-toggle]');
  const menu = $('[data-mobile-menu]');
  const icon = $('[data-mobile-menu-icon]');
  if (!toggleBtn || !menu) return;

  const close = () => {
    menu.classList.add('hidden');
    if (icon) icon.textContent = 'menu';
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.setAttribute('aria-label', 'Abrir menu');
  };

  toggleBtn.addEventListener('click', () => {
    const isOpen = !menu.classList.contains('hidden');
    if (isOpen) {
      close();
    } else {
      menu.classList.remove('hidden');
      if (icon) icon.textContent = 'close';
      toggleBtn.setAttribute('aria-expanded', 'true');
      toggleBtn.setAttribute('aria-label', 'Fechar menu');
    }
  });

  $$('[data-mobile-menu-link]').forEach((link) => link.addEventListener('click', close));
}

function initProjectsToggle() {
  const toggleBtn = $('[data-projects-toggle]');
  const extras = $$('[data-project-extra]');
  const label = $('[data-projects-toggle-label]');
  if (!toggleBtn || !extras.length) return;

  const isMobile = () => window.innerWidth < 768;

  const setExpanded = (expanded) => {
    toggleBtn.setAttribute('aria-expanded', String(expanded));
    if (label) label.textContent = expanded ? 'Exibir menos' : 'Exibir mais';

    const icon = $('.material-icons', toggleBtn);
    if (icon) icon.textContent = expanded ? 'expand_less' : 'expand_more';
    toggleBtn.setAttribute('aria-label', expanded ? 'Exibir menos projetos' : 'Exibir mais projetos');

    extras.forEach((el, idx) => {
      if (!isMobile()) {
        el.classList.remove('hidden');
        return;
      }
      el.classList.toggle('hidden', !expanded);
      if (expanded) {
        el.classList.add('reveal');
        el.classList.remove('is-visible');
        window.setTimeout(() => el.classList.add('is-visible'), idx * 120);
      } else {
        el.classList.remove('is-visible');
      }
    });
  };

  setExpanded(false);
  toggleBtn.addEventListener('click', () => {
    const expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    setExpanded(!expanded);
  });

  // Ao passar para desktop, garantir que todos os cards apareçam
  window.addEventListener('resize', () => {
    if (!isMobile()) {
      extras.forEach((el) => el.classList.remove('hidden'));
    } else {
      const expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
      extras.forEach((el) => el.classList.toggle('hidden', !expanded));
    }
  });
}

function initTimelineProgress() {
  const timelines = $$('[data-timeline]');
  if (!timelines.length) return;

  const update = () => {
    const vh = window.innerHeight;
    timelines.forEach((tl) => {
      const fill = $('[data-timeline-fill]', tl);
      if (!fill) return;
      const rect = tl.getBoundingClientRect();
      const total = rect.height + vh;
      const progress = Math.min(1, Math.max(0, rect.bottom / total));
      fill.style.height = `${progress * 100}%`;
    });
  };

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

function initAboutToggle() {
  const panels = $$('[data-about-panel]');
  const tabs   = $$('[data-about-tab]');
  const donut  = $('[data-about-donut]');
  const icon   = $('[data-about-icon]');
  if (!panels.length || !tabs.length || !donut) return;

  const DURATION = 30000;
  const CIRC     = 113.1;
  const order    = ['personal', 'professional'];
  const iconMap  = { personal: 'person', professional: 'work' };

  let currentIndex = 0;
  let startTs = null;

  const activatePanel = (name) => {
    panels.forEach((p) => {
      const active = p.dataset.aboutPanel === name;
      p.classList.toggle('hidden', !active);
      if (active) {
        p.classList.add('about-panel-enter');
        window.setTimeout(() => p.classList.remove('about-panel-enter'), 350);
      }
    });
    tabs.forEach((t) => {
      const active = t.dataset.aboutTab === name;
      t.className = [
        'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
        active ? 'text-orange-400 bg-electric/15' : 'text-slate-400 hover:text-slate-200',
      ].join(' ');
    });
    if (icon) icon.textContent = iconMap[name] || 'person';
  };

  const tick = (ts) => {
    if (startTs === null) startTs = ts;
    const progress = Math.min(1, (ts - startTs) / DURATION);
    donut.style.strokeDashoffset = String(progress * CIRC);

    if (progress >= 1) {
      currentIndex = (currentIndex + 1) % order.length;
      activatePanel(order[currentIndex]);
      startTs = null;
    }

    requestAnimationFrame(tick);
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const idx = order.indexOf(tab.dataset.aboutTab);
      if (idx === -1 || idx === currentIndex) return;
      currentIndex = idx;
      activatePanel(order[currentIndex]);
      startTs = null;
    });
  });

  activatePanel(order[0]);
  requestAnimationFrame(tick);
}

function initMatchNetto() {
  const WORKER_URL  = 'https://matchnetto-proxy.mrpedronetinhu.workers.dev/check';
  const STORAGE_KEY = 'matchnetto_session_id';
  const EXPIRY_KEY  = 'matchnetto_session_expiry';
  const SESSION_TTL = 24 * 60 * 60 * 1000;
  const CIRC        = 213.6;

  const modal     = $('[data-matchnetto-modal]');
  const input     = $('[data-matchnetto-input]');
  const charCount = $('[data-matchnetto-charcount]');
  const submitBtn = $('[data-matchnetto-submit]');
  const errorEl   = $('[data-matchnetto-error]');
  const widgetEl  = modal ? $('.cf-turnstile', modal) : null;
  if (!modal || !input || !submitBtn) return;

  let widgetId = null;

  const getSessionId = () => {
    const now = Date.now();
    const expiry = parseInt(localStorage.getItem(EXPIRY_KEY) || '0', 10);
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id || !expiry || now > expiry) {
      id = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : 'sess-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(STORAGE_KEY, id);
      localStorage.setItem(EXPIRY_KEY, String(now + SESSION_TTL));
    }
    return id;
  };

  const showStep = (step) => {
    $$('[data-matchnetto-step]', modal).forEach((el) => {
      el.classList.toggle('hidden', el.dataset.matchnettoStep !== step);
    });
  };

  const showError = (msg) => {
    if (!errorEl) return;
    errorEl.textContent = msg;
    errorEl.classList.remove('hidden');
  };
  const hideError = () => errorEl && errorEl.classList.add('hidden');

  const renderTurnstile = () => {
    if (!widgetEl || !window.turnstile) return;
    if (widgetId !== null) {
      try { window.turnstile.reset(widgetId); } catch (_) {}
      return;
    }
    try {
      widgetId = window.turnstile.render(widgetEl, {
        sitekey: widgetEl.dataset.sitekey,
        theme: 'dark',
      });
    } catch (_) { /* script may still be loading */ }
  };
  const resetTurnstile = () => {
    if (window.turnstile && widgetId !== null) {
      try { window.turnstile.reset(widgetId); } catch (_) {}
    }
  };
  const getTurnstileToken = () => {
    if (!window.turnstile || widgetId === null) return '';
    try { return window.turnstile.getResponse(widgetId) || ''; } catch (_) { return ''; }
  };

  const openModal = () => {
    hideError();
    showStep('form');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    // Render after modal is visible (allow iframe sizing).
    // Retry a couple of times in case the Turnstile script hasn't loaded yet.
    window.setTimeout(renderTurnstile, 50);
    window.setTimeout(renderTurnstile, 400);
    window.setTimeout(renderTurnstile, 1200);
  };

  const closeModal = () => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (input) {
      input.value = '';
      if (charCount) charCount.textContent = '0';
    }
    resetTurnstile();
  };

  // Live character counter
  input.addEventListener('input', () => {
    if (charCount) charCount.textContent = String(input.value.length);
  });

  // Open / close / esc
  $$('[data-matchnetto-open]').forEach((btn) => btn.addEventListener('click', openModal));
  document.addEventListener('click', (event) => {
    const closeBtn = event.target.closest('[data-matchnetto-close]');
    if (closeBtn && modal.contains(closeBtn)) closeModal();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
  });

  const animateScore = (target) => {
    const scoreEl = $('[data-matchnetto-score]', modal);
    const ring    = $('[data-matchnetto-score-ring]', modal);
    const clamped = Math.max(0, Math.min(100, Number(target) || 0));

    if (ring) {
      ring.style.strokeDashoffset = String(CIRC);
      window.requestAnimationFrame(() => {
        ring.style.strokeDashoffset = String(CIRC * (1 - clamped / 100));
      });
    }
    if (!scoreEl) return;

    let current = 0;
    const step = Math.max(1, Math.ceil(clamped / 30));
    const iv = window.setInterval(() => {
      current = Math.min(clamped, current + step);
      scoreEl.textContent = String(current);
      if (current >= clamped) window.clearInterval(iv);
    }, 30);
  };

  const joinList = (items) => {
    if (!Array.isArray(items)) return '';
    const clean = items.map((s) => String(s || '').trim()).filter(Boolean);
    if (!clean.length) return '';
    if (clean.length === 1) return clean[0] + '.';
    if (clean.length === 2) return clean.join(' e ') + '.';
    return clean.slice(0, -1).join('; ') + ' e ' + clean[clean.length - 1] + '.';
  };

  const synthesizeSummary = (a) => {
    const parts = [];
    const recoText = {
      'aplicar': 'O perfil tem fit significativo com a vaga e a aplicação é recomendada.',
      'aplicar com ressalvas': 'O perfil apresenta fit parcial com a vaga; a aplicação pode fazer sentido com ressalvas.',
      'nao recomendado': 'O perfil não apresenta fit suficiente com a vaga nesta análise.',
    };
    if (recoText[a.recommendation]) parts.push(recoText[a.recommendation]);

    const strengths = joinList(a.strengths);
    if (strengths) parts.push('Entre os pontos fortes identificados: ' + strengths.replace(/\.$/, '') + '.');

    const gaps = joinList(a.gaps);
    if (gaps) parts.push('Como gaps principais, destacam-se: ' + gaps.replace(/\.$/, '') + '.');

    const gh = a.github_evidence || {};
    const confirms = joinList(gh.confirms);
    if (confirms) parts.push('No GitHub, há evidências que confirmam o currículo: ' + confirms.replace(/\.$/, '') + '.');
    const contradictions = joinList(gh.contradictions);
    if (contradictions) parts.push('Pontos de ausência ou contradição no GitHub: ' + contradictions.replace(/\.$/, '') + '.');
    const notable = joinList(gh.notable_projects);
    if (notable) parts.push('Projetos notáveis no repositório público: ' + notable.replace(/\.$/, '') + '.');

    const tips = joinList(a.tips);
    if (tips) parts.push('Recomendações de ajuste: ' + tips.replace(/\.$/, '') + '.');

    if (!parts.length) parts.push('Análise concluída, porém sem dados suficientes para um resumo detalhado.');
    return parts;
  };

  const renderResult = (data) => {
    const a = data.analysis || {};
    animateScore(a.score);

    const recoMap = {
      'aplicar': 'Recomendado aplicar',
      'aplicar com ressalvas': 'Aplicar com ressalvas',
      'nao recomendado': 'Não recomendado',
    };
    const recoEl = $('[data-matchnetto-recommendation]', modal);
    if (recoEl) recoEl.textContent = recoMap[a.recommendation] || (a.recommendation || '—');

    const summaryEl = $('[data-matchnetto-summary]', modal);
    if (summaryEl) {
      summaryEl.innerHTML = '';
      let paragraphs;
      if (typeof a.summary === 'string' && a.summary.trim().length >= 40) {
        paragraphs = [a.summary.trim()].concat(synthesizeSummary(a).slice(1));
      } else {
        paragraphs = synthesizeSummary(a);
      }
      paragraphs.forEach((text) => {
        const p = document.createElement('p');
        p.textContent = text;
        summaryEl.appendChild(p);
      });
    }

    const quotaEl = $('[data-matchnetto-quota]', modal);
    if (quotaEl && data.quota) {
      const used  = data.quota.used  != null ? data.quota.used  : 0;
      const limit = data.quota.limit != null ? data.quota.limit : 3;
      quotaEl.textContent = `Análise ${used} de ${limit} nesta sessão`;
    }
  };

  // Submit
  submitBtn.addEventListener('click', async () => {
    hideError();
    const job = (input.value || '').trim();
    if (job.length < 20) {
      showError('Descrição da vaga muito curta. Mínimo 20 caracteres.');
      return;
    }
    const token = getTurnstileToken();
    if (!token) {
      showError('Complete a verificação anti-bot antes de enviar.');
      return;
    }

    showStep('loading');

    try {
      const resp = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_description: job,
          turnstile_token: token,
          session_id: getSessionId(),
        }),
      });

      let data = {};
      try { data = await resp.json(); } catch (_) { data = {}; }

      if (!resp.ok || !data.success || !data.analysis) {
        showStep('form');
        resetTurnstile();
        showError(data.error || 'Falha ao analisar. Tente novamente.');
        return;
      }

      renderResult(data);
      showStep('result');
    } catch (err) {
      showStep('form');
      resetTurnstile();
      showError('Erro de conexão. Verifique sua internet e tente novamente.');
    }
  });
}

initKeywordRain();
initThemeToggle();
initScrollSpy();
initImageModal();
initReveal();
initExperienceToggle();
initProjectsToggle();
initTimelineProgress();
initAboutToggle();
initMatchNetto();
initMobileMenu();
renderStories();
renderCerts();
initRocketTimelines();
