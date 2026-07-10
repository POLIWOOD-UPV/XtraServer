// ─────────────────────────────────────────────
//  CONFIGURATION
// ─────────────────────────────────────────────
const ATTRIBUTE_NAME = "infoteam";   // atributo dentro de la entidad Animaciones
const ID_MOSTRADO = "urn:ngsi-ld:equipoMostrado:001";
// ─────────────────────────────────────────────

// Elementos del DOM
const main_block   = document.querySelector(".bloque_info_extra");
const elNombre     = document.getElementById("nombre_equipo");
const elAcr        = document.getElementById("acr_equipo");
const elLogo       = document.getElementById("logo_equipo");
const elUni        = document.getElementById("uni_equipo");
const elMiembros   = document.getElementById("miembros_resultado");
const elPayload    = document.getElementById("payload_resultado");
const elLider      = document.getElementById("lider_resultado");
const elPiloto     = document.getElementById("piloto_resultado");

// Sockets
const socket = typeof io === "function" ? io() : null;

// ── Visibilidad ──────────────────────────────────────────────
/**
 * Obtiene la entidad de Animaciones y muestra u oculta el panel segun su valor
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

// ── Contenido: datos del equipo mostrado ─────────────────────
/**
 * Rellena el panel con los datos del equipo. Si equipo es null, pone guiones.
 * mostrado es la entidad equipoMostrado (aporta el payload del momento).
 */
function render(equipo, mostrado) {
    if (!equipo) {
        elNombre.textContent = "Team info";
        elAcr.textContent = "";
        elUni.textContent = "";
        elMiembros.textContent = "—";
        elPayload.textContent = "—";
        elLider.textContent = "—";
        elPiloto.textContent = "—";
        elLogo.src = "../img/dummy.png";
        return;
    }

    const acr = equipo.acr?.value ?? "";

    elNombre.textContent   = equipo.name?.value ?? "";
    elAcr.textContent      = acr;
    elUni.textContent      = equipo.uni?.value ?? "";
    elMiembros.textContent = equipo.miembros?.value ?? "—";
    elLider.textContent    = equipo.lider?.value ?? "—";
    elPiloto.textContent   = equipo.piloto?.value ?? "—";

    // El payload vive en equipoMostrado y solo aplica si payloadAcr coincide
    // con el equipo mostrado actualmente.
    const payload = mostrado?.payload?.value;
    const aplica = payload != null && mostrado?.payloadAcr?.value === acr;
    elPayload.textContent = aplica ? `${payload} PL` : "—";

    // Los archivos de logo se nombran por acrónimo (../img/Equipos/<ACR>.png),
    // no por el campo `logo` de la entidad, que no siempre coincide.
    elLogo.src = acr ? `../img/Equipos/${acr}.png` : "../img/dummy.png";
    elLogo.onerror = () => { elLogo.onerror = null; elLogo.src = "../img/dummy.png"; };
}

/**
 * Lee el equipo actualmente mostrado (equipoMostrado.acr) y busca su Equipo
 */
function cogerEquipo() {
    fetch(`/v2/entities/${ID_MOSTRADO}`)
        .then(res => {
            if (!res.ok) throw new Error("No se pudo obtener equipoMostrado");
            return res.json();
        })
        .then(mostrado => {
            const acr = mostrado.acr?.value;
            if (!acr) return render(null);

            return fetch(`/v2/entities?type=Equipo&q=acr==${encodeURIComponent(acr)}`)
                .then(res => res.json())
                .then(equipos => render(equipos[0] ?? null, mostrado));
        })
        .catch(err => {
            console.error("Error al obtener info del equipo:", err);
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

        if (msg.includes("urn:ngsi-ld:equipoMostrado:")) {
            cogerEquipo();
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("InfoTeam cargado, obteniendo estado...");
    cogerAnimaciones();
    cogerEquipo();
});
