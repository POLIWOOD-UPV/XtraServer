////////////////////////////////////////////////////
// Funciones de poner y quitar pilotos             //
////////////////////////////////////////////////////


// Vaciar todos los aviones instantaneamente
function vaciarPilotos(){
    for (var j = filas.length - 1; j >= 0; j--) {
        filas[j].remove();
       
        controla_pilotos--; // Bajar la cantidad de pilotos
    }
}
// Borra los pilotos del ranking y control
function quitaPiloto(estado, pos) {
    if (filas.length > 0) {

        pos = Number(pos.split("c")[0]); // Obtener la posición de la ID del botón
        console.log("Posición a borrar: " + pos);

        let a_borrar = document.getElementById(String(pos)); // Elemento del piloto a borrar
        a_borrar.style.left = "-500px"; // Animación para mover el elemento fuera de la vista

        switch (estado) {
            case "animado":
                setTimeout(() => {
                    a_borrar.remove();
                    controla_pilotos--; // Decrementar el contador de pilotos
                    bajar_posiciones(pos); // Ajustar posiciones de los pilotos restantes
                }, 150);
                break;
            case "seco":
                a_borrar.remove();
                controla_pilotos--; // Decrementar el contador de pilotos
                bajar_posiciones(pos); // Ajustar posiciones de los pilotos restantes
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
function sumaPiloto(piloto,pos,puntos,estado,) {
    console.log("SumaPiloto")
    //Poner el avion en el ranking
    let nueva_fila = creaFila(piloto,pos, puntos);
    // Incrementamos la cantidad de aviones que hay
    ++controla_pilotos
    console.log("Introduciendo piloto " + piloto + " en "+pos+" con puntos: "+puntos)

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

// Introduce en el ranking la fila nueva
function meter_en_ranking(nueva_fila) {
    console.log("meter_en_ranking");

    let filas_array = Array.from(filas);

    // Pillamos la posicion
    let pos = parseInt(nueva_fila.querySelector(".numero").textContent, 10);

    // Verifica si la posición ya está ocupada
    let posicionOcupada = filas_array.some(fila => parseInt(fila.id, 10) === pos);

    if (posicionOcupada) {  // Si la posición está ocupada, inserta la nueva fila y ajusta las posiciones de las filas posteriores
        introducir_en_filas(pos, nueva_fila);
        subir_posiciones(pos);
    } else { // Si la posición no está ocupada, añade la nueva fila al final del ranking
        document.getElementById("contenedor").appendChild(nueva_fila); // Append to contenedor
        filas_array.push(nueva_fila);

        filas_array.forEach((fila, index) => {
            fila.querySelector('.numero').textContent = index + 1; // Ajusta el número visible
            fila.id = (index + 1).toString();                      // Ajusta el ID
        });
    }
    filas = document.querySelectorAll("#contenedor .fila"); // Update the filas NodeList
}

// Mete la info de la fila nueva en la posición correcta 
function introducir_en_filas(pos, nueva_fila) {
    console.log("introducir_en_filas");

    // Convierte la colección HTML de filas a un array temporal para iterar etc
    let filas_array = Array.from(filas);

    // Divide el array en dos partes: una antes y otra después de la posición indicada
    let filas_1 = filas_array.slice(0, pos - 1);  // Elementos del inicio hasta pos-1
    let filas_2 = filas_array.slice(pos - 1);     // Elementos desde pos-1 hasta el final

    // Inserta la nueva fila en donde va a estar y la juntamos con la segunda mitad 
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
    let cabeza = document.getElementById("cabeza");
    fragment.appendChild(cabeza);

    // Crea un nuevo contenedor para las filas
    let contenedor = document.createElement("div");
    contenedor.id = "contenedor";
    
    // Añade todas las filas al nuevo contenedor
    filas_array.forEach(function(fila) {
        contenedor.appendChild(fila);
    });

    // Añade el contenedor al fragmento
    fragment.appendChild(contenedor);

    // Limpia el contenedor actual del ranking y añade el fragmento actualizado
    while (ranking.firstChild) {
        ranking.removeChild(ranking.firstChild);
    }
    ranking.appendChild(fragment);

    filas = document.querySelectorAll("#contenedor .fila"); 
}

