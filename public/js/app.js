async function loadData() {
  const res = await fetch('data/seed.json');
  const data = await res.json();
  buildTree(data);
}

function buildTree(data) {
  const container = document.getElementById('tree');
  container.innerHTML = '';

  Object.keys(data).forEach(category => {
    const catDiv = document.createElement('div');
    catDiv.className = 'category has-children';

    const catHeader = document.createElement('div');
    catHeader.className = 'node-header';
    const catArrow = document.createElement('span');
    catArrow.className = 'arrow';
    catArrow.textContent = '\u25B6';
    const catLabel = document.createElement('span');
    catLabel.className = 'node-label';
    catLabel.textContent = category;
    catHeader.appendChild(catArrow);
    catHeader.appendChild(catLabel);
    catDiv.appendChild(catHeader);

    const invList = document.createElement('ul');
    invList.className = 'investor-list';
    invList.style.display = 'none';

    catHeader.addEventListener('click', () => {
      const isOpen = invList.style.display === 'none';
      invList.style.display = isOpen ? 'block' : 'none';
      catArrow.textContent = isOpen ? '\u25BC' : '\u25B6';
    });

    Object.keys(data[category]).forEach(investor => {
      const investorItem = document.createElement('li');
      investorItem.className = 'investor has-children';

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

      const compList = document.createElement('ul');
      compList.className = 'company-list';
      compList.style.display = 'none';

      invHeader.addEventListener('click', e => {
        e.stopPropagation();
        const isOpen = compList.style.display === 'none';
        compList.style.display = isOpen ? 'block' : 'none';
        invArrow.textContent = isOpen ? '\u25BC' : '\u25B6';
      });

      data[category][investor].forEach(company => {
        const compItem = document.createElement('li');
        compItem.className = 'company';
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

  // Set up public toggle
  const toggle = document.getElementById('show-public');
  if (toggle) {
    toggle.addEventListener('change', () => updateVisibility(toggle.checked));
    updateVisibility(toggle.checked);
  }

  // Set up search filter
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      filterTree(searchInput.value.toLowerCase());
    });
  }

  // Expand/Collapse buttons
  const expandBtn = document.getElementById('expand-all');
  const collapseBtn = document.getElementById('collapse-all');
  if (expandBtn) expandBtn.addEventListener('click', expandAll);
  if (collapseBtn) collapseBtn.addEventListener('click', collapseAll);
}

function updateVisibility(showPublic) {
  document.querySelectorAll('.company').forEach(item => {
    const isPublic = item.dataset.public === 'true';
    item.style.display = (!showPublic && isPublic) ? 'none' : 'list-item';
  });
}

function filterTree(query) {
  const showPublic = document.getElementById('show-public').checked;
  if (!query) {
    // Reset: show all items and collapse lists
    document.querySelectorAll('.category, .investor, .company').forEach(el => {
      el.style.display = '';
    });
    collapseAll();
    updateVisibility(showPublic);
    return;
  }
  // Expand all for search visibility
  expandAll();
  document.querySelectorAll('.category, .investor, .company').forEach(el => {
    const text = el.textContent.toLowerCase();
    if (text.includes(query)) {
      el.style.display = '';
    } else {
      el.style.display = 'none';
    }
  });
  updateVisibility(showPublic);
}

function expandAll() {
  document.querySelectorAll('.investor-list, .company-list').forEach(list => {
    list.style.display = 'block';
  });
  document.querySelectorAll('.arrow').forEach(arrow => {
    arrow.textContent = '\u25BC';
  });
}

function collapseAll() {
  document.querySelectorAll('.investor-list, .company-list').forEach(list => {
    list.style.display = 'none';
  });
  document.querySelectorAll('.arrow').forEach(arrow => {
    arrow.textContent = '\u25B6';
  });
}

loadData();
