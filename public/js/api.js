// ==========================
// BASE DE LA API
// ==========================
const API_BASE = '/api'; // Prefijo común para todas las rutas de la API

// ==========================
// HELPERS DE TOKEN
// ==========================

// Guardar token en localStorage y su expiración (2 horas)
function setToken(token) {
  localStorage.setItem('token', token); // Guardamos token
  const exp = Date.now() + 2 * 60 * 60 * 1000; // Tiempo de expiración: 2 horas
  localStorage.setItem('token_exp', String(exp)); // Guardamos timestamp de expiración
}

// Obtener token de localStorage y validar expiración
function getToken() {
  const t = localStorage.getItem('token'); // Obtenemos token
  const exp = Number(localStorage.getItem('token_exp') || 0); // Obtenemos expiración
  if (!t) return null; // Si no hay token, retornamos null
  if (Date.now() > exp) {
    // Si ya expiró, lo eliminamos
    localStorage.removeItem('token');
    localStorage.removeItem('token_exp');
    return null;
  }
  return t; // Retornamos token válido
}

// Limpiar token de localStorage
function clearToken() {
  localStorage.removeItem('token');
  localStorage.removeItem('token_exp');
}

// ==========================
// WRAPPER PARA FETCH
// ==========================
// Función que simplifica llamadas a la API
async function apiFetch(path, { method = "GET", body, isFormData = false } = {}) {
  const headers = {}; // Inicializamos headers
  const token = getToken(); // Obtenemos token
  if (token) headers["Authorization"] = `Bearer ${token}`; // Si hay token, lo agregamos

  let fetchBody;
  if (body) {
    if (isFormData) {
      // Si es FormData (subir archivos), se envía tal cual
      fetchBody = body;
    } else {
      // Si es JSON, se agrega header y se stringify el body
      headers["Content-Type"] = "application/json";
      fetchBody = JSON.stringify(body);
    }
  }

  // Ejecutamos la petición
  const res = await fetch(API_BASE + path, { method, headers, body: fetchBody });

  // Revisamos el tipo de contenido de la respuesta
  const contentType = res.headers.get("content-type") || "";
  let data;
  if (contentType.includes("application/json")) {
    data = await res.json(); // Parseamos JSON si aplica
  }

  // Si la respuesta no es OK, lanzamos error
  if (!res.ok) throw new Error((data && data.error) || "Error en la petición");

  return data; // Retornamos datos
}