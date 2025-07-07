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
let rondaActual;

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
// let ranking_visible = true; en rankingDinamicas para evitar problemas de cache bla bla bla
let filas_visible   = true;

// Pedimos la ronda activa al cargar
// Mostramos siempre el número de ronda actual
document.addEventListener("DOMContentLoaded", async () => {
    await actualizarRondaActiva(); // Mostramos la ronda al arrancar
    await cogerDorsales(); // Cargamos los dorsales
    await cogerEquipos();

    // Coger los vuelos de esta ronda
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
      rondaActual = num
      document.getElementById("num_ronda").textContent = num;
    }
  } catch (err) {
    console.error("Error al obtener ronda activa:", err);
  }
}

// Funciones utiles
// Parser para mensajes de rankingTest
// Nuevo parseRanking que entiende el mensaje NGSI/
function parseRanking(msg) {
  // ——— Flujo NGSI ———
  if (msg.tipo === "ngsiRanking") {
    const { crono, ficha, vuelo } = msg;

    // 1) Acrónimo
    const dorsal    = ficha.equipo.value;
    const equipoEnt = equiposJSON.find(e => e.dorsal.value === dorsal);
    const acr       = equipoEnt?.acr.value ?? String(dorsal);

    // 2) Tiempo en ms
    const tiempoMs = crono.stop.value - crono.start.value;

    // 3) Peso: sólo el resultante del vuelo
    const peso = vuelo.carga.value;

    // 4) Despegue
    let despegueStr;
    if (!vuelo.aterrizaje.value) {
      despegueStr = "Fallido";
    } else {
      // keys 0–3 según los 4 tipos de distancia
      const distMap = {
        0: "60m",
        1: "40m",
        2: "20m",
        3: "15m"
      };
      const code = ficha.despegue.value;
      despegueStr = distMap[code] ?? `${code}m`;
    }

    return [acr, tiempoMs, peso, despegueStr];
  }

  // ——— Flujo clásico rankingTest ———
  const { acr, tiempo, peso, despegue } = msg;
  return [acr, tiempo, peso, despegue];
}


// Convierte un string de tiempo (MM:SS:ms o HH:MM:SS) a milisegundos
function convertirTiempoAMilisegundos(t) {
  // 0) Si ya es número, lo devolvemos (flujo NGSI)
  if (typeof t === "number") {
    return t;
  }

  // 1) Si no es string, advertimos y devolvemos 0
  if (typeof t !== "string") {
    console.warn("convertirTiempoAMilisegundos recibió:", t);
    return 0;
  }

  // 2) Partimos por ":" y convertimos a números
  const parts = t.split(":").map(Number);
  let ms = 0; 

  // 3) MM:SS
  if (parts.length === 2) {
    const [m, s] = parts;
    ms = (m * 60 + s) * 1000;

  // 4) MM:SS:cs (centisegundos o milisegundos)
  } else if (parts.length === 3) {
    const [m, s, c] = parts;
    ms = (m * 60 + s) * 1000 + c;

  // 5) Formato inesperado
  } else {
    console.error("Formato de tiempo inesperado en convertirTiempoAMilisegundos:", t);
  }

  return ms;
}


// FILAS ENTRYPOINT
function sumaPiloto(piloto, pos, tiempo, peso, estado, despegue) {
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


function procesarRanking(msg) {
  // 1) Parsear datos
  const [acr, rawMs, peso, despegueStr] = parseRanking(msg);

  // 1b) Formatear rawMs → "M:SS:ms"
  const m  = Math.floor(rawMs / 60000);
  const s  = Math.floor((rawMs % 60000) / 1000);
  const ms = Math.floor((rawMs % 1000) / 10);
  const tiempoStr = `${m}:${String(s).padStart(2, "0")}:${String(ms).padStart(2, "0")}`;

  // —— Log de depuración —— 
  console.log("Datos parseados para ranking:", {
    acr,
    tiempo: tiempoStr,
    peso,
    despegue: despegueStr
  });

  // 2) Determinar contenedor y selector
  const equipoData = equiposJSON.find(e => e.acr.value === acr);
  const esUni      = equipoData?.acad.value === true;
  const cont       = document.getElementById(esUni ? "filasUni" : "filasClub");
  const selector   = esUni ? ".filaUni" : ".filaClub";

  // 3) Eliminar fila previa
  const previa = Array.from(cont.querySelectorAll(selector))
                      .find(f => f.querySelector(".nombre").textContent === acr);
  if (previa) previa.remove();

  // 4) Re-extraer filas limpias
  const filasExistentes = Array.from(cont.querySelectorAll(selector));

  // 5) Calcular posición (se pasa rawMs para comparar en ms)
  const pos = sacar_pos_piloto(rawMs, filasExistentes);

  // 6) Insertar/animar: aquí uso tiempoStr para mostrar
  sumaPiloto(acr, pos, tiempoStr, peso, "animado", despegueStr);
}


socket.on("message", async (msg) => {

  // ——— rankingTest (objeto) ———
  if (typeof msg === "object" && msg?.tipo === "rankingTest") {
    procesarRanking(msg);
    return;
  }

  // ——— Todas las notificaciones NGSI ———
  if (typeof msg === "string" && msg.startsWith("!entity")) {
    // 1) Separamos acción y URN completo
    const [action, fullId] = msg.split(" ");
    console.log("MSG NGSI:", action, fullId);

    // 2) Obtenemos entityType y tail
    const colonSegs  = fullId.split(":");
    const entityType = colonSegs[2];           // Crono | Ficha | Vuelo | Ronda | Animaciones
    const tail       = colonSegs[3] || "";      // "1-04-CIRC", "1-04", "6", "001", etc.
    const [rondaMSG, equipoMSG] = tail.split("-");
    const idKey      = (rondaMSG && equipoMSG) ? `${rondaMSG}-${equipoMSG}` : null;

    switch (entityType) {

      case "Crono":
        try {
          // Cogemos el crono que se ha actualizado
          const resCrono  = await fetch(`/v2/entities/${fullId}`);
          if (!resCrono.ok) throw new Error(resCrono.statusText);
          const cronoData = await resCrono.json();

          // Procesamos si es tipo CIRC
          if (cronoData.tipo?.value !== "CIRC") {
            console.log(`Crono ${fullId} no es CIRC, se ignora.`);
            return;
          }

          // Pedimos la ficha y vuelo de ese equipo y ronda
          const fichaId = `urn:ngsi-ld:Ficha:${rondaMSG}-${equipoMSG}`;
          const vueloId = `urn:ngsi-ld:Vuelo:${rondaMSG}-${equipoMSG}`;

          const [resFicha, resVuelo] = await Promise.all([
            fetch(`/v2/entities/${fichaId}`),
            fetch(`/v2/entities/${vueloId}`)
          ]);
          if (!resFicha.ok) throw new Error(`Ficha ${resFicha.statusText}`);
          if (!resVuelo.ok) throw new Error(`Vuelo ${resVuelo.statusText}`);
          
          // Pasamos a JSON para trabajar
          const [fichaData, vueloData] = await Promise.all([
            resFicha.json(),
            resVuelo.json()
          ]);

          // Lo mandamos a procesar
          procesarRanking({
            tipo: "ngsiRanking",
            crono:  cronoData,
            ficha:  fichaData,
            vuelo:  vueloData
          });

        } catch (err) {
          console.error("Error en flujo Crono→Ficha/Vuelo:", err);
        }
        break;

      case "Ronda":
        // — Actualizamos la ronda activa —
        await actualizarRondaActiva();
        break;

      case "Animaciones":
        // — Actualizamos visibilidad de animaciones —
        try {
          const anim = await fetch(`/v2/entities/${fullId}`).then(r => r.json());
          applyAnimVisibility(anim);
        } catch (err) {
          console.error("Error NGSI Animaciones:", err);
        }
        break;

      default:
        // — Ignoramos otros entity types —
        console.debug(`IGNORED NGSI ${action} de ${entityType}`);
    }

    return;
  }

  // ——— Otros mensajes ———
  console.warn("Mensaje no reconocido:", msg);
});
