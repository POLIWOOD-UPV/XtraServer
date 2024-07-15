////////////////////////////////////////////////////
// Funciones del socket del control del ranking   //
////////////////////////////////////////////////////

// Inicializamos el socket
const socket = io();

function hola(){
    socket.emit("all","ranking",["message","Hola!"]);
}
// Dinamicas
function s_rankingMov(){
    if (ranking_visible) { // Es visible
        // Ranking se pasa a oculto
        aparecer_desaparecer_rank.textContent = "Aparecer Ranking";
        ranking_visible = false;
    } else { // No es visible
        aparecer_desaparecer_rank.textContent = "Desaparecer Ranking";
        ranking_visible = true;
        }
    socket.emit("all","ranking",["rankMov"])
}

function s_aparicionDinamica(){
    socket.emit("all","ranking",["apaDina"])
}
function s_desaparicionDinamica(){
    socket.emit("all","ranking",["desDina"])
}

// Filas
function s_mostrarTiempo(){
    if (tiempo_visible){
        // Ocultar tiempos
        boton_tiempo.textContent = "Mostrar Tiempos"
        tiempo_visible = false;
    }else{
        // Mostrar tiempos
        boton_tiempo.textContent = "Ocultar Tiempos"
        tiempo_visible = true;
    }
    socket.emit("all","ranking",["mosTem"]);
}

function s_mostrarPeso(){
    if (peso_visible){
        // Ocultar pesos
        boton_peso.textContent = "Mostrar Pesos"
        peso_visible = false;
    }else{
        // Mostrar pesos
        boton_peso.textContent = "Ocultar Pesos"
        peso_visible = true;
    }
    socket.emit("all","ranking",["mosPeso"]);
}

function s_cambiazoPesoTiempos(){
    if ((!tiempo_visible && !peso_visible) ||(tiempo_visible && peso_visible) ) {
        return
    }else{
        s_mostrarTiempo();
        s_mostrarPeso();
    }
}

function s_ocultarLogos(){
    if (logos_visibles){ // Son visibles y vamos a esconderlos
        bot_logos.textContent = "Mostrar logos"
        logos_visibles = false
    }else{
        bot_logos.textContent = "Ocultar logos"
        logos_visibles = true
    }
    socket.emit("all","ranking",["logVis",logos_visibles])
}
function s_ocultarDespegue(){
    socket.emit("all","ranking",["desVis",despes_visibles])
    if (despes_visibles){ // Son visibles y vamos a esconderlos
        bot_despegues.textContent = "Mostrar despegues"
        despes_visibles = false
    }else{
        bot_despegues.textContent = "Ocultar despegues"
        despes_visibles = true
    }
}
// Pilotos
function s_vaciarPilotos(){
    for (let j = filas_control.length-1; j>=0; j--){
        console.log(filas_control[j])
        filas_control[j].remove(); // Quitar todas las filas de control                    
    }
    pilotos = []
    socket.emit("all","ranking",["vacPilo"]);
}
function s_sumaPiloto(estado){
    // Agreganis el avion a la lista y lo cogemos
    piloto = cogerPiloto();
    if (pilotos.includes(piloto)){
        remplazar_piloto(piloto,estado)
    }else if (estado == "negado"){
        pilotos.push(piloto)
        // Coger el tiempo del avion
        minutos = cogerTiempo_Peso("min")
        segundos = cogerTiempo_Peso("seg")
        miliseg = cogerTiempo_Peso("mil")
        tiempo = minutos + ":" + segundos + ":" + miliseg
        console.log("TIEMPO "+tiempo)
        // Coger el peso
        peso = cogerTiempo_Peso("pes")
        // Encontrar en que posicion va a estar AHORA A TRAVES DE CONTROL!!!!!
        pos = sacar_pos_avion(tiempo) // Es un numero
        FilaControlResta(piloto,tiempo,pos) // Lo llamo antes para que cree la fila con id 1, o sino se la saltaba

        // Coger el despegue
        let despegue_input = document.querySelector("#tipos_despegue_id").value

        info = ["sumPil",piloto, pos, tiempo, peso, estado,despegue_input]
        socket.emit("all", "ranking",info )
        ordenar_control(); // Ordenar la lista de control después de la eliminación
    }else {
        pilotos.push(piloto)
        // Coger el tiempo del avion
        minutos = cogerTiempo_Peso("min")
        segundos = cogerTiempo_Peso("seg")
        miliseg = cogerTiempo_Peso("mil")
        tiempo = minutos + ":" + segundos + ":" + miliseg
        console.log("TIEMPO "+tiempo)
        // Coger el peso
        peso = cogerTiempo_Peso("pes")
        // Encontrar en que posicion va a estar AHORA A TRAVES DE CONTROL!!!!!
        pos = sacar_pos_avion(tiempo) // Es un numero
        FilaControlResta(piloto,tiempo,pos) // Lo llamo antes para que cree la fila con id 1, o sino se la saltaba

        // Coger el despegue
        let despegue_input = document.querySelector("#tipos_despegue_id").value

        info = ["sumPil",piloto, pos, tiempo, peso, estado,despegue_input]
        socket.emit("all", "ranking",info )
        ordenar_control(); // Ordenar la lista de control después de la eliminación
    }
}
function s_quitaPiloto(estado,pos,negado = false){
    console.log("Parametros QuitaPilotos: "+estado+" "+pos)
    let a_borrar_c = document.getElementById(pos).parentNode; // Elemento de control a borrar animado
    a_borrar_c.remove();

    a_borrar_nombre = a_borrar_c.querySelector(".nombre_control").textContent.toUpperCase()
    console.log("TEST: ", a_borrar_nombre)

    // Quitamos el piloto
    pilotos = pilotos.filter(item => item !== a_borrar_nombre)
    info = ["quiPil",estado,pos]
    socket.emit("all","ranking",info)
    // Actualizar el ID de todos los botones de la fila de control
    for (let i = 0; i < filas_control.length; i++) {
        fila = filas_control[i]
        // Estas son las filas de la derecha
        let botones = fila.getElementsByTagName("button") // Cogemos los dos botones de la fila
        // Cogemos los botones a trabajar con 
        boton_animado = botones[0]
        boton_normal = botones[1]

        // identificamos si estamos en una fila que debemos modificar
        let id_fila_actual = Number(boton_animado.id.split("c")[0])
        console.log(id_fila_actual)
        pos = pos.split("c")[0]
        if (id_fila_actual > pos){
            boton_animado.id = String(id_fila_actual-1)+"c_AN"
            console.log("boton_id "+boton_animado.id)
            // Boton sin animacion
            boton_normal.id = String(id_fila_actual-1)+"c"
        }
    }
    ordenar_control()
}

function s_mandar_zeros(){
    // Primero vaciamos todos los pilotos
    s_vaciarPilotos();
    let estado = "animado"
    // Rellenamos el control con todo 0s
    for (let piloto of equipos){
        negar_piloto(piloto,estado)
        ordenar_control(); // Ordenar la lista de control después de la eliminación
    }
}

