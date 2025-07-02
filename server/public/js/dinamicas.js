const socket = io();
// DOM
const anuncios = document.getElementById("anuncios")
const cronos = document.getElementById("cronos")
const datos = document.getElementById("datos")
const equipos = document.getElementById("equipos")
const rankings = document.getElementById("rankings")



// EVITAR SOLAPES 
let actualizando = false;

// Cuando se cargue el DOM, pedir el estado
document.addEventListener("DOMContentLoaded", async () => {
  if (window.self !== window.top) return; // EVITAR PROBLEMAS CON EL DOM
  await actualizarEstado();
});


socket.addEventListener("message", (event) => {
  if (event === "!entityChange urn:ngsi-ld:Animaciones:001") {
    actualizarEstado();
  }
});


// actualizar visibilidad de los iframes (enteros)
async function actualizarEstado() {
  if (actualizando) return; // evitar solapes
  actualizando = true;

  try {
    const res = await fetch("/v2/entities/urn:ngsi-ld:Animaciones:001"); // pedir estado NGSI
    const json = await res.json();

    for (let id in json) {
      // ignorar campos fijos
      if (id === "id" || id === "type") continue; 
      let estado = json[id]?.value || "oculto"; // estado por defecto: oculto

      switch (id) {
        case "anuncios":
          anuncios.style.top =  estado === "visible" ? "0px" : "-600px"
          break;
        case "cronos":
          cronos.style.right =  estado === "visible" ? "0px" : "-600px"
          break;
        case "datos":
          datos.style.right =  estado === "visible" ? "0px" : "-600px"
          break;
        case "equipos":
          equipos.style.right =  estado === "visible" ? "0px" : "-600px"
          break;
        case "rankings":
          const iframe = rankings.querySelector("iframe");
          if (iframe?.contentWindow) {
            estado === "visible"
              ? iframe.contentWindow?.aparicionDinamica?.()
              : iframe.contentWindow?.desaparicionDinamica?.();
          }
          break;
        default:
          console.warn(`Elemento desconocido: ${id}`);
      }

      
    }
  } catch (err) {
    console.error("Error al obtener el estado de Animaciones:", err); // log de error
  } finally {
    actualizando = false; // desbloquear
  }
}


// animarDIV(div)
