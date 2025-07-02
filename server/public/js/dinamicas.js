const socket = io();

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

function animarArriba(div, estado) {
  if (!div) return;

  if (estado === "visible") {
    div.style.top = "0px";
  } else {
    div.style.top = "-200px"; // o más, según cuánto quieras que se esconda
  }
}

// actualizar visibilidad de los iframes (enteros)
async function actualizarEstado() {
  if (actualizando) return; // evitar solapes
  actualizando = true;

  try {
    const res = await fetch("/v2/entities/urn:ngsi-ld:Animaciones:001"); // pedir estado NGSI
    const json = await res.json();

    for (let id in json) {
      if (id === "id" || id === "type") continue; // ignorar campos fijos
      const estado = json[id]?.value || "oculto"; // estado por defecto: oculto
      const contenedor = document.getElementById(id === "ranking" ? "rankings" : id); // corregir id si es ranking

      if (contenedor) {
        if (id !== "rankings") {
          switch (id) {
            case "anuncios":
              animarArriba(contenedor, estado);
              break;
            default:
              contenedor.style.display = (estado === "visible") ? "block" : "none";
          }
        } else {
          const iframe = contenedor.querySelector("iframe");
          if (iframe && iframe.contentWindow) {
            const doc = iframe.contentDocument || iframe.contentWindow.document;
            const divRanking = doc.getElementById("contenedor");

            if (divRanking) {
              if (estado === "visible") {
                iframe.contentWindow?.aparicionDinamica?.();
              } else {
                iframe.contentWindow?.desaparicionDinamica?.();
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.error("Error al obtener el estado de Animaciones:", err);
  } finally {
    actualizando = false;
  }
}

// ✅ AÑADIDO: Reenviar mensajes desde control.html al iframe correspondiente
window.addEventListener("message", (event) => {
  const tipo = event.data;

  if (tipo === "ocultarAnuncios" || tipo === "mostrarAnuncios") {
    const iframe = document.querySelector("#anuncios iframe");
    iframe?.contentWindow?.postMessage(tipo, "*");
  }
});
