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
// Poner
function sumaPiloto(estado,piloto) {
    let nueva_fila = creaFila(piloto,++controla_pilotos, "+1 lap","1Kg");
    FilaControlResta(piloto)
    ranking.append(nueva_fila);

    switch (estado){
        case "animado":
            nueva_fila.style.left = "-500px"
            setTimeout(() => {
                nueva_fila.style.left = "0px"
            }, 50);
            break;
        case "seco":
            nueva_fila.style.left = "0px"
            break;
        }
    }

// Controla las filas de control
function crea_Perfil() {
    let piloto_input = document.getElementById("input_nombre")
    piloto = piloto_input.value

    controla_pilotos++ // Subimos la posicion
    // Creamos la fila en el ranking y en control
    FilaControlSuma(piloto);
    // Metemos el nuevo perfil en la lista
    pilotos.push(piloto)

}

// Sacar
function quitaPiloto(estado) {
    if (filas.length > 0) {
        // Quita del ranking
        filas[filas.length-1].style.left = "-500px"
        filas_control[filas_control.length-1].remove() // Esto es para quitar la fila de control
        switch (estado){
            case "animado":
                setTimeout(() => {
                    //filas[filas.length - 1].remove();
                    let a_borrar = document.getElementById(controla_pilotos)
                    a_borrar.remove()
                    controla_pilotos--;
                }, 150);
                break;
            case "seco":
                //filas[filas.length - 1].remove();
                let a_borrar = document.getElementById(controla_pilotos)
                a_borrar.remove()               
                controla_pilotos--;
                break;
            }
    }
}

// Hacer que sea crear perfil y no meter al ranking directamente
// Vaciar todos los aviones instantaneamente
function vaciarPilotos(){
    for (var j = filas.length - 1; j >= 0; j--) {
        filas[j].remove();
        filas_control[j].remove(); // Quitar todas las filas de control
        controla_pilotos--; // Bajar la cantidad de pilotos
    }
}

