////////////////////////////////////////////////////
// Funciones para modificar filas y sus contenidos//
////////////////////////////////////////////////////

// Variables Pilotos

var controla_pilotos = 1

// Coger ranking y filas
var ranking = document.getElementById("contenedor")
var filas = document.getElementsByClassName("fila")


// Tiempo ( empieza activa)
var tiempo_visible = true;
var tiempos = document.getElementsByClassName("tiempo")

// Peso (empieza desactivada)
var peso_visible = false;
var pesos = document.getElementsByClassName("peso")



// Crea la fila donde se meten los datos
function creaFila(nom,pos,tiemp,pes){
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
    resto.append(nombre,tiempo,peso)
    // Le ponemos de ID la posicion
    fila.id = pos
    fila.append(numero,resto)

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