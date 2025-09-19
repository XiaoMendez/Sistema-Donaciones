async function loadProfile(){
  try {
    const me = await apiFetch('/users/me');
    document.getElementById('profile_name').value = me.nombre;
    document.getElementById('profile_email').value = me.email;
  } catch(err) { showError('Error', err.message); }
}