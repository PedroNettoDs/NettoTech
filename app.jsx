/* global React, ReactDOM, Nav, Hero, Projects, Skills, Experience, Certs, Education, Trajetoria, MatchNettoCTA, Contact, ImageModal, MatchNetto */
const { useState, useEffect } = React;

const THEME_KEY = "nettotech_theme";

const Meander = () => (
  <div className="section-divider" aria-hidden="true">
    <div className="container"><div className="meander"></div></div>
  </div>
);

const App = () => {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light") return false;
    if (saved === "dark") return true;
    return true; // default
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", dark ? "#1a1714" : "#faf7f2");
  }, [dark]);

  const toggleTheme = () => setDark(!dark);

  return (
    <>
      <div className="marble-bg"></div>
      <Nav dark={dark} onToggleTheme={toggleTheme} />
      <Hero />
      <Meander />
      <Projects />
      <Meander />
      <Skills />
      <Meander />
      <Experience />
      <Meander />
      <Certs />
      <Meander />
      <Education />
      <Meander />
      <Trajetoria />
      <Meander />
      <MatchNettoCTA />
      <Meander />
      <Contact />
      <footer className="footer">
        <div className="container">
          <div className="footer-mono">
            PEDRO NETTO <span>·</span> INFRAESTRUTURA & AUTOMAÇÃO <span>·</span> 2026
          </div>
        </div>
      </footer>

      {/* Modais globais */}
      <ImageModal />
      <MatchNetto />
    </>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
