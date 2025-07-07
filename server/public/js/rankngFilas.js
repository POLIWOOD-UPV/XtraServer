/*
Javascript para la creación e inserción de filas en el ranking
*/

// Construir la fila
function creaFila(nom, pos, rawMs, tiemp, pes, despegue) {
    // Creamos la fila con sus partes
    const fila = document.createElement("div");
  
    // Determinar si es universitario consultando equiposJSON
    const equipoData = equiposJSON.find(e => e.acr.value === nom);
    const esUni      = equipoData?.acad.value === true;
    fila.className   = esUni ? "filaUni" : "filaClub";
    
    // Asignamos el id igual a la posición para que meter_en_ranking la encuentre
    fila.id = String(pos);

    // Número
    const numero = document.createElement("div");
    numero.className = "numero";
    numero.textContent = pos;

    // Zona de contenido (logo, nombre, tiempo, peso, despegue)
    const resto = document.createElement("div");
    resto.className = "resto";

    // Nombre
    const nombre = document.createElement("div");
    nombre.className = "nombre";
    nombre.textContent = nom;

    // Logo dinámico
    const logo = meterLogos(nom);
    logo.style.display = logos_visibles ? "flex" : "none";

    // Dorsal dinámico
    const dor = meterDorsal(nom);
    dor.style.display = dorsal_visible ? "flex" : "none";

    // Tiempo
    const tiempoDiv = document.createElement("div");
    tiempoDiv.className = "tiempo";
    tiempoDiv.textContent = tiemp;
    tiempoDiv.dataset.raw = rawMs;
    tiempoDiv.style.display = tiempo_visible ? "block" : "none";

    // Peso
    const pesoDiv = document.createElement("div");
    pesoDiv.className = "peso";
    pesoDiv.textContent = pes;
    pesoDiv.style.display = peso_visible ? "flex" : "none";

    // Despegue (círculo coloreado)
    const dot = document.createElement("span");
    dot.className = "dot";
    const colorMap = {
      "15m":        "#9000ff",
      "20m":        "#ff00e6",
      "40m":        "#0062ff",
      "60m":        "#0dff00",
      "Pendiente":  "#ffffff",
      "Fallido":    "#ff0000"
    };
    dot.style.backgroundColor = colorMap[despegue] || "#ffffff";
    dot.style.display = despegues_visibles ? "flex" : "none";

    // Montamos el resto
    resto.append(dor, nombre, tiempoDiv, pesoDiv, dot);
    fila.append(numero, logo, resto);

    // Prepara para animar (sale desde la izquierda)
    fila.style.left = "-500px";
    return fila;
}


function meterLogos(nom) {
  const div = document.createElement("div");
  div.className = "logo";
  div.style.display = logos_visibles ? "flex" : "none";
  const img = document.createElement("img");
  img.src = `../../img/LogosPNG/${nom}.png`;
  div.append(img);
  return div;
}
function meterDorsal(nom) {
  const div = document.createElement("div");
  div.className = "dorsal";
  div.style.display = dorsal_visible ? "flex" : "none";
  div.textContent = valores_dorsal[nom] || "";
  return div;
}

// Calcula la posición (1-based) de un nuevo piloto comparando su tiempo con los existentes
function sacar_pos_piloto(rawMs, filas) {
  // 1) Leer todos los rawMs de las filas existentes
  const tiemposExistentes = filas.map(fila => {
    const attr = fila.querySelector(".tiempo")?.dataset.raw;
    return attr != null ? Number(attr) : Infinity;
  });

  // 2) Meter el nuevo tiempo y ordenar numéricamente
  const todos = [...tiemposExistentes, rawMs].sort((a, b) => a - b);

  // 3) La posición es el índice de rawMs + 1
  return todos.indexOf(rawMs) + 1;
}



// Inserta la fila 
function meter_en_ranking(nueva_fila) {
  // 1) Declaramos fuera los dos valores
  let ranking, filas;

  // 2) Elegimos contenedor y filas según clase
  if (nueva_fila.className === "filaUni") {
    ranking = document.getElementById("filasUni");
    filas   = Array.from(ranking.querySelectorAll(".filaUni"));
  } else {
    ranking = document.getElementById("filasClub");
    filas   = Array.from(ranking.querySelectorAll(".filaClub"));
  }

  // 3) Sacamos pos y comprobamos si ocupa
  const pos   = parseInt(nueva_fila.querySelector(".numero").textContent, 10);
  const ocupa = filas.some(f => parseInt(f.id, 10) === pos);

  if (ocupa) {
    // 4a) Insertar en medio y reindexar
    const antes   = filas.slice(0, pos - 1);
    const despues = filas.slice(pos - 1);
    const todas   = [...antes, nueva_fila, ...despues];

    todas.forEach((f, i) => {
      f.id = `${i + 1}`;
      f.querySelector(".numero").textContent = i + 1;
    });

    // 5a) Volcar al DOM
    const frag = document.createDocumentFragment();
    todas.forEach(f => frag.appendChild(f));
    ranking.innerHTML = "";
    ranking.appendChild(frag);
  } else {
    // 4b) Añadir al final y reindexar
    ranking.appendChild(nueva_fila);

    // Ojo: usamos el mismo selector que arriba
    const selector = nueva_fila.className === "filaUni" ? ".filaUni" : ".filaClub";
    Array.from(ranking.querySelectorAll(selector)).forEach((f, i) => {
      f.id = `${i + 1}`;
      f.querySelector(".numero").textContent = i + 1;
    });
  }
}

