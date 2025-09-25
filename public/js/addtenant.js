document.addEventListener('DOMContentLoaded', function () {
  loadTenants();

  document.getElementById('addNewTenantBtn')?.addEventListener('click', async () => {
    openTenantModal();
    await loadPropertiesIntoSelect(); 
  });

  document.getElementById('tenantForm')?.addEventListener('submit', handleTenantSubmit);

  document.querySelectorAll('.close-btn').forEach((btn) => btn.addEventListener('click', closeTenantModal));
  document.getElementById('tenantModal')?.addEventListener('click', function (e) {
    if (e.target === this) closeTenantModal();
  });
});


function openTenantModal() {
  document.getElementById('tenantModalTitle').textContent = 'Add New Tenant';
  document.getElementById('tenantForm').reset();
  document.getElementById('tenantId').value = '';
  document.getElementById('tenantModal').classList.add('active'); // matches your CSS pattern
}

function closeTenantModal() {
  document.getElementById('tenantModal').classList.remove('active');
}