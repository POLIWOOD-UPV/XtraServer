/*
Javascript general para controlar el ranking y el HUD
*/

// DOM 
const textoDOM = document.getElementById("texto");
const selector_equipo_img = document.getElementById("selector_equipo_img")
const selector_rondas = document.getElementById("selector_ronda")
const selector_ranking = document.getElementById("selector_equipo_ranking");
const ImgLogoEquipo = document.getElementById("imagen_equipo");
const estadoLogo = document.getElementById("estadoLogo")
const datos = document.getElementById("datosEquipo")

equipos = []
rondas = []
const atributosAnimaciones = ["rankings","anuncios","equipos","cronos","datos",
                             "tiempos","logos","dorsales","pesos","nombre","pos","dot"];
const panel = document.getElementById("panelVisibilidad");

const socket = io();

socket.on("message", (msg) => {
  if (typeof msg !== "string") {return}
  if (msg.includes("urn:ngsi-ld:Ronda:")) {
    cogerRondas();
  } else if ((msg.includes("urn:ngsi-ld:Animaciones:"))){
    cogerAnimaciones()
  }
});



// Eventos
document.addEventListener("DOMContentLoaded", () => {
  // Cargar datos
  cogerEquipos();
  cogerAnimaciones();
  cogerRondas();
});

selector_equipo_img.addEventListener("change",mostrarDatosEquipo)

// Modificar el DOM de control.html
function mostrarDatosEquipo() {
    acronimo = selector_equipo_img.value;
    if (acronimo) {
        ImgLogoEquipo.src = `/img/LogosPNG/${acronimo}.png`;
        ImgLogoEquipo.style.display = "block";

        // Si el equipo existe
        equipo = equipos.find(e => e.acr?.value === acronimo);

        // Representar datos
        if (equipo) {
            datos.innerHTML = `
                <table style="margin-top: 10px; border-collapse: collapse;">
                    <tr><td><strong>Acrónimo:</strong></td><td>${acronimo || "N/A"}</td></tr>
                    <tr><td><strong>Lider:</strong></td><td>${equipo.lider?.value || "N/A"}</td></tr>
                    <tr><td><strong>Piloto:</strong></td><td>${equipo.piloto?.value || "N/A"}</td></tr>
                    <tr><td><strong>Universidad / Club:</strong></td><td>${equipo.uni?.value || "N/A"}</td></tr>
                    <tr><td><strong>Miembros:</strong></td><td>${equipo.miembros?.value || "N/A"}</td></tr>
                    <tr><td><strong>Académico:</strong></td><td>${equipo.acad?.value ? "Sí" : "No"}</td></tr>
                </table>
            `;
        } else {
            datos.textContent = "Equipo no encontrado.";
        }
    } else {
        ImgLogoEquipo.style.display = "none";
        datos.innerHTML = "";
    }
}

async function toggleAnim(attr) {
  const btn = document.getElementById(attr);
  const nuevo = btn.textContent === "visible" ? "oculto" : "visible";
  btn.textContent = "Actualizando…";

  const entidad = {
    id: "urn:ngsi-ld:Animaciones:001",
    type: "Animaciones",
    [attr]: { type: "Text", value: nuevo }
  };

  try {
    const res = await fetch("/v2/op/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actionType: "update", entities: [entidad] })
    });
    btn.textContent = res.ok ? nuevo : "Error";
  } catch (err) {
    btn.textContent = "Error";
    console.error("Error toggleAnim:", err);
  }
}

