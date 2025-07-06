/*
Javascript para la creación e inserción de filas en el ranking
*/

// Construir la fila
function creaFila(nom, pos, tiemp, pes, despegue) {
    // Creamos la fila con sus partes
    const fila = document.createElement("div");
    fila.className = "fila";
    
    // Número
    const numero = document.createElement("div");
    numero.className = "numero";
    numero.textContent = pos;
    // Si es un club, que el número sea de otro color
    if (nom === "XALOC" || nom.startsWith("EAFT")) {
        numero.style.backgroundColor = "rgb(70 157 243)";
        numero.style.color = "white";
    }

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



// Inserta la fila 
function meter_en_ranking(nueva_fila) {
  const ranking = document.getElementById("contenedor");
  const filas = Array.from(ranking.querySelectorAll(".fila"));
  const pos   = parseInt(nueva_fila.querySelector(".numero").textContent, 10);
  const ocupa = filas.some(f => parseInt(f.id,10)===pos);
  if (ocupa) {
    // Inserta y reindexa
    const antes   = filas.slice(0, pos-1),
          despues = filas.slice(pos-1),
          todas   = [...antes, nueva_fila, ...despues];
    todas.forEach((f,i)=>{
      f.id = `${i+1}`;
      f.querySelector(".numero").textContent = i+1;
    });
    const frag = document.createDocumentFragment();
    frag.append(document.getElementById("cabeza"));
    todas.forEach(f => frag.append(f));
    ranking.innerHTML = "";
    ranking.append(frag);
  } else {
    // Al final\    ranking.appendChild(nueva_fila);
    Array.from(ranking.querySelectorAll(".fila")).forEach((f,i)=>{
      f.id = `${i+1}`;
      f.querySelector(".numero").textContent = i+1;
    });
  }
}
