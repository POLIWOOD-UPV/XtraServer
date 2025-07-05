// DOM 
const textoDOM = document.getElementById("texto");
const selector_equipo_img = document.getElementById("selector_equipo_img")
const selector_rondas = document.getElementById("selector_ronda")
const ImgLogoEquipo = document.getElementById("imagen_equipo");
const estadoLogo = document.getElementById("estadoLogo")
const datos = document.getElementById("datosEquipo")

equipos = []
rondas = []
const atributosAnimaciones = ["rankings", "anuncios", "equipos", "cronos", "datos"];
const panel = document.getElementById("panelVisibilidad");

const socket = io();

socket.on("message", (entityId) => {
  if (entityId.includes("urn:ngsi-ld:Ronda:")) {
    cogerRondas();
  } else if ((entityId.includes("urn:ngsi-ld:Animaciones:"))){
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

// Coger datos

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
    fetch("http://localhost/v2/entities?type=Ronda&limit=40")
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
async function publicarEquipoMostrado(sponsors) {
    let acronimo = sponsors ? "SPONSORS" : selector_equipo_img.value

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

// Publicar la ronda seleccionada como activa
function publicarRonda() {
  const numSeleccionado = selector_rondas.value;
  if (!numSeleccionado) {
    alert("Selecciona una ronda valida");
    return;
  }

  // Creamos la entidad NGSI para marcarla como activa
  const entidad = {
    id: `urn:ngsi-ld:Ronda:${numSeleccionado}`,
    type: "Ronda",
    actv: { type: "Bit", value: 1 }
  };

  // Mandamos la entidad al broker
  fetch("/v2/op/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      actionType: "update",
      entities: [entidad]
    })
  })
    .then(async res => {
      if (res.ok) {
        console.log(`Ronda ${numSeleccionado} marcada como activa`);
        // Desactivamos las demas rondas
        await desactivarOtrasRondas(parseInt(numSeleccionado));
      } else {
        const msg = await res.text();
        console.error(`Error (${res.status}): ${msg}`);
      }
    })
    .catch(err => {
      console.error("Error al publicar ronda:", err.message);
    });
}

// Desactiva todas las rondas excepto la indicada
async function desactivarOtrasRondas(numActivo) {
  try {
    // Cogemos todas las rondas del servidor
    const res = await fetch("/v2/entities?type=Ronda&limit=40");
    const rondas = await res.json();

    // Filtramos solo las que estan activas y no son la actual
    const aDesactivar = rondas
      .filter(r => r.num?.value != numActivo && r.actv?.value == 1)
      .map(r => ({
        id: r.id,
        type: "Ronda",
        actv: { type: "Bit", value: 0 }
      }));

    // Si hay rondas que desactivar, mandamos la peticion
    if (aDesactivar.length > 0) {
      await fetch("/v2/op/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "update",
          entities: aDesactivar
        })
      });
      console.log(`Desactivadas ${aDesactivar.length} otras rondas`);
    }
  } catch (err) {
    console.error("Error al desactivar otras rondas:", err);
  }
}




async function alternar(attr) {
  const boton = document.getElementById(attr);
  const nuevoValor = (boton.textContent === "visible") ? "oculto" : "visible";
  boton.textContent = "Actualizando...";

  const entidad = {
    id: "urn:ngsi-ld:Animaciones:001",
    type: "Animaciones",
    [attr]: { type: "Text", value: nuevoValor }
  };

  try {
    const res = await fetch("/v2/op/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actionType: "update", entities: [entidad] })
    });

    if (res.ok) {
      boton.textContent = nuevoValor;
    } else {
      const msg = await res.text();
      boton.textContent = `Error`;
      console.error(`Error ->(${res.status}):`, msg);
    }
  } catch (err) {
    boton.textContent = "Error";
    console.error("Error al alternar visibilidad:", err);
  }
}



