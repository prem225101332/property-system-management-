class AuthManager {
  constructor() {
    this.currentUser = null;
    this.token = null;
    this.init();
  }

  init() {
    const savedUser = localStorage.getItem('currentUser');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) {
      this.currentUser = JSON.parse(savedUser);
      this.token = savedToken;
    }
  }

  async login(email, password) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Login failed');
    }

    const data = await res.json();
    this.currentUser = data.user;
    this.token = data.token;
    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    localStorage.setItem('token', this.token);
    localStorage.setItem('userId', this.currentUser._id);
    return this.currentUser;
  }

  logout() {
    this.currentUser = null;
    this.token = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isLoggedIn() {
    return !!this.currentUser;
  }

  hasRole(role) {
    return this.currentUser && this.currentUser.role === role;
  }
}


export default AuthManager;
