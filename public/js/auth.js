// Authentication and User Management
class AuthManager {
  constructor() {
    this.currentUser = null;
    this.users = this.loadUsers();
    this.init();
  }

  init() {
    // Check if user is logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
    }
  }

  loadUsers() {
    const users = localStorage.getItem('users');
    if (!users) {
      // Create default admin user
      const defaultUsers = [
        {
          id: 'admin-1',
          name: 'Admin User',
          email: 'admin@property.com',
          password: 'admin123',
          role: 'Admin',
          createdAt: new Date().toISOString()
        },
        {
          id: 'tenant-1',
          name: 'John Doe',
          email: 'john@email.com',
          password: 'tenant123',
          role: 'Tenant',
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('users', JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    return JSON.parse(users);
  }

  saveUsers() {
    localStorage.setItem('users', JSON.stringify(this.users));
  }

  register(userData) {
    // Check if email already exists
    if (this.users.find(user => user.email === userData.email)) {
      throw new Error('Email already exists');
    }

    const newUser = {
      id: 'user-' + Date.now(),
      ...userData,
      createdAt: new Date().toISOString()
    };

    this.users.push(newUser);
    this.saveUsers();
    return newUser;
  }

  login(email, password) {
    const user = this.users.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    this.currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isLoggedIn() {
    return this.currentUser !== null;
  }

  hasRole(role) {
    return this.currentUser && this.currentUser.role === role;
  }

  updateProfile(userData) {
    if (!this.currentUser) throw new Error('Not logged in');
    
    const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
    if (userIndex === -1) throw new Error('User not found');

    this.users[userIndex] = { ...this.users[userIndex], ...userData };
    this.currentUser = this.users[userIndex];
    
    this.saveUsers();
    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    return this.currentUser;
  }

  getAllUsers() {
    return this.users;
  }

  createUser(userData) {
    return this.register(userData);
  }

  updateUser(userId, userData) {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error('User not found');

    this.users[userIndex] = { ...this.users[userIndex], ...userData };
    this.saveUsers();
    return this.users[userIndex];
  }

  deleteUser(userId) {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error('User not found');

    this.users.splice(userIndex, 1);
    this.saveUsers();
  }
}

// Export for use in other files
window.AuthManager = AuthManager;