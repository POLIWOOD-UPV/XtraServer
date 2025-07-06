/*
Javascript para mandar datos al servidor / ranking
*/


// RONDAS
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

// EQUIPOS / SPONSORS
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

// ANUNCIOS
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


// RANKING
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


