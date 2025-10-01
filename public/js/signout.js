document.addEventListener('DOMContentLoaded', () => {
  const signOutLink = document.querySelector('.sign-out a, a#signout, button#signout');

  if (!signOutLink) return;

  signOutLink.addEventListener('click', async (e) => {
    e.preventDefault();

    try {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });

      window.location.replace('index.html');
    } catch (err) {
      window.location.replace('index.html');
    }
  });
});