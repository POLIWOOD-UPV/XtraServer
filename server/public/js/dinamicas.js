const socket = io();

// EVITAR SOLAPES 
let actualizando = false;

// Cuando se cargue el DOM, pedir el estado
document.addEventListener("DOMContentLoaded", async () => {
  if (window.self !== window.top) return; // EVITAR PROBLEMAS CON EL DOM
  await actualizarEstado();
});


socket.addEventListener("message", (event) => {
  // console.log("Actualización recibida:", event);ss
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
      if (id === "id" || id === "type") continue; // ignorar campos fijos
      const estado = json[id]?.value || "oculto"; // estado por defecto: oculto
      const contenedor = document.getElementById(id === "ranking" ? "rankings" : id); // corregir id si es ranking

      if (contenedor) {
        if (id !== "ranking") {
          animarDIV(contenedor, estado); // animar contenedor si no es ranking
          contenedor.style.display = (estado === "visible") ? "block" : "none"; // mostrar u ocultar (quitar cuando animarDIV este hecha)
        } else {
          const iframe = contenedor.querySelector("iframe"); // coger el iframe que esta dentro del contenedor "rankings"
          
          if (iframe && iframe.contentWindow) { // asegurarse de que el iframe esta cargado y tiene contenido
            const doc = iframe.contentDocument || iframe.contentWindow.document; // coger el documento interno del iframe (ranking.html)

            // Cogemos el contenedor principal de ranking.html
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
    console.error("Error al obtener el estado de Animaciones:", err); // log de error
  } finally {
    actualizando = false; // desbloquear
  }
}

