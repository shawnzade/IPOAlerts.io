async function loadData() {
  const res = await fetch('data/seed.json');
  const data = await res.json();
  buildTree(data);
}

function buildTree(data) {
  const container = document.getElementById('tree');
  container.innerHTML = '';

  Object.keys(data).forEach(category => {
    // Create category node
    const catNode = document.createElement('div');
    catNode.className = 'category';
    catNode.textContent = category;
    
    // List to hold investors and their companies
    const invList = document.createElement('ul');
    invList.style.display = 'none';

    // Toggle investor list visibility when category is clicked
    catNode.addEventListener('click', () => {
      invList.style.display = invList.style.display === 'none' ? 'block' : 'none';
    });

    // Iterate over investors in this category
    Object.keys(data[category]).forEach(investor => {
      const investorItem = document.createElement('li');
      investorItem.className = 'investor';
      investorItem.textContent = investor;

      const compList = document.createElement('ul');
      compList.style.display = 'none';

      // Toggle company list visibility when investor is clicked
      investorItem.addEventListener('click', (e) => {
        // Prevent event from bubbling up to category toggle
        e.stopPropagation();
        compList.style.display = compList.style.display === 'none' ? 'block' : 'none';
      });

      // Add companies under this investor
      data[category][investor].forEach(company => {
        const coLi = document.createElement('li');
        coLi.textContent = company.name + (company.public ? ' (Public)' : '');
        coLi.dataset.public = company.public;
        compList.appendChild(coLi);
      });

      invList.appendChild(investorItem);
      invList.appendChild(compList);
    });

    container.appendChild(catNode);
    container.appendChild(invList);
  });

  const toggle = document.getElementById('toggle');

  function updateVisibility() {
    // Show or hide public companies based on toggle
    const companyItems = container.querySelectorAll('li');
    companyItems.forEach(item => {
      if (item.dataset.public === 'true') {
        item.style.display = toggle.checked ? 'list-item' : 'none';
      } else if (item.dataset.public === 'false') {
        item.style.display = 'list-item';
      }
    });
  }

  toggle.addEventListener('change', updateVisibility);
  updateVisibility();
}

loadData();
