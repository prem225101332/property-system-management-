document.addEventListener('DOMContentLoaded', function () {
  loadTenants();
  document.getElementById('addNewTenantBtn')?.addEventListener('click', async () => {
    openTenantModal();
    await Promise.all([loadTenantUsersIntoSelect(), loadPropertiesIntoSelect()]);
  });
  document.getElementById('tenantForm')?.addEventListener('submit', handleTenantSubmit);
  document.querySelectorAll('.close-btn').forEach((b) => b.addEventListener('click', closeTenantModal));
  document.getElementById('tenantModal')?.addEventListener('click', function (e) { if (e.target === this) closeTenantModal(); });
});

async function api(url, method = 'GET', data) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (data) opts.body = JSON.stringify(data);
  const res = await fetch(url, opts);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

async function loadTenants() {
  const tenants = await api('/api/addtenants');
  renderTenants(tenants || []);
}

function renderTenants(rows) {
  const tbody = document.getElementById('tenantsTableBody');
  if (!rows?.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No tenants found</td></tr>';
    return;
  }
  tbody.innerHTML = rows.map((t) => {
    const u = t.user || {};
    const prop = t.property || null;
    const propLabel = (prop && (prop.title || prop.name || prop.address?.line1)) || '—';
    const rent = Number(t.rent || 0);
    const status = (t.status || 'paid').toString().toLowerCase();
    return `
      <tr>
        <td>${escapeHtml(u.name || '')}</td>
        <td>${escapeHtml(u.email || '')}</td>
        <td>${escapeHtml(t.phone || '')}</td>
        <td>${escapeHtml(String(propLabel))}</td>
        <td>$${rent.toLocaleString()}</td>
        <td><span class="status-badge ${status}">${status}</span></td>
        <td class="action-buttons">
          <button class="edit-btn" data-id="${t._id || ''}" data-user="${u._id || ''}"><i class="fas fa-edit"></i> Edit</button>
          ${t._id ? `<button class="delete-btn" data-id="${t._id}"><i class="fas fa-trash"></i> Delete</button>` : ''}
        </td>
      </tr>
    `;
  }).join('');
  document.querySelectorAll('.edit-btn').forEach((btn) => {
    btn.addEventListener('click', function () {
      const assignId = this.getAttribute('data-id');
      const userId = this.getAttribute('data-user');
      editTenant(assignId, userId);
    });
  });
  document.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', function () {
      const id = this.getAttribute('data-id');
      deleteTenant(id);
    });
  });
}

function escapeHtml(s) {
  return String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function openTenantModal() {
  document.getElementById('tenantModalTitle').textContent = 'Assign/Update Tenant';
  document.getElementById('tenantForm').reset();
  document.getElementById('assignmentId').value = '';
  document.getElementById('tenantUser').disabled = false;
  document.getElementById('tenantEmailView').value = '';
  document.getElementById('tenantModal').classList.add('active');
}

function closeTenantModal() {
  document.getElementById('tenantModal').classList.remove('active');
}

async function loadPropertiesIntoSelect(selectedId = '') {
  const select = document.getElementById('tenantProperty');
  select.innerHTML = '<option value="">Loading properties…</option>';
  const data = await api('/api/properties', 'GET');
  const list = Array.isArray(data) ? data : (data.properties || data.data || []);
  if (!list.length) {
    select.innerHTML = '<option value="">No properties found</option>';
    return;
  }
  const opts = ['<option value="">Select a property</option>'];
  for (const p of list) {
    const id = p._id || p.id;
    const label = p.title || p.name || p.address?.line1 || id;
    const sel = String(selectedId) === String(id) ? ' selected' : '';
    opts.push(`<option value="${escapeHtml(String(id))}"${sel || ''}>${escapeHtml(String(label))}</option>`);
  }
  select.innerHTML = opts.join('');
}

async function loadTenantUsersIntoSelect(selectedId = '') {
  const select = document.getElementById('tenantUser');
  select.innerHTML = '<option value="">Loading tenants…</option>';
  const users = await api('/api/addtenants/tenant-users', 'GET');
  if (!users.length) {
    select.innerHTML = '<option value="">No tenants found</option>';
    return;
  }
  const opts = ['<option value="">Select a tenant</option>'];
  for (const u of users) {
    const id = u._id || u.id;
    const sel = String(selectedId) === String(id) ? ' selected' : '';
    opts.push(`<option value="${escapeHtml(String(id))}" data-email="${escapeHtml(u.email)}"${sel}>${escapeHtml(u.name)} (${escapeHtml(u.email)})</option>`);
  }
  select.innerHTML = opts.join('');
  select.addEventListener('change', function () {
    const email = this.options[this.selectedIndex]?.getAttribute('data-email') || '';
    document.getElementById('tenantEmailView').value = email;
  }, { once: true });
  if (selectedId) {
    const opt = [...select.options].find(o => String(o.value) === String(selectedId));
    if (opt) document.getElementById('tenantEmailView').value = opt.getAttribute('data-email') || '';
  }
}

async function editTenant(assignmentId, userId) {
  openTenantModal();
  await Promise.all([loadTenantUsersIntoSelect(userId), loadPropertiesIntoSelect()]);
  if (userId) {
    document.getElementById('tenantUser').value = userId;
    document.getElementById('tenantUser').disabled = true;
    const opt = document.getElementById('tenantUser').options[document.getElementById('tenantUser').selectedIndex];
    document.getElementById('tenantEmailView').value = opt?.getAttribute('data-email') || '';
  }
  if (assignmentId) {
    const t = await api(`/api/addtenants/${assignmentId}`);
    document.getElementById('assignmentId').value = t._id || '';
    document.getElementById('tenantPhone').value = t.phone || '';
    document.getElementById('tenantRent').value = t.rent ?? '';
    document.getElementById('tenantStatus').value = (t.status || 'paid').toLowerCase();
    const propertyId = (t.property && (t.property._id || t.property.id)) || '';
    if (propertyId) document.getElementById('tenantProperty').value = propertyId;
  }
}

async function handleTenantSubmit(e) {
  e.preventDefault();
  const assignmentId = document.getElementById('assignmentId').value.trim();
  const userId = document.getElementById('tenantUser').value.trim();
  const phone = document.getElementById('tenantPhone').value.trim();
  const rent = Number(document.getElementById('tenantRent').value || 0);
  const status = document.getElementById('tenantStatus').value;
  const propertyId = document.getElementById('tenantProperty').value;
  if (!userId) return alert('Select a tenant.');
  if (!(rent >= 0)) return alert('Rent must be a number.');
  if (assignmentId) {
    await api(`/api/addtenants/${assignmentId}`, 'PUT', { phone, rent, status, propertyId: propertyId || undefined });
  } else {
    await api('/api/addtenants/upsert', 'POST', { userId, phone, rent, status, propertyId: propertyId || undefined });
  }
  closeTenantModal();
  loadTenants();
}

async function deleteTenant(assignmentId) {
  if (!confirm('Remove this tenant assignment?')) return;
  await api(`/api/addtenants/${assignmentId}`, 'DELETE');
  loadTenants();
}
