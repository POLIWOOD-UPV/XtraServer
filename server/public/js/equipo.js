// Este codigo se basa en rickEquipos.js

// DOM
const contenedor = document.getElementById("equipo");
const socket = io();


let rotador = null
let contenido = []
let index = 0
const intervaloRotacion = 4000 // ms

// Eventos
document.addEventListener("DOMContentLoaded", () => {
    actualizarEquipoMostrado();
});

socket.addEventListener("message", (event) => {
    if (event === "!entityUpdate urn:ngsi-ld:equipoMostrado:001") {
        actualizarEquipoMostrado();
    }
});

// Funciones para mostrar datos
async function actualizarEquipoMostrado() {
    try {
        // Limpiar rotador previo si existe
        if (rotador) {
            clearInterval(rotador);
            rotador = null;
        }

        // Limpiar visualmente
        contenedor.replaceChildren();

        // Cogemos el ultimo equipo
        const res = await fetch("http://localhost:80/v2/entities/urn:ngsi-ld:equipoMostrado:001");
        const mostrado = await res.json();
        
        // Comprobamos el acronimo
        acronimo = mostrado.acr?.value;
        if (!acronimo) throw new Error("acronimo no definido");

        // Cogemos el dato de ese equipo
        const resEquipos = await fetch("http://localhost:80/v2/entities?type=Equipo&limit=100");
        const equipos = await resEquipos.json();
        equipo = equipos.find(e => e.acr?.value === acronimo);

        // Comprobamos el equipo
        if (!equipo) {
            contenedor.innerHTML = `<p>Equipo con acrónimo <b>${acronimo}</b> no encontrado.</p>`;
            return;
        }


        // Construimos los bloques de contenido
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
        img.src = `./public/favicon.ico`///${logo}`;
        img.alt = `Logo de ${nombre}`;
        img.className = "logo-equipo";
        logoDiv.appendChild(img);
        
        // Bloque info basica
        const bloque1 = document.createElement("div");
        bloque1.className = "equipo"
        bloque1.innerHTML = `
        <div class="dato-equipo"><strong>${dorsal} - ${nombre}</strong></div>
        <div class="dato-equipo"><strong>Universidad:</strong> <span class="valor">${universidad}</span></div>
        `;
        
        
        // Bloque info avanzada
        const bloque2 = document.createElement("div");
        bloque2.className = "equipo";
        bloque2.innerHTML = `
        <div class="dato-equipo"><strong>Líder:</strong> <span class="valor">${lider}</span></div>
        <div class="dato-equipo"><strong>Piloto:</strong> <span class="valor">${piloto}</span></div>
        <div class="dato-equipo"><strong>Miembros:</strong> <span class="valor">${miembros}</span></div>
        `;

        // Rotacion de contenido
        contenido = [logoDiv, bloque1, bloque2];
        index = 0;
        mostrarContenido();
        rotador = setInterval(mostrarContenido, intervaloRotacion);

    } catch (err) {
        console.error("Error al actualizar equipo mostrado:", err);
        contenedor.innerHTML = "<p>Error al cargar el equipo activo.</p>";
    }
}

function mostrarContenido() {
    contenedor.innerHTML = "";
    contenedor.appendChild(contenido[index]);
    index = (index + 1) % contenido.length;
}