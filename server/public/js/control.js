// DOM 
textoDOM = document.getElementById("texto");
selector_equipo_img = document.getElementById("selector_equipo_img")
ImgLogoEquipo = document.getElementById("imagen_equipo");
estadoLogo = document.getElementById("estadoLogo")
datos = document.getElementById("datosEquipo")

equipos = []

// Eventos
document.addEventListener("DOMContentLoaded",cogerEquipos)    
selector_equipo_img.addEventListener("change",mostrarDatosEquipo)


function cogerEquipos() {
    // Cogemos los equipos del servidor
    fetch("http://localhost/v2/entities?type=Equipo&limit=40")
    .then(res =>{
        if (!res.ok)  throw new Error("No se pudo coger los equipos del servidor")
            return res.json()
    })
    .then(json =>{
        equipos = json
        selector_equipo_img.innerHTML = ""
        // Guardamos los equipos individuales
        json.forEach(equipo => {
            acronimo = equipo.acr?.value || "Sin acrónimo"
            dorsal = equipo.dorsal?.value || "Sin dorsal"
            
            // Metemos los acros en el select
            option = document.createElement("option")
            option.value = acronimo
            option.textContent = `${dorsal} - ${acronimo}`
            
            selector_equipo_img.appendChild(option)
        })
    })
}


// Anuncios
async function publicarAnuncio() {
    let texto = textoDOM.value.trim();
    // Comprobar que el texto no esta vacío 
    if (!texto) {
        texto = "XC2025";
        estado.textContent = "El texto no puede estar vacío. XC2025 puesto";
    }

    const entidad = {
        id: "urn:ngsi-ld:Anuncio:001",
        type: "Anuncio",
        texto: { type: "Text", value: texto }
    };
    
    try {
        // Mandar el texto a ORION
        const res = await fetch("/v2/op/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                actionType: "update",
                entities: [entidad]
            })
        });
        
        // Comprobar la respuesta
        if (res.ok) {
            estado.textContent = `Anuncio publicado: "${texto}"`;
        } else {
            const msg = await res.text();
            estado.textContent = `Error ->(${res.status}): ${msg}`;
        }
    } catch (err) {
        estado.textContent = `Error al enviar el anuncio: ${err.message}`;
    }
}

// Datos
async function publicarEquipoMostrado() {
    let acronimo = selector_equipo_img.value || "WOOD";

    let entidad = {
        id: "urn:ngsi-ld:equipoMostrado:001",
        type: "EquipoMostrado",
        acr: { type: "Text", value: acronimo }
    };

    try {
        const res = await fetch("/v2/op/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                actionType: "update",
                entities: [entidad]
            })
        });

        if (res.ok) {
            estadoLogo.textContent = `Equipo mostrado publicado: "${acronimo}"`;
            mostrarDatosEquipo();
        } else {
            const msg = await res.text();
            estadoLogo.textContent = `Error ->(${res.status}): ${msg}`;
        }
    } catch (err) {
        estadoLogo.textContent = `Error al enviar el EquipoMostrado de ${acronimo}: ${err.message}`;
    }
}


function mostrarDatosEquipo() {
    acronimo = selector_equipo_img.value;
    if (acronimo) {
        ImgLogoEquipo.src = `/data/equipos/${acronimo}.jpg`;
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



