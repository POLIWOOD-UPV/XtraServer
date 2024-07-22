///////////////////////////////////////////////////////////////
// Funciones para modificar filas y sus contenidos en Ranking//
///////////////////////////////////////////////////////////////

// Variables de visibilidad específicas
let tiempo_visible = true;
let tiempos = document.getElementsByClassName("tiempo");

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
        numero.style.color = "white"
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

// Función para mostrar el tiempo en la fila
function mostrarTiempo() {
    let estado = tiempo_visible ? "none" : "block";
    tiempo_visible = !tiempo_visible;
    document.getElementById("cab_tie").style.display = tiempo_visible ? "block" : "none";
    for (let i = 0; i < tiempos.length; i++) {
        tiempos[i].style.display = estado;
    }
}

// Función para mostrar el peso en la fila
function mostrarPeso() {
    let estado = peso_visible ? "none" : "flex";
    peso_visible = !peso_visible;
    document.getElementById("cab_pes").style.display = peso_visible ? "block" : "none";
    for (let i = 0; i < pesos.length; i++) {
        pesos[i].style.display = estado;
    }
}

// Función para alternar el peso con el tiempo y viceversa
function cambiazoPesoTiempos() {
    if ((!tiempo_visible && !peso_visible) || (tiempo_visible && peso_visible)) {
        return;
    } else {
        mostrarTiempo();
        mostrarPeso();
    }
}

// Función para alternar la visibilidad de los despegues
function ocultarDespegue() {
    let despegues = document.getElementsByClassName("dot");
    let estado = despegues_visibles ? "none" : "flex";
    despegues_visibles = !despegues_visibles;
    for (let despegue of despegues) {
        despegue.style.display = estado;
    }
}

// Cambiar el nº de ronda arriba
function cambiarRonda(num) {
    let ronda = document.getElementById("num_ronda");
    ronda.textContent = num;
}
