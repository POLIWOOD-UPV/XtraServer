const socket = io();


// DOM
const contenedor = document.getElementById("contenedor");
const filas = Array.from(document.querySelectorAll(".fila"));

// Flags
let ranking_visible = true;
let filas_visible = true;


// Pedimos la ronda activa al cargar
document.addEventListener("DOMContentLoaded", async () => {
  await actualizarRondaActiva(); // Mostramos la ronda al arrancar
});



// Funciones nuria dinamicas
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

// NUEVA función: mover solo las filas, sin afectar al contenedor
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


// Dinamicas usadas finalmente
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


window.toggleRanking = toggleRanking;
window.toggleFilas = toggleFilas;
window.toggleSoloFilas = toggleSoloFilas;
window.mostrarSoloFilas = mostrarSoloFilas;
window.aparicionDinamica = aparicionDinamica;
window.desaparicionDinamica = desaparicionDinamica;

window.addEventListener("message", (event) => {
if (event.data === "ocultarRanking") desaparicionDinamica();
if (event.data === "mostrarRanking") aparicionDinamica();

if (event.data?.tipo === "ronda") {
    document.getElementById("num_ronda").textContent = event.data.numero;
}
});


// Actualiza la ronda activa en pantalla
async function actualizarRondaActiva() {
  try {
    // Pedimos las rondas al broker
    const res = await fetch("/v2/entities?type=Ronda&limit=40");
    const rondas = await res.json();

    // Buscamos la ronda con actv = 1
    const activa = rondas.find(r => r.actv?.value == 1);

    // Si hay una ronda activa, la mostramos
    if (activa) {
      const num = activa.num?.value ?? "-";
      document.getElementById("num_ronda").textContent = num;
    }
  } catch (err) {
    console.error("Error al obtener ronda activa:", err);
  }
}


socket.on("message", async (msg) => {
  // Si el mensaje es de tipo Ronda, pedimos la activa
  if (msg.includes("urn:ngsi-ld:Ronda:")) {
    await actualizarRondaActiva();
  }
});