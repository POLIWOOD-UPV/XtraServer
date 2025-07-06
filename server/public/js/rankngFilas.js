/*
Javascript para la creación e inserción de filas en el ranking
*/

// Construir la fila
function creaFila(nom, pos, tiemp, pes, despegue) {
    // Creamos la fila con sus partes
    const fila = document.createElement("div");
  
    // Primero hay que determinar a cual de los dos va (clubes / unis)
    let clase;
    if (equiposAcademicos.has(nom)) {
      clase = "filaUni"
    }else {
      clase = "filaClub"
    }
    fila.className = clase
    
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
    if (logos_visibles) logo.style.display = "flex";
    else            logo.style.display = "none";

    // Dorsal dinámico
    const dor = meterDorsal(nom);
    if (dorsal_visible) dor.style.display = "flex";
    else               dor.style.display = "none";

    // Tiempo
    const tiempoDiv = document.createElement("div");
    tiempoDiv.className = "tiempo";
    tiempoDiv.textContent = tiemp;
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
      "Corto":      "#9000ff",
      "Correcto":   "#0dff00",
      "Ilegal":     "#ff0000",
      "Pendiente":  "#ffffff",
      "Fallido":    "#E6FE00"
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
function sacar_pos_piloto(tiempoStr, filasControl) {
  // 1) Convertir el tiempo nuevo a ms
  const tiempoNuevo = convertirTiempoAMilisegundos(tiempoStr);

  // 2) Extraer y convertir todos los tiempos actuales a ms
  const tiempos = filasControl.map((f, idx) => {
    const tText = f.querySelector('.tiempo').textContent;
    const tMs = convertirTiempoAMilisegundos(tText);
    return tMs;
  });

  // 3) Insertar el tiempo nuevo en el array y ordenar de menor a mayor
  const ordenados = [...tiempos, tiempoNuevo].sort((a, b) => a - b);

  // 4) Determinar posición (lastIndexOf +1)
  const pos = ordenados.lastIndexOf(tiempoNuevo) + 1;
  return pos;
}


// Inserta la fila 
function meter_en_ranking(nueva_fila) {
  // 1) Declarar fuera los dos valores
  let ranking, filas;

  // 2) Rellenar según si es Uni o Club
  if (nueva_fila.className === "filaUni") {
    ranking = document.getElementById("filasUni");
    filas   = Array.from(ranking.querySelectorAll(".filaUni"));
  } else {
    ranking = document.getElementById("filasClub");
    filas   = Array.from(ranking.querySelectorAll(".filaClub"));
  }

  // 3) Leer la posición y saber si está ocupada
  const pos   = parseInt(nueva_fila.querySelector(".numero").textContent, 10);
  const ocupa = filas.some(f => parseInt(f.id, 10) === pos);

  if (ocupa) {
    // 4a) Insertar en medio y desplazar
    const antes   = filas.slice(0, pos - 1);
    const despues = filas.slice(pos - 1);
    const todas   = [...antes, nueva_fila, ...despues];

    // 5a) Reindexar IDs y números
    todas.forEach((f, i) => {
      f.id = `${i + 1}`;
      f.querySelector(".numero").textContent = i + 1;
    });

    // 6a) Volcar de nuevo en el contenedor
    const frag = document.createDocumentFragment();
    todas.forEach(f => frag.appendChild(f));
    ranking.innerHTML = "";
    ranking.appendChild(frag);
  } else {
    // 4b) Añadir al final
    ranking.appendChild(nueva_fila);

    // 5b) Reindexar usando el mismo selector de filas del contenedor
    const selector = nueva_fila.className === "filaUni" ? ".filaUni" : ".filaClub";
    Array.from(ranking.querySelectorAll(selector)).forEach((f, i) => {
      f.id = `${i + 1}`;
      f.querySelector(".numero").textContent = i + 1;
    });
  }
}

