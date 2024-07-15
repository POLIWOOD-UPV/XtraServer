/////////////////////////////////////////////////////////////
// Funciones del socket del control del ranking de puntos  //
/////////////////////////////////////////////////////////////

// Inicializamos el socket
const socket = io();

function hola(){
    socket.emit("all","puntos",["message","Hola!"]);
}
// Dinamicas (son las mismas, a futuro optimizar en un mismo fichero)
function s_rankingMov(){
    if (ranking_visible) { // Es visible
        // Ranking se pasa a oculto
        aparecer_desaparecer_rank.textContent = "Aparecer Ranking";
        ranking_visible = false;
    } else { // No es visible
        aparecer_desaparecer_rank.textContent = "Desaparecer Ranking";
        ranking_visible = true;
        }
    socket.emit("all","puntos",["rankMov"])
}

function s_aparicionDinamica(){
    socket.emit("all","puntos",["apaDina"])
}
function s_desaparicionDinamica(){
    socket.emit("all","puntos",["desDina"])
}

// Filas
function s_mostrarPuntos(){
    if (puntos_visibles){
        // Ocultar tiempos
        boton_puntos.textContent = "Mostrar Puntos"
        puntos_visibles = false;
    }else{
        // Mostrar tiempos
        boton_puntos.textContent = "Ocultar Puntos"
        puntos_visibles = true;
    }
    socket.emit("all","puntos",["mosPes"]);
}

function s_ocultarLogos(){ 
    socket.emit("all","puntos",["logVis",logos_visibles])
    if (logos_visibles){ // Son visibles y vamos a esconderlos
        bot_logos.textContent = "Mostrar logos"
        logos_visibles = false
    }else{
        bot_logos.textContent = "Ocultar logos"
        logos_visibles = true
    }
}

// Pilotos
function s_vaciarPilotos(){ // Esta tambien es igual, filas control cuidado
    for (let j = filas_control.length-1; j>=0; j--){
        console.log(filas_control[j])
        filas_control[j].remove(); // Quitar todas las filas de control                    
    }
    // Vaciamos la lista de pilotos
    pilotos = []
    socket.emit("all","puntos",["vacPilo"]);
}
function s_sumaPiloto(estado){
    // console.info("s_sumaPiloto")
    // Coger el piloto
    piloto = cogerPiloto();
    console.log(piloto)
    // Comprobamos si existe ya una entrada de ese piloto
    if (pilotos.includes(piloto)){ // Ya existe -> Hay que reemplazarlo
        remplazar_piloto(piloto,estado)
    }else{                          // No existe -> Hay que crearlo 
        // Metemos el nuevo perfil en la lista
        pilotos.push(piloto)

        // Coger los puntos del avion
        puntos = cogerPuntos();

        // Encontrar en que posicion va a estar AHORA A TRAVES DE CONTROL!!!!!
        pos = sacar_pos_avion(puntos) // Es un numero
        FilaControlResta(piloto,puntos,pos) // Lo llamo antes para que cree la fila con id 1, o sino se la saltaba

        // Empaquetado de informacion
        info = ["sumPil",piloto, pos, puntos,estado]
        socket.emit("all", "puntos",info )
        ordenar_control(); // Ordenar la lista de control después de la eliminación
    }
}
function s_quitaPiloto(estado,pos){ // Esta es igial tambien, cuidado con el emit y filas control
    // console.info("s_quitaPiloto")
    let a_borrar_c = document.getElementById(pos).parentNode; // Elemento de control a borrar animado
    a_borrar_c.remove();

    // Sacar datos
    a_borrar_nombre = a_borrar_c.querySelector(".nombre_control").textContent
    pos = pos.split("c")[0]
    console.log("Quitando "+a_borrar_nombre+" en "+pos)
    pilotos = pilotos.filter(item => item !== a_borrar_nombre)

    // Mandar la info al ranking
    info = ["quiPil",estado,pos]
    socket.emit("all","puntos",info)
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
        // console.log(id_fila_actual)
        pos = pos.split("c")[0]
        if (id_fila_actual > pos){
            boton_animado.id = String(id_fila_actual-1)+"c_AN"
            // Boton sin animacion
            boton_normal.id = String(id_fila_actual-1)+"c"
        }
    }
    ordenar_control()
}

function s_mandar_zeros(){
    // Primero vaciamos todos los pilotos
    s_vaciarPilotos();
    
    // Rellenamos el control con todo 0s
    let estado = "animado"
    for (equipo of equipos){
        // Metemos el nuevo perfil en la lista
        pilotos.push(equipo)
        // Coger los puntos del avion
        puntos = "0";
        
        // Encontrar en que posicion va a estar AHORA A TRAVES DE CONTROL!!!!!
        pos = sacar_pos_avion(puntos) // Es un numero
        FilaControlResta(equipo,puntos,pos) // Lo llamo antes para que cree la fila con id 1, o sino se la saltaba
        
        // Empaquetado de informacion
        info = ["sumPil",equipo, pos, puntos,estado]
        socket.emit("all", "puntos",info )
        ordenar_control(); // Ordenar la lista de control después de la eliminación
        
    }
}