/*
Javascript para mostrar / ocultar elementos
*/

// Funciones de Nuria para mover las filas del ranking

function toggleSoloFilas() {
  const cantidad = filas.length;
  if (filas_visible) {
    let i = 1;
    const salir = setInterval(() => {
      if (i <= cantidad) {
        filas[cantidad - i].style.left = "-1200px";
        i++;
      } else {
        clearInterval(salir);
      }
    }, 150);
    filas_visible = false;
  } else {
    let i = 0;
    const entrar = setInterval(() => {
      if (i < cantidad) {
        filas[i].style.left = "0px";
        i++;
      } else {
        clearInterval(entrar);
      }
    }, 150);
    filas_visible = true;
  }
}

function mostrarSoloFilas() {
  const cantidad = filas.length;
  let i = 0;
  const entrar = setInterval(() => {
    if (i < cantidad) {
      filas[i].style.left = "0px";
      i++;
    } else {
      clearInterval(entrar);
    }
  }, 150);
  filas_visible = true;
}

// Dinámicas usadas finalmente
function aparicionDinamica() {
  if (!ranking_visible) {
    filas_visible = false;
    ranking_visible = false;
    toggleRanking();
  }
}

function desaparicionDinamica() {
  if (ranking_visible) {
    filas_visible = true;
    toggleFilas();
  }
}


// — Funciones de animación y dinámica —
function toggleRanking() {
  if (ranking_visible) {
    contenedor.style.left = "-600px";
    ranking_visible = false;
  } else {
    contenedor.style.left = "0px";
    ranking_visible = true;
    if (!filas_visible) toggleFilas();
  }
}

function toggleFilas() {
  const cantidad = filas.length;
  if (filas_visible) {
    let i = 1;
    const salir = setInterval(() => {
      if (i <= cantidad) {
        filas[cantidad - i].style.left = "-1200px";
        i++;
      } else {
        clearInterval(salir);
        toggleRanking();
      }
    }, 150);
    filas_visible = false;
  } else {
    if (!ranking_visible) toggleRanking();
    let i = 0;
    const entrar = setInterval(() => {
      if (i < cantidad) {
        filas[i].style.left = "0px";
        i++;
      } else {
        clearInterval(entrar);
      }
    }, 150);
    filas_visible = true;
  }
}

window.toggleRanking       = toggleRanking;
window.toggleFilas         = toggleFilas;
window.toggleSoloFilas     = toggleSoloFilas;
window.mostrarSoloFilas    = mostrarSoloFilas;
window.aparicionDinamica   = aparicionDinamica;
window.desaparicionDinamica= desaparicionDinamica;


// Funcion para aplicar visibilidad a las columnas del ranking segun NGSI
function applyAnimVisibility(state) {
  // —— Filas ——  
  const tiempoEls    = [...document.querySelectorAll(".tiempo")];
  const logoEls      = [...document.querySelectorAll(".logo")];
  const dorsalEls    = [...document.querySelectorAll(".dorsal")];
  const pesoEls      = [...document.querySelectorAll(".peso")];
  const dotEls       = [...document.querySelectorAll(".dot")];
  const numeroEls    = [...document.querySelectorAll(".numero")];
  const nombreEls    = [...document.querySelectorAll(".nombre")];

  // —— Cabeceras ——  
  const cabTieElems  = [...document.querySelectorAll(".cab_tie")];
  const cabLogElems  = [...document.querySelectorAll(".cab_log")];
  const cabDorElems  = [...document.querySelectorAll(".cab_dor")];
  const cabPesElems  = [...document.querySelectorAll(".cab_pes")];
  const cabPosElems  = [...document.querySelectorAll(".cab_pos")];
  const cabNomElems  = [...document.querySelectorAll(".cab_nom")];

  // —— Estados desde la entidad Animaciones ——  
  const tiempoVisible = state.tiempos?.value   === "visible";
  const logosVisible  = state.logos?.value     === "visible";
  const dorsalVisible = state.dorsales?.value  === "visible";
  const pesoVisible   = state.pesos?.value     === "visible";
  const despeguesVis  = state.cronos?.value    === "visible";
  const posVisible    = state.pos?.value       === "visible";
  const nombreVisible = state.nombre?.value    === "visible";
  const dotVisible    = state.dot?.value       === "visible";

  // —— Mostrar/ocultar cabeceras ——  
  cabTieElems.forEach(el => el.style.display = tiempoVisible ? "" : "none");
  cabLogElems.forEach(el => el.style.display = logosVisible  ? "flex" : "none");
  cabDorElems.forEach(el => el.style.display = dorsalVisible ? "flex" : "none");
  cabPesElems.forEach(el => el.style.display = pesoVisible   ? "flex" : "none");
  cabPosElems.forEach(el => el.style.display = posVisible    ? "" : "none");
  cabNomElems.forEach(el => el.style.display = nombreVisible ? "" : "none");
  // Si tuvieras header para dot:
  // cabDotElems.forEach(el => el.style.display = dotVisible ? "" : "none");

  // —— Mostrar/ocultar filas ——  
  tiempoEls.forEach(el => el.style.display = tiempoVisible ? "" : "none");
  logoEls.forEach(el   => el.style.display = logosVisible  ? "flex" : "none");
  dorsalEls.forEach(el => el.style.display = dorsalVisible ? "flex" : "none");
  pesoEls.forEach(el   => el.style.display = pesoVisible   ? "flex" : "none");
  dotEls.forEach(el    => el.style.display = dotVisible    ? "" : "none");
  numeroEls.forEach(el => el.style.display = posVisible    ? "" : "none");
  nombreEls.forEach(el => el.style.display = nombreVisible ? "" : "none");
}


