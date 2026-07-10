// ─────────────────────────────────────────────
//  CONFIGURATION
// ─────────────────────────────────────────────
const ATTRIBUTE_NAME = "clima";   // atributo dentro de la entidad Animaciones
const LAT = 39.7095;
const LON = -0.7887;
const INTERVALO_CAMPO = 4000;     // ms entre campos del ciclo
const INTERVALO_REFRESCO = 5 * 60 * 1000;  // ms entre consultas a la API

const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
    `&current=temperature_2m,relative_humidity_2m,precipitation,` +
    `wind_speed_10m,wind_direction_10m,wind_gusts_10m,pressure_msl` +
    `&wind_speed_unit=ms&timezone=Europe/Madrid`;
// ─────────────────────────────────────────────

// Elementos del DOM
const main_block = document.getElementById("clima");
const elCampo = document.getElementById("campo");

// Sockets
const socket = typeof io === "function" ? io() : null;

let datos = [];
let indice = 0;
let cicloTimer = null;

// ── Formateo ─────────────────────────────────────────────────
const CARDINALES = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
function aCardinal(grados) {
    if (grados == null) return "";
    return CARDINALES[Math.round(grados / 45) % 8];
}

// Construye la lista de campos a mostrar a partir de la respuesta de Open-Meteo
function construirCampos(w) {
    return [
        {
            label: "Wind",
            valor: `${Math.round(w.wind_speed_10m)} m/s ${aCardinal(w.wind_direction_10m)}`,
            sub: `Gusts ${Math.round(w.wind_gusts_10m)} m/s`
        },
        { label: "Temperature", valor: `${Math.round(w.temperature_2m)}°C` },
        { label: "Humidity",    valor: `${Math.round(w.relative_humidity_2m)}%` },
        { label: "Pressure",    valor: `${Math.round(w.pressure_msl)} hPa` },
    ];
}

// ── Ciclo de campos ──────────────────────────────────────────
function mostrar(i) {
    if (!elCampo || !datos[i]) return;
    elCampo.style.opacity = "0";
    setTimeout(() => {
        const d = datos[i];
        const sub = d.sub ? `<span class="sub">${d.sub}</span>` : "";
        elCampo.innerHTML = `
            <div class="label">${d.label}</div>
            <div class="valor">${d.valor}${sub}</div>
        `;
        elCampo.style.opacity = "1";
    }, 500);
}

function iniciarCiclo() {
    if (cicloTimer) clearInterval(cicloTimer);
    indice = 0;
    mostrar(indice);
    cicloTimer = setInterval(() => {
        indice = (indice + 1) % datos.length;
        mostrar(indice);
    }, INTERVALO_CAMPO);
}

// ── Datos: Open-Meteo ────────────────────────────────────────
async function cargarClima() {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const nuevos = construirCampos(data.current);
        if (nuevos.length > 0) {
            const primeraVez = cicloTimer === null;
            datos = nuevos;
            if (primeraVez) iniciarCiclo();
        }
    } catch (err) {
        console.error("Error obteniendo clima:", err);
    }
}

// ── Visibilidad ──────────────────────────────────────────────
function cogerAnimaciones() {
    fetch("/v2/entities?type=Animaciones")
        .then(res => res.json())
        .then(data => {
            const estado = String(data[0]?.[ATTRIBUTE_NAME]?.value ?? "visible").toLowerCase();
            main_block?.classList.toggle("hidden", estado !== "visible");
        })
        .catch(err => console.error("Error al obtener Animaciones:", err));
}

// ── Sockets de eventos ───────────────────────────────────────
if (socket) {
    socket.on("message", msg => {
        if (typeof msg !== "string") return;
        if (msg.includes("urn:ngsi-ld:Animaciones:")) {
            cogerAnimaciones();
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("Clima cargado, obteniendo datos...");
    cogerAnimaciones();
    cargarClima();
    setInterval(cargarClima, INTERVALO_REFRESCO);
});
