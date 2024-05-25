////////////////////////////////////////////////////
// Funciones para modificar filas y sus contenidos//
////////////////////////////////////////////////////

// Variables Pilotos
var pilotos = ["RIC"]
var controla_pilotos = 1

// Coger ranking y filas
var ranking = document.getElementById("contenedor")
var filas = document.getElementsByClassName("fila")

var pilotos_control_resta = document.getElementById("pilotos_mas_borrar") // Bloque de las filas control borrar
var filas_control = document.getElementsByClassName("fila_control_borrar") // Filas del bloque control borrar

// Cogemos los botones
var boton_tiempo = document.getElementById("mostrar_tiempo_id");
var boton_peso = document.getElementById("mostrar_peso_id");
var boton_cambiazo = document.getElementById("cambiazoPesoTiempos")

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
    // Le ponemos de ID la posicion
    fila.id = pos
    fila.append(numero,resto)

    // Ponemos la fila en la izquierda para que se mueva mas tarde
    fila.style.left = "-500px"
    return fila
}


function FilaControlResta(piloto,tiempo){
     // Creamos la fila con sus partes
    let fila_borrar = document.createElement("div")
    fila_borrar.className = "fila_control_borrar"
    
    // Ponemos el nombre
    let nombre = document.createElement("div")
    nombre.textContent = piloto
    fila_borrar.append(nombre)

    // Para borrar
    //Ponemos el boton de eliminar animado
    let botoncin = document.createElement("button")
    botoncin.id = controla_pilotos+"c_AN" // Le ponemos el id con la posicion en la que esta para luego poder quitarlo al borrar el piloto

    botoncin.onclick = () => {
        quitaPiloto('animado',botoncin.id) // Le pasamos la ID ya que es lo que lleva en que pos estamos 
    };
    botoncin.textContent = "BORRAR_An"
    fila_borrar.append(botoncin)
    //Ponemos el boton de eliminar seco
    let botoncin2 = document.createElement("button")
    botoncin2.id = controla_pilotos+"c" // Le ponemos el id con la posicion en la que esta para luego poder quitarlo al borrar el piloto

    botoncin2.onclick = () => {
        quitaPiloto('seco',botoncin2.id); // Le pasamos la ID ya que es lo que lleva en que pos estamos 
    };
    botoncin2.textContent = "BORRAR"
    fila_borrar.append(botoncin2)

    // Ponemos el tiempo del piloto
    let tiempin = document.createElement("div")
    tiempin.id = "tiempo_c"
    tiempin.textContent = tiempo
    fila_borrar.append(tiempin)


    //Ponemos la fila en BORRAR y SUMAR
    pilotos_control_resta.append(fila_borrar)
    
}
// Funciones para modificar la informacion del ranking

// Función para mo  ar el tiempo en la fila
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
function cambiazoPesoTiempos(){
    if ((!tiempo_visible && !peso_visible) ||(tiempo_visible && peso_visible) ) {
        return
    }else{
        mostrarTiempo();
        mostrarPeso();
    }
}


// Resets
function resetFilas(){
    
}
function resetRank(){

}
function resetFilaRank(){

}