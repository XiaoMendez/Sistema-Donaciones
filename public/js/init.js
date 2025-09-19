// ==========================
// Script de inicialización de la sesión
// ==========================

(function() {
  // Lista de páginas que requieren que el usuario esté logueado
  const protectedPages = ['/dashboard.html', '/profile.html', '/']; // Puedes ajustar según tu proyecto

  // Obtenemos la ruta actual de la página
  const path = window.location.pathname;

  // Tomamos el token y su expiración del localStorage
  const token = localStorage.getItem('token');
  const exp = Number(localStorage.getItem('token_exp') || 0);

  // Comprobamos si la página actual es protegida
  if (protectedPages.includes(path) || path === '/index.html') {

    // Si no hay token, mostramos alerta y redirigimos a login
    if (!token) {
      Swal.fire('Acceso', 'Debes iniciar sesión', 'info')
        .then(() => window.location.href = '/login.html');

    // Si la sesión ha expirado según la fecha de expiración guardada
    } else if (Date.now() > exp) {
      Swal.fire('Sesión', 'Tu sesión ha caducado', 'warning')
        .then(() => {
          // Limpiamos token y expiración, luego redirigimos
          localStorage.removeItem('token');
          localStorage.removeItem('token_exp');
          window.location.href = '/login.html';
        });
    }
  }
})();