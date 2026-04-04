/** Codigo para el player */

// Elementos del DOM
let contenedor = document.getElementById("contenedor");

// Sockets
const socket = typeof io === "function" ? io() : null;

/**
 * Obtiene la entidad de Animaciones y muestra u oculta el player dependiendo de su valor
 */
function cogerAnimaciones() {
    fetch("/v2/entities?type=Animaciones")
        .then(res => {
            if (!res.ok) throw new Error("No se pudo obtener la entidad de Animaciones");
            return res.json();
        })
        .then(json => {
            // Sacar valor del JSON
            estadoPlayer = String(json?.[0]?.player?.value || "").toLowerCase();

            // Actualizar rel estado
            switch (estadoPlayer) {
                case "visible":
                    mostrarPlayer();
                    break;
                case "oculto":
                    esconderPlayer();
                    break;
                default:
                    console.warn("Valor desconocido para player:", estadoPlayer);
            }
        })
        .catch(err => {
            console.error("Error al recibir animación:", err);
        });
}

/**
 * Esconde el player hacia la derecha
 */
function esconderPlayer() {
    console.log("Escondiendo player...");
    if (!contenedor) return;
    contenedor.style.right = "-100%";
}

/**
 * Posiciona al player en su posición original
*/
function mostrarPlayer() {
    console.log("Mostrando player...");
    if (!contenedor) return;
    contenedor.style.right = "0px";
}


if (socket) {
    socket.on("message", msg => {
        if (typeof msg !== "string") return;
        if (msg.includes("urn:ngsi-ld:Animaciones:")) {
            cogerAnimaciones();
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("Player cargado, obteniendo animaciones...");
    cogerAnimaciones();
});



