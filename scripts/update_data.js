const fs = require('fs').promises;
const path = require('path');

// Use the global fetch API available in Node.js v18+
const API_KEY = process.env.HNWI_API_KEY;
const API_URL = process.env.HNWI_API_URL || 'https://api.acuris.com/hwni/v1/hnwi-profile';

/**
 * Fetch holdings for an investor from the HNWI Profile API.
 * This function expects the API to return a JSON object with a `holdings` array.
 * Each holding should have a `company` name and a boolean `isPublic` field.
 * @param {string} name The investor name
 * @returns {Promise<Array<{name: string, public: boolean}>>}
 */
async function getInvestorHoldings(name) {
  if (!API_KEY) {
    console.error('HNWI_API_KEY is not set. Cannot fetch data.');
    return [];
  }
  const url = `${API_URL}?name=${encodeURIComponent(name)}`;
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json'
      }
    });
    if (!response.ok) {
      console.error(`Failed to fetch data for ${name}: ${response.status} ${response.statusText}`);
      return [];
    }
    const data = await response.json();
    if (!data || !Array.isArray(data.holdings)) {
      return [];
    }
    return data.holdings.map(h => ({
      name: h.company || h.name,
      public: Boolean(h.isPublic)
    }));
  } catch (err) {
    console.error(`Error fetching holdings for ${name}:`, err);
    return [];
  }
}

/**
 * Update the seed.json file with latest holdings from the API.
 */
async function updateData() {
  const filePath = path.join(__dirname, '..', 'public', 'data', 'seed.json');
  const jsonText = await fs.readFile(filePath, 'utf8');
  const data = JSON.parse(jsonText);

  // Iterate through categories and investors
  for (const categoryName of Object.keys(data)) {
    const investors = data[categoryName];
    for (const investorName of Object.keys(investors)) {
      console.log(`Updating holdings for ${investorName}...`);
      const holdings = await getInvestorHoldings(investorName);
      if (holdings.length > 0) {
        // Merge with existing list: avoid duplicates, update public flag if changed
        const updatedList = [];
        const namesSeen = new Set();
        // Add new holdings
        for (const holding of holdings) {
          updatedList.push({ name: holding.name, public: holding.public });
          namesSeen.add(holding.name.toLowerCase());
        }
        investors[investorName] = updatedList;
      }
    }
  }

  // Write updated data back to file
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  console.log('seed.json has been updated with latest holdings.');
}

updateData().catch(err => {
  console.error(err);
  process.exit(1);
});
