////////////////////////////////////////////////////
// Funciones del ranking pero desde control       //
////////////////////////////////////////////////////

// Elementos HTML
var pilotos_control_resta = document.getElementById("pilotos_mas_borrar") // Bloque de las filas control borrar
var filas_control = document.getElementsByClassName("fila_control_borrar") // Filas del bloque control borrar
var botones_control = document.getElementsByClassName("boton_control")
var aparecer_desaparecer_rank = document.getElementById("aparecer_desaparecer_rank_id")

// Cogemos los botones
var boton_tiempo = document.getElementById("mostrar_tiempo_id");
var boton_peso = document.getElementById("mostrar_peso_id");
var boton_cambiazo = document.getElementById("cambiazoPesoTiempos")
let bot_logos = document.querySelector("#ocultar_logos_id")
let bot_despegues = document.querySelector("#ocultar_despegue_id")
let bot_dorsales = document.querySelector("#mostrar_dorsal_id")
// Flags
let peso_visible = false;
let tiempo_visible = true;
let ranking_visible = true;
let filas_visible = true;
let logos_visibles = true;
let despes_visibles = true;
let dorsal_visible = false;
// Listas
let pilotos = ["WOOD"]
let equipos = ["RUHE", "UVIGA", "G3", "MATSI", "LUFTS", "ECLFT", "SAET2", "DIANA", "TRENC", "NTHPO", "SAET1", "UCAIR", "XALOC", "EAFT1", "EAFT2"];
// Funciones traidas de otros archivos

// Coge al piloto y lo mete en el sistema
function cogerPiloto() {
    // Cogemos el  del avion actual a través del drop down
    let piloto_input = document.getElementById("nombres_equipos_constructor_id")
    piloto = piloto_input.value
    // Metemos el nuevo perfil en la lista
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
            return validarNumero(segundos) ? parseInt(segundos) : "00";

        case "mil":
            // Coger milis
            milis = document.getElementById("milisegundos_input_id").value;
            milis = String(milis*0.001).split(".")
            milis = milis[1]
            console.log("milis " + milis)
            return  validarNumero(milis) ? (milis.slice(0, 3)): "000";
        case "pes":
            // Coger el peso
            peso = document.getElementById("peso_input_id").value
            return validarNumero(peso) ? parseInt(peso) : 0;
    }
}

// Crea la fila de control        
function FilaControlResta(piloto,tiempo,pos){
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


    // Ponemos el tiempo del piloto
    let tiempin = document.createElement("div")
    tiempin.className = "tiempo_control"
    tiempin.textContent = tiempo
    fila_borrar.append(tiempin)


    //Ponemos la fila en BORRAR al final y luego lo reordenamos todo y nos da igual ya que no se va a ver
    pilotos_control_resta.append(fila_borrar)

    // Lo reordenamo
    arreglar_pos_control(pos)
}

// Arregla las posiciones de abajo de las filas de control
function arreglar_pos_control(pos) {
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
    var tiempos_ord_cont = [];
    // Obtener los tiempos de todas las filas
    Array.from(filas_control).forEach(fila => {
        let tiempo = fila.querySelector(".tiempo_control").textContent;
        let tiempoEnSegundos = convertirTiempoAMilisegundos(tiempo);
        tiempos_ord_cont.push(tiempoEnSegundos);
    });
    // Ordenar los tiempos
    let tiemposOrdenados = [...tiempos_ord_cont].sort((a, b) => a - b);
    // Los tiempos salen bien ordenados

    // Reordenar las filas en base a los tiempos ordenados
    Array.from(filas_control).forEach((fila, index) => {
        let tiempoFila = convertirTiempoAMilisegundos(fila.querySelector(".tiempo_control").textContent);
        let nuevaPosicion = tiemposOrdenados.indexOf(tiempoFila) + 1; // Agregar 1 ya que las posiciones comienzan desde 1
        console.log("Posicion que va al order: "+nuevaPosicion)
        // ESTA LINEA ES UNA BENDICION LA AMO
        fila.style.order = nuevaPosicion; // Establecer el orden con CSS CSS 
    });
    
}

// convertir tiempo a milisegundos
function convertirTiempoAMilisegundos(tiempo) {
    if (tiempo === '-:-:-') {
        return Number.MAX_SAFE_INTEGER; // Un valor muy alto para asegurar que se posicionen al final
    }
    let partes = tiempo.split(':');
    let minutos = Number(partes[0]) * 60;
    let segundos = Number(partes[1]);
    let milisegundos = Number(partes[2]);
    return minutos + segundos + milisegundos;
}

// Función para validar si el valor es un número
function validarNumero(valor) {
    return /^\d+$/.test(valor); // No se como va pero va :)
}

//Sacar la nueva posicion  - PERO AHORA DESDE CONTROL LOOOL
function sacar_pos_avion(tiempo) {
    let tiempo_avion = convertirTiempoAMilisegundos(tiempo);

    let tiempos = [];
    filas_array = Array.from(filas_control);

    // Cogemos todos los tiempos de los aviones
    filas_array.forEach(fila => {
        let tiempo = fila.querySelector('.tiempo_control').textContent;
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

function remplazar_piloto(piloto,estado,negado = false){
    console.log("remplazar_piloto")
    // Primero borramos la entrada existente ya
    // Necesitamos saber en que posicion esta
    let i = 0;
    for (let fila_piloto of filas_control) {
        // Cogemos el nombre y lo comparamos
        let nombre = fila_piloto.querySelector(".nombre_control").textContent;
        if (nombre === piloto) { // Coinciden los nombres
            pos = fila_piloto.querySelector(".boton_control[id*='c']").id.split("c")[0]; // Obtenemos el id del boton y sacamos la pos
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
        if (negado){
            negar_piloto(piloto)
        }else{
            // Volvemos a introducirlo con los puntos nuevos
            s_sumaPiloto(estado)
        }
    },500) // Retraso, podemos variarlo

}

function negar_piloto(piloto=cogerPiloto()){
    let estado = "animado"
    if (pilotos.includes(piloto)){ // Hay que reemplazarlo
        remplazar_piloto(piloto,estado,true)
    }else{
        pilotos.push(piloto)
        // Coger el tiempo del avion
        minutos = "-"
        segundos = "-"
        miliseg = "-"
        tiempo = minutos + ":" + segundos + ":" + miliseg
        console.log("TIEMPO "+tiempo)
        // Coger el peso
        peso = "-"
        // Encontrar en que posicion va a estar AHORA A TRAVES DE CONTROL!!!!!
        pos = sacar_pos_avion(tiempo) // Es un numero
        FilaControlResta(piloto,tiempo,pos) // Lo llamo antes para que cree la fila con id 1, o sino se la saltaba

        // Coger el despegue
        let despegue_input = "Pendiente"

        info = ["sumPil",piloto, pos, tiempo, peso, estado,despegue_input]
        socket.emit("all", "ranking",info )
    }
}