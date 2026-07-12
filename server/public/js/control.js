/**
 * Controlador de HUD a traves de entidades NGSI (mirar server/modules/ngsi.js).
 * Cada boton .btnToggle controla un atributo de la entidad Animaciones
 * (visible/oculto) mediante su data-attr.
 */

const ID_ANIMACIONES = "urn:ngsi-ld:Animaciones:001";
const ID_ANUNCIO = "urn:ngsi-ld:Anuncio:001";
const ID_MOSTRADO = "urn:ngsi-ld:equipoMostrado:001";
const ID_SIGUIENTE = "urn:ngsi-ld:SiguienteEquipo:001";

const botonesToggle = document.querySelectorAll(".btnToggle");

// Socket para señales en tiempo real (recarga manual de puntos)
const socket = typeof io === "function" ? io() : null;
const SENAL_RECARGA_PUNTOS = "recargar-puntos";

// Recargar puntos (envía una señal por socket que el overlay de puntos escucha)
const btnRecargarPuntos = document.getElementById("btnRecargarPuntos");
const feedbackPuntos = document.getElementById("feedbackPuntos");

// Texto del anuncio
const inputTexto = document.getElementById("inputTexto");
const btnEnviarTexto = document.getElementById("btnEnviarTexto");
const feedbackTexto = document.getElementById("feedbackTexto");

// Equipo mostrado (InfoTeam)
const selectEquipo = document.getElementById("selectEquipo");
const btnEnviarEquipo = document.getElementById("btnEnviarEquipo");
const feedbackEquipo = document.getElementById("feedbackEquipo");

// Payload del equipo mostrado
const inputPayload = document.getElementById("inputPayload");
const btnEnviarPayload = document.getElementById("btnEnviarPayload");
const feedbackPayload = document.getElementById("feedbackPayload");

// Siguiente equipo (Next)
const selectSiguiente = document.getElementById("selectSiguiente");
const btnEnviarSiguiente = document.getElementById("btnEnviarSiguiente");
const feedbackSiguiente = document.getElementById("feedbackSiguiente");

// Etiqueta legible por atributo y estado actual (attr -> "visible" | "oculto")
const ETIQUETAS = { anuncios: "Anuncios", sponsors: "Sponsors", infoteam: "InfoTeam", siguiente: "Siguiente", clima: "Clima", puntos: "Puntos" };
const estados = {};

// Pinta el boton segun el estado actual del atributo
function pintarEstado(attr) {
    const boton = document.querySelector(`.btnToggle[data-attr="${attr}"]`);
    if (!boton) return;
    const visible = estados[attr] === "visible";
    boton.textContent = `${ETIQUETAS[attr] || attr}: ${visible ? "visible" : "oculto"}`;
    boton.className = "btnToggle " + (visible ? "activo" : "inactivo");
}

// Lee la entidad Animaciones y refleja el estado de cada boton
function cargarAnimaciones() {
    return fetch("/v2/entities?type=Animaciones")
        .then(res => res.json())
        .then(data => {
            const entidad = data[0] || {};
            botonesToggle.forEach(boton => {
                const attr = boton.dataset.attr;
                estados[attr] = String(entidad[attr]?.value ?? "oculto").toLowerCase();
                pintarEstado(attr);
            });
        })
        .catch(err => {
            console.error("Error al cargar animaciones:", err);
        });
}

// Cada boton alterna su atributo y actualiza la entidad NGSI
botonesToggle.forEach(boton => {
    boton.addEventListener("click", () => {
        const attr = boton.dataset.attr;
        const nuevoValor = estados[attr] === "visible" ? "oculto" : "visible";

        POST("/v2/op/update", {
            actionType: "update",
            entities: [{
                id: ID_ANIMACIONES,
                type: "Animaciones",
                [attr]: { type: "Text", value: nuevoValor }
            }]
        })
            .then(() => {
                estados[attr] = nuevoValor;
                pintarEstado(attr);
                console.log(`Animación ${attr} -> ${nuevoValor}`);
            })
            .catch(err => {
                console.error(`Error al cambiar visibilidad de ${attr}:`, err);
            });
    });
});

// Recarga manual de puntos
/////////////////////////////////////////////////////////////

if (btnRecargarPuntos) {
    btnRecargarPuntos.addEventListener("click", () => {
        if (!socket) {
            mostrarFeedback(feedbackPuntos, "Sin conexión de socket.", true);
            return;
        }
        // El servidor reemite este mensaje a todos los clientes; el overlay de puntos lo escucha
        socket.send(SENAL_RECARGA_PUNTOS);
        mostrarFeedback(feedbackPuntos, "Recargando puntos...");
        console.log("Señal de recarga de puntos enviada");
    });
}

// Texto del anuncio
/////////////////////////////////////////////////////////////

// Carga el texto actual de la entidad Anuncio en el input
function cargarTexto() {
    return fetch(`/v2/entities/${ID_ANUNCIO}`)
        .then(res => res.json())
        .then(data => {
            inputTexto.value = data.texto?.value ?? "";
        })
        .catch(err => {
            console.error("Error al cargar el texto del anuncio:", err);
        });
}

// Muestra un mensaje temporal de feedback en el elemento indicado
function mostrarFeedback(el, msg, esError = false) {
    if (!el) return;
    el.textContent = msg;
    el.className = "feedback" + (esError ? " error" : "");
    setTimeout(() => { el.textContent = ""; }, 3000);
}

if (btnEnviarTexto) {
    btnEnviarTexto.addEventListener("click", () => {
        const texto = inputTexto.value.trim();
        if (!texto) {
            mostrarFeedback(feedbackTexto, "El texto no puede estar vacío.", true);
            return;
        }

        POST("/v2/op/update", {
            actionType: "update",
            entities: [{
                id: ID_ANUNCIO,
                type: "Anuncio",
                texto: { type: "Text", value: texto }
            }]
        })
            .then(() => {
                mostrarFeedback(feedbackTexto, "Anuncio actualizado.");
                console.log(`Anuncio -> ${texto}`);
            })
            .catch(err => {
                mostrarFeedback(feedbackTexto, "Error al enviar.", true);
                console.error("Error al actualizar el anuncio:", err);
            });
    });
}

// Equipo mostrado (InfoTeam) y siguiente equipo
/////////////////////////////////////////////////////////////

// Añade una opción por equipo al select indicado
function rellenarSelect(select, equipos) {
    if (!select) return;
    equipos.forEach(eq => {
        const opt = document.createElement("option");
        opt.value = eq.acr;
        opt.textContent = `#${eq.dorsal} - ${eq.name}`;
        select.appendChild(opt);
    });
}

// Carga los equipos en los selects (mostrado y siguiente) y refleja el estado actual
function cargarEquipos() {
    return fetch("/v2/entities?type=Equipo&options=keyValues&attrs=dorsal,name,acr&limit=1000")
        .then(res => res.json())
        .then(equipos => {
            equipos.sort((a, b) => a.dorsal - b.dorsal);
            rellenarSelect(selectEquipo, equipos);
            rellenarSelect(selectSiguiente, equipos);

            // Reflejar el estado actual de ambas entidades
            return Promise.all([refrescarMostrado(), refrescarSiguiente()]);
        })
        .catch(err => {
            console.error("Error al cargar equipos:", err);
        });
}

// Lee equipoMostrado y refleja el equipo seleccionado y su payload en el control
function refrescarMostrado() {
    return fetch(`/v2/entities/${ID_MOSTRADO}`)
        .then(res => res.json())
        .then(mostrado => {
            const acr = mostrado.acr?.value ?? "";
            if (selectEquipo) {
                selectEquipo.value =
                    [...selectEquipo.options].some(o => o.value === acr) ? acr : "";
            }
            // El payload solo aplica si payloadAcr coincide con el equipo mostrado
            if (inputPayload) {
                const payload = mostrado.payload?.value;
                const aplica = payload != null && mostrado.payloadAcr?.value === acr;
                inputPayload.value = aplica ? payload : "";
            }
        })
        .catch(() => {});
}

if (btnEnviarEquipo) {
    btnEnviarEquipo.addEventListener("click", () => {
        POST("/v2/op/update", {
            actionType: "update",
            entities: [{
                id: ID_MOSTRADO,
                type: "EquipoMostrado",
                acr: { type: "Text", value: selectEquipo.value }
            }]
        })
            .then(() => {
                const opcion = selectEquipo.options[selectEquipo.selectedIndex]?.textContent || "Ninguno";
                mostrarFeedback(feedbackEquipo, `Mostrando: ${opcion}`);
                console.log(`equipoMostrado -> ${selectEquipo.value || "(ninguno)"}`);
            })
            // Al cambiar de equipo, el payload aplicable cambia: refrescar el input
            .then(() => refrescarMostrado())
            .catch(err => {
                mostrarFeedback(feedbackEquipo, "Error al enviar.", true);
                console.error("Error al actualizar el equipo mostrado:", err);
            });
    });
}

// Payload del equipo mostrado
/////////////////////////////////////////////////////////////

if (btnEnviarPayload) {
    btnEnviarPayload.addEventListener("click", () => {
        const n = parseInt(inputPayload.value, 10);
        if (Number.isNaN(n) || n < 0) {
            mostrarFeedback(feedbackPayload, "Introduce un número válido.", true);
            return;
        }
        const acr = selectEquipo?.value;
        if (!acr) {
            mostrarFeedback(feedbackPayload, "No hay equipo mostrado.", true);
            return;
        }

        // El payload se guarda en equipoMostrado, vinculado al equipo actual (payloadAcr).
        // append crea los atributos si no existen y los actualiza si ya están.
        POST("/v2/op/update", {
            actionType: "append",
            entities: [{
                id: ID_MOSTRADO,
                type: "EquipoMostrado",
                payload: { type: "Number", value: n },
                payloadAcr: { type: "Text", value: acr }
            }]
        })
            .then(() => {
                mostrarFeedback(feedbackPayload, `Payload: ${n} PL`);
                console.log(`payload -> ${n} PL (${acr})`);
            })
            .catch(err => {
                mostrarFeedback(feedbackPayload, "Error al enviar.", true);
                console.error("Error al actualizar el payload:", err);
            });
    });
}

// Siguiente equipo (Next)
/////////////////////////////////////////////////////////////

// Lee SiguienteEquipo y refleja el equipo seleccionado en el control
function refrescarSiguiente() {
    if (!selectSiguiente) return Promise.resolve();
    return fetch(`/v2/entities/${ID_SIGUIENTE}`)
        .then(res => res.json())
        .then(siguiente => {
            const acr = siguiente.acr?.value ?? "";
            selectSiguiente.value =
                [...selectSiguiente.options].some(o => o.value === acr) ? acr : "";
        })
        .catch(() => {});
}

if (btnEnviarSiguiente) {
    btnEnviarSiguiente.addEventListener("click", () => {
        POST("/v2/op/update", {
            actionType: "update",
            entities: [{
                id: ID_SIGUIENTE,
                type: "SiguienteEquipo",
                acr: { type: "Text", value: selectSiguiente.value }
            }]
        })
            .then(() => {
                const opcion = selectSiguiente.options[selectSiguiente.selectedIndex]?.textContent || "Ninguno";
                mostrarFeedback(feedbackSiguiente, `Siguiente: ${opcion}`);
                console.log(`siguienteEquipo -> ${selectSiguiente.value || "(ninguno)"}`);
            })
            .catch(err => {
                mostrarFeedback(feedbackSiguiente, "Error al enviar.", true);
                console.error("Error al actualizar el siguiente equipo:", err);
            });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("Controlador de HUD cargado");
    cargarAnimaciones();
    cargarTexto();
    cargarEquipos();
});
