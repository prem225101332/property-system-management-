document.addEventListener('DOMContentLoaded', function() {
    // Load tenants and properties
    loadTenants();
    loadPropertiesForDropdown();
    
    // Event listeners
    document.getElementById('addNewTenantBtn').addEventListener('click', openTenantModal);
    document.getElementById('tenantForm').addEventListener('submit', handleTenantSubmit);
    
    // Close modal buttons
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', closeModals);
    });
    
    // Close modal when clicking outside
    document.getElementById('tenantModal').addEventListener('click', function(e) {
        if (e.target === this) closeModals();
    });
});

// async function loadTenants() {
//     try {
//         const tenants = await api('/api/tenants');
//         renderTenants(tenants);
//     } catch (error) {
//         console.error('Error loading tenants:', error);
//         alert('Error loading tenants: ' + error.message);
//     }
// }

// async function loadPropertiesForDropdown() {
//     try {
//         const properties = await api('/api/properties');
//         const propertySelect = document.getElementById('tenantProperty');
        
//         // Clear existing options except the first one
//         while (propertySelect.options.length > 1) {
//             propertySelect.remove(1);
//         }
        
//         // Add properties to dropdown
//         properties.forEach(property => {
//             const option = document.createElement('option');
//             option.value = property._id;
//             option.textContent = `${property.title} - ${property.address}`;
//             propertySelect.appendChild(option);
//         });
//     } catch (error) {
//         console.error('Error loading properties:', error);
//     }
// }

function renderTenants(tenants) {
    const tbody = document.getElementById('tenantsTableBody');
    
    if (!tenants || tenants.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No tenants found</td></tr>';
        return;
    }
    
    tbody.innerHTML = tenants.map(tenant => `
        <tr>
            <td class="tenant-name">${tenant.name}</td>
            <td>${tenant.email}</td>
            <td>${tenant.phone}</td>
            <td>${tenant.propertyTitle || 'Not assigned'}</td>
            <td class="tenant-rent">$${tenant.rent}</td>
            <td><span class="status-badge ${tenant.status}">${tenant.status}</span></td>
            <td class="action-buttons">
                <button class="edit-btn" data-id="${tenant._id}"><i class="fas fa-edit"></i> Edit</button>
                <button class="delete-btn" data-id="${tenant._id}"><i class="fas fa-trash"></i> Delete</button>
            </td>
        </tr>
    `).join('');
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tenantId = this.getAttribute('data-id');
            editTenant(tenantId);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tenantId = this.getAttribute('data-id');
            deleteTenant(tenantId);
        });
    });
}

function openTenantModal() {
    document.getElementById('tenantModalTitle').textContent = 'Add New Tenant';
    document.getElementById('tenantForm').reset();
    document.getElementById('tenantId').value = '';
    document.getElementById('tenantModal').classList.add('active');
}

// async function editTenant(tenantId) {
//     try {
//         const tenant = await api(`/api/tenants/${tenantId}`);
        
//         document.getElementById('tenantModalTitle').textContent = 'Edit Tenant';
//         document.getElementById('tenantId').value = tenant._id;
//         document.getElementById('tenantName').value = tenant.name;
//         document.getElementById('tenantEmail').value = tenant.email;
//         document.getElementById('tenantPhone').value = tenant.phone;
//         document.getElementById('tenantProperty').value = tenant.propertyId || '';
//         document.getElementById('tenantRent').value = tenant.rent;
//         document.getElementById('tenantStatus').value = tenant.status;
        
//         document.getElementById('tenantModal').classList.add('active');
//     } catch (error) {
//         console.error('Error loading tenant:', error);
//         alert('Error loading tenant: ' + error.message);
//     }
// }

// async function handleTenantSubmit(e) {
//     e.preventDefault();
    
//     const tenantId = document.getElementById('tenantId').value;
//     const formData = {
//         name: document.getElementById('tenantName').value,
//         email: document.getElementById('tenantEmail').value,
//         phone: document.getElementById('tenantPhone').value,
//         propertyId: document.getElementById('tenantProperty').value,
//         rent: document.getElementById('tenantRent').value,
//         status: document.getElementById('tenantStatus').value
//     };
    
//     try {
//         if (tenantId) {
//             // Update existing tenant
//             await api(`/api/tenants/${tenantId}`, 'PUT', formData);
//         } else {
//             // Create new tenant
//             await api('/api/tenants', 'POST', formData);
//         }
        
//         closeModals();
//         loadTenants(); // Refresh the list
//     } catch (error) {
//         console.error('Error saving tenant:', error);
//         alert('Error saving tenant: ' + error.message);
//     }
// }

// async function deleteTenant(tenantId) {
//     if (!confirm('Are you sure you want to delete this tenant?')) return;
    
//     try {
//         await api(`/api/tenants/${tenantId}`, 'DELETE');
//         loadTenants(); // Refresh the list
//     } catch (error) {
//         console.error('Error deleting tenant:', error);
//         alert('Error deleting tenant: ' + error.message);
//     }
// }

function closeModals() {
    document.getElementById('tenantModal').classList.remove('active');
}