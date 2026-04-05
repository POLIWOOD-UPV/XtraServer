/**
 * Controlador de HUD a traves de entidades NGSI (mirar server/modules/ngsi.js) 
 */


/** DOM Botones de animaciones */
let animPlayer = document.getElementById("animPlayer");
let animAnuncios = document.getElementById("animAnuncios");
let estadoPlayer = document.getElementById("estadoPlayer");
let estadoAnuncios = document.getElementById("estadoAnuncios");

/** DOM Stream */
let urlStream = document.getElementById("urlStream");
let playStream = document.getElementById("playStream");
let endpointButtons = document.getElementById("endpointButtons");

/**Valores globales */
let animaciones;
let endpointsMediaMTX = [];

// Estado animaciones
/////////////////////////////////////////////////////////////
function cogerAnimaciones() {
    return fetch("/v2/entities?type=Animaciones")
        .then(res => {
            return res.json();
        })
        .then(data => {
            animaciones = data;
            pintarEstados();
        })
        .catch(err => {
            console.error("Error al obtener animaciones:", err);
        });
}

function getValorAnimacion(nombre) {
    if (!Array.isArray(animaciones) || animaciones.length === 0) return "desconocido";
    const entidad = animaciones[0];
    if (!entidad || !entidad[nombre]) return "desconocido";
    return entidad[nombre].value;
}

function pintarEstados() {
    const valorPlayer = getValorAnimacion("player");
    const valorAnuncios = getValorAnimacion("anuncios");

    estadoPlayer.textContent = `Estado: ${valorPlayer}`;
    estadoAnuncios.textContent = `Estado: ${valorAnuncios}`;
}

function escapeHtml(text) {
    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function toggleAnimacion(nombreAttr) {
    // Validar que tenemos la entidad de animaciones cargada
    if (!Array.isArray(animaciones) || animaciones.length === 0) {
        console.error("No hay entidad de animaciones cargada todavía");
        return Promise.resolve();
    }

    // Obtener la entidad actual y el valor actual de la animación específica
    let entidadActual = animaciones[0];
    let valorActual = getValorAnimacion(nombreAttr);
    let nuevoValor = String(valorActual).toLowerCase() === "visible" ? "oculto" : "visible";

    // Construir la entidad actualizada con el nuevo valor para la animación específica
    let entidad = {
        id: entidadActual.id,
        type: entidadActual.type || "Animaciones",
        [nombreAttr]: {
            type: entidadActual[nombreAttr]?.type || "Text",
            value: nuevoValor
        }
    };

    // Actualizar la entidad NGSI con el nuevo valor
    return POST("/v2/op/update", {
        actionType: "update",
        entities: [entidad]
    })
        .then(() => {
            console.log(`Animación ${nombreAttr} -> ${nuevoValor}`);
        })
        // Actualizar el estado local y la UI después de cambiar la animación
        .then(() => cogerAnimaciones())
        .catch(err => {
            console.error(`Error al cambiar animación ${nombreAttr}:`, err);
        });
}


// Botones de animaciones
/////////////////////////////////////////////////////////////////
animPlayer.addEventListener("click", () => {
    toggleAnimacion("player");
});

animAnuncios.addEventListener("click", () => {
    toggleAnimacion("anuncios");
});


document.addEventListener("DOMContentLoaded", () => {
    console.log("Controlador de HUD cargado");
    cogerAnimaciones();
});




// Stream

// Recibir endpoints
///////////////////////////////////////////////////////////////////////////////////////////////
async function cogerEndpoints(){
    try {
        const data = await GET_MEDIAMTX("/v3/paths/list");
        endpointsMediaMTX = Array.isArray(data?.items) ? data.items : [];
        pintarEndpoints();
    } catch (err) {
        console.error("Error al obtener endpoints de MediaMTX:", err);
        endpointsMediaMTX = [];
        if (endpointButtons) {
            endpointButtons.innerHTML = '<span class="error">No se pudieron cargar los endpoints</span>';
        }
    }
}

function pintarEndpoints() {
    if (!endpointButtons) return;

    if (!Array.isArray(endpointsMediaMTX) || endpointsMediaMTX.length === 0) {
        endpointButtons.innerHTML = '<span class="empty">Sin endpoints disponibles</span>';
        return;
    }

    endpointButtons.innerHTML = endpointsMediaMTX
        .map(endpoint => {
            const label = endpoint.ready ? "Disponible" : "No listo";
            return `<button type="button" data-endpoint="${escapeHtml(endpoint.name)}">${escapeHtml(endpoint.name)} <small>${label}</small></button>`;
        })
        .join("");

    endpointButtons.querySelectorAll("button[data-endpoint]").forEach(button => {
        button.addEventListener("click", () => {
            urlStream.value = button.dataset.endpoint || "";
            urlStream.focus();
        });
    });
}

async function publicarStreamSeleccionado() {
    const endpoint = urlStream.value.trim();

    if (!endpoint) {
        console.warn("No hay endpoint seleccionado para publicar");
        return;
    }

    try {
        await POST("/v2/op/update", {
            actionType: "update",
            entities: [{
                id: "urn:ngsi-ld:Stream:001",
                type: "Stream",
                endpoint: {
                    type: "Text",
                    value: endpoint
                }
            }]
        });
        console.log("Endpoint publicado en NGSI:", endpoint);
    } catch (err) {
        console.error("Error al publicar el endpoint seleccionado:", err);
    }
}

// Enviar a NGSI
///////////////////////////////////////////////////////////////////////
playStream.addEventListener("click", () => {
    publicarStreamSeleccionado();

});

document.addEventListener("DOMContentLoaded", () => {
    cogerEndpoints();
});