# IPOAlerts.io

IPOAlerts.io tracks private companies invested in by famous investors and notifies you when they file for an initial public offering (IPO). The site shows private companies by default and allows you to toggle to show public ones. Companies are organized into categories such as *All In Podcast*, *PayPal Mafia*, *Billionaire Investors*, and *Tech Giants*.

The code in this repository includes:

- A static front end in `public/` that loads company data from `public/data/seed.json` and displays a simple, responsive tree view.
- A GitHub Actions workflow that runs daily (`.github/workflows/sec-check.yml`) and executes `scripts/check_ipo.js`. The script looks for new SEC filings (S-1, F-1, or 424B) for the private companies in your list. When a potential IPO filing is detected, it sends email and push notifications via Brevo and OneSignal.
- A `scripts/` folder with the Node.js script that performs the SEC check and sends notifications.

To deploy the site for free, enable **GitHub Pages** for this repository (Settings → Pages) and select the `public` folder. Add your Brevo and OneSignal API credentials as repository secrets:

- `BREVO_API_KEY` – your Brevo (Sendinblue) SMTP API key
- `EMAIL_TO` – the email address to receive alerts
- `ONESIGNAL_APP_ID` – your OneSignal app ID
- `ONESIGNAL_REST_API_KEY` – your OneSignal REST API key

You can customize the investor list and categories by editing `public/data/seed.json`.
