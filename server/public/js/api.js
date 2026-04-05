// Peticiones
//////////////////////////////////////////////////////////
/**
 * Función MAESTRA para realizar peticiones HTTP.
 * Centraliza la lógica de headers, serialización y manejo de errores.
 */
async function request(method, endpoint, options = {}) {
    let { body, query, headers = {} } = options;
    
    // Cabeceras y datos comunes para todas las peticiones
    let init = {
        method,
        headers: { ...headers }
    };

    // Configuración de la URL final
    // Si se proporcionan parámetros de consulta, los añadimos a la URL
    if (query) {
        endpoint = buildApiUrl(endpoint, query).toString();
    // Si no hay parámetros de consulta, simplemente unimos la ruta base de la API al endpoint
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

/**
 * API UTILS
 */
/** Función para unir la ruta de la API al endpoint 
 * @description Asegura que el endpoint siempre comience con una barra y se una correctamente a la ruta base de la API.
 * @param {string} endpoint - El endpoint de la API (ej: "entities?type=Animaciones")
 * @return {string} - El endpoint completo con la ruta de la API (ej: "/v2/entities?type=Animaciones")
*/
function joinApiPath(endpoint) {
    if (!endpoint) return '/';
    return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
}

/** Función para construir la URL completa de la API con parámetros de consulta
 * @param {string} endpoint - El endpoint de la API (ej: "/v2/entities")
 * @param {Object} query - Un objeto con los parámetros de consulta (ej: { type: "Animaciones" })
 * @return {URL} - La URL completa con los parámetros de consulta añadidos
 */
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