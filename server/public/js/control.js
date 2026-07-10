/**
 * Controlador de HUD a traves de entidades NGSI (mirar server/modules/ngsi.js)
 */


/** DOM Botones de animaciones */
let animAnuncios = document.getElementById("animAnuncios");
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
    const valorAnuncios = getValorAnimacion("anuncios");

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


// Botones de control
/////////////////////////////////////////////////////////////
animAnuncios.addEventListener("click", () => {
    toggleAnimacion("anuncios");
});


document.addEventListener("DOMContentLoaded", () => {
    console.log("Controlador de HUD cargado");
    cogerAnimaciones();
});
