'use strict';
const html = document.documentElement;
html.classList.add('js');
const themeButton = document.querySelector('.theme-toggle');
const themeMeta = document.querySelector('meta[name="theme-color"]');
function updateTheme(theme) {
  html.dataset.theme = theme;
  const label = `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`;
  themeButton?.setAttribute('aria-label', label);
  themeButton?.setAttribute('title', label);
  themeMeta?.setAttribute('content', theme === 'dark' ? '#201C23' : '#F5F4F8');
}
if (themeButton) {
  themeButton.hidden = false;
  updateTheme(html.dataset.theme || 'light');
  themeButton.addEventListener('click', () => {
    const next = html.dataset.theme === 'dark' ? 'light' : 'dark';
    updateTheme(next);
    try { localStorage.setItem('my-portfolio-theme', next); } catch (_) {}
  });
}
const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('.primary-nav');
const mobile = matchMedia('(max-width: 767px)');
function setMenu(open) {
  menu?.setAttribute('aria-expanded', String(open));
  nav?.classList.toggle('is-open', open);
}
if (menu && nav) {
  menu.hidden = false;
  menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { setMenu(false); menu.focus(); }
  });
  document.addEventListener('click', event => { if (!event.target.closest('.site-header')) setMenu(false); });
  mobile.addEventListener('change', () => setMenu(false));
}
// Native details controls work without JS. JS only reveals direct project anchors.
function revealHash() {
  let id;
  try { id = decodeURIComponent(location.hash.slice(1)); } catch (_) { return; }
  if (!id) return;
  const target = document.getElementById(id);
  if (!target) return;
  const project = target.closest('.project') || (id === 'projects' ? document.getElementById('hitalent') : null);
  const details = project?.querySelector('details');
  if (details && !details.open) {
    details.open = true;
    requestAnimationFrame(() => target.scrollIntoView({block:'start'}));
  }
}
revealHash();
window.addEventListener('hashchange', revealHash);
window.addEventListener('pageshow', () => { // Restore theme and deep links after browser history navigation.
  try { const saved = localStorage.getItem('my-portfolio-theme'); if (saved === 'dark' || saved === 'light') updateTheme(saved); } catch (_) {}
  revealHash();
});
document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', () => {
  if (a.hash === location.hash) revealHash();
}));
const copy = document.querySelector('.copy-button');
const status = document.querySelector('.copy-status');
if (copy && status) {
  copy.hidden = false;
  copy.addEventListener('click', async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard not available');
      await navigator.clipboard.writeText(copy.dataset.copy);
      status.textContent = 'Email address copied.';
    } catch (_) {
      const input = document.createElement('textarea'); input.value = copy.dataset.copy;
      input.style.cssText = 'position:fixed;left:-9999px;top:0;'; document.body.append(input); input.select();
      let ok = false; try { ok = document.execCommand('copy'); } catch (_) {}
      input.remove(); copy.focus();
      status.textContent = ok ? 'Email address copied.' : 'Please select and copy the email address above.';
    }
  });
}
// Static local preview: a file:// browser cannot resolve directory routes to index.html.
if (location.protocol === 'file:') {
  document.querySelectorAll('a[href="projects/hitalent/"]').forEach(a => a.setAttribute('href', 'projects/hitalent/index.html'));
  document.querySelectorAll('a[href="../../"], a[href="../../#projects"]').forEach(a => a.setAttribute('href', '../../index.html' + a.hash));
}
