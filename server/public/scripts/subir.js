    let idiomaActual = 'es'; 

    const boton = document.getElementById('subir');
    const inputArchivo = document.getElementById('archivo');
    const etiquetaArchivo = document.getElementById('etiquetaArchivo');

    inputArchivo.addEventListener('change', function () {
      const archivo = this.files[0];
      if (archivo) {
        etiquetaArchivo.textContent = archivo.name;
        boton.disabled = false;
      } else {
        etiquetaArchivo.textContent = textos[idiomaActual].ninguno;
        boton.disabled = true;
      }
    });

