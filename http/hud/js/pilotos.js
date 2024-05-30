////////////////////////////////////////////////////
// Funciones de poner y quitar pilotos             //
////////////////////////////////////////////////////


// Vaciar todos los aviones instantaneamente
function vaciarPilotos(){
    for (var j = filas.length - 1; j >= 0; j--) {
        filas[j].remove();
        filas_control[j].remove(); // Quitar todas las filas de control
        controla_pilotos--; // Bajar la cantidad de pilotos
    }
}
// Borra los pilotos del ranking y control
function quitaPiloto(estado, pos) {
    if (filas.length > 0) {
        pos = Number(pos[0]); // Obtener la posición de la ID del botón
        console.log("Posición a borrar: " + pos);

        let a_borrar = document.getElementById(String(pos)); // Elemento del piloto a borrar
        let a_borrar_c = document.getElementById(String(pos + "c_AN")).parentNode; // Elemento de control a borrar animado
        a_borrar.style.left = "-500px"; // Animación para mover el elemento fuera de la vista

        switch (estado) {
            case "animado":
                setTimeout(() => {
                    a_borrar.remove();
                    a_borrar_c.remove();
                    controla_pilotos--; // Decrementar el contador de pilotos
                    bajar_posiciones(pos); // Ajustar posiciones de los pilotos restantes
                }, 150);
                break;
            case "seco":
                a_borrar.remove();
                a_borrar_c.remove();
                controla_pilotos--; // Decrementar el contador de pilotos
                bajar_posiciones(pos); // Ajustar posiciones de los pilotos restantes
                break;
        }
        ordenar_control(); // Ordenar la lista de control después de la eliminación
    }
}

function bajar_posiciones(pos){
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
        let botones = fila.getElementsByTagName("button") // Cogemos los dos botones de la fila
        // Cogemos los botones a trabajar con 
        boton_animado = botones[0]
        boton_normal = botones[1]

        // identificamos si estamos en una fila que debemos modificar
        let id_fila_actual = Number(boton_animado.id[0])
        if (id_fila_actual > pos){
            boton_animado.id = String(id_fila_actual-1)+"c_AN"
            
            // Boton sin animacion
            boton_normal.id = String(id_fila_actual-1)+"c"
        }
    }
}
// Cambiar el número visible a todos los de debajo y al que se ha agregado
function subir_posiciones(pos) {
    let numeros = [];
    for (let i = pos; i <= filas.length; i++) {
        numeros.push(i);
    }

    let cont = 0;
    for (let fila of filas) {
        let posicion = fila.querySelector('.numero');
        if (Number(posicion.textContent) >= pos) {
            posicion.textContent = numeros[cont];
            fila.id = String(numeros[cont]);
            cont++;
        }
    }
}

// Poner y sacar aviones (con animacion)
function sumaPiloto(estado) {
    // Agreganis el avion a la lista y lo cogemos
    piloto = crea_Perfil();

    // Coger el tiempo del avion
    minutos = cogerTiempo_Peso("min")
    segundos = cogerTiempo_Peso("seg")
    miliseg = cogerTiempo_Peso("mil")
    tiempo = minutos + ":" + segundos + ":" + miliseg

    // Encontrar en que posicion va a estar
    pos = sacar_pos_avion(tiempo) // Es un numero

    FilaControlResta(piloto,tiempo,pos) // Lo llamo antes para que cree la fila con id 1, o sino se la saltaba
    
    // Coger el peso
    peso = cogerTiempo_Peso("pes")

    //Poner el avion en el ranking
    let nueva_fila = creaFila(piloto,pos, tiempo,peso);
    // Incrementamos la cantidad de aviones que hay
    ++controla_pilotos

    // Metemos en el ranking
    meter_en_ranking(nueva_fila)

    // Fisicamente hacerlo aparecer
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

// Coge al piloto y lo mete en el sistema
function crea_Perfil() {
    // Cogemos el  del avion actual a través del drop down
    let piloto_input = document.getElementById("nombres_equipos_constructor_id")
    piloto = piloto_input.value
    // Metemos el nuevo perfil en la lista
    pilotos.push(piloto)
    return piloto

}

// Coger los tiempos del input
function cogerTiempo_Peso(que) {
    switch (que) {
        case "min":
            // Coger Minutos
            minutos = document.getElementById("minutos_input_id").value;
            return validarNumero(minutos) ? parseInt(minutos) : 0;

        case "seg":
            // Coger segundos
            segundos = document.getElementById("segundos_input_id").value;
            return validarNumero(segundos) ? parseInt(segundos) : 0;

        case "mil":
            // Coger milis
            milis = document.getElementById("milisegundos_input_id").value;
            return validarNumero(milis) ? parseInt(milis) : 0;
        case "pes":
            // Coger el peso
            peso = document.getElementById("peso_input_id").value
            return validarNumero(milis) ? parseInt(milis) : 0+" Kg";
    }
}

// Función para validar si el valor es un número
function validarNumero(valor) {
    return /^\d+$/.test(valor); // No se como va pero va :)
}

// Versión con array
function meter_en_ranking(nueva_fila) {
    let filas_array = Array.from(filas);

    // Pillamos la posicion
    let pos = parseInt(nueva_fila.querySelector(".numero").textContent, 10);

    // Verifica si la posición ya está ocupada
    // Miramos si esta ocupada (a lo mejor implementar este metodo en otros sitios??)
    let posicionOcupada = filas_array.some(fila => parseInt(fila.id, 10) === pos);

    if (posicionOcupada) {  // Si la posición está ocupada, inserta la nueva fila y ajusta las posiciones de las filas posteriores
        introducir_en_filas(pos, nueva_fila);
        subir_posiciones(pos);
    } else { // Si la posición no está ocupada, añade la nueva fila al final del ranking
        ranking.appendChild(nueva_fila);
        filas_array.push(nueva_fila);

        filas_array.forEach((fila, index) => {
            fila.querySelector('.numero').textContent = index + 1; // Ajusta el número visible
            fila.id = (index + 1).toString();                      // Ajusta el ID
        });
    }
}

function introducir_en_filas(pos, nueva_fila) {
    // Convierte la colección HTML de filas a un array temporal para itrerar etc
    let filas_array = Array.from(filas);

    // Divide el array en dos partes: una antes y otra después de la posición indicada
    let filas_1 = filas_array.slice(0, pos - 1);  // Elementos del inicio hasta pos-1
    let filas_2 = filas_array.slice(pos - 1);     // Elementos desde pos-1 hasta el final

    // Inserta la nueva fila en donde va a estar y la juntamos con la segunda mitard 
    filas_1.push(nueva_fila);
    filas_array = filas_1.concat(filas_2);

    // Actualiza el número visible y el ID de cada fila para reflejar su nueva posición
    filas_array.forEach((fila, index) => {
        fila.querySelector('.numero').textContent = index + 1; // Ajusta el número visible
        fila.id = (index + 1).toString();                      // Ajusta el ID
    });

    // Crea un fragmento de documento para eficiencia en la actualización del DOM
    let fragment = document.createDocumentFragment();
    // Añade la cabecera al fragmento
    fragment.appendChild(document.getElementById("cabecera"));

    // Añade todas las filas al fragmento
    filas_array.forEach(function(fila) {
        fragment.appendChild(fila);
    });

    // Limpia el contenedor actual del ranking y añade el fragmento actualizado
    while (ranking.firstChild) {
        ranking.removeChild(ranking.firstChild);
    }
    ranking.appendChild(fragment);
}

// funcion para convertir a milisegundos
function convertirTiempoAMilisegundos(tiempo) {
    let partes = tiempo.split(':');
    let minutos = Number(partes[0]) * 60;
    let segundos = Number(partes[1]);
    let milisegundos = Number(partes[2]) * 0.001;
    return minutos + segundos + milisegundos;
}
//Sacar la nueva posicion  
function sacar_pos_avion(tiempo) {
    let tiempo_avion = convertirTiempoAMilisegundos(tiempo);

    let tiempos = [];
    filas_array = Array.from(filas);

    // Cogemos todos los tiempos de los aviones
    filas_array.forEach(fila => {
        let tiempo = fila.querySelector('.tiempo').textContent;
        let tiempoEnSegundos = convertirTiempoAMilisegundos(tiempo);
        tiempos.push(tiempoEnSegundos);
    });

    // Metemos al final el nuestro y creamos una copia ordenada
    tiempos.push(tiempo_avion);
    let tiempos2 = [...tiempos].sort((a, b) => a - b);

    // Buscamos el indice y +1 ya que es un array y las pos empiezan en 1 no 0
    let nueva_posicion = tiempos2.lastIndexOf(tiempo_avion) + 1;

    return nueva_posicion;
}
