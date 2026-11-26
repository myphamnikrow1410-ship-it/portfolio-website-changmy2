# Pham Hong Chang My — Business Analyst Portfolio

This is the **complete, deployment-corrected project** for the approved two-page static HTML/CSS/JavaScript portfolio. The website itself was not redesigned or rebuilt for this fix. HTML, CSS, JavaScript, images, text, links, colors, interaction behavior, and layout are unchanged.

## The deployment fix

The previous configuration ran `npm run build:deploy` on Vercel, which called `node scripts/build.mjs`. While `scripts/build.mjs` exists in the original complete archive, a Vercel checkout missing it (for example, from an incomplete GitHub upload or an incorrect Root Directory) fails with `MODULE_NOT_FOUND`. The previous `.gitignore` also excluded the prebuilt `public/` website, making the build step mandatory on GitHub.

This version serves **checked-in static files** from `public/`. It needs **no Vercel build command, no install command, no npm dependencies, and no required Node.js runtime**. The original optional `scripts/` and `src/` folders remain available for later content editing, but Vercel never invokes them.

### Files changed *only* for deployment

- `vercel.json`: Framework `Other` (`null`), empty `buildCommand` and `installCommand`, `outputDirectory: "public"`, trailing slash URLs.
- `package.json`: removed the npm build scripts **and the former broad `engines.node: ">=18"` declaration**; retained metadata only, with no dependencies. This static deployment does not need a Node.js version pin.
- `.gitignore`: removed `public/` so the static site is committed to GitHub.
- `README.md`: corrected deployment instructions.

All website files in `index.html`, `projects/hitalent/`, `assets/`, and `public/` are **byte-for-byte identical** to the preceding approved package.

## About the two Vercel warnings

These warnings were separate from the `MODULE_NOT_FOUND` error:

1. **`Warning: Detected "engines": { "node": ">=18" }`** — The original `package.json` had an open-ended Node range, which Vercel warns could select a future unsupported major. In this corrected package, `package.json` **does not declare a Node engine**, because deployment serves static files and invokes no Node code. When editing the project locally using the preserved optional authoring scripts, use a supported Node.js LTS (22.x or 24.x); Node is not needed to preview or deploy the current website. In Vercel project settings, leave the supported default Node version (currently 24.x) or choose 22.x if you later add server-side code. No Node version setting is needed for this static site.

2. **`npm warn Unknown env config "cache-dir"`** — The original and corrected project archives contain **no `.npmrc`, `cache-dir` property, or `NPM_CONFIG_CACHE_DIR` setting**. A late-2026 Vercel community report traced this warning to an `npm_config_cache_dir` environment variable injected during the provider's npm build process. This is ordinarily a nonfatal npm warning, **not evidence of an application bug**. The corrected `vercel.json` has empty `installCommand` and `buildCommand`, so normal Vercel static deployment does **not invoke npm**. If the warning persists in project build logs, check Vercel **Settings → Environment Variables** for a manually added `NPM_CONFIG_CACHE_DIR` / `npm_config_cache_dir` and remove it if present, check for dashboard command overrides, then redeploy without the old build cache. If no such setting exists and it still appears, it is outside this repository; a harmless provider-side warning cannot be fixed by changing website code.

Do not add a project `.npmrc` with an unsupported `cache-dir` key or run `npm install` as a Vercel build step for this static website.

## Complete folder layout

```text
index.html                        Existing homepage (unchanged)
projects/hitalent/index.html     Existing case-study page (unchanged)
assets/
  styles.css                     Existing layout, light/dark palette (unchanged)
  site.js                        Existing interactions (unchanged)
  theme-init.js                  Existing theme initialization (unchanged)
  favicon.svg                    Existing favicon (unchanged)
  images/*.webp                  Portrait and three project screenshots (unchanged)
public/                          PREBUILT PUBLIC SITE (commit this folder to Git!)
  index.html                     Public homepage
  projects/hitalent/index.html   Public case study
  assets/                        Public styles, scripts and images
src/content.json                 Existing editable content source (not served publicly)
scripts/build.mjs                Optional authoring generator (not run by Vercel)
scripts/prepare-public.mjs       Optional asset-copy tool (not run by Vercel)
package.json                     Metadata only; no build scripts/dependencies
vercel.json                      Deploy public/ statically without building
.gitignore                       Does NOT ignore public/
.nojekyll                        Original repository metadata
QA-results.txt                   Earlier full visual QA report
```

## Run locally

1. Extract this ZIP to a folder.
2. Open a terminal **inside the folder containing `vercel.json` and `public/`**.
3. Start a static local server:

```bash
python -m http.server 8000 --directory public
```

Open the homepage at `http://localhost:8000/` and the case study at `http://localhost:8000/projects/hitalent/`. You can alternatively open the root `index.html` locally for a quick preview, though a server better simulates website navigation.

Python is only needed for this optional local server, not for Vercel deployment.

## Upload the complete corrected project to GitHub

**Important:** Do not upload the ZIP itself as one file and expect GitHub or Vercel to unzip it. Upload/extract its **contents**, including the `public/` folder and `vercel.json`, at the repository root.

### If you already have a GitHub repository

1. Replace its old project files with all contents of the extracted corrected folder (especially `vercel.json`, `package.json`, `.gitignore`, and the complete `public/` folder).
2. Run these commands in the repository folder:

```bash
git add -A
git status
git commit -m "Fix Vercel deployment: serve committed static site"
git push
```

Verify that **`public/index.html` appears in the GitHub repository** alongside `vercel.json`. If it does not, the repository has not received the required files.

### If creating a new GitHub repository

Create an empty repository at https://github.com/new, then inside the extracted project folder:

```bash
git init -b main
git add -A
git commit -m "Add deployment-ready static portfolio"
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

Replace `YOUR-USERNAME` and `YOUR-REPO` with your repository details.

## Set up or redeploy on Vercel

In https://vercel.com/dashboard, open the project → **Settings → Build and Deployment** (the exact menu name may vary). Verify:

| Setting | Required value |
| --- | --- |
| Framework Preset | **Other** |
| Root Directory | **Repository root (`./`)**, where `vercel.json` and `public/` are located |
| Build Command | **No command — leave blank** (enable Override if needed) |
| Install Command | **No command — leave blank** |
| Output Directory | **public** |

The committed `vercel.json` also specifies these deployment values. Do **not** set the Build Command to `npm run build`, `npm run build:deploy`, or `node scripts/build.mjs`.

After pushing the corrected repository files, Vercel should start a new deployment automatically. Otherwise, select **Deployments → Redeploy** and disable **Use existing Build Cache** if offered. In deployment logs, the old `npm run build:deploy` command must **not** appear.

After success, verify both live routes:

- `https://YOUR-SITE.vercel.app/`
- `https://YOUR-SITE.vercel.app/projects/hitalent/`

Open the public URL in a private/incognito browser to ensure public visitors need no login. Review Vercel's Deployment Protection settings if they do.

### Deploy directly using Vercel CLI (optional)

From the extracted project root, after signing in:

```bash
npx vercel --prod
```

Vercel serves the existing `public/` directory with no build step. No `npm install` is required.

## Editing the site later (optional)

This is a static deploy with **both editable source and prebuilt public files** included. The data source `src/content.json` and the *existing* authoring scripts are preserved for future edits, but are not needed to deploy the current site.

To rebuild HTML after editing `src/content.json`, if Node.js is installed:

```bash
node scripts/build.mjs
node scripts/prepare-public.mjs
```

For changes made directly to `assets/` or root HTML, run `node scripts/prepare-public.mjs` to synchronize the public folder before committing. **This is only for later updates, not for the current Vercel deployment.**

## Review before publishing

- The portfolio already contains the candidate's portrait, phone number, email and location. Confirm public-sharing consent before publishing.
- Project and certificate URLs were copied unchanged; external permissions have not been independently verified.
- A separate downloadable CV PDF and individual HiTalent document files were not supplied in the original source. The existing pending-file notices remain unchanged.
- No public URL is created by this ZIP; publication requires an authenticated Vercel account.
