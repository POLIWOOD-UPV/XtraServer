const socket = io();

    // DOM
    contenedor_logo_equipo = document.getElementById("contenedor_logo_equipo");
    estadoLogo = document.getElementById("estadoLogo");
    datosEquipo = document.getElementById("datosEquipo");

    function mostrarLogo(path) {
        estadoLogo.textContent = path;
        contenedor_logo_equipo.src = path;
    }

    function mostrarDatosEquipo(equipo) {
        datosEquipo.innerHTML = `
            <table style="margin-top: 10px; border-collapse: collapse;">
                <tr><td><strong>Lider:</strong></td><td>${equipo.lider?.value || "N/A"}</td></tr>
                <tr><td><strong>Piloto:</strong></td><td>${equipo.piloto?.value || "N/A"}</td></tr>
                <tr><td><strong>Universidad:</strong></td><td>${equipo.uni?.value || "N/A"}</td></tr>
                <tr><td><strong>Miembros:</strong></td><td>${equipo.miembros?.value || "N/A"}</td></tr>
                <tr><td><strong>Académico:</strong></td><td>${equipo.acad?.value ? "Sí" : "No"}</td></tr>
            </table>
        `;
    }

    async function actualizarEquipoMostrado() {
        try {
            const resEquipoMostrado = await fetch("http://localhost/v2/entities/urn:ngsi-ld:equipoMostrado:001");
            const entidad = await resEquipoMostrado.json();
            const acronimo = entidad.acr.value;

            // Mostrar imagen (logo jpg)
            contenedor_logo_equipo.src = `/data/equipos/${acronimo}.jpg`;
            estadoLogo.textContent = acronimo;

            const resEquipos = await fetch("http://localhost/v2/entities?type=Equipo&limit=100");
            const equipos = await resEquipos.json();
            const equipo = equipos.find(e => e.acr?.value === acronimo);

            if (equipo) mostrarDatosEquipo(equipo);
        } catch (err) {
            console.error("Error al actualizar equipo mostrado:", err);
        }
    }

    // Eventos
    document.addEventListener("DOMContentLoaded", () => {
        actualizarEquipoMostrado();

        socket.addEventListener("message", (event) => {
            if (event === "!entityUpdate urn:ngsi-ld:equipoMostrado:001") {
                actualizarEquipoMostrado();
            }
        });
    });