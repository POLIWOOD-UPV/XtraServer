/*
Javascript general del ranking
*/


const socket = io();

// ——— Variables globales de visibilidad y contadores ———
let controla_pilotos = 0;
let logos_visibles   = true;
let despegues_visibles = true;
let dorsal_visible   = false;
let peso_visible     = false;
let tiempo_visible   = true;
let dot_visible   = true;

let equiposJSON;
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
    await cogerDorsales(); // Cargamos los dorsales
    await cogerEquipos();
});

// COGER DATOS

// Equipos
function cogerEquipos() {
  // Cogemos los equipos del servidor
  fetch("http://localhost/v2/entities?type=Equipo&limit=40")
  .then(res =>{
      if (!res.ok)  throw new Error("No se pudo coger los equipos del servidor")
          return res.json()
  })
  .then(json =>{
      equiposJSON = json
  })
}


// Dorsales
async function cogerDorsales() {
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

// Funciones utiles
// Parser para mensajes de rankingTest
function parseRanking(msg) {
  const { acr, pos, tiempo, peso, despegue } = msg;
  return [ acr, tiempo, peso, despegue ];
}

// Convierte un string de tiempo (MM:SS:ms o HH:MM:SS) a milisegundos
function convertirTiempoAMilisegundos(t) {
  const partes = t.split(':').map(Number);
  if (partes.length === 3) {
    // Formato MM:SS:ms → minutos, segundos y milisegundos
    return (partes[0] * 60 + partes[1]) * 1000 + partes[2];
  }
  if (partes.length === 2) {
    // Formato SS:ms → segundos y milisegundos
    return partes[0] * 1000 + partes[1];
  }
  // Si llega ya en ms como número puro
  return Number(t);
}

// FILAS ENTRYPOINT
function sumaPiloto(piloto, pos, tiempo, peso, estado, despegue) {
    console.log("SumaPiloto");
    if (piloto === "WOOD") {return} // Evitamos el de POLIWOOD
    // 1) Creamos la fila
    let nueva_fila = creaFila(piloto, pos, tiempo, peso, despegue);
    ++controla_pilotos;

    // 2) Buscamos en el JSON el equipo cuyo acrónimo coincide con 'piloto'
    const equipoData = equiposJSON.find(e => e.acr.value === piloto);

    // 3) Seleccionamos el contenedor según acad.value
    const uniCont = document.getElementById("filasUni");
    const clubCont = document.getElementById("filasClub");
    let destino;
    if (equipoData && equipoData.acad.value === true) {
      destino = uniCont;
    } else if (equipoData && equipoData.acad.value === false) {
      destino = clubCont;
    } else {
      // fallback: si no lo encuentra, lo metemos en el contenedor genérico
      destino = document.getElementById("contenedor");
    }

    meter_en_ranking(nueva_fila);

    // 5) Animaciones según 'estado'
    switch (estado) {
      case "animado":
        nueva_fila.style.left = "-500px";
        setTimeout(() => { nueva_fila.style.left = "0px"; }, 50);
        break;
      case "seco":
        nueva_fila.style.left = "0px";
        break;
      default:
        nueva_fila.style.left = "-500px";
        setTimeout(() => { nueva_fila.style.left = "0px"; }, 50);
    }
}

// Listener principal de socket
// Listener principal de socket
socket.on("message", async (msg) => {
  // Test de ranking
  if (typeof msg !== "string" && msg?.tipo === "rankingTest") {
    // 1) Parsear datos
    const [acr, tiempo, peso, despegue] = parseRanking(msg);

    // 2) Determinar contenedor y tipo
    const equipoData = equiposJSON.find(e => e.acr.value === acr);
    const esUni = equipoData && equipoData.acad.value === true;
    const cont = document.getElementById(esUni ? "filasUni" : "filasClub");

    // 3) Construir selector dinámico y extraer filas
    const selector = esUni ? ".filaUni" : ".filaClub";
    const filasExistentes = Array.from(cont.querySelectorAll(selector));
    
    // 4) Calcular posición según tiempo
    const pos = sacar_pos_piloto(tiempo, filasExistentes);
    // 5) Llamar a sumaPiloto con 'pos' ya calculado
    sumaPiloto(acr, pos, tiempo, peso, "animado", despegue);
    return
  }

  // Ronda -> pedimos la activa
  if (msg.includes("urn:ngsi-ld:Ronda:")) {
    await actualizarRondaActiva();
  }

  // Animaciones -> Pedimos las animaciones
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

