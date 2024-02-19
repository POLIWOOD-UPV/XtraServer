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

// Funciones para crear los informativos del ranking
// Tiempo
function crearTiempo(tiemp){
    let tiempo = document.createElement("div")
    tiempo.className = "tiempo"

    // Si es el primero, le ponemos que es el lider
    if ( controla_pilotos==0){
        tiempo.textContent = "LEADER"
    }else{
        tiempo.textContent = tiemp
    }
    
    return tiempo
}
// Peso
function crearPeso(pes){
    let peso = document.createElement("div")
    peso.className = "peso"

    peso.textContent = pes;
    return peso

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
// Poner y sacar aviones (con animacion)
function sumaPiloto() {
    let piloto = pilotos[++controla_pilotos % 4];
    let nueva_fila = creaFila(piloto,controla_pilotos+1 , "+1 lap","1Kg");
    ranking.append(nueva_fila);
    nueva_fila.style.left = "-500px"
    setTimeout(() => {
        nueva_fila.style.left = "0px"
    }, 50);


}
function quitaPiloto() {
    if (filas.length > 0) {

        filas[filas.length-1].style.left = "-500px"
        setTimeout(() => {
            filas[filas.length - 1].remove();
            --controla_pilotos;
        }, 150);

    }
}


// Poner y sacar aviones (sin animacion)
// Sumar avion instantaneamente
function nacerPiloto() {
    let piloto = pilotos[++controla_pilotos % 4];
    let nueva_fila = creaFila(piloto,controla_pilotos+1 , "+1 lap","1Kg");
    ranking.append(nueva_fila);
    nueva_fila.style.left = "0px"
}

// Eliminar un avion instantaneamente
function matarPiloto() {
    if (filas.length > 0) {
        filas[filas.length - 1].remove();
        --controla_pilotos;
    }
}
// Vaciar todos los aviones instantaneamente
function vaciarPilotos(){
    for (var j = filas.length - 1; j >= 0; j--) {
        filas[j].remove();
        controla_pilotos--; // Decrement the global variable
    }
}


// Aparecer y desaparecer ranking
var ranking_visible = true;
var aparecer_desaparecer_rank = document.getElementById("aparecer_desaparecer_rank_id")

// Mover el ranking en o fuera de pantalla
function rankingMov() {
    console.log("rankingMov")
    if (ranking_visible) { // Es visible
        // Ranking se pasa a oculto
        aparecer_desaparecer_rank.textContent = "Aparecer Ranking";
        ranking_visible = false;
        ranking.style.left = "-500px"//"300px";
    } else { // No es visible
        ranking.style.left = "0px";
        aparecer_desaparecer_rank.textContent = "Desaparecer Ranking";
        ranking_visible = true;
        if (!filas_visible){
            filasMov()
        }
        
        }
}


// Mover filas en o fuera de pantalla
var filas_visible = true;
function filasMov(){
    // Saca o pone las filas depende del estado actual
    let cant_filas =  filas.length;

    if (filas_visible){
        // Hacer filas No Visibles
        // Se repite el codigo en un intervalo hasta que se usa clearInterval
        let indice = 1;
        let intervalId = setInterval(() => {

            // Comprobmos si hemos quitado todas ya
            if (indice < cant_filas+1) {
                // Lo posicionamos a la izquierda (se aplica la transicion)
                filas[filas.length-indice].style.left = "-500px"//"300px";
                indice++
            } else {
                // Una vez hemos quitado todas, movemos el contenedor entero y paramos lo otro
                clearInterval(intervalId);
                rankingMov();
            }
        }, 150); // Que espere 150ms antes de quitar el siguiente 
        filas_visible = false;

    } else{
        // Hacer filas visibles
        // Se repite el codigo en un intervalo hasta que se usa clearInterval
        let indice2 = 0;
        if (!ranking_visible){
            rankingMov();
        }
        let intervalId = setInterval(() => {
            // Comprobmos si hemos quitado todas ya
            if (indice2 < cant_filas) {
                // Lo posicionamos a la izquierda (se aplica la transicion)
                filas[indice2].style.left = "0px";
                indice2++
            } else {
                // Una vez hemos quitado todas, movemos el contenedor entero y paramos lo otro
                clearInterval(intervalId);
            }
        }, 150); // Que espere 150ms antes de quitar el siguiente 

        filas_visible = true;
    }
}

// Funciones aparecer/desaparecer dinamicas    
function desaparicionDinamica() {
    if (!ranking_visible) {
        // Ya escondido, no se ve
        return;
    } else {
        filas_visible = true;
        filasMov()
    }
}

function aparicionDinamica() {
    if (ranking_visible) {
        // Ya se ve
        return;
    } else {
        filas_visible = false;
        ranking_visible = false;
        rankingMov()
    }
}
