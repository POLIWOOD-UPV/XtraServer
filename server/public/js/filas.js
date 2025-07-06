// Crea la fila donde se meten los datos
function creaFila(nom, pos, tiemp, pes, despegue) {
    // Creamos la fila con sus partes
    let fila = document.createElement("div");
    fila.className = "fila";
    
    // Creamos la zona del número
    let numero = document.createElement("div");
    numero.className = "numero";
    numero.textContent = pos;

    // Si es un club, que el numero sea de otro color
    if (nom === "XALOC" || nom.substring(0, 4) === "EAFT") {
        numero.style.backgroundColor = "rgb(70 157 243)";
        numero.style.color = "white";
    }
    
    // Creamos la zona del nombre, peso/tiempo
    let resto = document.createElement("div");
    resto.className = "resto";
    
    // Ponemos el nombre
    let nombre = document.createElement("div");
    nombre.className = "nombre";
    nombre.textContent = nom;
    
    // Metemos el logo
    let logo = meterLogos(nom);
    
    // Metemos el dorsal
    let dor = meterDorsal(nom);
    
    // Metemos el estado del despegue
    let circulo = document.createElement("span");
    circulo.className = "dot";
    let color = "";
    switch (despegue) {
        case "Corto": color = "#9000ff"; break;
        case "Correcto": color = "#0dff00"; break;
        case "Ilegal": color = "#ff0000"; break;
        case "Pendiente": color = "#ffffff"; break;
        case "Fallido": color = "#E6FE00"; break;
    }
    circulo.style.backgroundColor = color;
    
    // Informativos
    // Tiempo
    let tiempo = document.createElement("div");
    tiempo.className = "tiempo";
    tiempo.textContent = tiemp;
    
    // Peso
    let peso = document.createElement("div");
    peso.className = "peso";
    peso.textContent = pes;
    
    if (!tiempo_visible) {
        tiempo.style.display = "none";
    }
    if (peso_visible) {
        peso.style.display = "flex";
    }
    if (logos_visibles) {
        logo.style.display = "flex";
    }
    if (dorsal_visible) {
        dor.style.display = "flex";
    }
    if (!despegues_visibles) {
        circulo.style.display = "none";
    }
    
    // Lo juntamos todo y devolvemos la fila
    resto.append(dor, nombre, tiempo, peso, circulo);
    fila.id = pos;
    fila.append(numero, logo, resto);
    
    // Ponemos la fila en la izquierda para que se mueva más tarde
    fila.style.left = "-500px";
    return fila;
}

// ——— Funciones de construcción de fila ———
function meterLogos(nom) {
  const div = document.createElement("div");
  div.className = "logo";
  div.style.display = logos_visibles ? "flex" : "none";
  let key = nom.startsWith("SAET") ? "SAETA"
          : nom.startsWith("EAFT") ? "FlyEagle"
          : nom;
  const img = document.createElement("img");
  img.src = `./img/LogosPNG/${key}.png`;
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

// ——— Funciones para toggle de visibilidad ———
function ocultarLogos() {
  logos_visibles = !logos_visibles;
  document.getElementById("cab_log").style.display = logos_visibles?"block":"none";
  document.querySelectorAll(".logo").forEach(el=> el.style.display = logos_visibles?"flex":"none");
}
function ocultarDespegue() {
  despegues_visibles = !despegues_visibles;
  document.querySelectorAll(".dot").forEach(el=> el.style.display = despegues_visibles?"flex":"none");
}
function mostrarDorsal() {
  dorsal_visible = !dorsal_visible;
  const cabDor = document.getElementById("cab_dor");
  if (cabDor) {
    cabDor.style.display = dorsal_visible ? "block" : "none";
  }
  document.querySelectorAll(".dorsal")
    .forEach(el => el.style.display = dorsal_visible ? "flex" : "none");
}

function mostrarPeso() {
  peso_visible = !peso_visible;
  const cabPes = document.getElementById("cab_pes");
  if (cabPes) {
    cabPes.style.display = peso_visible ? "block" : "none";
  }
  document.querySelectorAll(".peso")
    .forEach(el => el.style.display = peso_visible ? "flex" : "none");
}