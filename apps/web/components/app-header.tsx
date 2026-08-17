export function AppHeader() {
  return (
    <header className="app-header">
      <a className="brand" href="/" aria-label="DueBack home">
        <span className="brand-mark" aria-hidden="true">✓</span>
        <span>DueBack</span>
      </a>
      <nav className="header-actions" aria-label="Primary navigation">
        <a className="header-link" href="/cases">My follow-ups</a>
        <a className="header-link" href="/privacy">Privacy</a>
        <a className="header-cta" href="/intake">Try DueBack</a>
      </nav>
    </header>
  );
}
