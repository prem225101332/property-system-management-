const cName = document.getElementById('cName');
const cEmail = document.getElementById('cEmail');
const cCompany = document.getElementById('cCompany');
const cDue = document.getElementById('cDue');
const cPaid = document.getElementById('cPaid');
const payBox = document.getElementById('payBox');
const paidCheck = document.getElementById('paidCheck');
const markPaidBtn = document.getElementById('markPaidBtn');
const payMsg = document.getElementById('payMsg');

document.getElementById('logoutBtn').addEventListener('click', logout);

// protect page
if (!localStorage.getItem('token')) window.location.href = '/';

async function loadMyRecord() {
  try {
    const me = await api('/api/customers/me/record');
    cName.textContent = me.name || '';
    cEmail.textContent = me.email || '';
    cCompany.textContent = me.company || '';
    cDue.textContent = (me.dueAmount || 0).toFixed(2);
    cPaid.textContent = me.paid ? 'Paid' : 'Due';

    if ((me.dueAmount || 0) > 0 && !me.paid) {
      payBox.classList.remove('hidden');
    } else {
      payBox.classList.add('hidden');
    }
  } catch (err) {
    payMsg.textContent = err.message || 'Could not load record';
  }
}

markPaidBtn.addEventListener('click', async () => {
  if (!paidCheck.checked) return alert('Please tick the checkbox to confirm payment.');
  payMsg.textContent = '';
  try {
    const updated = await api('/api/customers/me/mark-paid', 'POST');
    cPaid.textContent = updated.paid ? 'Paid' : 'Due';
    payBox.classList.add('hidden');
    alert('Marked as paid! This will show as Paid for the admin.');
  } catch (err) { payMsg.textContent = err.message; }
});

loadMyRecord();
