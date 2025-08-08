async function loadData() {
  const res = await fetch('data/seed.json');
  const data = await res.json();
  buildTree(data);
}

function buildTree(data) {
  const container = document.getElementById('tree');
  container.innerHTML = '';
  Object.keys(data).forEach(cat => {
    const catNode = document.createElement('div');
    catNode.className = 'category';
    catNode.textContent = cat;
    const list = document.createElement('ul');
    list.style.display = 'none';
    catNode.addEventListener('click', () => {
      list.style.display = list.style.display === 'none' ? 'block' : 'none';
    });
    data[cat].forEach(co => {
      const li = document.createElement('li');
      li.textContent = co.name + (co.public ? ' (Public)' : '');
      li.dataset.public = co.public;
      list.appendChild(li);
    });
    container.appendChild(catNode);
    container.appendChild(list);
  });
}

document.getElementById('toggle').addEventListener('change', e => {
  const showPublic = e.target.checked;
  document.querySelectorAll('#tree li').forEach(li => {
    if (li.dataset.public === 'true') {
      li.style.display = showPublic ? 'list-item' : 'none';
    }
  });
});

loadData();
