const UI = {
  success(msg, title = '¡Éxito!') {
    return Swal.fire({
      icon: 'success',
      title,
      text: msg,
      confirmButtonText: 'Aceptar',
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      },
      confirmButtonColor: '#6B46C1', // morado
      allowOutsideClick: false,
      allowEscapeKey: false
    });
  },
  error(msg, title = '¡Error!') {
    return Swal.fire({
      icon: 'error',
      title,
      text: msg,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#E53E3E', // rojo
      showClass: {
        popup: 'animate__animated animate__shakeX'
      },
      allowOutsideClick: false,
      allowEscapeKey: false
    });
  },
  info(msg, title = 'Información') {
    return Swal.fire({
      icon: 'info',
      title,
      text: msg,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#3182CE', // azul
      allowOutsideClick: false,
      allowEscapeKey: false
    });
  },
  confirm(msg, title = 'Confirmar') {
    return Swal.fire({
      title,
      text: msg,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
      confirmButtonColor: '#6B46C1', // morado
      cancelButtonColor: '#A0AEC0', // gris
      allowOutsideClick: false,
      allowEscapeKey: false
    });
  }
};

// Exportar global
window.UI = UI;