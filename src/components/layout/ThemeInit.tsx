// Runs before paint to avoid a flash of the wrong theme. Reads a saved
// preference from localStorage; falls back to the OS setting (handled purely
// by the CSS media query when no explicit stamp is present).
const script = `
try {
  var t = localStorage.getItem('sl_theme');
  if (t === 'light' || t === 'dark') {
    document.documentElement.setAttribute('data-theme', t);
  }
} catch (e) {}
`;

export function ThemeInit() {
  // eslint-disable-next-line react/no-danger
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
