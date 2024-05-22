////////////////////////////////////////////////////
// Funciones de poner y quitar pilotos             //
////////////////////////////////////////////////////

// Array de tiempos global
tiempos = []


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

    // Encontrar en que posicion va a estar
    pos = sacar_pos_avion(tiempo)

    //Poner el avion en el ranking
    let nueva_fila = (piloto,pos, tiempo,peso);

    // Incrementamos la cantidad de aviones que hay
    ++controla_pilotos
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
                    bajar_posiciones(pos)
                }, 150);
                break;
            case "seco":
                let a_borrar = document.getElementById(String(pos+1))
                a_borrar.remove()               
                controla_pilotos--;
                bajar_posiciones(pos)
                break;
            }
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

function subir_posiciones(pos){
    // Cambiar el número visible a todos los de debajo del que se ha agregado
    for (fila of filas){
        // Estas son las filas de la izquierda
        let posicion = fila.querySelector('.numero');

        // Posicion fila analizando > pos fila a meter
        if (Number(posicion.textContent) >= pos){
            posicion.textContent = Number(posicion.textContent)
            // Actualizar el ID de la fila del ranking de todos los de abajo
            fila.id = String(Number(fila.id))+1
        }
    }
}

// Vaciar todos los aviones instantaneamente
function vaciarPilotos(){
    for (var j = filas.length - 1; j >= 0; j--) {
        filas[j].remove();
        filas_control[j].remove(); // Quitar todas las filas de control
        controla_pilotos--; // Bajar la cantidad de pilotos
    }
}


// Coger los tiempos del input
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


// Version con objeto
/*
function meter_en_ranking(nueva_fila) {
    // Funcion para extraer partes del tiempo de la fila nueva que vamos a meter
    function convertirTiempo(tipo) {
        let tiempo = nueva_fila.querySelector('.tiempo').textContent;
        // Partimos en 3 partes ya que esta en MM:SS:XXX
        let partes = tiempo.split(':');
        if (tipo === "min") return Number(partes[0])*60;
        if (tipo === "seg") return Number(partes[1]);
        if (tipo === "mil") return Number(partes[2])*0.001;
    }

    // Convertir el tiempo de nueva_fila a segundos para poder compararlo con el resto
    let minutos_avion = convertirTiempo("min")
    let segundos_avion = convertirTiempo("seg")
    let miliseg_avion = convertirTiempo("mil")
    let tiempo_avion = minutos_avion + segundos_avion + miliseg_avion; // Tiempo en segundos

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

        
    });

    console.log("Objeto Tiempos: ")
    console.log(tiempos)
    
    console.log("Tiempo de nuestro avion "+tiempo_avion)
    // Buscamos si hay alguna clave (posicion) que su tiempo sea menor que el de nuestro nuevo avion
    let claveEncontrada = null;
    for (let [clave, tiempo] of Object.entries(tiempos)) {
        console.log("Clave: "+clave+" Tiempo: "+tiempo)
        // Si el tiempo de la fila ya existente es mayor que el que queremos meter, tenemos posicion, si no, seguir buscandos
        if (tiempo > tiempo_avion) { 
            console.log(tiempo + ">" + tiempo_avion)
            claveEncontrada = clave;
            break;
        }
    }
    console.log("Clave Encontrada: " + claveEncontrada)

    // Si hay una posición con tiempo más pequeño que el nuestro
    if (claveEncontrada !== null) {
        console.log(`Insertar ${nueva_fila.id} antes de ${claveEncontrada}`);
        // Fila con tiempo ya más grande que el que queremos meter
        let filaExistente = document.getElementById(claveEncontrada);
        
        // Insertar nueva fila antes de la fila existente
        filaExistente.parentNode.insertBefore(nueva_fila, filaExistente);
        subir_posiciones(claveEncontrada)
        
    } else { // Si NO hay una posición con tiempo menor que el de nuestro avión
        console.log(`Insertar ${nueva_fila.id} al final`);
        // Si no se encuentra ningún tiempo mayor, se inserta al final
        ranking.appendChild(nueva_fila);
    }

    
}
*/


// Sacar la nueva posicion  
function sacar_pos_avion(tiempo){
        // Funcion para extraer partes del tiempo de la fila nueva que vamos a meter
        function convertirTiempo(tipo) {
            //let tiempo = nueva_fila.querySelector('.tiempo').textContent;
            // Partimos en 3 partes ya que esta en MM:SS:XXX
            let partes = tiempo.split(':');
            if (tipo === "min") return Number(partes[0])*60;
            if (tipo === "seg") return Number(partes[1]);
            if (tipo === "mil") return Number(partes[2])*0.001;
        }
    
        // Convertir el tiempo de nueva_fila a segundos para poder compararlo con el resto
        let minutos_avion = convertirTiempo("min")
        let segundos_avion = convertirTiempo("seg")
        let miliseg_avion = convertirTiempo("mil")
        let tiempo_avion = minutos_avion + segundos_avion + miliseg_avion; // Tiempo en segundos
    
        // let tiempos = []; AHORA ES GLOBAL
        // Convertir HTMLCollection a un array para poder iterar
        filas_array = Array.from(filas); 

        // Comprobar el tiempo del resto
        filas_array.forEach(fila => {
            // Cogemos el div resto y el div del tiempo
            let resto = fila.querySelector('.resto');
            let tiempo = resto.querySelector('.tiempo');
            
            // Esto es el tiempo en formato MM:SS:XXX
            let tiempoText = tiempo.textContent;
    
            // Separamos el texto en partes
            let partes = tiempoText.split(':');
            // Convertimos cada parte a un número
            let minutos = parseInt(partes[0], 10) * 60;
            let segundos = parseInt(partes[1], 10);
            let miliseg = parseInt(partes[2], 10) * 0.001;
            
            console.log("Miutos " + minutos + " Segundos: " + segundos + " miliseg: " + miliseg)
            
            let tiempo_en_seg = minutos + segundos + miliseg;
    
            // Guardamos en el objeto tiempos el tiempo en segundos en la posición
            tiempos.push(tiempo_en_seg)
    
            /*
            Est nos deja un array  asi:
            tiempos = [TIEMPO_EN_SEG,_TIEMPO_EN_SEG]
                ... 
    
            */
        });        
        console.log("Tiempo de nuestro avion "+tiempo_avion)
     
        // Agregar el tiempo del avión a la lista de tiempos
        tiempos.push(tiempo_avion);
    
        // Ordenar la lista de tiempos
        let tiempos2 = [...tiempos].sort((a, b) => a - b); // Creamos una instancia nueva de tiempos y que los pequeños vayan delante
    
        // Encontrar la nueva posición del tiempo_avion
        let nueva_posicion = tiempos2.indexOf(tiempo_avion)+1;
        // CUIADADO, nueva_posicion esta cogiendo indexes de arrays entonces hay que +1
    
        return nueva_posicion
}

// Version con array
function meter_en_ranking(nueva_fila) {
    let tiempo = nueva_fila.querySelector('.tiempo').textContent;
    let pos = nueva_fila.querySelector(".numero").textContent;

    // Comprobar si la posicion ya esta ocupada
    for (fila in filas){
        if(fila.id == pos){ // Hay conicidencia
            subir_posiciones(pos)
            // Hacer funcion de partir filas e introducir la fila nueva y rejuntar todo filas
            break;
        }else{ // No hay, al fondo
            ranking.append(nueva_fila)
            return;
        }
    }
    /*
    // Identificar las posiciones que cambiaron
    let posiciones_cambiadas = [];
    tiempos2.forEach((tiempo, index) => {
        if (tiempos[index] !== tiempo) {
            posiciones_cambiadas.push(index+1);
            // CUIADADO, posiciones_cambiadas esta cogiendo indexes de arrays entonces hay que +1
        }
    });*/

    
    console.log(posiciones_cambiadas)
    // Actualizar IDs de filas
    // 

}
