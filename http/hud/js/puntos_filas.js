////////////////////////////////////////////////////
// Funciones para modificar filas y sus contenidos//
////////////////////////////////////////////////////

// Variables Pilotos

let controla_pilotos = 1

// Coger ranking y filas
let ranking = document.getElementById("contenedor")
let filas = document.getElementsByClassName("fila")

// Puntos ( empieza activa)
let puntos_visibles = true;
let puntos_dto = document.getElementsByClassName("puntos")

// Peso (empieza desactivada)
let peso_visible = false;
let pesos = document.getElementsByClassName("peso")

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
    let logo = document.createElement("div")
    logo.className = "logo"
    logo.style.display = "flex"
    let elLogo = document.createElement("img")
    elLogo.src = "../favicon.ico"
    logo.append(elLogo)

    // Informativos

    // Puntos
    let puntazos = document.createElement("div")
    puntazos.className = "puntos"
    puntazos.textContent = puntos
    
    if (!puntos_visibles){
        puntos_dto.style.display = "none"
    }

    // Le ponemos de ID la posicion
    fila.id = pos
    fila.append(numero,logo,nombre,puntazos)

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

}

// Funcion para alternar la visibilidad de los logos
function ocultarLogos(){
    logos = document.getElementsByClassName("logo")
    let estado = (logos_visibles ? "none" : "flex");
    for (logo of logos){
        logo.style.display = estado
    }
}

