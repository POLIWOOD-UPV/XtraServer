// ─────────────────────────────────────────────
//  CONFIGURATION
// ─────────────────────────────────────────────
const ATTRIBUTE_NAME = "sponsors";   // atributo dentro de la entidad Animaciones
// ─────────────────────────────────────────────

// Cogemos los elementos del HTML
const main_block = document.querySelector("footer");

// Sockets
const socket = typeof io === "function" ? io() : null;

/**
 * Obtiene la entidad de Animaciones y muestra u oculta la barra segun su valor
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
            const estado = String(animaciones[ATTRIBUTE_NAME]?.value || "").toLowerCase();

            // Actualizar el estado
            switch (estado) {
                case "visible":
                    mostrarSponsors();
                    break;
                case "oculto":
                    esconderSponsors();
                    break;
                default:
                    console.warn("Valor desconocido para sponsors:", estado);
            }
        })
        .catch(err => {
            console.error("Error al recibir animación:", err);
        });
}

/**
 * Esconde la barra hacia abajo
 */
function esconderSponsors() {
    if (!main_block) return;
    main_block.classList.add("hidden");
}

/**
 * Devuelve la barra a su posición original
 */
function mostrarSponsors() {
    if (!main_block) return;
    main_block.classList.remove("hidden");
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

// AÑADIDO: lista de sponsors con su nombre y ruta de imagen
const sponsors = [
    { name: "AERCO",  img: "../img/Equipos/AERCO.png"  },
    { name: "AURA",   img: "../img/Equipos/AURA.png"   },
    { name: "DSDTA",  img: "../img/Equipos/DSDTA.png"  },
    { name: "ECL",    img: "../img/Equipos/ECL.png"    },
    { name: "SAETA",  img: "../img/Equipos/SAETA.png"  },
    { name: "SAKA",   img: "../img/Equipos/SAKA.png"   },
    { name: "TRENC",  img: "../img/Equipos/TRENC.png"  },
    { name: "UA1",    img: "../img/Equipos/UA1.png"    },
    { name: "UA2",    img: "../img/Equipos/UA2.png"    },
    { name: "VLAIR",  img: "../img/Equipos/VLAIR.png"  },
    { name: "ZENIT",  img: "../img/Equipos/ZENIT.png"  },
];

const track = document.querySelector(".sponsors-track");

// AÑADIDO: crea las tarjetas de sponsor a partir de la lista
function buildCards(list) {
    return list.map(s => {
        const card = document.createElement("div");
        card.className = "sponsor-card";
        const img = document.createElement("img");
        img.src = s.img;
        img.alt = s.name;
        card.appendChild(img);
        return card;
    });
}

// AÑADIDO: inserta los logos dos veces seguidas para que el bucle sea continuo y sin saltos
const originals = buildCards(sponsors);
const clones    = buildCards(sponsors);

originals.forEach(c => track.appendChild(c));
clones.forEach(c    => track.appendChild(c));

document.addEventListener("DOMContentLoaded", () => {
    console.log("Sponsors cargados, obteniendo estado...");
    cogerAnimaciones();
});
