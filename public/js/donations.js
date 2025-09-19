// ==========================
// Función genérica para hacer fetch al backend
// ==========================
async function apiFetch(endpoint, options = {}) {
  // Tomamos el token del localStorage
  const token = localStorage.getItem("token");
  const headers = options.headers || {};

  // Si no es FormData y no es GET, agregamos Content-Type JSON
  if (!options.isFormData && options.method && options.method.toUpperCase() !== "GET") {
    headers["Content-Type"] = "application/json";
  }

  // Construimos el body dependiendo si es GET o FormData
  const body = options.method && options.method.toUpperCase() !== "GET" 
    ? (options.isFormData ? options.body : JSON.stringify(options.body || {}))
    : undefined;

  // Hacemos la petición fetch
  const res = await fetch("/api" + endpoint, {
    ...options,
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : undefined // Incluimos token si existe
    },
    body
  });

  // Si la respuesta no es ok, lanzamos error con mensaje del backend
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || "Error en la petición");
  }

  // Retornamos el JSON de la respuesta
  return res.json();
}

// ==========================
// Decodifica token JWT para obtener info del usuario
// ==========================
function getUserInfo() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    // Extraemos el payload del JWT y lo parseamos
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return null; // Si el token es inválido, devolvemos null
  }
}

// ==========================
// Cargar donaciones del usuario
// ==========================
async function loadDonations() {
  try {
    // Petición al endpoint que devuelve las donaciones del usuario logueado
    const donations = await apiFetch("/donations/mine", { method: "GET" });
    const container = document.getElementById("donationsContainer");
    const user = getUserInfo(); // Obtenemos información del usuario desde el token

    // Si no hay donaciones, mostramos mensaje
    if (!donations.length) {
      container.innerHTML = "<p>No tienes donaciones registradas.</p>";
      return;
    }

    // Renderizamos cada donación
    container.innerHTML = donations.map(d => {
      let statusBtns = "";
      // Mostrar botones solo si el usuario es admin o creador de la campaña
      if (user && (user.rol === "admin" || user._id === d.campana.creador)) {
        statusBtns = `
          <!-- Aquí podrían ir botones de aceptar/rechazar donación -->
        `;
      }

      return `
        <div class="donation-card">
          <h5>Campaña: ${d.campana.titulo}</h5>
          <p>Monto: $${d.monto}</p>
          <p>Estado: <strong>${d.estado}</strong></p>
          <p>Fecha: ${new Date(d.createdAt).toLocaleString()}</p>
          ${d.campana.imagen ? `<img src="${window.location.origin}/uploads/${d.campana.imagen}" class="img-fluid mt-2" alt="Imagen">` : ""}
          ${statusBtns}
        </div>
      `;
    }).join("");
  } catch (err) {
    console.error(err);
    const container = document.getElementById("donationsContainer");
    container.innerHTML = "<p>Error cargando donaciones.</p>";
    Swal.fire("¡Error!", err.message || "No se pudieron cargar las donaciones", "error");
  }
}

// ==========================
// Cambiar estado de una donación
// ==========================
async function changeStatus(donationId, estado) {
  try {
    // Llamada al endpoint para actualizar estado
    await apiFetch(`/donations/${donationId}`, {
      method: "PUT",
      body: { estado }
    });
    Swal.fire("¡Éxito!", `Donación ${estado}.`, "success");

    // Recargamos donaciones después del cambio
    loadDonations();
  } catch (err) {
    console.error(err);
    Swal.fire("Error", err.message || "No se pudo actualizar el estado", "error");
  }
}

// ==========================
// Evento DOMContentLoaded
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  // Si no hay token, redirigimos a login
  if (!token) {
    Swal.fire("Acceso denegado", "Debes iniciar sesión para ver tus donaciones", "warning").then(() => {
      window.location.href = "login.html";
    });
    return;
  }

  // Cargamos las donaciones
  loadDonations();

  // Evento de logout
  document.getElementById("btnLogout")?.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
  });
});
