// Este codigo se basa en rickEquipos.js

// DOM
const contenedor = document.getElementById("contenedor_equipo");
const socket = io();

let rotador = null
let contenido = []
let index = 0
let actualizando = false; // para evitar llamadas simultáneas
const intervaloRotacion = 4000 // ms
let equipos;

// Eventos
document.addEventListener("DOMContentLoaded", () => {
    pedirEquipos()
    actualizarEquipoMostrado();
});

socket.addEventListener("message", (event) => {
    if (event === "!entityUpdate urn:ngsi-ld:equipoMostrado:001") {
        actualizarEquipoMostrado();
    }
});

async function pedirEquipos(){
    const resEquipos = await fetch("/v2/entities?type=Equipo&limit=100");
    equipos = await resEquipos.json();
}

// Funciones para mostrar datos
async function actualizarEquipoMostrado() {
    if (actualizando) {
        return;
    }

    actualizando = true;

    try {
        if (rotador !== null) {
            clearInterval(rotador);
            rotador = null;
        }

        // Limpiar visualmente
        contenedor.replaceChildren();

        // Cogemos el ultimo equipo
        const res = await fetch("/v2/entities/urn:ngsi-ld:equipoMostrado:001");
        const mostrado = await res.json();

        // Comprobamos el acronimo
        acronimo = mostrado.acr?.value;
        if (!acronimo) throw new Error("acronimo no definido");

        bloques = acronimo === "SPONSORS" ? mostrarSponsor() : await mostrarEquipo(acronimo)

        // Rotacion de contenido
        contenido = bloques
        index = 0;
        mostrarContenido();
        rotador = setInterval(mostrarContenido, intervaloRotacion);
    } catch (err) {
        contenedor.innerHTML = "<p>Error al cargar el equipo activo.</p>";
        console.log(err)
    } finally {
        actualizando = false;
    }
}


async function mostrarEquipo(acronimo){
    // Cogemos el dato de ese equipo
    let equipo = equipos.find(e => e.acr?.value === acronimo);

    if (!equipo) {
        contenedor.innerHTML = `<p>Equipo con acrónimo <b>${acronimo}</b> no encontrado.</p>`;
        return;
    }

    nombre = equipo.name?.value || "Equipo sin nombre";
    logo = equipo.logo?.value || "";
    dorsal = equipo.dorsal?.value || "?";
    piloto = equipo.piloto?.value || "Desconocido";
    lider = equipo.lider?.value || "Desconocido";
    miembros = equipo.miembros?.value || "?";
    universidad = equipo.uni?.value || "Universidad desconocida";

    // Bloque logo
    logoDiv = document.createElement("div");
    img = document.createElement("img");
    // img.src = `${logo}`;
    img.src = `../favicon.ico`;
    img.src = `../img/LogosPNG/${acronimo}.png`;
    img.alt = `Logo de ${nombre}`;
    img.className = "logo-equipo";
    logoDiv.appendChild(img);
    
    const bloques = [
        logoDiv,
        crearBloque(`Dorsal`, `${dorsal}`),
        crearBloque(`Name`, `${nombre}`),
        crearBloque(`University`, universidad),
        crearBloque(`Leader`, lider),
        crearBloque(`Pilot`, piloto),
        crearBloque(`Members`, miembros)
    ];

    return bloques

}

function mostrarSponsor() {
  const sponsors = [
    "ABELLA", "AYTOALCUDIA", "COIAE", "EMBENTION", "ETSIADI", "FDACV",
    "GENERALITAT", "GENESP", "HP", "IBERDROLA", "PARANOID", "UPV"
  ];

  const bloques = [];

  for (let sponsor of sponsors) {
    const sponsorDiv = document.createElement("div");
    const img = document.createElement("img");
    img.src = `../img/Sponsors/LogosPNG/${sponsor}.png`;
    img.alt = `Logo de ${sponsor}`;
    img.className = "logo-equipo";
    sponsorDiv.appendChild(img);
    bloques.push(sponsorDiv);
  }
  return bloques
}


function crearBloque(titulo, valor) {
    div = document.createElement("div");
    div.className = "bloque-dato";
    div.innerHTML = `<div class="titulo">${titulo}</div><div class="valor">${valor}</div>`;
    return div;
}

function mostrarContenido() {
    const nuevo = contenido[index].cloneNode(true); // evitar manipular el original
    nuevo.classList.add("fade-out");

    contenedor.replaceChildren(nuevo);

    // Forzar reflow para que el fade-in se aplique correctamente
    void nuevo.offsetWidth;

    nuevo.classList.remove("fade-out");
    nuevo.classList.add("fade-in");

    index = (index + 1) % contenido.length;
}
