const fs = require('fs');

// Use node's built-in fetch (Node 18+) to query external APIs
async function getLatestIpoFiling(companyName) {
  try {
    const query = encodeURIComponent(companyName);
    const url = `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&company=${query}&type=S-1&count=1&output=json`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'IPOAlerts.io/1.0 (info@ipoalerts.io)',
        'Accept': 'application/json'
      }
    });
    if (!res.ok) {
      console.error(`SEC query failed for ${companyName}: ${res.status}`);
      return false;
    }
    const data = await res.json();
    if (data && data.result && data.result.filings && data.result.filings.filing && data.result.filings.filing.length > 0) {
      return true;
    }
  } catch (err) {
    console.error(`Error checking company ${companyName}:`, err);
  }
  return false;
}

async function sendEmail(company) {
  const apiKey = process.env.BREVO_API_KEY;
  const emailTo = process.env.EMAIL_TO;
  if (!apiKey || !emailTo) {
    console.warn('Brevo API key or email not configured; skipping email');
    return;
  }
  const payload = {
    sender: { name: 'IPO Alerts', email: emailTo },
    to: [{ email: emailTo }],
    subject: `IPO Alert: ${company.name}`,
    htmlContent: `<p>${company.name} may have filed for an IPO.</p>`
  };
  await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

async function sendPush(company) {
  const appId = process.env.ONESIGNAL_APP_ID;
  const restKey = process.env.ONESIGNAL_REST_API_KEY;
  if (!appId || !restKey) {
    console.warn('OneSignal credentials missing; skipping push');
    return;
  }
  const payload = {
    app_id: appId,
    headings: { en: 'IPO Alert' },
    contents: { en: `${company.name} may have filed for an IPO.` },
    included_segments: ['All']
  };
  await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': `Basic ${restKey}`
    },
    body: JSON.stringify(payload)
  });
}

async function main() {
  const filePath = './public/data/seed.json';
  const json = fs.readFileSync(filePath, 'utf-8');
  let categories;
  try {
    categories = JSON.parse(json);
  } catch (err) {
    console.error('Could not parse seed.json:', err);
    return;
  }
  for (const category of categories) {
    const companies = category.companies || [];
    for (const company of companies) {
      // treat company as private unless explicitly marked public: true
      const isPrivate = !company.public;
      if (isPrivate) {
        const hasIpo = await getLatestIpoFiling(company.name);
        if (hasIpo) {
          console.log(`Detected potential IPO for ${company.name}`);
          await sendEmail(company);
          await sendPush(company);
        }
      }
    }
  }
}

main().catch(err => {
  console.error(err);
});
