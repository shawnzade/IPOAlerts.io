async function loadData() {
  const res = await fetch('data/seed.json');
  const data = await res.json();
  buildTree(data);
}

function buildTree(data) {
  const container = document.getElementById('tree');
  container.innerHTML = '';

  // Build categories
  Object.keys(data).forEach(category => {
    // create category wrapper
    const catDiv = document.createElement('div');
    catDiv.className = 'category has-children';

    // Header with arrow and label
    const catHeader = document.createElement('div');
    catHeader.className = 'node-header';
    const catArrow = document.createElement('span');
    catArrow.className = 'arrow';
    catArrow.textContent = '\u25B6'; // triangle pointing right
    const catLabel = document.createElement('span');
    catLabel.className = 'node-label';
    catLabel.textContent = category;

    catHeader.appendChild(catArrow);
    catHeader.appendChild(catLabel);
    catDiv.appendChild(catHeader);

    // Investor list
    const invList = document.createElement('ul');
    invList.className = 'investor-list';
    invList.style.display = 'none';

    // Toggle investor list
    catHeader.addEventListener('click', () => {
      const open = invList.style.display === 'none';
      invList.style.display = open ? 'block' : 'none';
      catArrow.textContent = open ? '\u25BC' : '\u25B6';
    });

    // Iterate investors
    Object.keys(data[category]).forEach(investor => {
      const investorItem = document.createElement('li');
      investorItem.className = 'investor has-children';

      // Investor header
      const invHeader = document.createElement('div');
      invHeader.className = 'node-header';
      const invArrow = document.createElement('span');
      invArrow.className = 'arrow';
      invArrow.textContent = '\u25B6';
      const invLabel = document.createElement('span');
      invLabel.className = 'node-label';
      invLabel.textContent = investor;

      invHeader.appendChild(invArrow);
      invHeader.appendChild(invLabel);
      investorItem.appendChild(invHeader);

      // Company list
      const compList = document.createElement('ul');
      compList.className = 'company-list';
      compList.style.display = 'none';

      // Toggle company list
      invHeader.addEventListener('click', (e) => {
        e.stopPropagation();
        const openComp = compList.style.display === 'none';
        compList.style.display = openComp ? 'block' : 'none';
        invArrow.textContent = openComp ? '\u25BC' : '\u25B6';
      });

      // Add companies
      data[category][investor].forEach(company => {
        const compItem = document.createElement('li');
        compItem.className = 'company';
        // Parse valuation from name (e.g., "Company ($22.5B)")
        const match = company.name.match(/\s*\(([^)]+)\)$/);
        if (match) {
          const baseName = company.name.replace(/\s*\(([^)]+)\)$/, '');
          compItem.innerHTML = `${baseName} <span class="valuation">(${match[1]})</span>`;
        } else {
          compItem.textContent = company.name;
        }
        compItem.dataset.public = company.public;
        compList.appendChild(compItem);
      });

      investorItem.appendChild(compList);
      invList.appendChild(investorItem);
    });

    catDiv.appendChild(invList);
    container.appendChild(catDiv);
  });

  // Set up show/hide public companies
  const toggle = document.getElementById('toggle');
  if (toggle) {
    toggle.addEventListener('change', () => updateVisibility(toggle.checked));
    updateVisibility(toggle.checked);
  }
}

function updateVisibility(showPublic) {
  document.querySelectorAll('.company').forEach(item => {
    const isPublic = item.dataset.public === 'true';
    item.style.display = (!showPublic && isPublic) ? 'none' : 'list-item';
  });
}

// Load data initially
loadData();
