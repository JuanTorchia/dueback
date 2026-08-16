export function AppHeader() {
  return (
    <header className="app-header">
      <a className="brand" href="/intake" aria-label="DueBack home">
        <span className="brand-mark" aria-hidden="true">✓</span>
        <span>DueBack</span>
      </a>
      <a className="header-link" href="/privacy">Privacy</a>
    </header>
  );
}
