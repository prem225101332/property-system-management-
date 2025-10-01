(function () {
  const tokenKey = 'authToken';
  const token = localStorage.getItem(tokenKey);

  const $prop = document.getElementById('propSelect');
  const $category = document.getElementById('category');
  const $severity = document.getElementById('severity');
  const $description = document.getElementById('description');
  const $submit = document.getElementById('submitBtn');
  const $msg = document.getElementById('msg');
  const $tbody = document.querySelector('#issuesTable tbody');

  async function loadProperties() {
    const res = await fetch('/api/properties?status=AVAILABLE', { headers: { 'Content-Type':'application/json' } });
    const items = res.ok ? await res.json() : [];
    $prop.innerHTML = `<option value="">-- None --</option>` + items.map(p => `<option value="${p._id}">${escapeHtml(p.title || p?.address?.line1 || 'Property')}</option>`).join('');
  }

const propertyCache = new Map();

async function getPropertyLabelById(id) {
  if (!id) return '';
  if (propertyCache.has(id)) return propertyCache.get(id);

  let label = id; 
  try {
    const res = await fetch(`/api/properties/${id}`, { headers: { 'Content-Type': 'application/json' } });
    if (res.ok) {
      const json = await res.json().catch(() => null);

      const doc =
        (json && json.data && (Array.isArray(json.data) ? json.data[0] : json.data)) ||
        (json && !json.ok ? json : null) ||
        json;

      if (doc && typeof doc === 'object') {
        label = doc.title || doc.name || (doc.address && doc.address.line1) || id;
      }
    }
  } catch (e) {
    console.error(`Failed to fetch property ${id}:`, e);
  }

  propertyCache.set(id, label);
  return label;
}

async function loadIssues() {
  const res = await fetch('/api/issues', { headers: { 'Content-Type':'application/json' } });
  const json = res.ok ? await res.json() : null;
  const items = (json && json.ok) ? json.data : [];

  $tbody.innerHTML = '';

  const uniquePropIds = [...new Set(items.map(it => it.property).filter(Boolean))];
  await Promise.all(uniquePropIds.map(getPropertyLabelById));

  for (const it of items) {
    const tr = document.createElement('tr');
    const created = it.createdAt ? new Date(it.createdAt).toLocaleString() : '';
    const propLabel = await getPropertyLabelById(it.property); // cached if already fetched

    tr.innerHTML = `
      <td>${escapeHtml(created)}</td>
      <td>${escapeHtml(propLabel)}</td>
      <td>${escapeHtml(it.category)}</td>
      <td>${escapeHtml(it.severity)}</td>
      <td>${escapeHtml(it.status)}</td>
      <td>${escapeHtml(it.description)}</td>
    `;
    $tbody.appendChild(tr);
  }
}


  async function submitIssue() {
    const payload = {
      property: $prop.value || undefined,
      category: $category.value,
      severity: $severity.value,
      description: $description.value.trim()
    };
    if (!payload.description) {
      $msg.textContent = 'Description is required.';
      return;
    }
    const res = await fetch('/api/issues', {
      method: 'POST',
      headers: {
        'Content-Type':'application/json',
      },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      $msg.textContent = 'Issue submitted';
      $description.value = '';
      await loadIssues();
    } else {
      const e = await res.json().catch(() => ({}));
      $msg.textContent = e.message || 'Failed to submit issue';
    }
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
  }

  $submit.addEventListener('click', submitIssue);

  loadProperties();
  loadIssues();
})();
