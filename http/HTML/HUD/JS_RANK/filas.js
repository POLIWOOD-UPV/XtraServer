

// Lista Pilotos
var pilotos = ["ric","jaw","abe","est"]
var controla_pilotos = 0

var ranking = document.getElementById("contenedor")
var filas = document.getElementsByClassName("fila")

// VCrea la fila donde se meten los datos
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
    let tiempo = crearTiempo(tiemp)
    let peso = crearPeso(pes)
    if (!tiempo_visible){
        tiempo.style.display = "none"
    }
    if (peso_visible){
        peso.style.display = "flex"
    }
    // Lo juntamos todo y devolvemos la fila
    resto.append(nombre,tiempo,peso)
    fila.append(numero,resto)

    // Ponemos la fila en la izquierda para que se mueva mas tarde
    fila.style.left = "-500px"
    return fila
}


// Funciones para modificar la informacion del ranking
var boton_tiempo = document.getElementById("mostrar_tiempo_id");
var boton_peso = document.getElementById("mostrar_peso_id");

// Tiempo ( empieza activa)
var tiempo_visible = true;
var tiempos = document.getElementsByClassName("tiempo")

// Función para mostrar el tiempo en la fila
function mostrarTiempo(){
    let estado;
    if (tiempo_visible){
        // Ocultar tiempos
        estado = "none";
        boton_tiempo.textContent = "Mostrar Tiempos"
        tiempo_visible = false;
    }else{
        // Mostrar tiempos
        estado = "flex";
        boton_tiempo.textContent = "Ocultar Tiempos"
        tiempo_visible = true;
    }
    for (var i = 0; i < tiempos.length;i++){
        tiempos[i].style.display = estado
    }

}

// Peso ( empieza desactivada)
var peso_visible = false;
var pesos = document.getElementsByClassName("peso")

// Función para mostrar el peso en la fila
function mostrarPeso(){
    let estado;
    if (peso_visible){
        // Ocultar pesos
        estado = "none";
        boton_peso.textContent = "Mostrar Pesos"
        peso_visible = false;
    }else{
        // Mostrar pesos
        estado = "flex";
        boton_peso.textContent = "Ocultar Pesos"
        peso_visible = true;
    }
    for (var i = 0; i < pesos.length;i++){
        pesos[i].style.display = estado
    }
}

// Función para alternar el peso con el tiempo y viceversa
var boton_cambiazo = document.getElementById("cambiazoPesoTiempos")
function cambiazoPesoTiempos(){
    if ((!tiempo_visible && !peso_visible) ||(tiempo_visible && peso_visible) ) {
        return
    }else{
        mostrarTiempo();
        mostrarPeso();
    }
}
