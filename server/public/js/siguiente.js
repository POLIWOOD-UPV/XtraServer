// ─────────────────────────────────────────────
//  CONFIGURATION
// ─────────────────────────────────────────────
const ATTRIBUTE_NAME = "siguiente";   // atributo dentro de la entidad Animaciones
const ID_SIGUIENTE = "urn:ngsi-ld:SiguienteEquipo:001";
// ─────────────────────────────────────────────

// Elementos del DOM
const main_block = document.getElementById("siguiente");
const elLogo     = document.getElementById("logo_siguiente");
const elDorsal   = document.getElementById("dorsal_siguiente");
const elNombre   = document.getElementById("nombre_siguiente");

// Sockets
const socket = typeof io === "function" ? io() : null;

// ── Visibilidad ──────────────────────────────────────────────
/**
 * Obtiene la entidad de Animaciones y muestra u oculta el banner segun su valor
 */
function cogerAnimaciones() {
    fetch("/v2/entities?type=Animaciones")
        .then(res => {
            if (!res.ok) throw new Error("No se pudo obtener la entidad de Animaciones");
            return res.json();
        })
        .then(data => {
            const estado = String(data[0]?.[ATTRIBUTE_NAME]?.value || "").toLowerCase();
            main_block?.classList.toggle("hidden", estado !== "visible");
        })
        .catch(err => {
            console.error("Error al recibir animación:", err);
        });
}

// ── Contenido: siguiente equipo ──────────────────────────────
/**
 * Rellena el banner con el equipo. Si equipo es null, muestra estado vacío.
 */
function render(equipo) {
    if (!equipo) {
        elDorsal.textContent = "";
        elNombre.textContent = "No team next";
        elLogo.src = "../img/dummy.png";
        return;
    }

    const acr = equipo.acr?.value ?? "";
    const dorsal = equipo.dorsal?.value;

    elDorsal.textContent = dorsal != null ? `#${dorsal}` : "";
    elNombre.textContent = equipo.name?.value ?? "";

    // Los archivos de logo se nombran por acrónimo (../img/Equipos/<ACR>.png)
    elLogo.src = acr ? `../img/Equipos/${acr}.png` : "../img/dummy.png";
    elLogo.onerror = () => { elLogo.onerror = null; elLogo.src = "../img/dummy.png"; };
}

/**
 * Lee el siguiente equipo (SiguienteEquipo.acr) y busca su Equipo
 */
function cogerEquipo() {
    fetch(`/v2/entities/${ID_SIGUIENTE}`)
        .then(res => {
            if (!res.ok) throw new Error("No se pudo obtener SiguienteEquipo");
            return res.json();
        })
        .then(siguiente => {
            const acr = siguiente.acr?.value;
            if (!acr) return render(null);

            return fetch(`/v2/entities?type=Equipo&q=acr==${encodeURIComponent(acr)}`)
                .then(res => res.json())
                .then(equipos => render(equipos[0] ?? null));
        })
        .catch(err => {
            console.error("Error al obtener el siguiente equipo:", err);
            render(null);
        });
}

// ── Sockets de eventos ───────────────────────────────────────
if (socket) {
    socket.on("message", msg => {
        if (typeof msg !== "string") return;
        console.log("Mensaje recibido por socket:", msg);

        if (msg.includes("urn:ngsi-ld:Animaciones:")) {
            cogerAnimaciones();
        }

        if (msg.includes("urn:ngsi-ld:SiguienteEquipo:")) {
            cogerEquipo();
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("Siguiente equipo cargado, obteniendo estado...");
    cogerAnimaciones();
    cogerEquipo();
});
