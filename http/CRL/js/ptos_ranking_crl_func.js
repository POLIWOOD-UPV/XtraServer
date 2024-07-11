////////////////////////////////////////////////////
// Funciones del ranking pero desde control       //
////////////////////////////////////////////////////

// Elementos HTML
var pilotos_control_resta = document.getElementById("pilotos_mas_borrar") // Bloque de las filas control borrar
var filas_control = document.getElementsByClassName("fila_control_borrar") // Filas del bloque control borrar
var botones_control = document.getElementsByClassName("boton_control")
var aparecer_desaparecer_rank = document.getElementById("aparecer_desaparecer_rank_id")

// Cogemos los botones
var boton_puntos = document.getElementById("mostrar_puntos_id");
let bot_logos = document.querySelector("#ocultar_logos_id")
// Flags
var ranking_visible = true;
var filas_visible = true;
let puntos_visibles = true;
logos_visibles = true;
var pilotos = ["POLIWOOD"]


// Funciones traidas de otros archivos

// Coge al piloto y lo mete en el sistema
function cogerPiloto() {
    // console.log("cogerPiloto")
    // Cogemos el  del avion actual a través del drop down
    let piloto_input = document.getElementById("nombres_equipos_constructor_id")
    piloto = piloto_input.value
    return piloto
}

// Coger los tiempos del input
function cogerPuntos() {
    // console.log("cogerPuntos")
    let puntos = parseInt(document.querySelector("#puntos_input_id").value);
    return isNaN(puntos) ? 0 : puntos; // Si no es un numero, devolvemos 0
}


// Crea la fila de control        
function FilaControlResta(piloto,puntos,pos){
    // console.log("FilaControlResta")

    // Creamos la fila con sus partes
    let fila_borrar = document.createElement("div")
    fila_borrar.className = "fila_control_borrar"
    
    // Ponemos el nombre
    let nombre = document.createElement("div")
    nombre.textContent = piloto
    nombre.className = "nombre_control"
    fila_borrar.append(nombre)

    // Para borrar
    //Ponemos el boton de eliminar animado
    let botoncin = document.createElement("button")
    botoncin.id = pos+"c_AN" // Le ponemos el id con la posicion en la que esta para luego poder quitarlo al borrar el piloto

    botoncin.onclick = () => {
        s_quitaPiloto('animado',botoncin.id) // Le pasamos la ID ya que es lo que lleva en que pos estamos 
    };
    botoncin.textContent = "BORRAR_An"
    botoncin.className = "boton_control"
    fila_borrar.append(botoncin)

    //Ponemos el boton de eliminar seco
    let botoncin2 = document.createElement("button")
    botoncin2.id = pos+"c" // Le ponemos el id con la posicion en la que esta para luego poder quitarlo al borrar el piloto

    botoncin2.onclick = () => {
        s_quitaPiloto('seco',botoncin2.id); // Le pasamos la ID ya que es lo que lleva en que pos estamos 
    };
    botoncin2.textContent = "BORRAR"
    botoncin2.className = "boton_control"
    fila_borrar.append(botoncin2)


    // Ponemos los puntos del piloto
    let puntitos = document.createElement("div")
    puntitos.className = "puntos_control"
    puntitos.textContent = puntos
    fila_borrar.append(puntitos)


    //Ponemos la fila en BORRAR al final y luego lo reordenamos todo y nos da igual ya que no se va a ver
    pilotos_control_resta.append(fila_borrar)

    // Lo reordenamo
    arreglar_pos_control(pos)
}

// Arregla las posiciones de abajo de las filas de control
function arreglar_pos_control(pos) {
    // console.log("arreglar_pos_control")

// Ordenamos las filas de control
    ordenar_control()
    if (pos < (filas_control.length)) { // Si la posicion se cuela entre y otras 
        // Ordenamos las filas de control
        //ordenar_control()

        // Guardamos los números de las IDs que vamos a poner
        let numeros = [];
        for (let i = filas_control.length - 1; i >= pos; i--){ // Cogemos al revés para que no haya conflictos de IDs
            numeros.push(i); // La posición como tal
        }
        // Sumamos y reasignamos
        for (let i = 0; i < numeros.length; i++) { // Empezamos en 0 porque vamos a trabajar con indices en listas
            // Cogemos el id con el que vamos a trabajar
            let boton_id = numeros[i];
            
            // Cogemos los botones antiguos
            let boton_seco = document.getElementById(String(boton_id + "c")); // Cogemos el botón seco antiguo
            let boton_anim = document.getElementById(String(boton_id + "c_AN")); // Cogemos el botón animado antiguo

            // Actualizamos el ID
            boton_seco.id = String((boton_id + 1) + "c");
            boton_anim.id = String((boton_id + 1) + "c_AN");

            // Actualizamos el onclick
            boton_seco.onclick = () => {
                s_quitaPiloto('seco',boton_seco.id); // Le pasamos la ID ya que es lo que lleva en que pos estamos 
            };

            boton_anim.onclick = () => {
                s_quitaPiloto('seco',boton_anim.id); // Le pasamos la ID ya que es lo que lleva en que pos estamos 
            };

        }    
    }
}

// Ordena las filas de control 
function ordenar_control() {
    // console.log("ordenar_control")
    var puntos_ord_cont = [];
    // Obtener los puntos de todas las filas
    Array.from(filas_control).forEach(fila => {
        let punto = parseInt(fila.querySelector(".puntos_control").textContent);
        puntos_ord_cont.push(punto);
        // console.log("Punto cogido de la fila: "+ punto)
    });
    // Ordenar los puntos
    let puntosOrdenados = [...puntos_ord_cont].sort((a, b) => b - a);
    // Los tiempos salen bien ordenados
    // console.log("Puntos Ordenados")
    // console.log(puntosOrdenados)
    // Reordenar las filas en base a los tiempos ordenados
    Array.from(filas_control).forEach((fila, index) => {
        let puntoFila = parseInt(fila.querySelector(".puntos_control").textContent)
        // console.log("puntoFila ",puntoFila)
        let nuevaPosicion = puntosOrdenados.indexOf(puntoFila) + 1; // Agregar 1 ya que las posiciones comienzan desde 1
        // console.log("Posicion que va al order: "+ nuevaPosicion)
        // ESTA LINEA ES UNA BENDICION LA AMO
        fila.style.order = nuevaPosicion; // Establecer el orden con CSS!! 
    });
    
}


// Función para validar si el valor es un número
function validarNumero(valor) {
    return /^\d+$/.test(valor); // No se como va pero va :)
}

//Sacar la nueva posicion  - PERO AHORA DESDE CONTROL LOOOL
function sacar_pos_avion(puntazo) {
    // console.log("sacar_pos_avion")
    let puntos = [];
    filas_array = Array.from(filas_control);

    // Cogemos todos los tiempos de los aviones
    filas_array.forEach(fila => {
        let punto = fila.querySelector('.puntos_control').textContent;
        puntos.push(punto);
    });

    // Metemos al final el nuestro y creamos una copia ordenada
    puntos.push(puntazo);
    let puntos2 = [...puntos].sort((a, b) => b - a);

    // Buscamos el indice y +1 ya que es un array y las pos empiezan en 1 no 0
    let nueva_posicion = puntos2.lastIndexOf(puntazo) + 1;

    return nueva_posicion;
}

function remplazar_piloto(piloto,estado){
    // console.log("remplazar_piloto")
    // Primero borramos la entrada existente ya
    // Necesitamos saber en que posicion esta
    let i = 0;
    for (let fila_piloto of filas_control) {
        // Cogemos el nombre y lo comparamos
        let nombre = fila_piloto.querySelector(".nombre_control").textContent;
        if (nombre === piloto) { // Coinciden los nombres
            pos = fila_piloto.querySelector(".boton_control[id*='c']").id[0]; // Obtenemos el id del boton y sacamos la pos
            break
        }else{ // No coinciden
            i++
        }
    }
    // Quitamos el piloto y de la lista tambien
    console.log("Reemplazar piloto "+piloto+" en "+pos)
    s_quitaPiloto(estado,pos+"c")
    pilotos = pilotos.filter(item => item !== piloto); // StackOverflow, devuevlve pilotos sin piloto
    
    setTimeout(()=>{
        // Volvemos a introducirlo con los puntos nuevos
        s_sumaPiloto(estado)
    },500) // Retraso, podemos variarlo

}