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

// Vaciar todos los aviones instantaneamente
function vaciarPilotos(){
    for (var j = filas.length - 1; j >= 0; j--) {
        filas[j].remove();
        filas_control[j].remove(); // Quitar todas las filas de control
        controla_pilotos--; // Bajar la cantidad de pilotos
    }
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
// Cambiar el número visible a todos los de debajo y al que se ha agregado
function subir_posiciones(pos) {

    // Cogemos los numeros desde nuestra pos hasta la longitud de la lista
    let numeros = [];
    for (let i = pos; i <= filas.length; i++) {
        numeros.push(i);
    }

    let cont = 0; // Inicializa el contador
    for (let fila of filas) {
        let posicion = fila.querySelector('.numero'); // Encuentra el elemento con la clase 'numero'
        // Si la posición actual es mayor o igual a la posición a subir
        if (Number(posicion.textContent) >= pos) {
            posicion.textContent = numeros[cont]; // Asigna el número correspondiente
            fila.id = String(numeros[cont]); // Asigna el mismo número como ID
            cont++; // Incrementa el contador para obtener el siguiente número en la lista
        }
    }
}


// Poner y sacar aviones (con animacion)
function sumaPiloto(estado) {
    // Agreganis el avion a la lista y lo cogemos
    piloto = crea_Perfil();

    // Coger el tiempo del avion
    minutos = cogerTiempo("min")
    segundos = cogerTiempo("seg")
    miliseg = cogerTiempo("mil")
    tiempo = minutos + ":" + segundos + ":" + miliseg

    // Encontrar en que posicion va a estar
    pos = sacar_pos_avion(tiempo) // Es un numero

    // Falta ordenarlas 
    FilaControlResta(piloto,tiempo,pos) // Lo llamo antes para que cree la fila con id 1, o sino se la saltaba
    
    // Coger el peso
    peso = document.getElementById("peso_input_id").value + "Kg"


    let despegue15;
    // Despegue en 15 metros
    if (document.getElementById("15mcheck").checked){
        despuegue15 = true
        document.getElementById("15mcheck").checked = false; // Le quitamos el check para el siguiente avion
    }else{
        despegue15 = false
    }

    //Poner el avion en el ranking
    let nueva_fila = creaFila(piloto,pos, tiempo,peso,despegue15);
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
function cogerTiempo(que) {
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
    }
}

// Función para validar si el valor es un número
function validarNumero(valor) {
    return /^\d+$/.test(valor); // No se como va pero va :)
}

// Versión con array
function meter_en_ranking(nueva_fila) {
    filas_array = Array.from(filas); 
    //let tiempo = nueva_fila.querySelector('.tiempo').textContent;
    let pos = parseInt(nueva_fila.querySelector(".numero").textContent, 10);
    // Esta pos está corregida con +1

    let posicionOcupada = false;
    for (let fila of filas) {
        if (parseInt(fila.id, 10) === pos) { // Hay coincidencia
            posicionOcupada = true;
            break;
        }
    }

    if (posicionOcupada) {
        // Partir filas, introducir la nueva fila y rejuntar todo en filas
        introducir_en_filas(pos, nueva_fila);

        // Subimos las posiciones de los que estan abajo de nuestra posicion
        subir_posiciones(pos);

    } else { // No hay coincidencia, añadir al final
        ranking.appendChild(nueva_fila);  // Usar appendChild para elementos DOM
    }
}
function introducir_en_filas(pos, nueva_fila) {
    // Convierte filas (HTMLCollection) a un array temporal
    let filas_array = Array.from(filas);

    // Divide el array en dos partes: antes y después de la posición
    let filas_1 = filas_array.slice(0, pos);  // Elementos del inicio a pos-1
    let filas_2 = filas_array.slice(pos - 1);     // El resto

    // Inserta la nueva fila en la posición adecuada
    filas_1.push(nueva_fila);

    // Combina las dos partes con la nueva fila incluida
    filas_array = filas_1.concat(filas_2);


    // MANTENER FILAS COMO HTML COLLECTION Y NO COMO ARRAY. Menudo cacao, documentar mejor a futuro:
    // Crear un fragmento de documento para eficiencia
    let fragment = document.createDocumentFragment();

    // Añadir la cabecera al fragmento
    fragment.appendChild(document.getElementById("cabecera"));

    // Añadir todas las filas al fragmento
    filas_array.forEach(function(fila) {
        fragment.appendChild(fila);
    });

    // Limpiar el contenedor y añadir el fragmento
    while (ranking.firstChild) {
        ranking.removeChild(ranking.firstChild);
    }
    ranking.appendChild(fragment);
}

//Sacar la nueva posicion  
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
    
        let tiempos = [];
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
                        
            let tiempo_en_seg = minutos + segundos + miliseg;
    
            // Guardamos en el objeto tiempos el tiempo en segundos en la posición
            tiempos.push(tiempo_en_seg)
    
            /*
            Est nos deja un array  asi:
            tiempos = [TIEMPO_EN_SEG,_TIEMPO_EN_SEG]
                ... 
            */
            
        });        
     
        // Agregar el tiempo del avión a la lista de tiempos
        tiempos.push(tiempo_avion);
    
        // Ordenar la lista de tiempos
        let tiempos2 = [...tiempos].sort((a, b) => a - b); // Creamos una instancia nueva de tiempos y que los pequeños vayan delante

        // Encontrar la nueva posición del tiempo_avion
        let nueva_posicion = tiempos2.indexOf(tiempo_avion)+1;
        // CUIADADO, nueva_posicion esta cogiendo indexes de arrays entonces hay que +1
    
        return nueva_posicion
}