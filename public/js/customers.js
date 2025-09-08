const showDeleted = document.getElementById('showDeleted');
const tableBody = document.querySelector('#customersTable tbody');
const tableMsg = document.getElementById('tableMsg');
const form = document.getElementById('customerForm');
const formMsg = document.getElementById('formMsg');
const formTitle = document.getElementById('formTitle');
const cancelEdit = document.getElementById('cancelEdit');
document.getElementById('logoutBtn').addEventListener('click', logout);

// protect page
if (!localStorage.getItem('token')) window.location.href = '/';

function resetForm() {
  form.reset();
  document.getElementById('customerId').value = '';
  formTitle.textContent = 'Add / Edit Customer';
  cancelEdit.classList.add('hidden');
  formMsg.textContent = '';
}

async function loadCustomers() {
  tableMsg.textContent = 'Loading...';
  tableBody.innerHTML = '';
  try {
    const list = await api('/api/customers?includeDeleted=' + (showDeleted.checked ? 'true' : 'false'));
    tableMsg.textContent = list.length ? '' : 'No customers yet.';
    for (const c of list) {
      const tr = document.createElement('tr');
      if (c.isDeleted) tr.classList.add('muted');
      tr.innerHTML = `
        <td>${c.name || ''}</td>
        <td>${c.email || ''}</td>
        <td>${c.phone || ''}</td>
        <td>${c.company || ''}</td>
        <td>${c.status || ''}</td>
        <td>$${(c.dueAmount || 0).toFixed(2)}</td>
        <td>${c.paid ? 'Paid' : 'Due'}</td>
        <td>
          <button data-id="${c._id}" class="editBtn" ${c.isDeleted ? 'disabled' : ''}>Edit</button>
          <button data-id="${c._id}" class="delBtn" ${c.isDeleted ? 'disabled' : ''}>Delete</button>
          <button data-id="${c._id}" class="dueBtn" ${c.isDeleted ? 'disabled' : ''}>Set Due</button>
        </td>`;
      tableBody.appendChild(tr);
    }
  } catch (err) { tableMsg.textContent = err.message; }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  formMsg.textContent = '';
  const id = document.getElementById('customerId').value;
  const payload = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    company: document.getElementById('company').value.trim(),
    status: document.getElementById('status').value,
    dueAmount: Number(document.getElementById('dueAmount').value || 0),
    paid: document.getElementById('paid').value === 'true'
  };
  try {
    const path = '/api/customers' + (id ? '/' + id : '');
    const method = id ? 'PUT' : 'POST';
    await api(path, method, payload);
    formMsg.textContent = id ? 'Updated' : 'Created';
    await loadCustomers();
    resetForm();
  } catch (err) { formMsg.textContent = err.message; }
});

cancelEdit.addEventListener('click', resetForm);
showDeleted.addEventListener('change', loadCustomers);

tableBody.addEventListener('click', async (e) => {
  const btn = e.target.closest('button'); if (!btn) return;
  const id = btn.getAttribute('data-id');

  if (btn.classList.contains('editBtn')) {
    try {
      const c = await api('/api/customers/' + id);
      document.getElementById('customerId').value = c._id;
      document.getElementById('name').value = c.name || '';
      document.getElementById('email').value = c.email || '';
      document.getElementById('phone').value = c.phone || '';
      document.getElementById('company').value = c.company || '';
      document.getElementById('status').value = c.status || 'Active';
      document.getElementById('dueAmount').value = c.dueAmount || 0;
      document.getElementById('paid').value = c.paid ? 'true' : 'false';
      formTitle.textContent = 'Edit Customer';
      cancelEdit.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) { tableMsg.textContent = err.message; }
  }

  if (btn.classList.contains('delBtn')) {
    if (!confirm('Soft-delete this customer?')) return;
    try { await api('/api/customers/' + id, 'DELETE'); await loadCustomers(); }
    catch (err) { tableMsg.textContent = err.message; }
  }

  if (btn.classList.contains('dueBtn')) {
    const amount = prompt('Enter due amount ($):', '0');
    if (amount === null) return;
    try { await api(`/api/customers/${id}/set-due`, 'POST', { amount }); await loadCustomers(); }
    catch (err) { alert(err.message); }
  }
});

if (!localStorage.getItem('token')) window.location.href = '/';
loadCustomers();
