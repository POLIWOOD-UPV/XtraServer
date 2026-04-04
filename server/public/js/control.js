/**
 * Controlador de HUD a traves de entidades NGSI (mirar server/modules/ngsi.js) 
 */


/** DOM Botones de animaciones */
let animPlayer = document.getElementById("animPlayer");
let animAnuncios = document.getElementById("animAnuncios");
let estadoPlayer = document.getElementById("estadoPlayer");
let estadoAnuncios = document.getElementById("estadoAnuncios");

/**Valores globales */
let animaciones;

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
/////////////////////////////////////////////////////////////
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



// Peticiones
//////////////////////////////////////////////////////////
/**
 * Función MAESTRA para realizar peticiones HTTP.
 * Centraliza la lógica de headers, serialización y manejo de errores.
 */
async function request(method, endpoint, options = {}) {
    let { body, query, headers = {} } = options;
    
    let init = {
        method,
        headers: { ...headers }
    };

    // Configuración de la URL final
    if (query) {
        endpoint = buildApiUrl(endpoint, query).toString();
    } else {
        endpoint = new URL(joinApiPath(endpoint), window.location.origin).toString();
    }

    // Manejo inteligente del cuerpo de la petición (Body)
    if (body !== undefined) {
        // Si ya es un formato binario o texto plano, se envía directo
        if (body instanceof FormData || body instanceof Blob || typeof body === 'string') {
            init.body = body;
    
        // Si es un objeto, lo convertimos a string JSON y avisamos al servidor
        } else {
            init.headers['Content-Type'] = 'application/json';
            init.body = JSON.stringify(body);
        }
    }

    // Ejecución de la petición
    let response = await fetch(endpoint, init);

    // Si la respuesta no es 2xx (éxito), lanzamos una excepción con el error del servidor
    if (!response.ok) {
        let errorPayload = await leerRespuesta(response).catch(() => null);
        let errorMessage = typeof errorPayload === 'string'
            ? errorPayload
            : errorPayload?.message || errorPayload?.error || null;

        throw new Error(errorMessage || `Error HTTP ${response.status}`);
    }

    return await leerRespuesta(response);
}

// Atajos para los métodos HTTP más comunes
async function GET(endpoint, options = {}) {
    return request('GET', endpoint, options);
}

async function POST(endpoint, body, options = {}) {
    return request('POST', endpoint, { ...options, body });
}

async function PATCH(endpoint, body, options = {}) {
    return request('PATCH', endpoint, { ...options, body });
}

async function PUT(endpoint, body, options = {}) {
    return request('PUT', endpoint, { ...options, body });
}


// URL api 
function joinApiPath(endpoint) {
    if (!endpoint) return '/';
    return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
}

function buildApiUrl(endpoint, query = {}) {
    const url = new URL(joinApiPath(endpoint), window.location.origin);
    Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            url.searchParams.set(key, String(value));
        }
    });
    return url;
}

/**
 * Lee la respuesta de una petición fetch y devuelve el contenido adecuado según el tipo de respuesta.
 * Si la respuesta es un JSON, lo parsea y devuelve el objeto. Si es texto plano, devuelve el texto. Si no hay contenido (204), devuelve null.
 * @param {Response} response - La respuesta de la petición fetch.
 * @returns {Promise<any>} - El contenido de la respuesta, ya sea un objeto JSON, texto plano o null.
 * @throws {Error} - Si ocurre un error al leer la respuesta o si el tipo de contenido no es reconocido.
 */
async function leerRespuesta(response) {
    // No hay contenido que leer
    if (response.status === 204) return null;

    // Intentamos detectar el tipo de contenido para decidir cómo leer la respuesta
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        return response.json();
    }
    return response.text();
}