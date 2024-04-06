////////////////////////////////////////////////////
// Funciones de poner y quitar pilotos             //
////////////////////////////////////////////////////

// Funciones para crear los informativos del ranking
// Tiempo
function crearTiempo(tiemp){
    let tiempo = document.createElement("div")
    tiempo.className = "tiempo"
    // Si es el primero, le ponemos que es el lider
    if ( controla_pilotos==1){
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
function sumaPiloto(estado,piloto) {
    FilaControlResta(piloto) // Lo llamo antes para que cree la fila con id 1, o sino se la saltaba
    let nueva_fila = creaFila(piloto,++controla_pilotos, "+1 lap","1Kg");
    // El ++ va delante para que no se genere dos veces el nº 1
    
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

    controla_pilotos // controla_pilotos++
    // Creamos la fila en el ranking y en control
    FilaControlSuma(piloto);
    // Metemos el nuevo perfil en la lista
    pilotos.push(piloto)

}

// Sacar los pilotos del ranking y control
function quitaPiloto(estado,pos) {
    if (filas.length > 0) {
        //Coger la posición
        pos = Number(pos[0])
        filas[pos].style.left = "+500px"
        filas_control[pos].remove() // Esto es para quitar la fila de control
        
        switch (estado){
            case "animado":
                setTimeout(() => {
                    let a_borrar = document.getElementById(String(pos+1))
                    a_borrar.remove()
                    controla_pilotos--;
                    arregla_desastres(pos)
                }, 150);
                break;
            case "seco":
                let a_borrar = document.getElementById(String(pos+1))
                a_borrar.remove()               
                controla_pilotos--;
                arregla_desastres(pos)
                break;
            }
    }
}

function arregla_desastres(pos){
    // Cambiar el número visible a todos los de debajo del que se ha quitado
    for (fila of filas){
        // Estas son las filas de la izquierda
        let posicion = fila.querySelector('.numero');
        if (Number(posicion.textContent) > pos){
            posicion.textContent = Number(posicion.textContent)-1
            // Actualizar el ID de la fila del ranking de todos los de abajo
            fila.id = String(Number(fila.id)-1)
        }
    }

    
    // Actualizar el ID de todos los botones de la fila de control
    for (fila of filas_control){
        // Estas son las filas de la derecha
        // Boton animado
        let botones = fila.getElementsByTagName("button") // Cogemos los dos botones de la fila
        //console.log(botones)

        // Primero identificamos si estamos en una fila que debemos modificar
        boton_animado = botones[0]
        boton_normal = botones[1]

        let id_fila_actual = Number(boton_animado.id[0])
        if (id_fila_actual > pos){
            boton_animado.id = String(id_fila_actual-1)+"c_AN"
            
            // Boton sin animacion
            boton_normal.id = String(id_fila_actual-1)+"c"
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