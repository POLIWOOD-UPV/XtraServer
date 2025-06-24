// Este codigo se basa en rickEquipos.js

// DOM
const contenedor = document.getElementById("equipo");
const socket = io();

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

    // Sacamos los datos
    nombre = equipo.name?.value || "Equipo sin nombre";
    logo = equipo.logo?.value || "";
    dorsal = equipo.dorsal?.value;

    // Poner la imagen
    contenedor.innerHTML = `
        <img src="/public/img/${logo}" alt="${acronimo}">
        <strong>${dorsal} - ${nombre}</strong>
    `;
    } catch (err) {
        console.error("Error al actualizar equipo mostrado:", err);
        contenedor.innerHTML = "<p>Error al cargar el equipo activo.</p>";
    }
}