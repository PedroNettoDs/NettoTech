# Migração do NettoTech para o estilo Greek (React + busto 3D)

## Context

Hoje o site `nettotech.com.br` está em vanilla HTML + Tailwind CDN + JS puro, com tema escuro/azul‑laranja dominante. No diretório `/mnt/hd/Dev/NettoTech/Greek/` existe um template pronto em **React (via Babel standalone, sem build step)** com uma identidade visual completamente diferente: **mármore grego + laranja quente + serifa Cormorant Garamond + mêandro grego + energy rings + timeline clássica**. Esse template já foi desenhado com a estrutura de seções do Pedro, mas contém apenas **texto genérico de scaffold** — nenhum dos dados reais do site atual (projetos, experiências, certificados, skills, contatos, MatchNetto).

O objetivo é:

1. Adotar o Greek como **nova base** (tech + visual).
2. **Preservar 100% das informações** que hoje estão no site (projetos, skills, experiências, certs, educação, trajetória, contatos, SEO, currículo, MatchNetto).
3. Trazer o **MatchNetto** (análise de compatibilidade via Claude + Turnstile + Worker) funcionando idêntico ao de hoje.
4. Substituir a imagem 2D do busto por um **modelo 3D real** via `<model-viewer>`.

Stack alvo: **React 18 + ReactDOM via CDN, Babel Standalone, JSX no browser, CSS puro, `<model-viewer>` para o 3D**. Sem build step — Cloudflare continua servindo o diretório como assets estáticos.

---

## Arquivos a criar / modificar

| Caminho | Ação | Vem de |
|---|---|---|
| `/mnt/hd/Dev/NettoTech/index.html` | **Substituir** pelo novo entry React | Baseado em `Greek/Pedro Netto Portfolio.html`, adicionando SEO meta tags, schema.json, Turnstile script, model‑viewer script |
| `/mnt/hd/Dev/NettoTech/styles.css` | **Substituir** | Greek/styles.css + novas regras para modal MatchNetto, 3D viewer, detalhes |
| `/mnt/hd/Dev/NettoTech/hero.jsx` | **Criar** | Greek/hero.jsx adaptado: busto 3D via `<model-viewer>`, texto do hero com o conteúdo atual |
| `/mnt/hd/Dev/NettoTech/sections-core.jsx` | **Criar** | Greek/sections-core.jsx populado com os **7 projetos**, **8 skills**, **5 experiências** reais |
| `/mnt/hd/Dev/NettoTech/sections-extra.jsx` | **Criar** | Greek/sections-extra.jsx populado com **6 certs**, **3 blocos de educação**, **5 contatos** reais, nova seção **Trajetória** (stories) e **MatchNetto CTA** |
| `/mnt/hd/Dev/NettoTech/matchnetto.jsx` | **Criar (novo)** | Componente React que encapsula todo o modal de compatibilidade (3 steps: form / loading / result) + Turnstile + fetch pro worker |
| `/mnt/hd/Dev/NettoTech/app.jsx` | **Criar** | Shell da aplicação (theme state, layout principal, monta tudo). **Sem tweaks-panel**. |
| `/mnt/hd/Dev/NettoTech/assets/marble-bust.glb` | **Criar/Obter** (o usuário vai fornecer) | Modelo 3D do busto em **glTF Binary** — ver seção "Busto 3D" abaixo |
| `/mnt/hd/Dev/NettoTech/img/*.jpeg` + `/mnt/hd/Dev/NettoTech/img/storys*.png` | **Preservar** | Mantém todas as imagens existentes (logos, experiências, stories, perfil) |
| `/mnt/hd/Dev/NettoTech/cv-pedro-netto.pdf` | **Preservar** | Link do botão "Currículo" continua apontando para `https://nettotech.com.br/cv-pedro-netto.pdf` |
| `/mnt/hd/Dev/NettoTech/wrangler.jsonc` | **Preservar** | `assets.directory: "."` já serve tudo |
| `/mnt/hd/Dev/NettoTech/app.js` | **Deletar** | Todas as funções `init*` migram para dentro dos componentes React |
| `/mnt/hd/Dev/NettoTech/StoriesSteamCarousel.tsx` | **Deletar** | Não estava referenciado no index.html, é artefato órfão |
| `/mnt/hd/Dev/NettoTech/Greek/` | **Preservar** | Mantido como referência; pode ser removido após validação |

---

## Conteúdo que deve ser 100% portado (checklist de não‑regressão)

Essa é a lista exaustiva do que **precisa chegar no Greek** — se qualquer item sumir, a migração tem bug.

### Meta / SEO (head)
- `<title>Pedro Netto | Analista de Infraestrutura & Automação</title>`
- Meta `description`, `keywords`, `author`, `robots`
- Open Graph: `og:title`, `og:description`, `og:image` (`https://nettotech.com.br/img/profile.jpeg`), `og:url`, `og:type`, `og:locale: pt_BR`
- Twitter Card
- `theme-color #0b0f19` → atualizar para `#1a1612` (novo marble-0 dark)
- `<script type="application/ld+json">` com `@type: Person` (name, url, image, jobTitle, email, sameAs com LinkedIn/GitHub/Wiki, knowsAbout, workLocation: Bauru SP)
- Google Fonts (Cormorant Garamond, Inter, JetBrains Mono) via preconnect + stylesheet
- **Turnstile**: `<script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" async defer></script>`
- **Model-viewer**: `<script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js"></script>`

### Hero (`#sobre`)
- H1 `Pedro Netto` (com `<em>` laranja em "Netto")
- Role pills: Analista de Infraestrutura · Linux · Cloud · Python
- Tabs: **Sobre mim** / **Resumo Profissional** com donut countdown 30s auto-rotate (migrar `initAboutToggle` pra React)
  - Panel "Sobre mim": texto atual sobre Linux Kubuntu, missão, CI/CD/LLMs/Agents/Automações, Zen of Python quote
  - Panel "Resumo Profissional": 3 parágrafos (+3 anos exp, Python/Bash/PowerShell/Docker/GH Actions, AWS Cloud Practitioner + CCNAv7 + FATEC + cultura DevOps)
- Botões: Wiki (link `https://wiki.nettotech.com.br/`) + Currículo (download `https://nettotech.com.br/cv-pedro-netto.pdf`)
- Stats: 3+ Anos · 6 Projetos · 6 Certificados (atualizar números pros reais)
- Lado direito: `<model-viewer src="assets/marble-bust.glb">` com energy rings + plinto (ver seção "Busto 3D")

### Projetos (`#projetos`) — 7 cards
1. **Alfred-Pennyworth** (IA/LLM) — Python, Ollama, Docker, RAG — `github.com/PedroNettoDs/Alfred-Pennyworth`
2. **Briefing de Notícias - LLM** (IA/LLM) — Python, Ollama, Docker, NLP — `github.com/PedroNettoDs/Briefing-LLM`
3. **NF-e Consolidator** (Automação) — Python, XML, Tkinter, Automation — `github.com/PedroNettoDs/NF-e-Consolidator`
4. **SubMAX** (SaaS) — Django, React, TypeScript, PostgreSQL, CI/CD — `https://www.submax.com.br` (link externo, não GitHub)
5. **IaC de Fileserver** (Infraestrutura) — Bash, Samba, GPO, IaC — `github.com/PedroNettoDs/IaC-Fileserver`
6. **Exchange Retention Manager** (Automação) — Python, Exchange Online, PowerShell, Automation — `github.com/PedroNettoDs/Exchange-Retention-Manager`
7. **Wiki NettoTech** (Documentação) — Linux, Redes, Cloud, Infraestrutura — `https://wiki.nettotech.com.br/`

Preservar a feature de **"Exibir mais"** no mobile (primeiros 3 visíveis, botão revela os outros 4).

### Competências Técnicas (`#competencias`) — 8 cards
1. Sistemas Operacionais: Linux, Ubuntu, Kubuntu, Debian, Windows Server, Active Directory, GPOs
2. Containers & IaC: Docker, Kubernetes, IaC
3. DevOps & CI/CD: GitHub Actions, Git/GitHub, Build/Test, Deploy
4. Automação: Python, Bash, PowerShell, Monitoramento, Backup
5. Observabilidade: Grafana, Elastic, ARIA, Logs & Métricas
6. Redes & Segurança: TCP/IP, CCNA, VPN, FortiGate, Firewall, Governança de Acessos
7. ITSM & Processos: ITIL v4, Scrum, Jira, ServiceNow, CHG
8. LLM / IA Aplicada: Ollama, Automações com IA, Agentes de IA, RAG

### Experiência Profissional (`#experiencia`) — 5 jobs + timeline
1. **Analista de Infraestrutura II** · Paschoalotto · nov/2025 – Atual · Bauru SP · Híbrido · logo `img/logo_paschoalotto.jpeg` · screenshot `img/ex_paschoalotto.jpeg` · 4 bullets
2. **Analista de Infraestrutura** · Paschoalotto · abr/2025 – nov/2025 · Bauru SP · 4 bullets
3. **Fundador & Gestor de Projetos** · AttanoTech · mar/2025 – Atual · Projeto pessoal · logo `img/logo_attanotech.jpeg` · screenshot `img/ex_attanotech.jpeg` · 3 bullets
4. **Analista de Suporte Júnior** · Linx Sistemas · set/2023 – abr/2025 · Bauru SP · logo `img/logo_linx.jpeg` · screenshot `img/ex_linx.jpeg` · 3 bullets (extra, escondido)
5. **Analista de TI** · KS2 Soluções Empresariais · jan/2023 – set/2023 · Bauru SP · logo `img/logo_ks2.jpeg` · screenshot `img/ex_ks2.jpeg` · 4 bullets (extra, escondido)

Preservar: botão **Ver mais / Ver menos** + **barra de progresso vertical** que esvazia conforme o usuário rola (inverter lógica igual o atual: 100% ao entrar na viewport, 0% ao sair).

### Certificados (`#certificados`) — carousel com 6 certs
Do `renderCerts()` atual (linhas 307–396 do `app.js`):
1. CCNA: Introduction to Networks · Cisco · 2023-12-18 · Credly `3dee7804-554c-4868-ba70-3f0d0a5bfea8`
2. CCNA: Switching, Routing, and Wireless Essentials · Cisco · 2023-12-18 · Credly `a6d10622-e238-4ddc-a47a-ecc6c7c61935`
3. CCNA: Enterprise Networking, Security, and Automation · Cisco · 2023-12-22 · Credly `883eb270-a7eb-44cb-a0f3-19a1f8cfe019`
4. Computer Network · Huawei · 2024-10-14 · Credly `ac3bff27-909e-4aa5-8c35-cb0b2fa37a23`
5. IT Essentials · Cisco · 2024-12-04 · Credly `866df61a-2ab3-471e-80d3-f864148e6eab`
6. (conferir no `app.js` se tem um AWS Cloud Essentials — o explorador reportou 6 mas o arquivo hardcoded tem 5; validar ao implementar)

Cada card: imagem Credly, título, emissor, data formatada pt-BR (`dd de mês de YYYY`), link "Verificar certificado".

### Educação (`#educacao`) — 3 blocos
1. **Educação Formal**: FATEC Bauru · Tecnólogo em Redes de Computadores · 2024 – atual · parágrafo descritivo sobre infraestrutura/servidores/AD/programação/automação
2. **Plataformas de Aprendizado**: Alura (link perfil) + Udemy (link perfil) — 2 cards
3. **Cursos Complementares**: sub‑timeline com CCNA Cisco (2023) + AWS Knowledge Cloud Essentials (2024)

### Trajetória (`#storys`) — carousel de 15 imagens
`img/storys1.png` até `img/storys15.png`. Reimplementar como carousel React (substituindo o `createCarousel` atual). Clicar numa imagem abre modal full‑screen (substituindo o `initImageModal`).

### MatchNetto (`#matchnetto`) — seção + modal
- Card de CTA com ícone `psychology`, título "Análise automática com IA", subtítulo "Powered by Claude + N8N · Turnstile · Limite de 3 análises por sessão", botão "Analisar compatibilidade com uma vaga"
- Modal (no `matchnetto.jsx`):
  - Worker URL: `https://matchnetto-proxy.mrpedronetinhu.workers.dev/check`
  - Turnstile sitekey: `0x4AAAAAADCQnXKSCnuy4TEX`
  - Session ID no `localStorage` (chaves `matchnetto_session_id` + `matchnetto_session_expiry`, TTL 24h, gerado com `crypto.randomUUID`)
  - 3 steps: `form` (textarea min 20 chars + charcount + Turnstile + submit/cancel) → `loading` (spinner) → `result` (score ring SVG + recomendação **sem emojis** + análise unificada em parágrafos)
  - Síntese de resumo via `synthesizeSummary()` já implementada (mapear recommendation `aplicar` / `aplicar com ressalvas` / `nao recomendado` + strengths + gaps + github_evidence + tips num texto fluente)
  - Quota: "Análise X de Y nesta sessão"
  - Fechar por botão / clique no overlay / Esc

### Contato (`#contato`) — 5 canais
1. WhatsApp: `https://wa.me/5514996807057?text=...` · cor `#25D366`
2. LinkedIn: `https://www.linkedin.com/in/pedronettods` · cor `#0A66C2`
3. Facebook: `https://facebook.com/PedroNettoDs` · cor `#1877F2`
4. YouTube: `https://youtube.com/@MrNetto` · cor `#FF0000`
5. Instagram: `https://instagram.com/pedro.nettotech/` · cor pink-400

Bloco de copy antes dos canais (preservar do site atual): "Quer saber como posso ser mais do que um funcionário e virar um investimento para a sua empresa? Então é só marcar uma conversa. Mas só vale a pena se a sua empresa realmente exalar tecnologia — porque é isso que eu respiro."

---

## Mapeamento de interatividade: do `app.js` atual → componentes React

| `init*` atual (app.js) | Equivalente React no Greek |
|---|---|
| `initThemeToggle` | `useState` em `app.jsx` + `<html data-theme="dark\|light">` (mecanismo do Greek). Persistir em `localStorage`. |
| `initScrollSpy` | Hook `useEffect` no `<Nav>` (já existe em `Greek/hero.jsx` linhas 62–75) — reaproveitar |
| `initReveal` | Hook `useEffect` + `IntersectionObserver` num wrapper `<Reveal>` reutilizável |
| `initExperienceToggle` | `useState` local no componente `ExperienceSection` (já parcialmente em `Greek/sections-core.jsx`) |
| `initProjectsToggle` | `useState` + media query `window.matchMedia('(max-width: 960px)')` no `ProjectsSection` |
| `initTimelineProgress` | Hook `useEffect` calculando `rect.bottom / (height + vh)` no scroll, aplicando em `<div class="timeline-fill">` |
| `initAboutToggle` | `useState` + `useEffect` com `requestAnimationFrame` pra donut (30s) no `<Hero>` |
| `initImageModal` / `renderStories` | Novo `<StoriesSection>` + `<ImageModal>` (lista `img/storysN.png` de 1 a 15) |
| `renderCerts` | Array declarativo no `<CertificatesSection>` (iterar e renderizar) |
| `initKeywordRain` | **Remover** — substituído pelo fundo de mármore (`marble-bg`) |
| `initMobileMenu` | `useState` no `<Nav>` + CSS media query |
| `initMatchNetto` | `matchnetto.jsx` (componente dedicado, todo o lifecycle do Turnstile + fetch + render) |
| `createCarousel` | Hook genérico `useCarousel(railRef, options)` reaproveitável por Stories e Certs |

---

## Busto 3D

**Formato do arquivo:** `GLB` (glTF 2.0 binário — padrão web, extensão `.glb`, ~1–5 MB otimizado, suporta texturas e PBR embutidos).

**Onde colocar:** `/mnt/hd/Dev/NettoTech/assets/marble-bust.glb`

**Como integrar:** via web component `<model-viewer>` (Google, Apache 2.0) — pre‑built, zero dependências, suporte a WebGL 2 + AR + lighting:

```jsx
<model-viewer
  src="assets/marble-bust.glb"
  alt="Busto de mármore"
  camera-controls
  auto-rotate
  auto-rotate-delay="3000"
  rotation-per-second="20deg"
  interaction-prompt="none"
  environment-image="neutral"
  exposure="1.1"
  shadow-intensity="1"
  disable-zoom
  style={{ width: '100%', height: '480px', background: 'transparent' }}
/>
```

**Fallback:** Se o GLB não carregar (navegador sem WebGL, erro de rede), `<model-viewer>` dispara evento `error` — cair pra `<img src="assets/marble-bust.png">` com o parallax CSS do Greek atual.

**Onde conseguir o modelo:**
- **Sketchfab** (muitos busti gregos CC‑BY — baixar GLB direto)
- **Poly Pizza / KhronosGroup samples** (gratuitos, licença livre)
- **Meshy / Luma AI** (gerar a partir do PNG atual `Greek/assets/marble-bust.png`)
- **Otimizar** com `gltf-transform` ou `meshoptimizer` (comprimir vertex data + Draco) — costuma cair de 8 MB → 800 KB

O plano aceita **duas fases**:
- **Fase 1 (lançamento):** usa o `marble-bust.png` existente com o parallax CSS do Greek (igual ao template original). Site já vai ao ar com o visual completo.
- **Fase 2 (upgrade):** trocar por `<model-viewer>` assim que o `.glb` estiver pronto — é um patch de umas 10 linhas em `hero.jsx`.

---

## Paleta e tipografia (para referência na implementação)

Do `Greek/styles.css`, adotar as CSS variables:

- Claro: `--marble-0: #faf7f2`, `--marble-1: #f3ede2`, `--marble-2: #e8e0d0`, `--marble-3: #d9cfb9`
- Escuro: `--marble-0: #1a1714`, `--marble-1: #221e1a`, `--marble-2: #2a2620`, `--marble-3: #3a342c`
- Ink (tipo): `--ink-0/1/2/3/4` (escuro‑claro em ambos os temas)
- Acento: `--orange: #d97048`, `--orange-hot: #e85a28`, `--orange-soft: rgba(217,112,72,.12)`, `--orange-line: rgba(217,112,72,.35)`
- Fontes: `Cormorant Garamond` (display), `Inter` (body), `JetBrains Mono` (labels/data)

**Não vai ter mais** o `electric: #f97316` do Tailwind — o MatchNetto precisa ser reestilizado com `--orange` (o laranja do Greek é ligeiramente diferente, mais terroso/clássico).

---

## Verificação end‑to‑end

Após implementação, testar:

1. **Abrir `index.html` no navegador** (ou via `npx wrangler dev` se preferir simular o Cloudflare)
2. **Checklist visual**:
   - Fundo de mármore carrega com textura SVG
   - Fontes Cormorant/Inter/JetBrains renderizam (não serif genérica)
   - Mêandro grego aparece nos dividers
   - Energy rings orbitam em volta do busto
   - Busto 3D: rotaciona com mouse (ou GLB auto‑rotate), carrega sem erros
   - Toggle de tema funciona (claro ↔ escuro, todas as cores invertem)
3. **Navegação**:
   - Cada link do nav rola até a seção correta (`#sobre`, `#projetos`, `#competencias`, `#experiencia`, `#certificados`, `#educacao`, `#matchnetto`, `#contato`)
   - Scroll spy destaca o link ativo conforme rola
   - Hamburger menu abre/fecha no mobile
4. **Seções (content não‑regressão)**:
   - 7 projetos aparecem, SubMAX linka pro site (não GitHub), Wiki é visível, "Exibir mais" no mobile funciona
   - 8 cards de Competências com todos os 40+ badges
   - 5 experiências (3 visíveis + 2 atrás de "Ver mais"), barra de progresso vertical esvaziando ao rolar
   - 6 certificados no carousel com links Credly
   - 3 blocos de Educação completos
   - 15 stories navegáveis, click abre modal
   - 5 contatos com as cores oficiais das marcas
5. **MatchNetto**:
   - Clicar em "Analisar compatibilidade" abre modal
   - Turnstile renderiza **uma vez só** (flag `?render=explicit` no script)
   - Contador de caracteres funciona ao digitar
   - Submit com < 20 chars mostra erro inline
   - Submit sem Turnstile mostra erro inline
   - Submit válido vai pro step loading, depois result (ou erro)
   - Score ring anima de 0 até o valor retornado
   - Recomendação sem emojis
   - Análise unificada em parágrafos
   - Quota "X de Y" aparece no footer
   - Fechar com Esc, overlay, ou botão
6. **Download do CV**: clicar no botão Currículo faz download de `cv-pedro-netto.pdf` (arquivo já existe)
7. **SEO**: `<title>`, meta tags e JSON‑LD presentes no head (inspecionar via DevTools)
8. **Responsivo**: reduzir janela pra 960px e 640px — grids colapsam, nav vira hamburger, hero empilha
9. **Console limpo**: nenhum erro JS ou 404 de asset
10. **Deploy preview**: `npx wrangler deploy` num preview e conferir se tudo carrega via CDN do Cloudflare (sem paths relativos quebrando)

---

## O que vai ser removido / substituído

- `app.js` (959 linhas de vanilla JS) → funcionalidades migram pra componentes React
- Tailwind CDN e todo o layout baseado em classes utilitárias → CSS puro com variáveis
- Paleta azul‑elétrica `#0b0f19` / `#f97316` → paleta mármore + laranja clássico
- Keyword rain no canvas → fundo de mármore estático
- Classes utilitárias do Tailwind nos botões/cards → classes semânticas (`.btn`, `.btn-primary`, `.project-card`, etc. do Greek)
- Foguete + tracejado da timeline (já removido) → mantém a barra de progresso vertical limpa
- Tweaks panel do Greek (dev‑only) → **não incluir**

---

## Ordem de execução sugerida

1. Escrever `index.html` novo (entry React + meta + scripts)
2. Escrever `styles.css` (Greek + modal MatchNetto + model-viewer)
3. Escrever `hero.jsx` com busto 2D (parallax) ainda — facilita iteração
4. Escrever `sections-core.jsx` e popular Projetos + Competências + Experiência
5. Escrever `sections-extra.jsx` e popular Certificados + Educação + Trajetória + Contato + CTA MatchNetto
6. Escrever `matchnetto.jsx` (modal completo)
7. Escrever `app.jsx` (shell, theme, montagem de tudo)
8. Deletar `app.js` e `StoriesSteamCarousel.tsx`
9. Testar tudo localmente e no preview do Cloudflare
10. (Posterior) trocar busto 2D por GLB quando o modelo 3D estiver pronto
