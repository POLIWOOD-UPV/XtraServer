const socket = io();

// EVITAR SOLAPES 
let actualizando = false;

// Cuando se cargue el DOM, pedir el estado
document.addEventListener("DOMContentLoaded", async () => {
  if (window.self !== window.top) return; // EVITAR PROBLEMAS CON EL DOM
  await actualizarEstado();
});


socket.addEventListener("message", (event) => {
  console.log("Actualización recibida:", event);
  if (event === "!entityChange urn:ngsi-ld:Animaciones:001") {
    actualizarEstado();
  }
});


// Actualizar visibilidad de los iframes (enteros)
async function actualizarEstado() {
  if (actualizando) return;
  actualizando = true;

  try {
    const res = await fetch("/v2/entities/urn:ngsi-ld:Animaciones:001");
    const json = await res.json();
    for (let id in json) {
      if (id === "id" || id === "type") continue;
      const estado = json[id]?.value || "oculto";
      const contenedor = document.getElementById(id);

      if (contenedor) {
        animarDIV(contenedor, estado); // funcion de animacion si la tienes
        contenedor.style.display = (estado === "visible") ? "block" : "none";
      } 
    }
  } catch (err) {
    console.error("Error al obtener el estado de Animaciones:", err);
  } finally {
    actualizando = false;
  }
}

// animacion basica 
function animarDIV(elemento, estado) {
  elemento.style.transition = "opacity 0.3s ease";
  elemento.style.opacity = (estado === "visible") ? "1" : "0";
}
