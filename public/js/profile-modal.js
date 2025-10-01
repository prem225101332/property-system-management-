function getToken() {
    return localStorage.getItem('token');
  }
  
  function authHeaders() {
    const t = getToken();
    return t ? { Authorization: `Bearer ${t}` } : {};
  }
  
  async function getJSON(url, { allow401 = false } = {}) {
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
  
  function setText(id, v) {
    const el = document.getElementById(id);
    if (el) el.textContent = v ?? '—';
  }
  
  async function hydrateProfileModal() {
    try {
      let user = await getJSON('/api/auth/me', { allow401: true });
      
      if (!user) {
        const t = getToken();
        if (t && t.split('.').length >= 2) {
          const p = JSON.parse(atob(t.split('.')[1]));
          if (p?.email) {
            user = {
              name: p.name,
              email: p.email,
              role: p.role,
              phone: p.phone ?? null
            };
          }
        }
      }
      
      if (!user || !user.email) throw new Error('No identity');
  
      setText('pmName', user.name || 'User');
      setText('pmEmail', user.email);
      setText('pmRole', user.role || '—');
  
      let phone = user.phone ?? null;
      try {
        const me = await getJSON('/api/customers/me/record');
        phone = phone ?? me?.phone ?? null;
      } catch {}
      setText('pmPhone', phone);
  
      const tenantBlock = document.getElementById('pmTenantBlock');
      if (user.role === 'Tenant') {
        tenantBlock?.classList.remove('d-none');
  
        let property = user.property ?? null;
        let dueAmount = null, paid = null;
  
        try {
          const c = await getJSON('/api/customers/me/record');
          if (c) {
            property = property ?? c.propertyName ?? c.property ?? null;
            if (typeof c.dueAmount === 'number') dueAmount = c.dueAmount;
            if (typeof c.paid === 'boolean') paid = c.paid;
          }
        } catch {}
  
        if (!property) {
          try {
            const list = await getJSON('/api/addtenants');
            const match = Array.isArray(list)
              ? list.find(x => (x.email || '').toLowerCase() === (user.email || '').toLowerCase())
              : null;
            if (match) {
              property = match.propertyName || match.property || property;
              if (typeof match.rent === 'number') dueAmount = match.rent;
            }
          } catch {}
        }
  
        setText('pmProperty', property);
        const rentText = (dueAmount != null ? `A$${Number(dueAmount).toFixed(2)}` : '—')
          + (paid != null ? ` • Paid: ${paid ? 'Yes' : 'No'}` : '');
        setText('pmRent', rentText);
      } else {
        tenantBlock?.classList.add('d-none');
      }
    } catch (e) {
      console.error('[profile modal] failed:', e?.message || e);
    }
  }
  
  function initProfileModal() {
    document.addEventListener('DOMContentLoaded', () => {
      const modalEl = document.getElementById('profileModal');
      modalEl?.addEventListener('shown.bs.modal', hydrateProfileModal);
  
      document.getElementById('btnLogout')?.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = '/index.html';
      });
    });
  }
initProfileModal();