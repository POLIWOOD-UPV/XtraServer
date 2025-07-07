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
    await cogerEquipos();
    await actualizarRondaActiva(); // Mostramos la ronda al arrancar
    await cogerDorsales(); // Cargamos los dorsales

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
    // 1) Obtener todas las rondas
    const resRondas = await fetch("/v2/entities?type=Ronda&limit=40");
    if (!resRondas.ok) throw new Error(resRondas.statusText);
    const rondas = await resRondas.json();

    // 2) Encontrar la activa
    const activa = rondas.find(r => r.actv?.value === 1);

    // 3) Si no hay, limpio y salgo
    if (!activa) {
      rondaActual = "-";
      document.getElementById("num_ronda").textContent = "-";
      document.getElementById("filasUni").innerHTML  = "";
      document.getElementById("filasClub").innerHTML = "";
      window.__procesados = new Set();   // también limpio el set
      return;
    }

    // 4) Muestro la ronda y limpio filas
    rondaActual = activa.num?.value ?? "-";
    document.getElementById("num_ronda").textContent = rondaActual;
    document.getElementById("filasUni").innerHTML  = "";
    document.getElementById("filasClub").innerHTML = "";

    // 5) Reseteo el set de ya procesados
    window.__procesados = new Set();

    // 6) Traer y filtrar cronos CIRC
    const resCronos = await fetch(`/v2/entities?type=Crono&q=ronda==${rondaActual}&limit=100`);
    if (!resCronos.ok) throw new Error(resCronos.statusText);
    let cronos = (await resCronos.json()).filter(c => c.tipo.value === "CIRC");

    // 7) Ordenar por tiempo ascendente
    cronos.sort((a, b) =>
      (a.stop.value - a.start.value) - (b.stop.value - b.start.value)
    );

    // 8) Procesar uno a uno
    for (const cronoData of cronos) {
      const equipoNum = cronoData.equipo.value;
      const equipoStr = String(equipoNum).padStart(2, "0");
      const key       = `${rondaActual}-${equipoStr}`;
      const fichaId   = `urn:ngsi-ld:Ficha:${key}`;
      const vueloId   = `urn:ngsi-ld:Vuelo:${key}`;

      try {
        const [resFicha, resVuelo] = await Promise.all([
          fetch(`/v2/entities/${fichaId}`),
          fetch(`/v2/entities/${vueloId}`)
        ]);
        if (!resFicha.ok || !resVuelo.ok) {
          console.warn(`Falta Ficha o Vuelo para ${key}`);
          continue;
        }
        const [fichaData, vueloData] = await Promise.all([
          resFicha.json(),
          resVuelo.json()
        ]);

        await procesarRanking({
          tipo:  "ngsiRanking",
          crono: cronoData,
          ficha: fichaData,
          vuelo: vueloData
        });

        // Pequeña pausa para que el DOM reordene
        await new Promise(r => setTimeout(r, 30));
      } catch (err) {
        console.error(`Error cargando datos para ${key}:`, err);
      }
    }

  } catch (err) {
    console.error("Error al obtener ronda activa:", err);
  }
}




// Funciones utiles
// Parser los mensajes que nos llegan
function parseRanking(msg) {
  // ——— Flujo NGSI ———
  if (msg.tipo === "ngsiRanking") {
    const { crono, ficha, vuelo } = msg;

    // 1) Acrónimo según dorsal
    const dorsal    = ficha.equipo.value;
    const equipoEnt = equiposJSON.find(e => e.dorsal.value === dorsal);
    const acr       = equipoEnt?.acr.value ?? String(dorsal);

    // 2) Tiempo en ms (stop - start)
    const rawMs     = crono.stop.value - crono.start.value;

    // 3) Peso resultante del vuelo
    const peso      = vuelo.carga.value;

    // 4) Despegue: si no aterrizó, "Fallido", si no, mapeo 0–3 a distancia
    let despegueStr;
    if (!vuelo.aterrizaje.value) {
      despegueStr = "Fallido";
    } else {
      const distMap = {
        0: "60m",
        1: "40m",
        2: "20m",
        3: "15m"
      };
      despegueStr = distMap[ficha.despegue.value] ?? `${ficha.despegue.value}m`;
    }

    return [acr, rawMs, peso, despegueStr];
  }

  // ——— Flujo clásico rankingTest ———
  const { acr, tiempo, peso, despegue } = msg;

  // convertir "M:SS" o "M:SS:cs" a ms
  let rawMs;
  if (typeof tiempo === "number") {
    rawMs = tiempo;
  } else {
    const parts = String(tiempo).split(":").map(Number);
    if (parts.length === 2) {
      const [m, s] = parts;
      rawMs = (m * 60 + s) * 1000;
    } else if (parts.length === 3) {
      const [m, s, c] = parts;
      rawMs = (m * 60 + s) * 1000 + c;
    } else {
      console.warn("Tiempo con formato inesperado en rankingTest:", tiempo);
      rawMs = 0;
    }
  }

  return [acr, rawMs, peso, despegue];
}


// Convierte un string de tiempo (MM:SS:ms o HH:MM:SS) a milisegundos
function convertirTiempoAMilisegundos(t) {
  if (typeof t === "number") return t;
  if (typeof t !== "string") return 0;
  const parts = t.split(":").map(Number);
  if (parts.length === 2) {
    const [m, s] = parts;
    return (m * 60 + s) * 1000;
  } else if (parts.length === 3) {
    const [m, s, c] = parts;
    return (m * 60 + s) * 1000 + c;
  } else {
    console.error("Formato inesperado:", t);
    return 0;
  }
}



// FILAS ENTRYPOINT
function sumaPiloto(piloto, pos, rawMs, tiempoStr, peso, estado, despegue) {
    if (piloto === "WOOD") {return} // Evitamos el de POLIWOOD
    // 1) Creamos la fila
    const nueva_fila = creaFila(piloto, pos, rawMs, tiempoStr, peso, despegue);
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


async function procesarRanking(msg) {
  // 0) Clave única por ronda-equipo
  let idKey;
  if (msg.tipo === "ngsiRanking") {
    const r = msg.ficha.ronda.value;
    const e = String(msg.ficha.equipo.value).padStart(2, "0");
    idKey = `${r}-${e}`;
  } else {
    idKey = msg.acr;
  }

  // Si ya procesado, salimos
  if (window.__procesados.has(idKey)) return;
  window.__procesados.add(idKey);

  // 1) Extraer datos
  const [acr, rawMs, peso, despegueStr] = parseRanking(msg);

  // 2) Formatear tiempo
  const m  = Math.floor(rawMs / 60000);
  const s  = Math.floor((rawMs % 60000) / 1000);
  const cs = Math.floor((rawMs % 1000) / 10);
  const tiempoStr = `${m}:${String(s).padStart(2,"0")}:${String(cs).padStart(2,"0")}`;

  // 3) Elegir contenedor
  const equipoData = equiposJSON.find(e => e.acr.value === acr);
  const esUni      = equipoData?.acad.value === true;
  const cont       = document.getElementById(esUni ? "filasUni" : "filasClub");
  const selector   = esUni ? ".filaUni" : ".filaClub";

  // 4) Quitar la fila previa de este acrónimo
  const previa = Array.from(cont.querySelectorAll(selector))
                      .find(f => f.querySelector(".nombre").textContent === acr);
  if (previa) previa.remove();

  // 5) Pequeño delay para que el DOM procese el remove
  await new Promise(r => setTimeout(r, 20));

  // 6) Recolectar filas limpias y calcular posición
  const filasExistentes = Array.from(cont.querySelectorAll(selector));
  const pos = sacar_pos_piloto(rawMs, filasExistentes);

  // 7) Insertar y animar
  setTimeout(() => {
    sumaPiloto(acr, pos, rawMs, tiempoStr, peso, "animado", despegueStr);
  }, 50);
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
