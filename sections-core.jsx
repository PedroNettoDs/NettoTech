/* global React, ReactDOM, Icon, Reveal */
const { useState, useEffect, useRef } = React;

// =====================================================
// PROJETOS
// Dados ricos: cada projeto tem `shortDesc` (no card) +
// campos opcionais `longDesc` / `features` / `metrics` / `media`
// preenchidos depois para alimentar o modal.
// =====================================================
const PROJECTS = [
  {
    id: "alfred-pennyworth",
    icon: "brain",
    tag: "IA / LLM",
    name: "Alfred-Pennyworth",
    shortDesc: "Assistente pessoal local com LLMs via Ollama, execução de comandos no host, pesquisa web autônoma e RAG via Knowledge Base. Integra vault Obsidian para memória persistente, eliminando dependência de APIs externas. Totalmente offline e privado.",
    chips: ["Python", "Ollama", "Docker", "RAG"],
    // TODO — descrição detalhada (2-3 parágrafos sobre arquitetura, motivação, como funciona)
    longDesc: "",
    // TODO — bullets de capacidades
    features: [],
    // TODO — métricas de impacto, ex.: { value: "100%", label: "Offline" }
    metrics: [],
    // TODO — GIFs/screenshots em img/projects/alfred-*.webm|png
    media: [],
    links: [
      { label: "Ver no GitHub", url: "https://github.com/PedroNettoDs/Alfred-Pennyworth", icon: "github", primary: true }
    ]
  },
  {
    id: "briefing-llm",
    icon: "clipboard",
    tag: "IA / LLM",
    name: "Briefing de Notícias — LLM",
    shortDesc: "Automatiza a curação diária de notícias em Markdown e áudio. Coleta de feeds RSS e SearXNG, agrupa por tema via clustering semântico, sintetiza com Ollama para gerar relatório estruturado e podcast. Economiza tempo no consumo de informações relevantes.",
    chips: ["Python", "Ollama", "Docker", "NLP"],
    longDesc: "",
    features: [],
    metrics: [],
    media: [],
    links: [
      { label: "Ver no GitHub", url: "https://github.com/PedroNettoDs/Briefing-LLM", icon: "github", primary: true }
    ]
  },
  {
    id: "nfe-consolidator",
    icon: "file",
    tag: "Automação",
    name: "NF-e Consolidator",
    shortDesc: "Processa arquivos XML de NF-e em lote e gera planilhas consolidadas com extração automatizada de dados (chave, datas, CNPJ/CPF, valores). Reduz 80% do tempo de processamento manual, suportando até 100+ XMLs por execução.",
    chips: ["Python", "XML", "Tkinter", "Automation"],
    longDesc: "",
    features: [],
    metrics: [],
    media: [],
    links: [
      { label: "Ver no GitHub", url: "https://github.com/PedroNettoDs/NF-e-Consolidator", icon: "github", primary: true }
    ]
  },
  {
    id: "submax",
    icon: "zap",
    tag: "SaaS",
    name: "SubMAX",
    shortDesc: "Plataforma SaaS multi-tenant de gerenciamento fitness com portais dedicados para personal trainer e aluno. Backend REST API com autenticação JWT isolada, integração WhatsApp, editor visual de rotinas com drag-and-drop, avaliações com 26 métricas antropométricas e execução de treino em tempo real. Hospedado em cloud com CI/CD automatizado.",
    chips: ["Django", "React", "TypeScript", "PostgreSQL", "CI/CD"],
    longDesc: "",
    features: [],
    metrics: [],
    media: [],
    links: [
      { label: "Acessar aplicação", url: "https://www.submax.com.br", icon: "external", primary: true }
    ]
  },
  {
    id: "iac-fileserver",
    icon: "network",
    tag: "Infraestrutura",
    name: "IaC de Fileserver",
    shortDesc: "Infrastructure as Code para provisionamento automatizado de fileserver institucional. Reduz tempo de setup de 2 horas para 15 minutos, garante padronização, rastreabilidade e reprodutibilidade completa do ambiente. Desenvolvido para FATEC Bauru com Bash, Samba e GPO.",
    chips: ["Bash", "Samba", "GPO", "IaC"],
    longDesc: "",
    features: [],
    metrics: [],
    media: [],
    links: [
      { label: "Ver no GitHub", url: "https://github.com/PedroNettoDs/IaC-Fileserver", icon: "github", primary: true }
    ]
  },
  {
    id: "exchange-retention",
    icon: "cloud",
    tag: "Automação",
    name: "Exchange Retention Manager",
    shortDesc: "Automatiza políticas de retenção no Exchange Online com autenticação OAuth, validação de permissões e logs estruturados. Interface intuitiva com execução em menos de 15 minutos por caixa de correio. Garante conformidade e rastreabilidade em ambientes corporativos.",
    chips: ["Python", "Exchange Online", "PowerShell", "Automation"],
    longDesc: "",
    features: [],
    metrics: [],
    media: [],
    links: [
      { label: "Ver no GitHub", url: "https://github.com/PedroNettoDs/Exchange-Retention-Manager", icon: "github", primary: true }
    ]
  },
  {
    id: "wiki",
    icon: "book",
    tag: "Documentação",
    name: "Wiki NettoTech",
    shortDesc: "Base de conhecimento pessoal com anotações, tutoriais e referências sobre Linux, redes, cloud e infraestrutura — escrita no dia a dia do aprendizado.",
    chips: ["Linux", "Redes", "Cloud", "Infraestrutura"],
    longDesc: "",
    features: [],
    metrics: [],
    media: [],
    links: [
      { label: "Acessar Wiki", url: "https://wiki.nettotech.com.br/", icon: "external", primary: true }
    ]
  }
];

// -----------------------------------------------------
// ProjectCard — clique no corpo abre modal,
// rodapé "Ver no GitHub/Acessar…" continua funcional (stopPropagation)
// -----------------------------------------------------
const ProjectCard = ({ project, onOpen }) => {
  const primary = project.links.find((l) => l.primary) || project.links[0];
  const handleKey = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen(project);
    }
  };
  return (
    <article
      className="project-card"
      role="button"
      tabIndex={0}
      onClick={() => onOpen(project)}
      onKeyDown={handleKey}
      aria-label={`Abrir detalhes de ${project.name}`}
    >
      <div className="project-head">
        <div className="project-icon"><Icon name={project.icon} size={18} /></div>
        <span className="tag">{project.tag}</span>
      </div>
      <h3 className="project-name">{project.name}</h3>
      <p className="project-desc">{project.shortDesc}</p>
      <div className="chip-row">
        {project.chips.map((c, j) => <span key={j} className="chip">{c}</span>)}
      </div>
      {primary && (
        <a
          href={primary.url}
          target="_blank"
          rel="noopener noreferrer"
          className="project-link"
          onClick={(e) => e.stopPropagation()}
          aria-label={`${primary.label} (abre em nova aba)`}
        >
          <Icon name={primary.icon} size={13} /> {primary.label} <Icon name="external" size={11} />
        </a>
      )}
    </article>
  );
};

// -----------------------------------------------------
// ProjectModal — exibição rica com placeholders elegantes
// para campos ainda não preenchidos.
// -----------------------------------------------------
const ProjectModal = ({ project, onClose }) => {
  // Bloqueia scroll do body e escucha Esc enquanto aberto
  useEffect(() => {
    if (!project) return;
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [project, onClose]);

  if (!project) return null;

  const hasLong    = !!(project.longDesc && project.longDesc.trim());
  const hasMedia   = Array.isArray(project.media)   && project.media.length > 0;
  const hasFeat    = Array.isArray(project.features)&& project.features.length > 0;
  const hasMetrics = Array.isArray(project.metrics) && project.metrics.length > 0;

  // Portal: renderiza no <body> pra escapar de qualquer ancestral com transform
  // (ex.: .reveal aplica translateY que quebraria position:fixed)

  const renderMedia = (m, i) => {
    const isVideo = /\.(webm|mp4)$/i.test(m.src);
    return (
      <figure key={i} className="pm-media-item">
        {isVideo ? (
          <video src={m.src} autoPlay loop muted playsInline />
        ) : (
          <img src={m.src} alt={m.caption || `Mídia ${i + 1}`} loading="lazy" />
        )}
        {m.caption && <figcaption>{m.caption}</figcaption>}
      </figure>
    );
  };

  const modalContent = (
    <div className="pm-modal open" aria-hidden="false" role="dialog" aria-modal="true">
      <button type="button" className="pm-overlay" onClick={onClose} aria-label="Fechar detalhes"></button>

      <div className="pm-dialog">
        <div className="pm-header">
          <div className="pm-header-left">
            <div className="project-icon"><Icon name={project.icon} size={18} /></div>
            <div>
              <span className="tag">{project.tag}</span>
              <h3 className="pm-title">{project.name}</h3>
            </div>
          </div>
          <button type="button" className="mn-close-btn" onClick={onClose} aria-label="Fechar">
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* MÉTRICAS */}
        {hasMetrics && (
          <div className="pm-metrics">
            {project.metrics.map((m, i) => (
              <div key={i} className="pm-metric">
                <span className="pm-metric-value">{m.value}</span>
                <span className="pm-metric-label">{m.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* MÍDIA — hero + galeria */}
        <div className="pm-section">
          <div className="pm-subhead">— Demonstrações</div>
          {hasMedia ? (
            <div className="pm-media-grid">
              {project.media.map(renderMedia)}
            </div>
          ) : (
            /* Convenção: mídias ficam em img/projects/{project.id}-*.webm|png|mp4 */
            <div className="pm-media-placeholder" aria-hidden="true">
              <div className="pm-placeholder-icon"><Icon name="sparkles" size={28} /></div>
              <p>Screenshots e GIFs em breve</p>
            </div>
          )}
        </div>

        {/* SOBRE */}
        <div className="pm-section">
          <div className="pm-subhead">— Sobre o projeto</div>
          {hasLong ? (
            project.longDesc.split(/\n+/).map((p, i) => <p key={i} className="pm-text">{p}</p>)
          ) : (
            <p className="pm-text">{project.shortDesc}</p>
          )}
        </div>

        {/* DESTAQUES */}
        {hasFeat && (
          <div className="pm-section">
            <div className="pm-subhead">— Destaques</div>
            <ul className="exp-bullets">
              {project.features.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </div>
        )}

        {/* STACK */}
        <div className="pm-section">
          <div className="pm-subhead">— Stack</div>
          <div className="chip-row">
            {project.chips.map((c, i) => <span key={i} className="tag">{c}</span>)}
          </div>
        </div>

        {/* LINKS / CTAs */}
        {project.links && project.links.length > 0 && (
          <div className="pm-actions">
            {project.links.map((l, i) => (
              <a
                key={i}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`btn ${l.primary ? "btn-primary" : "btn-ghost"}`}
              >
                <Icon name={l.icon || "external"} size={15} />
                {l.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

const Projects = () => {
  const [isMobile, setIsMobile]   = useState(false);
  const [expanded, setExpanded]   = useState(false);
  const [active, setActive]       = useState(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 960px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener ? mq.addEventListener("change", update) : mq.addListener(update);
    return () => {
      mq.removeEventListener ? mq.removeEventListener("change", update) : mq.removeListener(update);
    };
  }, []);

  const visible = isMobile && !expanded ? PROJECTS.slice(0, 3) : PROJECTS;

  return (
    <Reveal as="section" id="projetos" className="section">
      <div className="container">
        <div className="section-header">
          <span className="section-num">Ι.</span>
          <h2 className="section-title">Projetos</h2>
          <div className="section-rule"></div>
        </div>
        <p className="section-subtitle">
          Projetos autorais com foco em automação, infraestrutura e documentação técnica. Clique em um card para ver detalhes.
        </p>
        <div className="projects-grid">
          {visible.map((p) => (
            <ProjectCard key={p.id} project={p} onOpen={setActive} />
          ))}
        </div>
        {isMobile && PROJECTS.length > 3 && (
          <button
            className="projects-more"
            style={{ display: "inline-flex" }}
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
          >
            {expanded ? "Exibir menos ↑" : `Exibir mais (+${PROJECTS.length - 3}) ↓`}
          </button>
        )}
      </div>

      <ProjectModal project={active} onClose={() => setActive(null)} />
    </Reveal>
  );
};

// =====================================================
// COMPETÊNCIAS — 8 cards
// =====================================================
const SKILLS = [
  { icon: "terminal",  title: "Sistemas Operacionais", items: ["Linux", "Ubuntu", "Kubuntu", "Debian", "Windows Server", "Active Directory", "GPOs"] },
  { icon: "box",       title: "Containers & IaC",      items: ["Docker", "Kubernetes", "IaC"] },
  { icon: "git",       title: "DevOps & CI/CD",        items: ["GitHub Actions", "Git / GitHub", "Build / Test", "Deploy"] },
  { icon: "zap",       title: "Automação",             items: ["Python", "Bash", "PowerShell", "Monitoramento", "Backup"] },
  { icon: "activity",  title: "Observabilidade",       items: ["Grafana", "Elastic", "ARIA", "Logs & Métricas"] },
  { icon: "shield",    title: "Redes & Segurança",     items: ["TCP/IP", "CCNA", "VPN", "FortiGate", "Firewall", "Governança de Acessos"] },
  { icon: "clipboard", title: "ITSM & Processos",      items: ["ITIL v4", "Scrum", "Jira", "ServiceNow", "CHG"] },
  { icon: "brain",     title: "LLM / IA Aplicada",     items: ["Ollama", "Automações com IA", "Agentes de IA", "RAG"] }
];

const Skills = () => (
  <Reveal as="section" id="competencias" className="section">
    <div className="container">
      <div className="section-header">
        <span className="section-num">ΙΙ.</span>
        <h2 className="section-title">Competências <em>Técnicas</em></h2>
        <div className="section-rule"></div>
      </div>
      <p className="section-subtitle">
        Tecnologias, práticas e ferramentas com as quais trabalho no dia a dia.
      </p>
      <div className="skills-grid">
        {SKILLS.map((s, i) => (
          <div key={i} className="skill-col">
            <div className="skill-head">
              <Icon name={s.icon} size={18} className="skill-head-ico" />
              <h3 className="skill-title">{s.title}</h3>
            </div>
            <div className="chip-row">
              {s.items.map((it, j) => <span key={j} className="tag">{it}</span>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  </Reveal>
);

// =====================================================
// EXPERIÊNCIA — 5 jobs, timeline com fill de scroll (100% ao entrar, 0% ao sair)
// =====================================================
const EXPERIENCES = [
  {
    logoImg: "img/logo_paschoalotto.jpeg", logoInitial: "P", color: "#1f2937",
    role: "Analista de Infraestrutura II",
    company: "Paschoalotto", type: "Tempo integral",
    period: "nov de 2025 — Atual", location: "Bauru, SP · Híbrido",
    thumb: "img/ex_paschoalotto.jpeg",
    bullets: [
      "Lido em incidentes críticos via ServiceNow, coordenando comunicação entre times técnicos e diretoria em ambientes de alta disponibilidade.",
      "Conduzo Pedidos de Mudança (CHG) seguindo ITIL v4, programação de atualizações em massa via Checkpoint, plano de rollback, elevando a estabilidade do ambiente.",
      "Realizo troubleshooting avançado correlacionando logs e métricas em FortiGate, Elastic, ARIA e Grafana.",
      "Implementei automações em PowerShell e Python para provisionamento de usuários no AD e rotinas administrativas, economizando horas semanais de trabalho manual."
    ]
  },
  {
    logoImg: "img/logo_paschoalotto.jpeg", logoInitial: "P", color: "#1f2937",
    role: "Analista de Infraestrutura",
    company: "Paschoalotto", type: "Tempo integral",
    period: "abr de 2025 — nov de 2025", location: "Bauru, SP",
    bullets: [
      "Gerenciei incidentes e requisições N1/N2 via ServiceNow, mantendo aderência ao SLA e satisfação do usuário final.",
      "Administrei Active Directory (usuários, grupos, GPOs, OUs) e Microsoft 365 (licenças, Exchange, Centro de Administração).",
      "Apoiei a gestão de políticas de FortiGate e o monitoramento de infraestrutura em Grafana, Elastic e ARIA.",
      "Capacitei usuários internos em ferramentas e processos, reduzindo recorrência de chamados."
    ]
  },
  {
    logoImg: "img/logo_attanotech.jpeg", logoInitial: "A", color: "#d97048",
    role: "Fundador & Gestor de Projetos",
    company: "AttanoTech", type: "Projeto pessoal",
    period: "mar de 2025 — Atual",
    thumb: "img/ex_attanotech.jpeg",
    bullets: [
      "Construí pipelines de CI/CD no GitHub Actions automatizando build, testes e deploy de aplicações em ambientes Docker.",
      "Desenvolvi automações em Python para monitoramento, geração de relatórios e rotinas de backup.",
      "Apliquei práticas ITIL e metodologia Scrum na gestão dos projetos, com versionamento e code review via Git/GitHub."
    ]
  },
  {
    extra: true,
    logoImg: "img/logo_linx.jpeg", logoInitial: "L", color: "#1f2937",
    role: "Analista de Suporte Júnior",
    company: "Linx Sistemas", type: "Tempo integral",
    period: "set de 2023 — abr de 2025", location: "Bauru, SP",
    thumb: "img/ex_linx.jpeg",
    bullets: [
      "Prestei suporte técnico especializado a sistemas ERP/PDV (Degust, Taste, Menew, Payhub) via Salesforce, com foco em SLA e atendimento omnichannel.",
      "Realizei diagnósticos e manutenções diretas em bancos Firebase e MongoDB, incluindo coleta e análise de logs.",
      "Configurei ambientes cliente/servidor e acesso remoto via LogMeIn Rescue e TeamViewer Tensor."
    ]
  },
  {
    extra: true,
    logoImg: "img/logo_ks2.jpeg", logoInitial: "K2", color: "#1f2937",
    role: "Analista de TI",
    company: "KS2 Soluções Empresariais", type: "Tempo integral",
    period: "jan de 2023 — set de 2023", location: "Bauru, SP",
    thumb: "img/ex_ks2.jpeg",
    bullets: [
      "Administrei usuários, grupos e permissões em Windows Server / Active Directory, além de gestão de ativos de TI.",
      "Atuei em suporte N1/N2 via GLPI, incluindo manutenção preventiva e corretiva de estações e rede.",
      "Gerenciei contas Microsoft 365 e backups PST via Veeam, garantindo continuidade operacional.",
      "Monitorei ativos e disponibilidade com Grafana, identificando prontamente falhas de hardware e software."
    ]
  }
];

const useTimelineProgress = (ref, fillRef) => {
  useEffect(() => {
    const update = () => {
      const el = ref.current;
      const fill = fillRef.current;
      if (!el || !fill) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height + vh;
      const progress = Math.min(1, Math.max(0, rect.bottom / total));
      fill.style.height = `${progress * 100}%`;
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [ref, fillRef]);
};

const openImageModal = (src, title) => {
  if (window.__openImageModal) window.__openImageModal(src, title);
};

const Experience = () => {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? EXPERIENCES : EXPERIENCES.filter((e) => !e.extra);
  const extras = EXPERIENCES.filter((e) => e.extra).length;

  const timelineRef = useRef(null);
  const fillRef = useRef(null);
  useTimelineProgress(timelineRef, fillRef);

  return (
    <Reveal as="section" id="experiencia" className="section">
      <div className="container">
        <div className="section-header">
          <span className="section-num">ΙΙΙ.</span>
          <h2 className="section-title">Experiência <em>Profissional</em></h2>
          <div className="section-rule"></div>
        </div>
        <div className="timeline" ref={timelineRef}>
          <div className="timeline-fill" ref={fillRef}></div>
          {visible.map((e, i) => (
            <div key={i} className="exp-card">
              <div className="exp-head">
                <div className="exp-logo" style={{ background: e.color }}>
                  {e.logoImg ? (
                    <img src={e.logoImg} alt={`Logo ${e.company}`} loading="lazy" />
                  ) : (
                    e.logoInitial
                  )}
                </div>
                <div>
                  <h3 className="exp-role">{e.role}</h3>
                  <p className="exp-company">
                    {e.company} <span style={{ color: "var(--ink-3)" }}>· {e.type}</span>
                  </p>
                  <div className="exp-meta">{e.period}{e.location ? ` · ${e.location}` : ""}</div>
                </div>
              </div>
              <ul className="exp-bullets">
                {e.bullets.map((b, j) => <li key={j}>{b}</li>)}
              </ul>
              {e.thumb && (
                <button
                  type="button"
                  className="exp-thumb"
                  onClick={() => openImageModal(e.thumb, `${e.role} — ${e.company}`)}
                  aria-label="Ampliar imagem da experiência"
                >
                  <img src={e.thumb} alt="Evidência de experiência" loading="lazy" />
                </button>
              )}
            </div>
          ))}
        </div>
        {extras > 0 && (
          <button className="exp-toggle" onClick={() => setExpanded(!expanded)}>
            {expanded ? "Ver menos ↑" : `Ver mais (+${extras}) ↓`}
          </button>
        )}
      </div>
    </Reveal>
  );
};

Object.assign(window, { Projects, Skills, Experience, ProjectCard, ProjectModal });
