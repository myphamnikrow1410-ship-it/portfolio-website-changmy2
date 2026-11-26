/* Set the saved theme before CSS loads; default is the reference's warm light. */
try {
  const theme = localStorage.getItem('my-portfolio-theme');
  if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme;
} catch (_) { /* Storage can be unavailable in private/file contexts. */ }
