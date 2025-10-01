export function getToken() {
    return localStorage.getItem('token');
}

export function authHeaders() {
    const t = getToken();
    return t ? { Authorization: `Bearer ${t}` } : {};
}

export async function getJSON(url, { allow401 = false } = {}) {
    const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        credentials: 'include'
    });
    
    if (!res.ok) {
        if (allow401 && res.status === 401) return null;
        const text = await res.text().catch(() => res.statusText);
        throw new Error(text);
    }
    
    const body = await res.json();
    return body?.data ?? body;
}
export function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value ?? '—';
}
export async function fetchTenantAssignmentByEmail(email) {
    try {
        const list = await getJSON('/api/addtenants');
        if (!Array.isArray(list)) return null;
        return list.find(x => 
            (x?.email || '').toLowerCase() === String(email).toLowerCase()
        ) || null;
    } catch (e) {
        console.debug('[profile modal] addtenants fetch fail:', e?.message || e);
        return null;
    }
}
export async function hydrateProfileModal() {
    try {
        let user = await getJSON('/api/auth/me', { allow401: true });
        
        if (!user) {
            const t = getToken();
            if (t && t.split('.').length >= 2) {
                const payload = JSON.parse(atob(t.split('.')[1]));
                if (payload?.email) {
                    user = {
                        name: payload.name,
                        email: payload.email,
                        role: payload.role,
                        phone: payload.phone ?? null
                    };
                }
            }
        }
        
        if (!user || !user.email) {
            throw new Error('No identity');
        }

        setText('pmName', user.name || 'User');
        setText('pmEmail', user.email);
        setText('pmRole', user.role || '—');

        const assign = await fetchTenantAssignmentByEmail(user.email);

        let phone = assign?.phone ?? user.phone ?? null;
        if (!phone) {
            try {
                const me = await getJSON('/api/customers/me/record');
                phone = me?.phone ?? phone;
            } catch {}
        }
        setText('pmPhone', phone);

        const tenantBlock = document.getElementById('pmTenantBlock');
        if (user.role === 'Tenant') {
            tenantBlock?.classList.remove('d-none');

            const property = 
                assign?.propertyName ??
                assign?.property ??
                assign?.assignedProperty ??
                assign?.unit ?? null;

            let dueAmount = (typeof assign?.rent === 'number') ? assign.rent : null;
            let paid = (typeof assign?.paid === 'boolean') ? assign.paid : null;

            if (dueAmount == null || paid == null) {
                try {
                    const c = await getJSON('/api/customers/me/record');
                    if (dueAmount == null && typeof c?.dueAmount === 'number') {
                        dueAmount = c.dueAmount;
                    }
                    if (paid == null && typeof c?.paid === 'boolean') {
                        paid = c.paid;
                    }
                } catch {}
            }

            setText('pmProperty', property);
            
            const rentText = 
                (dueAmount != null ? `A$${Number(dueAmount).toFixed(2)}` : '—') +
                (paid != null ? ` • Paid: ${paid ? 'Yes' : 'No'}` : '');
            setText('pmRent', rentText);
        } else {
            tenantBlock?.classList.add('d-none');
        }
    } catch (e) {
        console.error('[profile modal] failed:', e?.message || e);
    }
}
export function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('adminId');
    window.location.href = '/index.html';
}
export function initProfileModal() {
    document.addEventListener('DOMContentLoaded', () => {
        const modalEl = document.getElementById('profileModal');
        modalEl?.addEventListener('shown.bs.modal', hydrateProfileModal);

        document.getElementById('btnLogout')?.addEventListener('click', handleLogout);
    });
}

if (typeof window !== 'undefined' && !window.profileModalInitialized) {
    window.profileModalInitialized = true;
    initProfileModal();
}