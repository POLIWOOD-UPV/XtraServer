// DOM 
textoDOM = document.getElementById("texto");
selector_equipo_img = document.getElementById("selector_equipo_img")
ImgLogoEquipo = document.getElementById("imagen_equipo");
estadoLogo = document.getElementById("estadoLogo")

// Inicio documento
document.addEventListener("DOMContentLoaded",()=>{
    cogerEquipos()
})
            
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
async function publicarLogo() {
    let equipo = selector_equipo_img.value;
    
    // Comprobar que el texto no esta vacío 
    if (!equipo) {
        equipo = "WOOD";
        estadoLogo.textContent = "El texto no puede estar vacío. XC2025 puesto";
    }

    path = `../data/logos/${equipo}.png`
    let entidad = {
        id:"urn:ngsi-ld:Logo:001",
        type: "Logo",
        path: {type: "Text", value: path}
    }
    
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
            estadoLogo.textContent = `Logo publicado de: "${equipo}"`;
        } else {
            const msg = await res.text();
            estadoLogo.textContent = `Error ->(${res.status}): ${msg}`;
        }
    } catch (err) {
        estadoLogo.textContent = `Error al enviar el logo de ${equipo}: ${err.message}`;
    }
}


// Imagenes equipo
function cogerEquipos() {
    // Cogemos los equipos del servidor
    fetch("http://localhost/v2/entities?type=Equipo&limit=40")
    .then(res =>{
        if (!res.ok)  throw new Error("No se pudo coger los equipos del servidor")
            return res.json()
    })
    .then(json =>{
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
    
// Mostrar imagen al seleccionar un equipo en el dropdown
selector_equipo_img.addEventListener("change", () => {
    acronimo = selector_equipo_img.value;
    if (acronimo) {
        // ImgLogoEquipo.src = `/data/equipos/${acronimo}.jpg`;
        ImgLogoEquipo.style.display = "block";
    } else {
        ImgLogoEquipo.style.display = "none";
    }
});

