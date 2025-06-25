// Este codigo se basa en rickEquipos.js

// DOM
const contenedor = document.getElementById("contenedor_equipo");
const socket = io();

let rotador = null
let contenido = []
let index = 0
let actualizando = false; // para evitar llamadas simultáneas
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
        const res = await fetch("http://localhost:80/v2/entities/urn:ngsi-ld:equipoMostrado:001");
        const mostrado = await res.json();
        
        // Comprobamos el acronimo
        acronimo = mostrado.acr?.value;
        if (!acronimo) throw new Error("acronimo no definido");

        // Cogemos el dato de ese equipo
        const resEquipos = await fetch("http://localhost:80/v2/entities?type=Equipo&limit=100");
        const equipos = await resEquipos.json();
        equipo = equipos.find(e => e.acr?.value === acronimo);

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
        contenedor.innerHTML = "<p>Error al cargar el equipo activo.</p>";
        console.log(err)
    } finally {
        actualizando = false;
    }
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
