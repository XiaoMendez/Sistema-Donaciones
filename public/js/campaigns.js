// ==========================
// Código principal del Dashboard
// ==========================

// Esperamos a que todo el DOM esté cargado
document.addEventListener("DOMContentLoaded", () => {
  // Verificamos que el usuario esté logueado
  const user = Auth.requireLogin();
  if (!user) return; // Si no hay usuario, detenemos ejecución

  // Configuramos la interfaz según el rol del usuario
  setupUI(user);

  // Cargamos campañas inicialmente
  loadCampaigns();

  // Event listener para botón de búsqueda
  document.getElementById("btnSearch").addEventListener("click", loadCampaigns);

  // Event listener para cerrar sesión
  document.getElementById("btnLogout").addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
  });

  // Configurar botón de crear campaña si existe
  const btnCreate = document.getElementById("btnCreateCampaign");
  if (btnCreate) {
    btnCreate.addEventListener("click", () => {
      // Abrimos modal de creación
      const modal = new bootstrap.Modal(document.getElementById("modalCreateCampaign"));
      modal.show();

      // Asignamos función de submit al formulario
      document.getElementById("formCreateCampaign").onsubmit = createCampaign;
    });
  }

  // Configurar botón de donar si existe
  const btnDonate = document.getElementById("btnDonate");
  if (btnDonate) {
    btnDonate.addEventListener("click", () => {
      // Obtenemos el id de la campaña del dataset de la tabla de donaciones
      const campaignId = document.getElementById('donationsTableBody').dataset.campaignId;

      // Usamos SweetAlert2 para pedir monto de donación
      Swal.fire({
        title: 'Donar',
        input: 'number',
        inputLabel: 'Monto a donar ($)',
        inputAttributes: { min: 1, step: 1 },
        showCancelButton: true
      }).then(async result => {
        // Si el usuario confirma y el monto es válido
        if (result.isConfirmed && result.value > 0) {
          try {
            // Hacemos petición POST a /donations
            await apiFetch(`/donations`, {
              method: 'POST',
              body: { campana: campaignId, monto: Number(result.value) }
            });

            Swal.fire('¡Gracias!', 'Donación registrada correctamente.', 'success');

            // Actualizamos la vista de donaciones y campañas
            viewDonations(campaignId);
            loadCampaigns();
          } catch (err) {
            Swal.fire('Error', err.message || 'No se pudo registrar la donación', 'error');
          }
        }
      });
    });
  }
});

// ==========================
// Configurar UI según rol
// ==========================
function setupUI(user) {
  const btn = document.getElementById("btnCreateCampaign");
  // Solo admin u organización pueden crear campañas
  if (btn && (user.rol === "admin" || user.rol === "organizacion")) {
    btn.style.display = "inline-block";
  }
}

// ==========================
// Cargar campañas
// ==========================
async function loadCampaigns() {
  const query = document.getElementById('searchInput').value.trim(); // Valor del buscador
  try {
    const campaigns = await apiFetch(`/campaigns?search=${query}`); // Petición a API
    const container = document.getElementById('campaignsContainer');
    const user = Auth.getUser(); // Para verificar rol y propietario

    if (!campaigns.length) { 
      container.innerHTML = "<p>No hay campañas activas</p>"; 
      return; 
    }

    // Renderizamos cada campaña
    container.innerHTML = campaigns.map(c => {
      const puedeEditar = user.rol === "admin" || (user.rol === "organizacion" && c.creador === user._id);

      return `
        <div class="campaign-card">
          ${c.imagenUrl ? `<img src="${c.imagenUrl}" alt="${c.titulo}" class="img-fluid mb-2 img-campaign">` : ''}
          <h5>${c.titulo}</h5>
          <p>${c.descripcion}</p>
          <p><strong>Meta:</strong> $${c.metaMonetario}</p>
          <p><strong>Recaudado:</strong> $${c.totalDonacionesAceptadas || 0}</p>
          <div class="d-flex gap-2 mt-2">
            ${puedeEditar ? `<button class="btn btn-sm btn-primary" onclick="editCampaign('${c._id}')">Editar</button>` : ''}
            <button class="btn btn-sm btn-warning" onclick="viewDonations('${c._id}')">Ver donaciones</button>
            <button class="btn btn-sm btn-morado" onclick="donateCampaign('${c._id}')">Donar</button>
          </div>
        </div>
      `;
    }).join('');
  } catch(err) {
    Swal.fire('Error', err.message || 'No se pudieron cargar las campañas', 'error');
  }
}

// ==========================
// Ver donaciones de una campaña
// ==========================
async function viewDonations(campaignId) {
  try {
    const donations = await apiFetch(`/campaigns/${campaignId}/donations`);
    const tbody = document.getElementById('donationsTableBody');
    tbody.dataset.campaignId = campaignId;
    const user = Auth.getUser();

    // Renderizamos cada donación
    tbody.innerHTML = donations.map(d => `
      <tr>
        <td>${d.usuario}</td>
        <td>$${d.monto}</td>
        <td>${new Date(d.fecha).toLocaleDateString()}</td>
        <td>${d.estado}</td>
        <td>
          ${(d.estado === 'pendiente' && (user.rol === 'admin' || user.rol === 'organizacion')) ? `
            <button class="btn btn-sm btn-success" onclick="updateDonation('${d._id}', 'aceptada')">Aceptar</button>
            <button class="btn btn-sm btn-danger" onclick="updateDonation('${d._id}', 'rechazada')">Rechazar</button>
          ` : ''}
        </td>
      </tr>
    `).join('');

    // Abrimos modal de donaciones
    new bootstrap.Modal(document.getElementById('modalDonations')).show();
  } catch(err) {
    Swal.fire('Error', err.message || 'No se pudieron cargar las donaciones', 'error');
  }
}

// ==========================
// Actualizar estado de una donación
// ==========================
async function updateDonation(donationId, estado) {
  try {
    await apiFetch(`/donations/${donationId}`, {
      method: 'PUT',
      body: { estado }
    });
    Swal.fire('Listo', `Donación ${estado.toLowerCase()} correctamente`, 'success');
    const campaignId = document.getElementById('donationsTableBody').dataset.campaignId;
    viewDonations(campaignId); // Refrescar tabla
    loadCampaigns(); // Refrescar campañas
  } catch(err) {
    Swal.fire('Error', err.message || 'No se pudo actualizar la donación', 'error');
  }
}

// ==========================
// Donar a una campaña
// ==========================
async function donateCampaign(campaignId) {
  Swal.fire({
    title: 'Donar',
    input: 'number',
    inputLabel: 'Monto a donar ($)',
    inputAttributes: { min: 1, step: 1 },
    showCancelButton: true
  }).then(async result => {
    if (result.isConfirmed && result.value > 0) {
      try {
        await apiFetch(`/donations`, {
          method: 'POST',
          body: { campana: campaignId, monto: Number(result.value) }
        });
        Swal.fire('¡Gracias!', 'Donación registrada correctamente.', 'success');
        loadCampaigns();
      } catch (err) {
        Swal.fire('Error', err.message || 'No se pudo registrar la donación', 'error');
      }
    }
  });
}

// ==========================
// Editar campaña
// ==========================
async function editCampaign(id) {
  try {
    const camp = await apiFetch(`/campaigns/${id}`);
    
    // Rellenar formulario del modal
    document.getElementById("editCampaignId").value = camp._id;
    document.getElementById("editTitulo").value = camp.titulo;
    document.getElementById("editDescripcion").value = camp.descripcion;
    document.getElementById("editMeta").value = camp.metaMonetario;

    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById("modalEditCampaign"));
    modal.show();

    // Asignamos función al submit del formulario
    document.getElementById("formEditCampaign").onsubmit = async (e) => {
      e.preventDefault();
      try {
        const formData = new FormData();
        formData.append("titulo", document.getElementById("editTitulo").value);
        formData.append("descripcion", document.getElementById("editDescripcion").value);
        formData.append("metaMonetario", document.getElementById("editMeta").value);

        const file = document.getElementById("editImagen").files[0];
        if (file) formData.append("imagen", file);

        await apiFetch(`/campaigns/${id}`, {
          method: "PUT",
          body: formData,
          isFormData: true
        });

        Swal.fire("¡Listo!", "Campaña actualizada correctamente", "success");
        modal.hide();
        loadCampaigns();
      } catch (err) {
        Swal.fire("Error", err.message || "No se pudo actualizar la campaña", "error");
      }
    };
  } catch (err) {
    Swal.fire("Error", err.message || "No se pudo obtener la campaña", "error");
  }
}

// ==========================
// Limpieza al cerrar cualquier modal
// ==========================
document.addEventListener("hidden.bs.modal", function () {
  document.body.classList.remove("modal-open");
  document.querySelectorAll(".modal-backdrop").forEach(el => el.remove());
});

// ==========================
// Búsqueda con Enter
// ==========================
document.getElementById("searchInput").addEventListener("keypress", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    loadCampaigns();
  }
});