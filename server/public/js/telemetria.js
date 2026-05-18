// ELementos DOM
let bola = document.getElementById("bola");
let plane = document.getElementById("plano-cartesiano");

const socket = typeof io === "function" ? io() : null;
let posVuelo = {};

// Calcular el centro del plano cartesiano (0, 0)
const planeRect = plane.getBoundingClientRect();
const centerX = planeRect.width / 2;
const centerY = planeRect.height / 2;

// Límites de aceleración
const LIMITE_ACELERACION = 8;
const PLANO_WIDTH = 320;
const PLANO_HEIGHT = 240;

// Offset y suavizado
let px = PLANO_WIDTH / 2;
let py = PLANO_HEIGHT / 2;
const COEF_SUAVIZADO = 0.2; // 0 = suave/lento, 1 = rápido/ruidoso

function cogerPosvuelo() {
    return fetch("/v2/entities?type=PosVuelo")
        .then(res => {
            return res.json();
        })
        .then(data => {
            posVuelo = data;
            /*
            id: "urn:ngsi-ld:PosVuelo:001",
            type: "PosVuelo",
            ronda: { type: "Number", value: 0 },
            dorsal: { type: "Number", value: 0 },
            lat: { type: "Float", value: 0.0 },
            lon: { type: "Float", value: 0.0 },
            ax : { type: "Float", value: 0.0 },
            ay : { type: "Float", value: 0.0 },
            az : { type: "Float", value: 0.0 },
            altura: { type: "Float", value: 0.0 },
            fix: { type: "String", value: "No fix" }
            */
            actualizarBola();

            // Actualizar mapa con posicion GPS
            // TODO maria
            actualizarMapa()
        })
        .catch(err => {
            console.error("Error al obtener posiciones de vuelo:", err);
        });
}

function actualizarMapa() {
    // TODO maria
}

// Filtro de suavizado (exponencial)
function suavizado(actual, anterior, coef = COEF_SUAVIZADO) {
    return coef * actual + (1 - coef) * anterior;
}


// Actualizar la bola (posición)
function actualizarBola() {
    if (!posVuelo[0] || !posVuelo[0].ax || !posVuelo[0].ay) {
        console.error("Datos de vuelo inválidos");
        return;
    }

    let ax = posVuelo[0].ax.value;
    let ay = posVuelo[0].ay.value;

    // Mapeo directo de aceleración a posición con suavizado
    let kx = PLANO_WIDTH / (LIMITE_ACELERACION * 2);
    let ky = PLANO_HEIGHT / (LIMITE_ACELERACION * 2);

    px = suavizado(ax * kx + PLANO_WIDTH / 2, px);
    py = suavizado(ay * ky + PLANO_HEIGHT / 2, py);

    // Limitar los valores de X y Y dentro del plano
    px = Math.max(0, Math.min(PLANO_WIDTH, px));
    py = Math.max(0, Math.min(PLANO_HEIGHT, py));

    // Calcular la posición de la bola en el plano (centrada en sus dimensiones)
    let bolaX = centerX + (px - PLANO_WIDTH / 2) - bola.offsetWidth / 2;
    let bolaY = centerY - (py - PLANO_HEIGHT / 2) - bola.offsetHeight / 2;

    // Colocar la bola en su nueva posición
    bola.style.left = `${bolaX}px`;
    bola.style.top = `${bolaY}px`;
}


// GPS
window.onload = () => {

    console.log(document.getElementById("map_block"));

    const map = L.map('map_block').setView([39.45544113234502, -0.35173511779024313], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    setTimeout(() => {
        map.invalidateSize();
    }, 200);

};

// Sockets de eventos
if (socket) {
    socket.on("message", msg => {
        if (typeof msg !== "string") return;
        console.log("Mensaje recibido por socket:", msg);

        if (msg.includes("urn:ngsi-ld:Posvuelo:")) {
            cogerPosvuelo();
        }
    });
}

// Carga inicial de datos del vuelo
document.addEventListener("DOMContentLoaded", () => {
    cogerPosvuelo();
});