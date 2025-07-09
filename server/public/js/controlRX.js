/*
Javascript para recibir datos del servidor
*/

// Coger datos

function cogerEquipos() {
    // Cogemos los equipos del servidor
    fetch("/v2/entities?type=Equipo&limit=40")
    .then(res =>{
        if (!res.ok)  throw new Error("No se pudo coger los equipos del servidor")
            return res.json()
    })
    .then(json =>{
        equipos = json
        selector_equipo_img.innerHTML = ""
        selector_ranking.innerHTML = ""
        // Guardamos los equipos individuales
        json.forEach(equipo => {
            acronimo = equipo.acr?.value || "Sin acrónimo"
            dorsal = equipo.dorsal?.value || "Sin dorsal"
            
            // Metemos los acros en el select
            option = document.createElement("option")
            option.value = acronimo
            option.textContent = `${dorsal} - ${acronimo}`
            selector_equipo_img.appendChild(option)

            // Metemos los acros en el OTRO select
            option2 = document.createElement("option")
            option2.value = acronimo
            option2.textContent = `${dorsal} - ${acronimo}`
            selector_ranking.appendChild(option2)
        })
    })
}

async function cogerAnimaciones() {
  try {
    const res = await fetch("/v2/entities/urn:ngsi-ld:Animaciones:001");
    const json = await res.json();
    atributosAnimaciones.forEach(attr => {
      const boton = document.getElementById(attr);
      boton.textContent = json[attr]?.value || "oculto";
    });
  } catch (err) {
    console.error("Error al obtener Animaciones:", err);
  }
}

function cogerRondas() {
    // Cogemos los equipos del servidor
    fetch("/v2/entities?type=Ronda&limit=40")
    .then(res =>{
        if (!res.ok)  throw new Error("No se pudo coger las rondas del servidor")
            return res.json()
    })
    .then(json =>{
        rondas = json
        selector_rondas.innerHTML = ""
        // Guardamos las rondas individuales
        json.forEach(ronda => {
            numero = ronda.num.value
            activa = ronda.actv?.value == 1
            
            
            // Lo metemos en el select
            option = document.createElement("option")
            option.value = numero
            option.textContent = activa ? `ACTIVA Ronda ${numero}` : `Ronda ${numero}`;
            
            selector_rondas.appendChild(option)
        })
    })
}
