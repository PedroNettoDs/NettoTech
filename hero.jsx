/* global React */
const { useState, useEffect, useRef } = React;

// =====================================================
// ICONS (SVG paths inline — sem dependência externa)
// =====================================================
const Icon = ({ name, size = 16, className = "" }) => {
  const paths = {
    terminal: <><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></>,
    book: <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>,
    briefcase: <><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></>,
    award: <><circle cx="12" cy="8" r="6"/><polyline points="8.21 13.89 7 22 12 19 17 22 15.79 13.88"/></>,
    graduation: <><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></>,
    mail: <><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/></>,
    linkedin: <><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></>,
    github: <><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></>,
    whatsapp: <><path d="M21 12a9 9 0 1 1-4.5-7.8L21 3l-1.2 4.5A9 9 0 0 1 21 12z"/><path d="M9 10s1 3 3 3 3-1 3-1"/></>,
    youtube: <><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></>,
    instagram: <><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></>,
    facebook: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>,
    cpu: <><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></>,
    box: <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>,
    git: <><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><line x1="6" y1="9" x2="6" y2="21"/></>,
    zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>,
    activity: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
    sparkles: <path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/>,
    arrow: <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
    external: <><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></>,
    sun: <><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></>,
    moon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>,
    network: <><circle cx="12" cy="5" r="3"/><circle cx="5" cy="19" r="3"/><circle cx="19" cy="19" r="3"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="12" x2="6" y2="17"/><line x1="12" y1="12" x2="18" y2="17"/></>,
    brain: <><path d="M12 4a3 3 0 0 0-3 3v10a3 3 0 0 0 6 0V7a3 3 0 0 0-3-3z"/><path d="M9 7a3 3 0 0 0-6 0v3a3 3 0 0 0 2 2.83V17a3 3 0 0 0 4 0"/><path d="M15 7a3 3 0 0 1 6 0v3a3 3 0 0 1-2 2.83V17a3 3 0 0 1-4 0"/></>,
    clipboard: <><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></>,
    play: <polygon points="5 3 19 12 5 21 5 3"/>,
    cloud: <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>,
    menu: <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>,
    close: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    person: <><circle cx="12" cy="7" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/></>,
    work: <><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><line x1="3" y1="13" x2="21" y2="13"/></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
    psychology: <><path d="M12 4a3 3 0 0 0-3 3v10a3 3 0 0 0 6 0V7a3 3 0 0 0-3-3z"/><path d="M9 7a3 3 0 0 0-6 0v3a3 3 0 0 0 2 2.83V17a3 3 0 0 0 4 0"/><path d="M15 7a3 3 0 0 1 6 0v3a3 3 0 0 1-2 2.83V17a3 3 0 0 1-4 0"/></>,
    auto_awesome: <path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {paths[name]}
    </svg>
  );
};

// =====================================================
// Reveal wrapper — IntersectionObserver para fade-in
// =====================================================
const Reveal = ({ children, as = "div", className = "", ...rest }) => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-visible");
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) el.classList.add("is-visible");
          else {
            const vh = window.innerHeight || 0;
            const out = entry.boundingClientRect.bottom < 0 || entry.boundingClientRect.top > vh;
            if (out) el.classList.remove("is-visible");
          }
        });
      },
      { threshold: 0.18 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  const Tag = as;
  return <Tag ref={ref} className={`reveal ${className}`} {...rest}>{children}</Tag>;
};

// =====================================================
// NAV (com scroll spy + hamburger mobile)
// =====================================================
const Nav = ({ dark, onToggleTheme }) => {
  const [active, setActive] = useState("sobre");
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [
    { id: "sobre", label: "Sobre" },
    { id: "projetos", label: "Projetos" },
    { id: "competencias", label: "Competências" },
    { id: "experiencia", label: "Experiência" },
    { id: "certificados", label: "Certificados" },
    { id: "educacao", label: "Educação" },
    { id: "trajetoria", label: "Trajetória" },
    { id: "matchnetto", label: "Compatibilidade" },
    { id: "contato", label: "Contato" }
  ];

  useEffect(() => {
    const handler = () => {
      const y = window.scrollY + 120;
      for (let i = links.length - 1; i >= 0; i--) {
        const el = document.getElementById(links[i].id);
        if (el && el.offsetTop <= y) {
          setActive(links[i].id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav className="nav">
      <div className="nav-inner">
        <a href="#sobre" className="brand" onClick={() => setMenuOpen(false)}>
          <div className="brand-mark">Π</div>
          <div className="brand-text">
            <span className="eyebrow">Pedro Netto</span>
            <span className="name">Infraestrutura · Automação</span>
          </div>
        </a>
        <div className="nav-links">
          {links.map(l => (
            <a key={l.id} href={`#${l.id}`} className={active === l.id ? "active" : ""}>
              {l.label}
            </a>
          ))}
        </div>
        <button className="theme-toggle" onClick={onToggleTheme} aria-label="Alternar tema">
          <Icon name={dark ? "sun" : "moon"} size={16} />
        </button>
        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
        >
          <Icon name={menuOpen ? "close" : "menu"} size={18} />
        </button>
      </div>
      {menuOpen && (
        <div className="mobile-menu" style={{ display: "flex" }}>
          {links.map(l => (
            <a key={l.id} href={`#${l.id}`} onClick={() => setMenuOpen(false)}>{l.label}</a>
          ))}
        </div>
      )}
    </nav>
  );
};

// =====================================================
// HERO — busto (com fallback 3D → 2D) + tabs com donut countdown
// =====================================================
const Hero = ({ showRings = true }) => {
  const bustRef = useRef(null);
  const donutRef = useRef(null);

  // Tabs com auto-rotate 30s + donut countdown
  const [tab, setTab] = useState("sobre");
  const DURATION = 30000;
  const CIRC = 113.1; // 2 * PI * 18
  const startTsRef = useRef(null);
  const tabRef = useRef("sobre");
  useEffect(() => { tabRef.current = tab; startTsRef.current = null; }, [tab]);

  useEffect(() => {
    let raf;
    const tick = (ts) => {
      if (startTsRef.current === null) startTsRef.current = ts;
      const progress = Math.min(1, (ts - startTsRef.current) / DURATION);
      if (donutRef.current) donutRef.current.style.strokeDashoffset = String(progress * CIRC);
      if (progress >= 1) {
        setTab(tabRef.current === "sobre" ? "resumo" : "sobre");
        startTsRef.current = null;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Parallax 3D no mouse (só quando usando a imagem 2D)
  useEffect(() => {
    const handler = (e) => {
      const el = bustRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      el.style.transform = `perspective(1000px) rotateY(${dx * 4}deg) rotateX(${-dy * 4}deg) translateZ(0)`;
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  // Detecta se deve tentar carregar o GLB
  const [use3D, setUse3D] = useState(false);
  useEffect(() => {
    // Tenta 3D só se o <model-viewer> está definido (web component carregado)
    // e o arquivo GLB existe. Usa um HEAD request leve.
    if (!window.customElements || !window.customElements.get) return;
    const check = () => {
      if (!customElements.get("model-viewer")) {
        window.setTimeout(check, 300);
        return;
      }
      fetch("assets/marble-bust.glb", { method: "HEAD" })
        .then((r) => { if (r.ok) setUse3D(true); })
        .catch(() => {});
    };
    check();
  }, []);

  return (
    <section id="sobre" className="hero">
      <div className="container">
        <div className="hero-grid">
          <div>
            <h1 className="hero-name">Pedro <em>Netto</em></h1>
            <div className="hero-role">
              <span>Analista de Infraestrutura</span>
              <span>Linux</span>
              <span>Cloud</span>
              <span>Python</span>
            </div>

            <div className="hero-tabs-wrap">
              <div className="hero-donut" aria-hidden="true">
                <svg viewBox="0 0 44 44">
                  <circle className="track" cx="22" cy="22" r="18" fill="none" strokeWidth="3"/>
                  <circle
                    ref={donutRef}
                    className="fill"
                    cx="22" cy="22" r="18" fill="none" strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={CIRC}
                    strokeDashoffset="0"
                  />
                </svg>
                <span className="donut-icon">
                  <Icon name={tab === "sobre" ? "person" : "work"} size={13} />
                </span>
              </div>
              <div className="hero-tabs">
                <button className={`hero-tab ${tab === "sobre" ? "active" : ""}`} onClick={() => setTab("sobre")}>Sobre mim</button>
                <button className={`hero-tab ${tab === "resumo" ? "active" : ""}`} onClick={() => setTab("resumo")}>Resumo profissional</button>
              </div>
            </div>

            {tab === "sobre" ? (
              <div key="sobre" className="hero-panel-enter">
                <p className="hero-bio">
                  Desde cedo a tecnologia é uma parte da minha vida. Meu pai dizia que o computador seria
                  meu futuro, e essa é minha missão. Sou usuário de <strong>Linux</strong> (Kubuntu) e sim,
                  vou reclamar do Windows em toda oportunidade.
                </p>
                <p className="hero-bio">
                  Tenho direcionado minha mira para <strong>CI/CD</strong>, <span className="orange-word">LLMs</span> e
                  <strong> Agents</strong>, <strong>Automações com Python</strong>, <strong>Cloud</strong> e
                  <strong> Gestão de projetos</strong>. Para mim, tecnologia não é profissão — é propósito.
                </p>
                <p className="hero-quote">Now is better than never — Zen of Python.</p>
              </div>
            ) : (
              <div key="resumo" className="hero-panel-enter">
                <p className="hero-bio">
                  Analista de Infraestrutura com <strong>+3 anos de experiência</strong> em ambientes Linux,
                  Active Directory, Microsoft 365 e monitoramento <span className="orange-word">(Grafana, Elastic, FortiGate)</span>.
                </p>
                <p className="hero-bio">
                  Experiência prática em automação com <strong>Python, Bash e PowerShell</strong>, conteinerização com
                  <span className="orange-word"> Docker</span> e pipelines CI/CD no <strong>GitHub Actions</strong>.
                </p>
                <p className="hero-bio">
                  Certificado <strong>AWS Cloud Practitioner</strong> e <strong>CCNAv7</strong>, cursando Tecnologia em Redes na FATEC Bauru.
                  Foco em infraestrutura como código, observabilidade, ITIL e <span className="orange-word">cultura DevOps</span>.
                </p>
              </div>
            )}

            <div className="hero-actions">
              <a href="https://wiki.nettotech.com.br/" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                <Icon name="book" size={15} />
                Wiki
              </a>
              <a href="https://nettotech.com.br/cv-pedro-netto.pdf" download="cv-pedro-netto.pdf" target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                <Icon name="download" size={15} />
                Currículo
              </a>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => window.__openMatchNetto && window.__openMatchNetto()}
              >
                <Icon name="auto_awesome" size={15} />
                Avaliar perfil
              </button>
            </div>

          </div>

          <div className="bust-wrap">
            {showRings && <div className="energy-ring outer"></div>}
            {showRings && <div className="energy-ring"></div>}
            <div className="bust-plinth">
              {use3D ? (
                <model-viewer
                  class="bust-3d"
                  src="assets/marble-bust.glb"
                  alt="Busto de mármore 3D"
                  camera-controls
                  auto-rotate
                  auto-rotate-delay="3000"
                  rotation-per-second="20deg"
                  interaction-prompt="none"
                  environment-image="neutral"
                  exposure="1.1"
                  shadow-intensity="1"
                  disable-zoom
                ></model-viewer>
              ) : (
                <img
                  ref={bustRef}
                  className="bust-img"
                  src="assets/marble-bust.png"
                  alt="Pedro Netto — busto de mármore"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

Object.assign(window, { Nav, Hero, Icon, Reveal });
