/* global React, Icon, Reveal */
const { useState, useEffect, useRef } = React;

// =====================================================
// CERTIFICADOS — 6 cards com badge Credly
// =====================================================
const CERTS = [
  {
    kind: "Certificado", title: "CCNA: Introduction to Networks",
    issuer: "Cisco", date: "2023-12-18",
    imageUrl: "https://images.credly.com/size/340x340/images/70d71df5-f3dc-4380-9b9d-f22513a70417/CCNAITN__1_.png",
    verifyUrl: "https://www.credly.com/badges/3dee7804-554c-4868-ba70-3f0d0a5bfea8",
  },
  {
    kind: "Certificado", title: "CCNA: Switching, Routing, and Wireless Essentials",
    issuer: "Cisco", date: "2023-12-18",
    imageUrl: "https://images.credly.com/size/340x340/images/f4ccdba9-dd65-4349-baad-8f05df116443/CCNASRWE__1_.png",
    verifyUrl: "https://www.credly.com/badges/a6d10622-e238-4ddc-a47a-ecc6c7c61935",
  },
  {
    kind: "Certificado", title: "CCNA: Enterprise Networking, Security, and Automation",
    issuer: "Cisco", date: "2023-12-22",
    imageUrl: "https://images.credly.com/size/340x340/images/0a6d331e-8abf-4272-a949-33f754569a76/CCNAENSA__1_.png",
    verifyUrl: "https://www.credly.com/badges/883eb270-a7eb-44cb-a0f3-19a1f8cfe019",
  },
  {
    kind: "Training Badge", title: "AWS Knowledge: Cloud Essentials",
    issuer: "Amazon Web Services Training and Certification", date: "2024-10-15",
    imageUrl: "https://images.credly.com/size/340x340/images/7cf036b0-c609-4378-a7be-9969e1dea7ab/blob",
    verifyUrl: "https://www.credly.com/badges/eaa33ec3-74e7-4784-9e60-d1fd389f5b7f",
  },
  {
    kind: "Certificado", title: "Computer Network",
    issuer: "Huawei", date: "2024-10-14",
    imageUrl: "https://images.credly.com/size/340x340/images/f0486748-58d5-468d-ab92-b7e85bed0517/image.png",
    verifyUrl: "https://www.credly.com/badges/ac3bff27-909e-4aa5-8c35-cb0b2fa37a23",
  },
  {
    kind: "Certificado", title: "IT Essentials",
    issuer: "Cisco", date: "2024-12-04",
    imageUrl: "https://images.credly.com/size/340x340/images/04e8034c-81f5-4f7f-ab23-e8b428c31ce9/ITE.png",
    verifyUrl: "https://www.credly.com/badges/866df61a-2ab3-471e-80d3-f864148e6eab",
  },
];

const formatDate = (iso) => {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
};

const Certs = () => (
  <Reveal as="section" id="certificados" className="section">
    <div className="container">
      <div className="section-header">
        <span className="section-num">ΙV.</span>
        <h2 className="section-title">Certificados</h2>
        <div className="section-rule"></div>
      </div>
      <p className="section-subtitle">
        Formação contínua validada por certificações reconhecidas no mercado.
      </p>
      <div className="cert-carousel">
        {CERTS.map((c, i) => (
          <div key={i} className="cert-card">
            <div className="cert-seal">
              {c.imageUrl ? <img src={c.imageUrl} alt={`Badge ${c.title}`} loading="lazy" /> : <Icon name="award" size={22} />}
            </div>
            <div className="cert-tag"><span className="tag">{c.kind}</span></div>
            <h3 className="cert-title">{c.title}</h3>
            <p className="cert-issuer">{c.issuer}</p>
            <span className="cert-date">Emitido em {formatDate(c.date)}</span>
            {c.verifyUrl && (
              <>
                <br />
                <a href={c.verifyUrl} target="_blank" rel="noopener noreferrer" className="cert-verify">
                  <Icon name="external" size={11} /> Verificar certificado
                </a>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  </Reveal>
);

// =====================================================
// EDUCAÇÃO — formal + plataformas + cursos complementares
// =====================================================
const Education = () => (
  <Reveal as="section" id="educacao" className="section">
    <div className="container">
      <div className="section-header">
        <span className="section-num">V.</span>
        <h2 className="section-title">Educação</h2>
        <div className="section-rule"></div>
      </div>
      <p className="section-subtitle">
        Formação acadêmica, perfis em plataformas de ensino e cursos complementares com foco em redes, cloud e infraestrutura.
      </p>

      <div className="edu-block">
        <div className="edu-subhead">— Educação formal</div>
        <div className="edu-card">
          <div className="exp-head">
            <div className="exp-logo" style={{ background: "var(--orange)" }}>
              <Icon name="graduation" size={20} />
            </div>
            <div>
              <h3 className="exp-role">Faculdade de Tecnologia de Bauru</h3>
              <p className="exp-company">
                Tecnólogo em Redes de Computadores <span style={{ color: "var(--ink-3)" }}>· 2024 — o momento</span>
              </p>
            </div>
          </div>
          <p style={{ fontSize: 14, color: "var(--ink-2)", margin: "12px 0 0 0", lineHeight: 1.6 }}>
            Formação ampla em infraestrutura e tecnologia, com fundamentos de redes, sistemas operacionais e organização de computadores.
            Inclui projetos práticos com servidores, Active Directory, programação e automação, além de noções de Administração e Inglês técnico
            para preparação profissional.
          </p>
        </div>
      </div>

      <div className="edu-block">
        <div className="edu-subhead">— Cursos complementares</div>
        <div className="timeline">
          <div className="exp-card">
            <div className="exp-head">
              <div className="exp-logo" style={{ background: "var(--ink-1)" }}>
                <Icon name="network" size={18} />
              </div>
              <div>
                <h3 className="exp-role">Trilha CCNA (Cisco)</h3>
                <p className="exp-company" style={{ color: "var(--ink-3)" }}>Dez de 2023</p>
              </div>
            </div>
            <ul className="exp-bullets">
              <li><strong>Introduction to Networks</strong> <span className="mono">Cisco · 18/12/2023</span></li>
              <li><strong>Switching, Routing, and Wireless Essentials</strong> <span className="mono">Cisco · 18/12/2023</span></li>
              <li><strong>Enterprise Networking, Security, and Automation</strong> <span className="mono">Cisco · 22/12/2023</span></li>
            </ul>
          </div>
          <div className="exp-card">
            <div className="exp-head">
              <div className="exp-logo" style={{ background: "var(--orange)" }}>
                <Icon name="cloud" size={18} />
              </div>
              <div>
                <h3 className="exp-role">AWS Knowledge: Cloud Essentials</h3>
                <p className="exp-company">
                  Amazon Web Services <span style={{ color: "var(--ink-3)" }}>· 15/10/2024</span>
                </p>
              </div>
            </div>
            <p style={{ fontSize: 13.5, color: "var(--ink-2)", margin: "8px 0 0 0", lineHeight: 1.55 }}>
              Conquistei esta badge após desenvolver conhecimentos fundamentais sobre os principais conceitos de Cloud Computing na AWS.
              Durante o treinamento, aprofundei minha compreensão dos serviços essenciais de Computação, Armazenamento, Redes e Bancos de Dados.
              Também adquiri entendimento sobre segurança na nuvem, princípios de arquitetura AWS, modelos de precificação e planos de suporte,
              fortalecendo minha base técnica para atuar em ambientes cloud.
            </p>
          </div>
        </div>
      </div>
    </div>
  </Reveal>
);

// =====================================================
// TRAJETÓRIA — carousel de 15 stories (img/storys1.png … storys15.png)
// =====================================================
const Trajetoria = () => {
  const stories = Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    src: `img/storys${i + 1}.png`,
    title: `Trajetória ${String(i + 1).padStart(2, "0")}`,
  }));

  return (
    <Reveal as="section" id="trajetoria" className="section">
      <div className="container">
        <div className="section-header">
          <span className="section-num">VΙ.</span>
          <h2 className="section-title">Trajetória</h2>
          <div className="section-rule"></div>
        </div>
        <p className="section-subtitle">
          Marcos, bastidores e momentos que construíram o profissional de hoje. Clique para ampliar.
        </p>
        <div className="stories-rail">
          {stories.map((s) => (
            <button
              key={s.id}
              type="button"
              className="story-card"
              onClick={() => window.__openImageModal && window.__openImageModal(s.src, s.title)}
              aria-label={`Abrir ${s.title}`}
            >
              <img src={s.src} alt={s.title} loading="lazy" />
            </button>
          ))}
        </div>
      </div>
    </Reveal>
  );
};

// =====================================================
// MATCHNETTO CTA — cartão de abertura do modal (o modal vive em matchnetto.jsx)
// =====================================================
const MatchNettoCTA = () => (
  <Reveal as="section" id="matchnetto" className="section">
    <div className="container">
      <div className="section-header">
        <span className="section-num">VΙΙ.</span>
        <h2 className="section-title">Verificar <em>compatibilidade</em></h2>
        <div className="section-rule"></div>
      </div>
      <p className="section-subtitle">
        É recrutador(a) e quer saber se faço fit com a vaga? Cole a descrição abaixo e uma IA faz a análise
        cruzando meu currículo com minhas evidências reais no GitHub — score, pontos fortes, gaps e recomendação.
      </p>

      <div className="matchnetto-card">
        <div className="matchnetto-head">
          <div className="matchnetto-ico"><Icon name="psychology" size={22} /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 className="matchnetto-title">Análise automática com IA</h3>
            <p className="matchnetto-sub">Powered by Claude + N8N · Verificação anti-bot via Turnstile · Limite de 3 análises por sessão</p>
          </div>
        </div>
        <button
          type="button"
          className="btn btn-primary matchnetto-btn"
          onClick={() => window.__openMatchNetto && window.__openMatchNetto()}
        >
          <Icon name="auto_awesome" size={15} />
          Analisar compatibilidade com uma vaga
        </button>
      </div>
    </div>
  </Reveal>
);

// =====================================================
// CONTATO — 5 canais
// =====================================================
const CONTACTS = [
  { icon: "whatsapp",  label: "WhatsApp",  desc: "Mensagem direta",           href: "https://wa.me/5514996807057?text=Ol%C3%A1%20Pedro%2C%20vi%20seu%20site%20e%20gostaria%20de%20conversar." },
  { icon: "linkedin",  label: "LinkedIn",  desc: "Conexões & carreira",       href: "https://www.linkedin.com/in/pedronettods" },
  { icon: "facebook",  label: "Facebook",  desc: "Página / perfil",           href: "https://facebook.com/PedroNettoDs" },
  { icon: "youtube",   label: "YouTube",   desc: "Conteúdos & labs",          href: "https://youtube.com/@MrNetto" },
  { icon: "instagram", label: "Instagram", desc: "Bastidores & atualizações", href: "https://instagram.com/pedro.nettotech/" }
];

const Contact = () => (
  <Reveal as="section" id="contato" className="section">
    <div className="container">
      <div className="section-header">
        <span className="section-num">VΙΙΙ.</span>
        <h2 className="section-title">Contato</h2>
        <div className="section-rule"></div>
      </div>
      <div className="contact-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, flexWrap: "wrap", gap: 16 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.18em", color: "var(--ink-3)", textTransform: "uppercase" }}>
            Links rápidos
          </div>
          <span className="tag">Contato</span>
        </div>
        <h3 className="contact-lead">Escolha o <em>melhor canal</em></h3>
        <p className="contact-text">
          Quer saber como posso ser mais do que um funcionário e virar um <strong>investimento</strong> para a sua empresa? Então é só marcar uma conversa.
        </p>
        <p className="contact-text">
          Mas só vale a pena se a sua empresa realmente <span className="orange-word">exalar tecnologia</span> — porque é isso que eu respiro.
        </p>
        <div className="contact-grid">
          {CONTACTS.map((c, i) => (
            <a key={i} href={c.href} target="_blank" rel="noopener noreferrer" className="contact-item">
              <div className="contact-ico"><Icon name={c.icon} size={18} /></div>
              <div className="contact-info">
                <span className="label">{c.label}</span>
                <span className="desc">{c.desc}</span>
              </div>
              <div className="contact-arrow"><Icon name="external" size={14} /></div>
            </a>
          ))}
        </div>
      </div>
    </div>
  </Reveal>
);

// =====================================================
// IMAGE MODAL global — abre via window.__openImageModal(src, title)
// =====================================================
const ImageModal = () => {
  const [state, setState] = useState({ open: false, src: "", title: "" });

  useEffect(() => {
    window.__openImageModal = (src, title) => setState({ open: true, src, title: title || "" });
    const onKey = (e) => { if (e.key === "Escape") setState((s) => ({ ...s, open: false })); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      delete window.__openImageModal;
    };
  }, []);

  const close = () => setState((s) => ({ ...s, open: false }));

  return (
    <div className={`img-modal ${state.open ? "open" : ""}`} aria-hidden={!state.open}>
      <button type="button" className="img-modal-overlay" onClick={close} aria-label="Fechar imagem"></button>
      <div className="img-modal-dialog">
        <button type="button" className="img-modal-close" onClick={close} aria-label="Fechar">
          <Icon name="close" size={18} />
        </button>
        {state.src && <img src={state.src} alt={state.title || "Imagem ampliada"} />}
      </div>
    </div>
  );
};

Object.assign(window, { Certs, Education, Trajetoria, MatchNettoCTA, Contact, ImageModal });
