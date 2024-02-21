////////////////////////////////////////////////////
// Funciones de poner y quitar pilotos             //
////////////////////////////////////////////////////

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

