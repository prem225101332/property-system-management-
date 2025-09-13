document.addEventListener('DOMContentLoaded', function() {
    // Load properties
    loadProperties();
    
    // Event listeners
    document.getElementById('addNewPropertyBtn').addEventListener('click', openPropertyModal);
    document.getElementById('propertyForm').addEventListener('submit', handlePropertySubmit);
    
    // Close modal buttons
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', closeModals);
    });
    
    // Close modal when clicking outside
    document.getElementById('propertyModal').addEventListener('click', function(e) {
        if (e.target === this) closeModals();
    });
});

// async function loadProperties() {
//     try {
//         const properties = await api('/api/properties');
//         renderProperties(properties);
//     } catch (error) {
//         console.error('Error loading properties:', error);
//         alert('Error loading properties: ' + error.message);
//     }
// }

function renderProperties(properties) {
    const tbody = document.getElementById('propertiesTableBody');
    
    if (!properties || properties.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No properties found</td></tr>';
        return;
    }
    
    tbody.innerHTML = properties.map(property => `
        <tr>
            <td><img src="${property.image || 'https://via.placeholder.com/60x40'}" alt="Property" class="property-image"></td>
            <td class="property-title">${property.title}</td>
            <td>${property.address}</td>
            <td class="property-price">$${property.price}</td>
            <td><span class="status-badge ${property.status}">${property.status}</span></td>
            <td class="action-buttons">
                <button class="edit-btn" data-id="${property._id}"><i class="fas fa-edit"></i> Edit</button>
                <button class="delete-btn" data-id="${property._id}"><i class="fas fa-trash"></i> Delete</button>
            </td>
        </tr>
    `).join('');
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const propertyId = this.getAttribute('data-id');
            editProperty(propertyId);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const propertyId = this.getAttribute('data-id');
            deleteProperty(propertyId);
        });
    });
}

function openPropertyModal() {
    document.getElementById('propertyModalTitle').textContent = 'Add New Property';
    document.getElementById('propertyForm').reset();
    document.getElementById('propertyId').value = '';
    document.getElementById('propertyModal').classList.add('active');
}

// async function editProperty(propertyId) {
//     try {
//         const property = await api(`/api/properties/${propertyId}`);
        
//         document.getElementById('propertyModalTitle').textContent = 'Edit Property';
//         document.getElementById('propertyId').value = property._id;
//         document.getElementById('propertyTitle').value = property.title;
//         document.getElementById('propertyAddress').value = property.address;
//         document.getElementById('propertyPrice').value = property.price;
//         document.getElementById('propertyStatus').value = property.status;
//         document.getElementById('propertyImage').value = property.image || '';
        
//         document.getElementById('propertyModal').classList.add('active');
//     } catch (error) {
//         console.error('Error loading property:', error);
//         alert('Error loading property: ' + error.message);
//     }
// }

// async function handlePropertySubmit(e) {
//     e.preventDefault();
    
//     const propertyId = document.getElementById('propertyId').value;
//     const formData = {
//         title: document.getElementById('propertyTitle').value,
//         address: document.getElementById('propertyAddress').value,
//         price: document.getElementById('propertyPrice').value,
//         status: document.getElementById('propertyStatus').value,
//         image: document.getElementById('propertyImage').value
//     };
    
//     try {
//         if (propertyId) {
//             // Update existing property
//             await api(`/api/properties/${propertyId}`, 'PUT', formData);
//         } else {
//             // Create new property
//             await api('/api/properties', 'POST', formData);
//         }
        
//         closeModals();
//         loadProperties(); // Refresh the list
//     } catch (error) {
//         console.error('Error saving property:', error);
//         alert('Error saving property: ' + error.message);
//     }
// }

// async function deleteProperty(propertyId) {
//     if (!confirm('Are you sure you want to delete this property?')) return;
    
//     try {
//         await api(`/api/properties/${propertyId}`, 'DELETE');
//         loadProperties(); // Refresh the list
//     } catch (error) {
//         console.error('Error deleting property:', error);
//         alert('Error deleting property: ' + error.message);
//     }
// }

function closeModals() {
    document.getElementById('propertyModal').classList.remove('active');
}