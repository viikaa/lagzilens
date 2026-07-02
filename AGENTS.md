# Project Agent Context: Wedding Photo Sharing Web App

This repository contains a mobile-first, lightweight Single Page Application (SPA) designed for wedding guests to seamlessly upload photos taken during the wedding of **Bogi & Viktor**. 

The application is built to be cost-effective (100% free tier), secure against unauthorized uploads, and optimized for low-bandwidth mobile connections.

---

## 1. System Architecture Overview

The system bypasses heavy cloud infrastructure by leveraging Google's ecosystem combined with static web hosting on GitHub Pages.

```
+------------------+         +-------------------+         +---------------------+
|   Mobile Client  |  POST   |    Web Backend    |  Save   |    Cloud Storage    |
|  (Angular SPA)   | ------> | (Google Apps Scr.)| ------> |    (Google Drive)   |
| [GitHub Pages]   |  Base64 |   [GAS Web App]   |  Blob   | [Dedicated Account] |
+------------------+         +-------------------+         +---------------------+
        ^                               ^
        | Validate Token                | Verify Token
        +-------------------------------+
```

### Technical Stack
- **Frontend:** Angular (Latest stable, SPA, Mobile-First)
- **Styling:** Tailwind CSS (For rapid, utility-first responsive UI)
- **Backend/API:** Google Apps Script (GAS) deployed as an anonymous Web App (`doPost(e)`)
- **Storage:** Google Drive (15 GB Free Tier on a dedicated wedding Google Account)
- **Hosting:** GitHub Pages exclusively (`username.github.io/repository-name`)
- **Routing Entry Point:** The same GitHub Pages domain serves as the temporary short URL entry point with a meta-refresh tag to handle redirection before the full app is deployed.

---

## 2. Key Features & Constraints

### Frontend Requirements
- **Mobile-First Design:** 100% of traffic will come from iOS/Android mobile browsers. UI must be clean, thumb-friendly, and lightweight.
- **Native File Picker:** Use native HTML5 `<input type="file" accept="image/*" multiple>` to trigger native camera or gallery rolls.
- **Upload Progress:** Visually clear progress indicators/bars to keep users engaged during flaky reception.
- **Token Guard:** Route Guard to prevent access unless a specific query parameter token is present (e.g., `?token=secret_token`).

### Backend (GAS) Requirements
- **Endpoint:** Single `doPost(e)` trigger accepting a JSON payload containing:
  - `token`: Validation string.
  - `base64String`: The image payload.
  - `mimeType`: Image format verification (JPEG, PNG, HEIC).
  - `fileName`: Suggested client filename.
- **Storage Allocation:** 15 GB allocation maps to roughly ~3,750 photos assuming an average of 4MB per photo. Videos are restricted at the frontend level to conserve space.

---

## 3. Security & Validation Matrix

To ensure that malicious actors or random web bots cannot spam the Google Drive storage, a 2-layer security strategy must be strictly enforced:

1. **Query Param Token (Access Layer):** The QR code on physical menu cards embeds a secret token string. The Angular route guard does not store the token; it sends the URL token to the GAS backend for validation. If invalid, access is blocked. The token is also forwarded in the API payload and verified again server-side inside GAS.
2. **Server-Side Sanitation (Payload Layer):**
   - Maximum payload limitation (e.g., Reject files > 20MB).
   - Strict Mime-Type whitelisting (`image/jpeg`, `image/png`, `image/heic`).
   - Filename sanitization on the server to prevent directory traversal or file-overwrite exploits.
   - *(Planned)* Server-side magic-byte validation after Base64 decoding, because iOS browsers may report `image/jpeg` for HEIC files. The Angular app already detects the real type client-side via the `image-type` library; GAS should verify it too.

---

## 4. Git Repository Scope & Guidelines for AI Agents

When acting as an AI developer or assistant in this repository, adhere to the following guidelines:
- **Keep it Simple:** Avoid bloated state management libraries (NgRx). Component-scoped state or a simple behavioral subject service for managing upload queues is sufficient.
- **CORS Mitigation:** Google Apps Script Web Apps handle CORS inherently when returning `ContentService.createTextOutput()`. Ensure all client HTTP requests use standard headers and handle redirect flows properly.
- **GitHub Pages Single-Repository Flow:** Since the app is hosted on GitHub Pages, ensure proper base-href configuration (`--base-href`) during production builds to avoid asset loading errors.
