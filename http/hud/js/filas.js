////////////////////////////////////////////////////
// Funciones para modificar filas y sus contenidos//
////////////////////////////////////////////////////

// Variables Pilotos

let controla_pilotos = 1

// Coger ranking y filas
let ranking = document.getElementById("contenedor")
let filas = document.getElementsByClassName("fila")


// Tiempo ( empieza activa)
let tiempo_visible = true;
let tiempos = document.getElementsByClassName("tiempo")

// Peso (empieza desactivada)
let peso_visible = false;
let pesos = document.getElementsByClassName("peso")

// Logos (empieza activado)
let logos_visibles = true
let despegues_visibles = true


// Crea la fila donde se meten los datos
function creaFila(nom,pos,tiemp,pes,despegue){
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
    let elLogo = document.createElement("img")
    elLogo.src = "../favicon.ico"
    logo.append(elLogo)

    // Metemos el estado del despegue
    let circulo = document.createElement("span")
    circulo.className = "dot"
    let color = "";
    switch (despegue){
        case "Corto": color = "#9000ff";break;
        case "Correcto":color = "#0dff00";break;
        case "Ilegal": color = "#ff0000"; break;
    }
    circulo.style.backgroundColor = color
    // Informativos

    // Tiempo
    let tiempo = document.createElement("div")
    tiempo.className = "tiempo"
    tiempo.textContent = tiemp
    
    // Peso
    let peso = document.createElement("div")
    peso.className = "peso"
    peso.textContent = pes;

    if (!tiempo_visible){
        tiempo.style.display = "none"
    }
    if (peso_visible){
        peso.style.display = "flex"
    }


    // Lo juntamos todo y devolvemos la fila
    resto.append(nombre,tiempo,peso,circulo)
    // Le ponemos de ID la posicion
    fila.id = pos
    fila.append(numero,logo,resto)

    // Ponemos la fila en la izquierda para que se mueva mas tarde
    fila.style.left = "-500px"
    return fila
}

// Función para mostrar el tiempo en la fila
function mostrarTiempo(){
    let estado;
    if (tiempo_visible){
        // Ocultar tiempos
        estado = "none";
        tiempo_visible = false;
    }else{
        // Mostrar tiempos
        estado = "flex";
        tiempo_visible = true;
    }
    for (var i = 0; i < tiempos.length;i++){
        tiempos[i].style.display = estado
    }

}

// Función para mostrar el peso en la fila
function mostrarPeso(){
    let estado;
    if (peso_visible){
        // Ocultar pesos
        estado = "none";
        peso_visible = false;
    }else{
        // Mostrar pesos
        estado = "flex";
        peso_visible = true;
    }
    for (var i = 0; i < pesos.length;i++){
        pesos[i].style.display = estado
    }
}

// Función para alternar el peso con el tiempo y viceversa
function cambiazoPesoTiempos(){
    if ((!tiempo_visible && !peso_visible) ||(tiempo_visible && peso_visible) ) {
        return
    }else{
        mostrarTiempo();
        mostrarPeso();
    }
}
 
// Funcion para alternar la visibilidad de los logos
function ocultarLogos(){
    logos = Array(document.querySelector(".logo"))
    let estado = (logos_visibles ? "none" : "flex");
    for (logo of logos){
        logo.style.display = estado
    }
}

// Funcion para alternar la visibilidad de los despegues
function ocultarDespegue(){
    despegues = document.getElementsByClassName("dot")
    let estado = (despegues_visibles ? "none" : "flex");
    for (despegue of despegues){
        despegue.style.display = estado
    }
}