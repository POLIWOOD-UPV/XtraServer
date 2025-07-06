const socket = io();

// ——— Variables globales de visibilidad y contadores ———
let controla_pilotos = 0;
let logos_visibles   = true;
let despegues_visibles = true;
let dorsal_visible   = false;
let peso_visible     = false;
let tiempo_visible   = true;

// Mapeo dinámico de dorsales y categoría académica
const valores_dorsal = {};
const equiposAcademicos = new Set();

// DOM
const contenedor = document.getElementById("contenedor");

// Cabeceras
const cabTie  = document.getElementById("cab_tie");
const cabLog  = document.getElementById("cab_log");
const cabDor  = document.getElementById("cab_dor");
const cabPes  = document.getElementById("cab_pes");

// Arrays
const filas = Array.from(document.querySelectorAll(".fila"));

// Flags de interfaz
let ranking_visible = true;
let filas_visible   = true;

// Pedimos la ronda activa al cargar
// Mostramos siempre el número de ronda actual
document.addEventListener("DOMContentLoaded", async () => {
    await actualizarRondaActiva(); // Mostramos la ronda al arrancar
    await sacaDorsales(); // Cargamos los dorsales
});

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

window.toggleRanking       = toggleRanking;
window.toggleFilas         = toggleFilas;
window.toggleSoloFilas     = toggleSoloFilas;
window.mostrarSoloFilas    = mostrarSoloFilas;
window.aparicionDinamica   = aparicionDinamica;
window.desaparicionDinamica= desaparicionDinamica;

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

// Parser para mensajes de rankingTest
function parseRanking(msg) {
  const { acr, pos, tiempo, peso, despegue } = msg;
  return [ acr, pos, tiempo, peso, despegue ];
}

// aplica la visibilidad según  NGSI
function applyAnimVisibility(state) {

  const tiempoEls = Array.from(document.querySelectorAll(".tiempo"));
  const logoEls   = Array.from(document.querySelectorAll(".logo"));
  const dorsalEls = Array.from(document.querySelectorAll(".dorsal"));
  const pesoEls   = Array.from(document.querySelectorAll(".peso"));
  const dotEls    = Array.from(document.querySelectorAll(".dot"));

  // Cabeceras (clases abarcan tanto bloque Universitarios como Clubes)
  const cabTieElems  = Array.from(document.querySelectorAll(".cab_tie"));
  const cabLogElems  = Array.from(document.querySelectorAll(".cab_log"));
  const cabDorElems  = Array.from(document.querySelectorAll(".cab_dor"));
  const cabPesElems  = Array.from(document.querySelectorAll(".cab_pes"));

  const tiempo_visible      = state.tiempos?.value   === "visible";
  const logos_visibles      = state.logos?.value     === "visible";
  const dorsal_visible      = state.dorsales?.value  === "visible";
  const peso_visible        = state.pesos?.value     === "visible";
  const despegues_visible   = state.cronos?.value    === "visible";

  // —— Cabeceras ——
  cabTieElems.forEach(el => el.style.display = tiempo_visible    ? "block" : "none");
  cabLogElems.forEach(el => el.style.display = logos_visibles    ? "flex"  : "none");
  cabDorElems.forEach(el => el.style.display = dorsal_visible    ? "flex"  : "none");
  cabPesElems.forEach(el => el.style.display = peso_visible      ? "flex"  : "none");

  // —— Celdas ——
  tiempoEls.forEach(el => el.style.display = tiempo_visible     ? "block" : "none");
  logoEls.forEach(el   => el.style.display = logos_visibles     ? "flex"  : "none");
  dorsalEls.forEach(el => el.style.display = dorsal_visible     ? "flex"  : "none");
  pesoEls.forEach(el   => el.style.display = peso_visible       ? "flex"  : "none");
  dotEls.forEach(el    => el.style.display = despegues_visible  ? "flex"  : "none");
}


// Listener principal de socket
socket.on("message", async (msg) => {
  // Procesar objetos de prueba rankingTest
  if (typeof msg !== "string") {
    if (msg?.tipo === "rankingTest") {
      const [ acr, pos, tiempo, peso, despegue ] = parseRanking(msg);
      // Mantén tu llamada a sumaPiloto con animado
      sumaPiloto(acr, pos, tiempo, peso, "animado", despegue);
    }
    return;
  }

  // Si el mensaje es de tipo Ronda, pedimos la activa
  if (msg.includes("urn:ngsi-ld:Ronda:")) {
    await actualizarRondaActiva();
  }

    // 3) Actualizaciones de visibilidad (Animaciones)
  if (msg.includes("urn:ngsi-ld:Animaciones:001")) {
    try {
      const state = await fetch("/v2/entities/urn:ngsi-ld:Animaciones:001")
                          .then(r => r.json());
      applyAnimVisibility(state);
    } catch (err) {
      console.error("Error actualizando visibilidad de Animaciones:", err);
    }
    return;
  }
});


// Inserta la fila ordenada en contenedor único
function meter_en_ranking(nueva_fila) {
  const ranking = document.getElementById("contenedor");
  const filas = Array.from(ranking.querySelectorAll(".fila"));
  const pos   = parseInt(nueva_fila.querySelector(".numero").textContent, 10);
  const ocupa = filas.some(f => parseInt(f.id,10)===pos);
  if (ocupa) {
    // Inserta y reindexa
    const antes   = filas.slice(0, pos-1),
          despues = filas.slice(pos-1),
          todas   = [...antes, nueva_fila, ...despues];
    todas.forEach((f,i)=>{
      f.id = `${i+1}`;
      f.querySelector(".numero").textContent = i+1;
    });
    const frag = document.createDocumentFragment();
    frag.append(document.getElementById("cabeza"));
    todas.forEach(f => frag.append(f));
    ranking.innerHTML = "";
    ranking.append(frag);
  } else {
    // Al final\    ranking.appendChild(nueva_fila);
    Array.from(ranking.querySelectorAll(".fila")).forEach((f,i)=>{
      f.id = `${i+1}`;
      f.querySelector(".numero").textContent = i+1;
    });
  }
}


//  sumaPiloto
function sumaPiloto(piloto,pos,tiempo,peso,estado,despegue) {
    console.log("SumaPiloto");
    let nueva_fila = creaFila(piloto,pos, tiempo,peso,despegue);
    ++controla_pilotos;
    //   meter_en_ranking(nueva_fila);
    const ranking = document.getElementById("contenedor");
    ranking.appendChild(nueva_fila)

    switch (estado){
    case "animado":
        nueva_fila.style.left = "-500px";
        setTimeout(() => { nueva_fila.style.left = "0px"; }, 50);
        break;
    case "seco":
        nueva_fila.style.left = "0px";
        break;
    }
}


async function sacaDorsales() {
  try {
    const res = await fetch("/v2/entities?type=Equipo&limit=100");
    const lista = await res.json();
    lista.forEach(e => {
      const acr = e.acr?.value;
      const dor = e.dorsal?.value;
      if (acr != null && dor != null) {
        valores_dorsal[acr] = dor;
        if (e.acad?.value) equiposAcademicos.add(acr);
      }
    });
  } catch (err) {
    console.error("Error cargando equipos NGSI:", err);
  }
}

// ——— Funciones de construcción de fila ———
function creaFila(nom, pos, tiemp, pes, despegue) {
    // Creamos la fila con sus partes
    const fila = document.createElement("div");
    fila.className = "fila";
    
    // Número
    const numero = document.createElement("div");
    numero.className = "numero";
    numero.textContent = pos;
    // Si es un club, que el número sea de otro color
    if (nom === "XALOC" || nom.startsWith("EAFT")) {
        numero.style.backgroundColor = "rgb(70 157 243)";
        numero.style.color = "white";
    }

    // Zona de contenido (logo, nombre, tiempo, peso, despegue)
    const resto = document.createElement("div");
    resto.className = "resto";

    // Nombre
    const nombre = document.createElement("div");
    nombre.className = "nombre";
    nombre.textContent = nom;

    // Logo dinámico
    const logo = meterLogos(nom);
    if (logos_visibles) logo.style.display = "flex";
    else            logo.style.display = "none";

    // Dorsal dinámico
    const dor = meterDorsal(nom);
    if (dorsal_visible) dor.style.display = "flex";
    else               dor.style.display = "none";

    // Tiempo
    const tiempoDiv = document.createElement("div");
    tiempoDiv.className = "tiempo";
    tiempoDiv.textContent = tiemp;
    tiempoDiv.style.display = tiempo_visible ? "block" : "none";

    // Peso
    const pesoDiv = document.createElement("div");
    pesoDiv.className = "peso";
    pesoDiv.textContent = pes;
    pesoDiv.style.display = peso_visible ? "flex" : "none";

    // Despegue (círculo coloreado)
    const dot = document.createElement("span");
    dot.className = "dot";
    const colorMap = {
      "Corto":      "#9000ff",
      "Correcto":   "#0dff00",
      "Ilegal":     "#ff0000",
      "Pendiente":  "#ffffff",
      "Fallido":    "#E6FE00"
    };
    dot.style.backgroundColor = colorMap[despegue] || "#ffffff";
    dot.style.display = despegues_visibles ? "flex" : "none";

    // Montamos el resto
    resto.append(dor, nombre, tiempoDiv, pesoDiv, dot);
    fila.append(numero, logo, resto);

    // Prepara para animar (sale desde la izquierda)
    fila.style.left = "-500px";
    return fila;
}

function meterLogos(nom) {
  const div = document.createElement("div");
  div.className = "logo";
  div.style.display = logos_visibles ? "flex" : "none";
  let key = nom.startsWith("SAET") ? "SAETA"
          : nom.startsWith("EAFT") ? "FlyEagle"
          : nom;
  const img = document.createElement("img");
  img.src = `./img/LogosPNG/${key}.png`;
  div.append(img);
  return div;
}
function meterDorsal(nom) {
  const div = document.createElement("div");
  div.className = "dorsal";
  div.style.display = dorsal_visible ? "flex" : "none";
  div.textContent = valores_dorsal[nom] || "";
  return div;
}

