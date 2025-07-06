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


function enviarRanking() {
    const acr = selector_ranking.value;
    const min = parseInt(document.getElementById("minutos_input_id").value) || 0;
    const seg = parseInt(document.getElementById("segundos_input_id").value) || 0;
    const mil = parseInt(document.getElementById("milisegundos_input_id").value) || 0;
    const peso = parseFloat(document.getElementById("peso_input_id").value) || 0;
    const despegue = document.getElementById("tipos_despegue_id").value;
    if (!acr) return alert("Selecciona un equipo");

    const tiempoMs = min * 60000 + seg * 1000 + mil;
    const tiempoStr = `${min}:${String(seg).padStart(2, '0')}:${String(mil).padStart(1, '0')}`;

    // Calcular posición
    const tiemposActuales = Array.from(document.getElementsByClassName("tiempo"))
        .map(t => {
            const [m, s, ms] = t.textContent.split(":").map(Number);
            return m * 60000 + s * 1000 + ms;
        });

    tiemposActuales.push(tiempoMs);
    tiemposActuales.sort((a, b) => a - b);
    const pos = tiemposActuales.lastIndexOf(tiempoMs) + 1;

    // Emitir al socket global
    socket.emit("message", {
        tipo: "rankingTest",
        acr,
        tiempo: tiempoStr,
        peso,
        despegue,
        pos
    });
}


function enviarTodosCeros() {
  const select = document.getElementById('selector_equipo_ranking');
  // Preparamos el tiempo a 0 y el string formateado
  const min = 0, seg = 0, mil = 0;
  const tiempoMs = 0;
  const tiempoStr = `${min}:${String(seg).padStart(2, '0')}:${String(mil).padStart(1, '0')}`;

  // Calculamos la posición de 0ms en el ranking actual
  const tiemposActuales = Array.from(document.getElementsByClassName("tiempo"))
    .map(t => {
      const [m, s, ms] = t.textContent.split(":").map(Number);
      return m * 60000 + s * 1000 + ms;
    });
  // Insertamos un cero para ver dónde caería
  tiemposActuales.push(tiempoMs);
  tiemposActuales.sort((a, b) => a - b);
  const posCero = tiemposActuales.lastIndexOf(tiempoMs) + 1;

  // Recorremos todos los equipos y emitimos el mismo evento que enviarRanking()
  for (let i = 0; i < select.options.length; i++) {
    const acr = select.options[i].value;
    if (!acr) continue;
    socket.emit("message", {
      tipo: "rankingTest",
      acr,
      tiempo: tiempoStr,
      peso: 0,
      despegue: "Pendiente",
      pos: posCero
    });
  }
}


