# IPOAlerts.io

IPOAlerts.io tracks private companies invested in by famous investors and notifies you when they file for an initial public offering (IPO). The site shows private companies by default and allows you to toggle to show public ones. The data is organized into two top‑level categories:

- **Notable Investors** – all of the individual investors you track along with their private holdings and valuations.
- **Companies** – major tech names (Meta, Amazon, Apple, Google, Netflix, Nvidia and Microsoft) you want to watch.

The front end now includes a search bar so you can quickly filter investors or companies and buttons to expand or collapse all sections. Companies with valuation figures are highlighted next to their names. Public companies remain hidden until you switch on the Show Public Companies toggle.

The code in this repository includes:

- A modern static front end in `public/` that loads data from `public/data/seed.json`, supports searching and expand/collapse, highlights valuations and hides public companies by default.
- A backend Express server in `backend/server.js` that stores user accounts (passwords are hashed with `bcryptjs`), user preferences and alert logs in a SQLite database. Endpoints exist for registration, login, password reset, getting and setting preferences and listing users.
- A GitHub Actions workflow (`.github/workflows/sec-check.yml`) that runs daily to check for new SEC filings (S‑1, F‑1 or 424B) and sends email and push notifications via Brevo and OneSignal.
- A second workflow (`.github/workflows/update-data.yml`) and script (`scripts/update_data.js`) designed to refresh holdings and valuations from an external API (e.g., Crunchbase) once you provide API credentials.
- A `scripts/` folder with Node.js scripts that perform the SEC check and data update.

To deploy the site for free, enable **GitHub Pages** for this repository (Settings → Pages) and select the root or `public` folder. Add your Brevo and OneSignal API credentials as repository secrets:

- `BREVO_API_KEY` – your Brevo (Sendinblue) SMTP API key
- `EMAIL_TO` – the email address to receive alerts
- `ONESIGNAL_APP_ID` – your OneSignal app ID
- `ONESIGNAL_REST_API_KEY` – your OneSignal REST API key

To enable automatic data updates, also add `HNWI_API_KEY` and `HNWI_API_URL` with your chosen data provider's credentials.

You can customize the investor list and categories by editing `public/data/seed.json`.
