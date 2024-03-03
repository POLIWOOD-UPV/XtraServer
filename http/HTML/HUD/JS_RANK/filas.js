////////////////////////////////////////////////////
// Funciones para modificar filas y sus contenidos//
////////////////////////////////////////////////////

// Variables Pilotos
var pilotos = ["RIC","JAW","ABE","EST"]
var controla_pilotos = 1

// Coger ranking y filas
var ranking = document.getElementById("contenedor")
var filas = document.getElementsByClassName("fila")

var pilotos_control_resta = document.getElementById("pilotos_mas_borrar")
var pilotos_control_suma = document.getElementById("pilotos_mas_sumar")
var filas_control = document.getElementsByClassName("fila_control_borrar")

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
    // Le ponemos de ID la posicion
    fila.id = controla_pilotos
    fila.append(numero,resto)

    // Ponemos la fila en la izquierda para que se mueva mas tarde
    fila.style.left = "-500px"
    return fila
}


// Filas de control
function FilaControlSuma(piloto){
    // Para SUMAR
    fila_sumar = document.createElement("div")
    fila_sumar.className = "fila_control_sumar"
    let nombre2 = document.createElement("div")
    nombre2.textContent = piloto
    fila_sumar.append(nombre2)

    let botonzon = document.createElement("button")
    botonzon.onclick = () => {
        sumaPiloto('animado',piloto)
    };
    botonzon.textContent = "SUMAR_An"
    fila_sumar.append(botonzon)
    
    let botonzon2 = document.createElement("button")
    botonzon2.onclick = () => {
        sumaPiloto('seco',piloto)
    };
    botonzon2.textContent = "SUMAR"
    fila_sumar.append(botonzon2)
    
    pilotos_control_suma.append(fila_sumar)


}

function FilaControlResta(piloto){
     // Creamos la fila con sus partes
    let fila_borrar = document.createElement("div")
    fila_borrar.className = "fila_control_borrar"

    // Ponemos el nombre
    let nombre = document.createElement("div")
    nombre.textContent = piloto
    fila_borrar.append(nombre)

    // Si no esta en los perfiles de los pilotos, agregarlo
    if(!pilotos.includes(piloto)){
        FilaControlSuma();
    }
    // Para borrar
    //Ponemos el boton de eliminar animado
    let botoncin = document.createElement("button")
    botoncin.onclick = () => {
        quitaPiloto('animado')
    };
    botoncin.textContent = "BORRAR_An"
    fila_borrar.append(botoncin)
    //Ponemos el boton de eliminar seco
    let botoncin2 = document.createElement("button")
    botoncin2.onclick = () => {
        quitaPiloto('seco');
    };
    botoncin2.textContent = "BORRAR"
    fila_borrar.append(botoncin2)

    //Ponemos la fila en BORRAR y SUMAR
    pilotos_control_resta.append(fila_borrar)
    
}
// Funciones para modificar la informacion del ranking

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