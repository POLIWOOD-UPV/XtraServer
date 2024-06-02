
////////////////////////////////////////////////////
// Funciones del socket del control del ranking   //
////////////////////////////////////////////////////

// Inicializamos el socket
const socket = io();

function hola(){
    socket.emit("all","message","Hola!");
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
    socket.emit("all","rankMov");
}

function s_aparicionDinamica(){
    socket.emit("all","apaDina")
}
function s_desaparicionDinamica(){
    socket.emit("all","desDina")
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
    socket.emit("all","mosTmpo");
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
    socket.emit("all","mosPeso");
}

function s_cambiazoPesoTiempos(){
    if ((!tiempo_visible && !peso_visible) ||(tiempo_visible && peso_visible) ) {
        return
    }else{
        s_mostrarTiempo();
        s_mostrarPeso();
    }
}

// Pilotos
function s_vaciarPilotos(){
    for (let j = filas_control.length-1; j>=0; j--){
        console.log(filas_control[j])
        filas_control[j].remove(); // Quitar todas las filas de control                    
    }
    socket.emit("all","vacPilo");
}
function s_sumaPiloto(estado){
    // Agreganis el avion a la lista y lo cogemos
    piloto = crea_Perfil();

    // Coger el tiempo del avion
    minutos = cogerTiempo_Peso("min")
    segundos = cogerTiempo_Peso("seg")
    miliseg = cogerTiempo_Peso("mil")
    tiempo = minutos + ":" + segundos + ":" + miliseg
    // Coger el peso
    peso = cogerTiempo_Peso("pes")
    // Encontrar en que posicion va a estar AHORA A TRAVES DE CONTROL!!!!!
    pos = sacar_pos_avion(tiempo) // Es un numero
    FilaControlResta(piloto,tiempo,pos) // Lo llamo antes para que cree la fila con id 1, o sino se la saltaba

    info = [piloto, pos, tiempo, peso, estado]
    socket.emit("all", "sumPil",info )
    ordenar_control(); // Ordenar la lista de control después de la eliminación

}
function s_quitaPiloto(estado,pos){
    let a_borrar_c = document.getElementById(pos).parentNode; // Elemento de control a borrar animado
    a_borrar_c.remove();

    info = [estado,pos]
    socket.emit("all","quiPil",info)
    // Actualizar el ID de todos los botones de la fila de control
    for (let i = 0; i < filas_control.length; i++) {
        fila = filas_control[i]
        // Estas son las filas de la derecha
        let botones = fila.getElementsByTagName("button") // Cogemos los dos botones de la fila
        // Cogemos los botones a trabajar con 
        boton_animado = botones[0]
        boton_normal = botones[1]

        // identificamos si estamos en una fila que debemos modificar
        let id_fila_actual = Number(boton_animado.id[0])
        console.log(id_fila_actual)
        pos = pos[0]
        if (id_fila_actual > pos){
            boton_animado.id = String(id_fila_actual-1)+"c_AN"
            console.log("boton_id "+boton_animado.id)
            // Boton sin animacion
            boton_normal.id = String(id_fila_actual-1)+"c"
        }
    }
}
