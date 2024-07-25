////////////////////////////////////////////////////
// Funciones Comunes para Modificar Filas y sus Contenidos //
////////////////////////////////////////////////////

// Variables Pilotos
let controla_pilotos = 1;
let valores_dorsal = {
    "RUHE": 1, "UVIGA": 2, "G3": 3, "MATSI": 4, "LUFTS": 5, "ECLFT": 6,
    "SAET2": 7, "DIANA": 8, "TRENC": 9, "NTHPO": 10, "SAET1": 11, "UCAIR": 12,
    "XALOC": 15, "EAFT1": 16, "EAFT2": 17,"EAFT3":18
};

// Coger ranking y filas
let ranking = document.getElementById("contenedor");
let filas = document.getElementsByClassName("fila");

// Variables de visibilidad
let logos_visibles = true;
let despegues_visibles = true
let dorsal_visible = false;
let peso_visible = false;

// Coger otros elementos
let pesos = document.getElementsByClassName("peso")
let dorsales = document.getElementsByClassName("dorsal")


// Función para alternar la visibilidad de los logos
function ocultarLogos() {
    let logos = document.getElementsByClassName("logo");
    let estado = (logos_visibles ? "flex" : "none");
    for (let logo of logos) {
        logo.style.display = estado;
    }
    logos_visibles = (estado === "flex");
    document.getElementById("cab_log").style.display = estado;
}

// Meter los logos en las filas del ranking
function meterLogos(nom) {
    let logo = document.createElement("div");
    logo.className = "logo";
    let estado = (logos_visibles ? "flex" : "none");
    logo.style.display = estado;

    if (nom.substring(0, 4) === "SAET") {
        nom = "SAETA";
    } else if (nom.substring(0, 4) === "EAFT") {
        nom = "FlyEagle";
    }

    let elLogo = document.createElement("img");
    elLogo.src = "../img/logos/" + nom + ".png";
    logo.append(elLogo);
    return logo;
}

// Meter los dorsales en las filas del ranking
function meterDorsal(nom) {
    let dors = document.createElement("div");
    dors.className = "dorsal";
    let estado = (dorsal_visible ? "flex" : "none");
    dors.style.display = estado;
    dors.textContent = valores_dorsal[nom];
    return dors;
}

// Función para mostrar / ocultar los dorsales
function mostrarDorsal() {
    let estado = dorsal_visible ? "flex" : "none";
    dorsal_visible = !dorsal_visible;
    document.getElementById("cab_dor").style.display = estado;
    for (let i = 0; i < dorsales.length; i++) {
        dorsales[i].style.display = estado;
    }
}
