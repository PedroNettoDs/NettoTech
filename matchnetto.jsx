/* global React, Icon */
const { useState, useEffect, useRef } = React;

// =====================================================
// MATCHNETTO — modal de compatibilidade (Claude + Turnstile + Worker)
// Expõe window.__openMatchNetto() para o CTA na seção de Compatibilidade
// =====================================================
const MATCHNETTO_CONFIG = {
  WORKER_URL: "https://matchnetto-proxy.mrpedronetinhu.workers.dev/check",
  TURNSTILE_SITEKEY: "0x4AAAAAADCQnXKSCnuy4TEX",
  STORAGE_KEY: "matchnetto_session_id",
  EXPIRY_KEY: "matchnetto_session_expiry",
  SESSION_TTL: 24 * 60 * 60 * 1000, // 24h
  CIRC: 213.6, // 2 * PI * 34 (score ring)
};

const getSessionId = () => {
  const now = Date.now();
  const expiry = parseInt(localStorage.getItem(MATCHNETTO_CONFIG.EXPIRY_KEY) || "0", 10);
  let id = localStorage.getItem(MATCHNETTO_CONFIG.STORAGE_KEY);
  if (!id || !expiry || now > expiry) {
    id = (typeof crypto !== "undefined" && crypto.randomUUID)
      ? crypto.randomUUID()
      : "sess-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(MATCHNETTO_CONFIG.STORAGE_KEY, id);
    localStorage.setItem(MATCHNETTO_CONFIG.EXPIRY_KEY, String(now + MATCHNETTO_CONFIG.SESSION_TTL));
  }
  return id;
};

const joinList = (items) => {
  if (!Array.isArray(items)) return "";
  const clean = items.map((s) => String(s || "").trim()).filter(Boolean);
  if (!clean.length) return "";
  if (clean.length === 1) return clean[0] + ".";
  if (clean.length === 2) return clean.join(" e ") + ".";
  return clean.slice(0, -1).join("; ") + " e " + clean[clean.length - 1] + ".";
};

const synthesizeSummary = (a) => {
  const parts = [];
  const recoText = {
    "aplicar": "O perfil tem fit significativo com a vaga e a aplicação é recomendada.",
    "aplicar com ressalvas": "O perfil apresenta fit parcial com a vaga; a aplicação pode fazer sentido com ressalvas.",
    "nao recomendado": "O perfil não apresenta fit suficiente com a vaga nesta análise.",
  };
  if (recoText[a.recommendation]) parts.push(recoText[a.recommendation]);

  const strengths = joinList(a.strengths);
  if (strengths) parts.push("Entre os pontos fortes identificados: " + strengths.replace(/\.$/, "") + ".");

  const gaps = joinList(a.gaps);
  if (gaps) parts.push("Como gaps principais, destacam-se: " + gaps.replace(/\.$/, "") + ".");

  const gh = a.github_evidence || {};
  const confirms = joinList(gh.confirms);
  if (confirms) parts.push("No GitHub, há evidências que confirmam o currículo: " + confirms.replace(/\.$/, "") + ".");
  const contradictions = joinList(gh.contradictions);
  if (contradictions) parts.push("Pontos de ausência ou contradição no GitHub: " + contradictions.replace(/\.$/, "") + ".");
  const notable = joinList(gh.notable_projects);
  if (notable) parts.push("Projetos notáveis no repositório público: " + notable.replace(/\.$/, "") + ".");

  const tips = joinList(a.tips);
  if (tips) parts.push("Recomendações de ajuste: " + tips.replace(/\.$/, "") + ".");

  if (!parts.length) parts.push("Análise concluída, porém sem dados suficientes para um resumo detalhado.");
  return parts;
};

const RECO_MAP = {
  "aplicar": "Recomendado aplicar",
  "aplicar com ressalvas": "Aplicar com ressalvas",
  "nao recomendado": "Não recomendado",
};

const MatchNetto = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState("form"); // form | loading | result
  const [jobText, setJobText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const widgetRef = useRef(null);
  const widgetIdRef = useRef(null);
  const scoreRingRef = useRef(null);
  const scoreValueRef = useRef(null);

  // Expor abertura globalmente
  useEffect(() => {
    window.__openMatchNetto = () => {
      setError("");
      setResult(null);
      setStep("form");
      setOpen(true);
      document.body.style.overflow = "hidden";
    };
    return () => { delete window.__openMatchNetto; };
  }, []);

  const close = () => {
    setOpen(false);
    setJobText("");
    setError("");
    document.body.style.overflow = "";
    // Reset Turnstile (se ativo)
    if (window.turnstile && widgetIdRef.current !== null) {
      try { window.turnstile.reset(widgetIdRef.current); } catch (_) {}
    }
  };

  // Esc para fechar
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Renderiza Turnstile quando o modal abre E quando está no step=form
  useEffect(() => {
    if (!open || step !== "form") return;

    const tryRender = () => {
      if (!widgetRef.current || !window.turnstile) return false;
      if (widgetIdRef.current !== null) {
        try { window.turnstile.reset(widgetIdRef.current); } catch (_) {}
        return true;
      }
      try {
        widgetIdRef.current = window.turnstile.render(widgetRef.current, {
          sitekey: MATCHNETTO_CONFIG.TURNSTILE_SITEKEY,
          theme: document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light",
        });
        return true;
      } catch (_) {
        return false;
      }
    };

    if (tryRender()) return;
    // Retry até o script do Turnstile carregar
    const t1 = window.setTimeout(tryRender, 200);
    const t2 = window.setTimeout(tryRender, 800);
    const t3 = window.setTimeout(tryRender, 2000);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [open, step]);

  const getTurnstileToken = () => {
    if (!window.turnstile || widgetIdRef.current === null) return "";
    try { return window.turnstile.getResponse(widgetIdRef.current) || ""; } catch (_) { return ""; }
  };

  const resetTurnstile = () => {
    if (window.turnstile && widgetIdRef.current !== null) {
      try { window.turnstile.reset(widgetIdRef.current); } catch (_) {}
    }
  };

  // Animações do score (ring + número)
  const animateScore = (value) => {
    const clamped = Math.max(0, Math.min(100, Number(value) || 0));
    const ring = scoreRingRef.current;
    if (ring) {
      ring.style.strokeDashoffset = String(MATCHNETTO_CONFIG.CIRC);
      window.requestAnimationFrame(() => {
        ring.style.strokeDashoffset = String(MATCHNETTO_CONFIG.CIRC * (1 - clamped / 100));
      });
    }
    const valueEl = scoreValueRef.current;
    if (!valueEl) return;
    let current = 0;
    const stepSize = Math.max(1, Math.ceil(clamped / 30));
    const iv = window.setInterval(() => {
      current = Math.min(clamped, current + stepSize);
      valueEl.textContent = String(current);
      if (current >= clamped) window.clearInterval(iv);
    }, 30);
  };

  // Executa o score animation depois do render do step=result
  useEffect(() => {
    if (step !== "result" || !result) return;
    const a = result.analysis || {};
    animateScore(a.score);
  }, [step, result]);

  const submit = async () => {
    setError("");
    const job = jobText.trim();
    if (job.length < 20) {
      setError("Descrição da vaga muito curta. Mínimo 20 caracteres.");
      return;
    }
    const token = getTurnstileToken();
    if (!token) {
      setError("Complete a verificação anti-bot antes de enviar.");
      return;
    }

    setStep("loading");

    try {
      const resp = await fetch(MATCHNETTO_CONFIG.WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_description: job,
          turnstile_token: token,
          session_id: getSessionId(),
        }),
      });

      let data = {};
      try { data = await resp.json(); } catch (_) { data = {}; }

      if (!resp.ok || !data.success || !data.analysis) {
        setStep("form");
        resetTurnstile();
        setError(data.error || "Falha ao analisar. Tente novamente.");
        return;
      }

      setResult(data);
      setStep("result");
    } catch (_) {
      setStep("form");
      resetTurnstile();
      setError("Erro de conexão. Verifique sua internet e tente novamente.");
    }
  };

  const analysis = result && result.analysis ? result.analysis : {};
  const quotaText = (() => {
    if (!result || !result.quota) return "";
    const used = result.quota.used != null ? result.quota.used : 0;
    const limit = result.quota.limit != null ? result.quota.limit : 3;
    return `Análise ${used} de ${limit} nesta sessão`;
  })();

  const summaryParagraphs = (() => {
    if (!analysis) return [];
    if (typeof analysis.summary === "string" && analysis.summary.trim().length >= 40) {
      return [analysis.summary.trim()].concat(synthesizeSummary(analysis).slice(1));
    }
    return synthesizeSummary(analysis);
  })();

  return (
    <div className={`mn-modal ${open ? "open" : ""}`} aria-hidden={!open}>
      <button type="button" className="mn-overlay" onClick={close} aria-label="Fechar análise"></button>

      <div className="mn-dialog">
        {step === "form" && (
          <>
            <div className="mn-header">
              <div>
                <p className="mn-eyebrow">MatchNetto</p>
                <h3 className="mn-heading">Verificar compatibilidade</h3>
              </div>
              <button type="button" className="mn-close-btn" onClick={close} aria-label="Fechar">
                <Icon name="close" size={18} />
              </button>
            </div>
            <p className="mn-help">
              Cole a descrição completa da vaga (mínimo 20 caracteres). A IA cruzará com meu currículo e repositórios públicos.
            </p>
            <label>
              <span className="mn-label">Descrição da vaga</span>
              <textarea
                className="mn-textarea"
                rows="10"
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                placeholder="Ex: Estamos buscando um(a) desenvolvedor(a) Node.js sênior para atuar em nossa plataforma SaaS. Requisitos: experiência com TypeScript, AWS, Docker, pipelines CI/CD e bancos PostgreSQL..."
              />
            </label>
            <p className="mn-counter">
              {jobText.length} caracteres (mínimo 20)
            </p>

            <div ref={widgetRef} className="cf-turnstile" style={{ marginTop: 6 }}></div>

            <p className={`mn-error ${error ? "show" : ""}`}>{error}</p>

            <div className="mn-actions">
              <button type="button" className="btn btn-primary" onClick={submit}>
                <Icon name="auto_awesome" size={15} />
                Analisar
              </button>
              <button type="button" className="btn btn-ghost" onClick={close}>
                Cancelar
              </button>
            </div>
          </>
        )}

        {step === "loading" && (
          <div className="mn-loading">
            <div className="mn-spinner">
              <div className="ring-base"></div>
              <div className="ring-spin"></div>
            </div>
            <h3>Analisando compatibilidade…</h3>
            <p>Cruzando meu CV com meus repositórios do GitHub via Claude. Costuma levar 15-30 segundos.</p>
          </div>
        )}

        {step === "result" && (
          <>
            <div className="mn-result-head">
              <div className="mn-score-ring">
                <svg viewBox="0 0 80 80">
                  <circle className="track" cx="40" cy="40" r="34" fill="none" strokeWidth="6" />
                  <circle
                    ref={scoreRingRef}
                    className="fill"
                    cx="40" cy="40" r="34" fill="none" strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={MATCHNETTO_CONFIG.CIRC}
                    strokeDashoffset={MATCHNETTO_CONFIG.CIRC}
                  />
                </svg>
                <div className="mn-score-value"><span ref={scoreValueRef}>0</span></div>
              </div>
              <div className="mn-result-meta" style={{ flex: 1, minWidth: 0 }}>
                <p className="mn-eyebrow">Score de compatibilidade</p>
                <p className="mn-reco">
                  {RECO_MAP[analysis.recommendation] || analysis.recommendation || "—"}
                </p>
              </div>
              <button type="button" className="mn-close-btn" onClick={close} aria-label="Fechar">
                <Icon name="close" size={18} />
              </button>
            </div>

            <div className="mn-analysis">
              {summaryParagraphs.map((text, i) => <p key={i}>{text}</p>)}
            </div>

            <div className="mn-footer">
              <p className="mn-quota">{quotaText}</p>
              <button type="button" className="btn btn-ghost" onClick={close}>Fechar</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

Object.assign(window, { MatchNetto });
