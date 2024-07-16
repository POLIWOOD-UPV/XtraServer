////////////////////////////////////////////////////
// Funciones para modificar filas y sus contenidos//
////////////////////////////////////////////////////

// Variables Pilotos

let controla_pilotos = 1
let valores_dorsal = {"RUHE":1,"UVIGA":2, "G3":3,"MATSI": 4,"LUFTS": 5,"ECLFT": 6,"SAET2": 7,"DIANA": 8,"TRENC": 9,"NTHPO": 10,"SAET1": 11,"UCAIR": 12,"XALOC": 15,"EAFT1": 16,"EAFT2":17,}

// Coger ranking y filas
let ranking = document.querySelector("main");
let filas = document.getElementsByClassName("fila")

// Puntos ( empieza activa)
let puntos_visibles = true;
let puntos_dto = document.getElementsByClassName("puntos")

// Peso y Dorsal (empiezan desactivadas)
let peso_visible = false;
let pesos = document.getElementsByClassName("peso")

let dorsal_visible = false;
let dorsales = document.getElementsByClassName("dorsal")
// Logos (empieza activado)
let logos_visibles = true
let despegues_visibles = true


// Crea la fila donde se meten los datos
function creaFila(nom,pos, puntos){
    // Creamos la fila con sus partes
    let fila = document.createElement("div")
    fila.className = "fila"
    // Creamos la zona del numero
    let numero = document.createElement("div")
    numero.className = "numero"
    numero.textContent = pos
    // Creamos la zona del nombre, peso/tiempo
    let resto = document.createElement("div")
    resto.className = "resto"

    // Ponemos el nombre
    let nombre = document.createElement("div")
    nombre.className = "nombre"
    nombre.textContent = nom

    // Metemos la imagen
    logo = meterLogos(nom)

    // Metemos el dorsal
    dor = meterDorsal(nom);
    // Informativos

    // Puntos
    let puntazos = document.createElement("div")
    puntazos.className = "puntos"
    puntazos.textContent = puntos
    
    if (!puntos_visibles){
        puntos_dto.style.display = "none"
    }

    if (logos_visibles){
        logo.style.display = "flex"
    }
    if (dorsal_visible){
        dor.style.display = "flex"
    }

    // Le ponemos de ID la posicion
    fila.id = pos
    fila.append(numero,logo,dor,nombre,puntazos)

    // Ponemos la fila en la izquierda para que se mueva mas tarde
    fila.style.left = "-500px"
    return fila
}

// Función para mostrar el tiempo en la fila
function mostrarPuntos(){
    let estado;
    if (puntos_visibles){
        // Ocultar puntos
        estado = "none";
        puntos_visibles = false;
    }else{
        // Mostrar tiempos
        estado = "flex";
        puntos_visibles = true;
    }
    for (var i = 0; i < puntos_dto.length;i++){
        puntos_dto[i].style.display = estado
    }
    document.getElementById("cab_pun").style.display = estado

}
// Función para mostrar / ocultar los dorsales de los 
function mostrarDorsal(){
    let estado;
    if (dorsal_visible){
        // Mostrar dorsal
        estado = "flex";
        dorsal_visible = true;
    }else{
        // Ocultar dorsal
        estado = "none";
        dorsal_visible = false;
    }
    for (var i = 0; i < dorsales.length;i++){
        dorsales[i].style.display = estado
    }
    document.getElementById("cab_dor").style.display = estado
}
// Funcion para alternar la visibilidad de los logos
function ocultarLogos(){
    logos = document.getElementsByClassName("logo")
    let estado = (logos_visibles ? "flex" : "none");
    for (logo of logos){
        logo.style.display = estado
    }
    logos_visibles = (estado == "flex") ? true : false;

    document.getElementById("cab_log").style.display = estado
}

// Meter los dorsales en las filas del ranking
function meterLogos(nom){
    let logo = document.createElement("div")
    logo.className = "logo"

    let estado = (logos_visibles ? "flex" : "none");
    logo.style.display = estado

    if (nom.substring(0, 4) === "SAET") {
        nom = "SAETA"
    } else if (nom.substring(0,4) === "EAFT"){
        nom = "FlyEagle"
    }
    
    let elLogo = document.createElement("img")
    elLogo.src = "../img/logos/"+nom+".png"
    logo.append(elLogo)
    return logo
}

// Meter los dorsales en las filas del ranking
function meterDorsal(nom){
    let dors = document.createElement("div")
    dors.className = "dorsal"

    let estado = (dorsal_visible ? "flex" : "none");
    dors.style.display = estado

    dors.textContent = valores_dorsal[nom]
    return dors
}