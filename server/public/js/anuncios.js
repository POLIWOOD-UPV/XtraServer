// ─────────────────────────────────────────────
//  CONFIGURATION
// ─────────────────────────────────────────────
const NGSI_BASE_URL  = "http://your-ngsi-server:1026";
const ENTITY_ID      = "urn:ngsi-ld:Animaciones:001";
const ATTRIBUTE_NAME = "anuncios";   // attribute inside the Animaciones entity
const POLL_INTERVAL  = 3000;         // ms
// ─────────────────────────────────────────────

const contenedor = document.getElementById("contenedor_anuncios");

/**
 * Obtiene la entidad de Animaciones y muestra u oculta el panel dependiendo de su valor
 */
function cogerAnimaciones() {
    fetch(`${NGSI_BASE_URL}/v2/entities?type=Animaciones`)
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
    contenedor.style.top = "-150%";
}

/**
 * Posiciona el banner en su posición original
 */
function mostrarAnuncios() {
    if (!contenedor) return;
    contenedor.style.top = "0px";
}

// Polling
cogerAnimaciones();
setInterval(cogerAnimaciones, POLL_INTERVAL);