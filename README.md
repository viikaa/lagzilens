# lagzilens

A lightweight, mobile-first wedding photo-sharing SPA for **Bogi & Viktor**.

Guests scan a QR code from the menu card, open the app hosted on GitHub Pages, and upload photos directly to a dedicated Google Drive folder.

## Quick Links

- **Live app:** `https://hemex-c.github.io/lagzilens/?token=secret_token`
- **Backend:** Google Apps Script Web App
- **Storage:** Google Drive (15 GB free tier)

## Project Layout

```text
lagzilens/
├── app/                  # Angular frontend source
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/     # Guards, services, models
│   │   │   └── features/ # Upload & no-access pages
│   │   └── environments/ # Configurable endpoint only
│   ├── angular.json
│   ├── package.json
│   └── tailwind.config.js
├── docs/
│   └── GAS-SETUP.md      # Backend deployment guide
├── index-redirect.html   # Temporary QR-code entrypoint
└── .github/workflows/
    └── deploy.yml        # CI/CD to GitHub Pages
```

## Required Configuration

Before deploying, update these placeholders:

1. **`app/src/environments/environment.ts`** and **`environment.prod.ts`**
   - `gasEndpoint`: your GAS Web App URL

2. **`gas/Code.gs`**
   - `SECRET_TOKEN`: the secret token printed on the QR code
   - `DRIVE_FOLDER_ID`: target Google Drive folder

3. **`index-redirect.html`**
   - Replace `hemex-c` with your GitHub username.
   - Replace the token if it differs from `secret_token`.

## Local Development

From the repository root:

```bash
npm install   # installs app dependencies via postinstall
npm start
```

Or from the `app/` directory:

```bash
cd app
npm install
npm start
```

The app requires a valid `?token=` query parameter. Open:

```text
http://localhost:4200/?token=secret_token
```

## Production Build

From the repository root:

```bash
npm run build
```

Output is written to `app/dist/lagzilens/browser`.

## Deployment

### Automatic (recommended)

Push to `main`. The GitHub Actions workflow in `.github/workflows/deploy.yml` builds and deploys to GitHub Pages.

### Manual

```bash
cd app
ng add angular-cli-ghpages
ng deploy --base-href=/lagzilens/
```

Then enable **Settings → Pages → Deploy from a branch → gh-pages** in the repository.
