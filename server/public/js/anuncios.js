// ─────────────────────────────────────────────
//  CONFIGURATION
// ─────────────────────────────────────────────
const ATTRIBUTE_NAME = "anuncios";   // attribute inside the Animaciones entity
// ─────────────────────────────────────────────

const contenedor = document.getElementById("contenedor_anuncios");

// Sockets
const socket = typeof io === "function" ? io() : null;

/**
 * Obtiene la entidad de Animaciones y muestra u oculta el panel dependiendo de su valor
 */
function cogerAnimaciones() {
    fetch("/v2/entities?type=Animaciones")
        .then(res => {
            if (!res.ok) throw new Error("No se pudo obtener la entidad de Animaciones");
            return res.json();
        })
        .then(data => {
            const animaciones = data[0];

            // Sacar valor del JSON
            const estadoAnuncios = String(animaciones[ATTRIBUTE_NAME]?.value || "").toLowerCase();

            // Actualizar el estado
            switch (estadoAnuncios) {
                case "visible":
                    mostrarAnuncios();
                    break;
                case "oculto":
                    esconderAnuncios();
                    break;
                default:
                    console.warn("Valor desconocido para anuncios:", estadoAnuncios);
            }
        })
        .catch(err => {
            console.error("Error al recibir animación:", err);
        });
}

/**
 * Esconde el banner hacia arriba
 */
function esconderAnuncios() {
    if (!contenedor) return;
    contenedor.classList.add("hidden");
}

/**
 * Posiciona el banner en su posición original
 */
function mostrarAnuncios() {
    if (!contenedor) return;
    contenedor.classList.remove("hidden");
}

// Sockets de eventos
if (socket) {
    socket.on("message", msg => {
        if (typeof msg !== "string") return;
        console.log("Mensaje recibido por socket:", msg);

        if (msg.includes("urn:ngsi-ld:Animaciones:")) {
            cogerAnimaciones();
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("Anuncios cargados, obteniendo estado...");
    cogerAnimaciones();
});