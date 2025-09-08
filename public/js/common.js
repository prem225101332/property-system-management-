function saveToken(token) { localStorage.setItem('token', token); }
function getToken() { return localStorage.getItem('token'); }
function clearToken() { localStorage.removeItem('token'); }

async function api(url, method = 'GET', body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

function logout() { clearToken(); window.location.href = '/'; }
