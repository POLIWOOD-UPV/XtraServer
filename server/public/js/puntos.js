const MAX_EQUIPOS_COLUMNA = 15;
const TABLA_HEADERS = ["Logo", "No.", "Team", "Points"];
const LOGO_FALLBACK = "/img/Equipos/default.png";
const API_URL = "/api/puntos";
const REFRESH_MS = 600000;           // auto-refresco periódico de los puntos (10 min)
const SENAL_RECARGA = "recargar-puntos"; // señal manual emitida desde control

// Visibilidad controlada por la entidad Animaciones (atributo "puntos")
const ATTRIBUTE_NAME = "puntos";
const contenedor = document.getElementById("contenedor_puntos");
const socket = typeof io === "function" ? io() : null;

// Mapeo de nombres de equipos a sus alias para buscar imágenes
const TEAM_ALIASES = {
  "AEROCOSMOS": "AERCO",
  "Aurora UPV": "AURA",
  "DESDENTAO": "DSDTA",
  "ECLift": "ECL",
  "SAETA HALCÓN": "SAETA",
  "SAKA": "SAKA",
  "Trencalòs Team": "TRENC",
  "UCA&AIR 1": "UA1",
  "UCA&AIR 2": "UA2",
  "Velair UPV": "VLAIR",
  "Zenit UPV": "ZENIT",
  "EQUIPO XALOC GUARDO": "GUARD",
  "EQUIPO XALOC VALENCIA": "VLC",
  "Flying Pigs": "FLYPG",
  "Sky Dragons": "SYDRG"
};

// Carpeta específica para ciertos clubes
const CLUBES_FOLDER = new Set(["FLYPG", "GUARD", "SYDRG", "VLC"]);

// ─────────────────────────────────────────────
//  STATE
// ─────────────────────────────────────────────
let equipos = [];
let pointsData = {};

// ─────────────────────────────────────────────
//  UTILITY FUNCTIONS
// ─────────────────────────────────────────────

/**
 * Obtiene el alias de un equipo basándose en su nombre
 * @param {string} teamName - Nombre del equipo
 * @returns {string} Alias del equipo o primeros 5 caracteres en mayúsculas
 */
function getTeamImageAlias(teamName) {
  return TEAM_ALIASES[teamName] || teamName.substring(0, 5).toUpperCase();
}

/**
 * Determina la carpeta donde se encuentra la imagen del equipo
 * @param {string} alias - Alias del equipo
 * @returns {string} "Clubes" o "Equipos"
 */
function getTeamImageFolder(alias) {
  return CLUBES_FOLDER.has(alias) ? "Clubes" : "Equipos";
}

/**
 * Normaliza el número de dorsal a formato de 2 dígitos
 * @param {string|number} dorsal - Dorsal del jugador
 * @returns {string} Dorsal normalizado con ceros a la izquierda
 */
function normalizarDorsal(dorsal) {
  const numero = Number(dorsal);
  if (Number.isNaN(numero)) {
    return String(dorsal ?? "");
  }
  return String(numero).padStart(2, "0");
}

/**
 * Crea una tabla HTML con los datos de los equipos
 * @param {Array} listaEquipos - Array de equipos con logo, dorsal, nombre y puntos
 * @returns {HTMLTableElement} Elemento table con los datos
 */
function crearTabla(listaEquipos) {
  const table = document.createElement("table");
  table.className = "tabla-puntos";

  // Crear encabezados
  const thead = document.createElement("thead");
  const trHead = document.createElement("tr");
  TABLA_HEADERS.forEach((header) => {
    const th = document.createElement("th");
    th.textContent = header;
    trHead.appendChild(th);
  });
  thead.appendChild(trHead);

  // Crear filas de datos
  const tbody = document.createElement("tbody");
  listaEquipos.forEach((equipo) => {
    const tr = document.createElement("tr");

    // Celda con logo
    const tdLogo = document.createElement("td");
    const img = document.createElement("img");
    img.src = equipo.logo;
    img.className = "team-logo";
    img.onerror = () => { img.src = LOGO_FALLBACK; };
    tdLogo.appendChild(img);

    // Celda con dorsal
    const tdDorsal = document.createElement("td");
    tdDorsal.textContent = normalizarDorsal(equipo.dorsal);

    // Celda con nombre
    const tdNombre = document.createElement("td");
    tdNombre.textContent = equipo.nombre;

    // Celda con puntos
    const tdPuntos = document.createElement("td");
    tdPuntos.textContent = String(equipo.puntos);

    tr.appendChild(tdLogo);
    tr.appendChild(tdDorsal);
    tr.appendChild(tdNombre);
    tr.appendChild(tdPuntos);
    tbody.appendChild(tr);
  });

  table.appendChild(thead);
  table.appendChild(tbody);
  return table;
}

/**
 * Renderiza los equipos en el contenedor, manejando una o dos columnas según la cantidad
 */
function renderEquipos() {
  const grid = document.getElementById("tablas-grid");
  if (!grid) return;

  grid.innerHTML = "";

  // Si no hay equipos, mostrar una sola columna vacía
  if (equipos.length === 0) {
    grid.classList.remove("modo-dos");
    grid.classList.add("modo-una");
    return;
  }

  // Si caben en una columna, mostrar una
  if (equipos.length <= MAX_EQUIPOS_COLUMNA) {
    grid.classList.remove("modo-dos");
    grid.classList.add("modo-una");
    grid.appendChild(crearTabla(equipos));
    return;
  }

  // Si no caben, dividir en dos columnas
  grid.classList.remove("modo-una");
  grid.classList.add("modo-dos");

  const primeraColumna = equipos.slice(0, MAX_EQUIPOS_COLUMNA);
  const segundaColumna = equipos.slice(MAX_EQUIPOS_COLUMNA);

  grid.appendChild(crearTabla(primeraColumna));
  grid.appendChild(crearTabla(segundaColumna));
}

// ─────────────────────────────────────────────
//  API & DATA LOADING
// ─────────────────────────────────────────────

/**
 * Carga los datos de equipos y puntos desde la API
 */
async function cargarDatos() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();

    // Cargar datos de puntos si existen
    if (data.publications && data.publications.points) {
      pointsData = data.publications.points;
    }

    // Procesar y renderizar equipos
    if (data.teams && Array.isArray(data.teams)) {
      equipos = data.teams.map(team => {
        const alias = getTeamImageAlias(team.name);
        const folder = getTeamImageFolder(alias);
        return {
          logo: `/img/${folder}/${alias}.png`,
          dorsal: team.dorsal,
          nombre: team.name,
          puntos: pointsData[team.id] ?? pointsData[team.dorsal] ?? 0
        };
      });

      renderEquipos();
    }
  } catch (error) {
    console.error("Error cargando datos de puntos:", error);
  }
}

// ─────────────────────────────────────────────
//  VISIBILIDAD (patrón Animaciones)
// ─────────────────────────────────────────────

/**
 * Lee la entidad Animaciones y muestra u oculta el overlay según el atributo "puntos"
 */
function cogerAnimaciones() {
  fetch("/v2/entities?type=Animaciones")
    .then(res => {
      if (!res.ok) throw new Error("No se pudo obtener la entidad de Animaciones");
      return res.json();
    })
    .then(data => {
      if (!contenedor) return;
      const estado = String(data[0]?.[ATTRIBUTE_NAME]?.value || "").toLowerCase();
      contenedor.classList.toggle("hidden", estado !== "visible");
    })
    .catch(err => {
      console.error("Error al recibir animación:", err);
    });
}

if (socket) {
  socket.on("message", msg => {
    if (typeof msg !== "string") return;
    // Notificación de Animaciones: refrescar la visibilidad
    if (msg.includes("urn:ngsi-ld:Animaciones:")) {
      cogerAnimaciones();
    }
    // Señal manual de recarga emitida desde el control: volver a pedir los puntos
    if (msg === SENAL_RECARGA) {
      cargarDatos();
    }
  });
}

// Auto-refresco periódico de los puntos (la fuente puede publicar nuevos valores)
setInterval(cargarDatos, REFRESH_MS);

// Cargar datos y estado de visibilidad al inicializar el módulo
cargarDatos();
cogerAnimaciones();

