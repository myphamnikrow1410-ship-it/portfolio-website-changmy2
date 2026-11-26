// Assemble only browser-facing files for Vercel; never publish editable content or build scripts.
import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'public');
rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
for (const name of ['index.html', 'assets', 'projects']) {
  cpSync(resolve(root, name), resolve(output, name), { recursive: true });
}
console.log('Prepared public/ for Vercel (two HTML pages and shared assets).');
