////////////////////////////////////////////////////
// Funciones de poner y quitar pilotos             //
////////////////////////////////////////////////////

// Funciones para crear los informativos del ranking
// Tiempo
function crearTiempo(tiemp){
    let tiempo = document.createElement("div")
    tiempo.className = "tiempo"
    tiempo.textContent = tiemp
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
function sumaPiloto(estado) {
    // Agreganis el avion a la lista y lo cogemos
    piloto = crea_Perfil();
    FilaControlResta(piloto) // Lo llamo antes para que cree la fila con id 1, o sino se la saltaba

    // Coger el tiempo del avion
    minutos = cogerTiempo("min")
    segundos = cogerTiempo("seg")
    miliseg = cogerTiempo("mil")
    tiempo = minutos + ":" + segundos + ":" + miliseg

    // Coger el peso
    peso = document.getElementById("peso_input_id").value + "Kg"

    //Poner el avion en el ranking
    let nueva_fila = creaFila(piloto,++controla_pilotos, tiempo,peso);
    // El ++ va delante para que no se genere dos veces el nº 1

    // Metemos en el ranking
    //ranking.append(nueva_fila);
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
    // Cogemos el nombre del avion actual a través del drop down
    let piloto_input = document.getElementById("nombres_equipos_constructor_id")
    piloto = piloto_input.value
    // Metemos el nuevo perfil en la lista
    pilotos.push(piloto)
    return piloto

}

// Borra los pilotos del ranking y control
function quitaPiloto(estado,pos) {
    if (filas.length > 0) {
        //Coger la posición
        pos = Number(pos[0])
        filas[pos].style.left = "-500px"
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

// Hacer que sea crear perfil y no meter al ranking directamente
// Vaciar todos los aviones instantaneamente
function vaciarPilotos(){
    for (var j = filas.length - 1; j >= 0; j--) {
        filas[j].remove();
        filas_control[j].remove(); // Quitar todas las filas de control
        controla_pilotos--; // Bajar la cantidad de pilotos
    }
}


// Coger los tiempos 
function cogerTiempo(que){
    switch(que){
        case "min":
            //Coger Minutos
            minutos = document.getElementById("minutos_input_id").value
            return minutos
        case "seg":
            //Coger segundos
            segundos = document.getElementById("segundos_input_id").value
            return segundos
        case "mil":
            // Coger milis
            milis = document.getElementById("milisegundos_input_id").value
            return milis           
    }
}
function meter_en_ranking(nueva_fila) {
    // Funcion para extraer partes del tiempo de la fila nueva que vamos a meter
    function convertirTiempo(tipo) {
        let tiempo = nueva_fila.querySelector('.tiempo').textContent;
        // Partimos en 3 partes ya que esta en MM:SS:XXX
        let partes = tiempo.split(':');
        if (tipo === "min") return partes[0];
        if (tipo === "seg") return partes[1];
        if (tipo === "mil") return partes[2];
    }

    // Convertir el tiempo de nueva_fila a segundos para poder compararlo con el resto
    let minutos_avion = Number(convertirTiempo("min")) * 60;
    let segundos_avion = Number(convertirTiempo("seg"));
    let miliseg_avion = Number(convertirTiempo("mil")) * 0.001;
    let tiempo_avion = minutos_avion + segundos_avion + miliseg; // Tiempo en segundos

    let tiempos = {};
    // Convertir HTMLCollection a un array para poder iterar
    filas_array = Array.from(filas); 

    // Comprobar el tiempo del resto
    filas_array.forEach(fila => {
        // Cogemos el div resto
        let resto = fila.querySelector('.resto');
        // Cogemos el div del tiempo
        let tiempo = resto.querySelector('.tiempo');
        
        // Esto es el tiempo en formato MM:SS:XXX
        let tiempoText = tiempo.textContent;

        // Separamos el texto en partes
        let partes = tiempoText.split(':');
        // Convertimos cada parte a un número
        let minutos = parseInt(partes[0], 10) * 60;
        let segundos = parseInt(partes[1], 10);
        let miliseg = parseInt(partes[2], 10) * 0.001;
        console.log("Fila nº: " + fila.id)
        console.log("Miutos " + minutos + " Segundos: " + segundos + " miliseg: " + miliseg)
        
        let tiempo_en_seg = minutos + segundos + miliseg;

        // Guardamos en el objeto tiempos el tiempo en segundos en la posición
        tiempos[fila.id] = tiempo_en_seg;

        /*
        Est nos deja un objeto  asi:
        tiempos = {
            1 : TIEMPO EN SEG
            2: TIEMPO EN SEG
            ... }

        */
    });

    console.log("Objeto Tiempos: ")
    console.log(tiempos)
    
    // Buscamos si hay alguna clave (posicion) que su tiempo sea menor o si no, nos tocara ir al final de la cola
    let claveEncontrada = null;
    for (let [clave, tiempo] of Object.entries(tiempos)) {
        console.log()
        // Si el tiempo de la fila ya existente es menor que el que queremos meter, tenemos posicion
        if (tiempo < tiempo_avion) { 
            claveEncontrada = clave;
            break;
        }
    }
    
    // Si no hemos encontrado una clave (tiempo), nos vamos al final de la cola

}
