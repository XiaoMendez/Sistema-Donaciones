// ==========================
// OBJETO AUTH
// ==========================
// Contiene métodos para registro, login, logout y gestión de usuario
const Auth = {
  // ==========================
  // REGISTRO DE USUARIO
  // ==========================
  async register(e) {
    e.preventDefault(); // Evita que el formulario se envíe de forma tradicional

    // Obtenemos valores de los campos del formulario
    const nombre = document.getElementById("regNombre").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regClave").value.trim();
    const rol = document.getElementById("regRol").value;
    const adminCode = document.getElementById("regAdminCode")?.value.trim(); // Solo si existe el campo

    try {
      // Llamada a la API para registrar usuario
      await apiFetch('/auth/register', {
        method: 'POST',
        body: { nombre, email, password, rol, adminCode }
      });

      // Mostrar mensaje de éxito con SweetAlert2
      await Swal.fire({
        icon: 'success',
        title: 'Registro exitoso',
        text: 'Ahora puedes iniciar sesión'
      });

      // Redirigir a página de login
      window.location.href = '/login.html';
    } catch (err) {
      console.error("❌ Error registro:", err);
      Swal.fire({ icon: 'error', title: 'Error', text: err.message });
    }
  },

  // ==========================
  // LOGIN DE USUARIO
  // ==========================
  async login(e) {
    e.preventDefault(); // Evita recarga de la página

    // Obtenemos valores de los campos del formulario
    const email = document.getElementById("logEmail").value.trim();
    const password = document.getElementById("logClave").value.trim();

    try {
      // Llamada a la API para login
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: { email, password }
      });

      // Guardamos token y usuario en localStorage
      setToken(data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Mensaje de bienvenida
      await Swal.fire({
        icon: 'success',
        title: 'Bienvenido',
        text: `Hola ${data.user.nombre}`
      });

      // Redirigir a dashboard
      window.location.href = '/dashboard.html';
    } catch (err) {
      console.error("❌ Error login:", err);
      Swal.fire({ icon: 'error', title: 'Error', text: err.message });
    }
  },

  // ==========================
  // LOGOUT
  // ==========================
  logout() {
    clearToken(); // Limpiar token de localStorage
    localStorage.removeItem("user"); // Limpiar info de usuario

    // Mostrar mensaje de sesión cerrada y redirigir a login
    Swal.fire({ icon: 'info', title: 'Sesión cerrada' }).then(() => {
      window.location.href = '/login.html';
    });
  },

  // ==========================
  // OBTENER USUARIO ACTUAL
  // ==========================
  getUser() {
    try {
      // Parseamos el usuario desde localStorage
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null; // Si hay error, retornamos null
    }
  },

  // ==========================
  // REQUERIR LOGIN
  // ==========================
  requireLogin() {
    const user = this.getUser(); // Obtenemos usuario
    if (!user) {
      // Si no hay usuario, mostramos advertencia y redirigimos a login
      Swal.fire({
        icon: "warning",
        title: "Acceso restringido",
        text: "Debes iniciar sesión para acceder a esta página",
        confirmButtonText: "Ir a login"
      }).then(() => {
        window.location.href = "/login.html";
      });
      throw new Error("Usuario no autenticado"); // Detenemos ejecución
    }
    return user; // Retornamos usuario si existe
  }
};

// ==========================
// EVENTOS DE FORMULARIOS
// ==========================
// Registro
document.getElementById("formRegister")?.addEventListener("submit", e => Auth.register(e));
// Login
document.getElementById("formLogin")?.addEventListener("submit", e => Auth.login(e));

// Mostrar u ocultar campo de código admin según rol seleccionado
document.getElementById("regRol")?.addEventListener("change", e => {
  const adminWrap = document.getElementById("adminCodeWrap"); // Contenedor del input
  if (e.target.value === "admin") adminWrap.classList.remove("hidden"); // Mostrar
  else adminWrap.classList.add("hidden"); // Ocultar
});
