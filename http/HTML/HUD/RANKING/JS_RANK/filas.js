////////////////////////////////////////////////////
// Funciones para modificar filas y sus contenidos//
////////////////////////////////////////////////////

// Variables Pilotos
var pilotos = ["RIC"]
var controla_pilotos = 1

// Coger ranking y filas
var ranking = document.getElementById("contenedor")
var filas = document.getElementsByClassName("fila")

var pilotos_control_resta = document.getElementById("pilotos_mas_borrar") // Bloque de las filas control borrar
var filas_control = document.getElementsByClassName("fila_control_borrar") // Filas del bloque control borrar

var botones_control = document.getElementsByClassName("boton_control")
// Cogemos los botones
var boton_tiempo = document.getElementById("mostrar_tiempo_id");
var boton_peso = document.getElementById("mostrar_peso_id");
var boton_cambiazo = document.getElementById("cambiazoPesoTiempos")

// Tiempo ( empieza activa)
var tiempo_visible = true;
var tiempos = document.getElementsByClassName("tiempo")

// Peso (empieza desactivada)
var peso_visible = false;
var pesos = document.getElementsByClassName("peso")



// Crea la fila donde se meten los datos
function creaFila(nom,pos,tiemp,pes){
    // Creamos la fila con sus partes
    let fila = document.createElement("div")
    fila.className = "fila"
    // Creamos la zona del numero
    let numero = document.createElement("div")
    numero.className = "numero"
    numero.textContent = pos
    // Creamos la zona del nombre, peso/tiempo
    let resto = document.createElement("div")
    resto.className = "resto"

    // Ponemos el nombre
    let nombre = document.createElement("div")
    nombre.className = "nombre"
    nombre.textContent = nom

    // Informativos
    let tiempo = crearTiempo(tiemp)
    let peso = crearPeso(pes)
    if (!tiempo_visible){
        tiempo.style.display = "none"
    }
    if (peso_visible){
        peso.style.display = "flex"
    }


    // Lo juntamos todo y devolvemos la fila
    resto.append(nombre,tiempo,peso)
    // Le ponemos de ID la posicion
    fila.id = pos
    fila.append(numero,resto)

    
    
    // Ponemos la fila en la izquierda para que se mueva mas tarde
    fila.style.left = "-500px"
    return fila
}


function FilaControlResta(piloto,tiempo,pos){
     // Creamos la fila con sus partes
    let fila_borrar = document.createElement("div")
    fila_borrar.className = "fila_control_borrar"
    
    // Ponemos el nombre
    let nombre = document.createElement("div")
    nombre.textContent = piloto
    fila_borrar.append(nombre)

    // Para borrar
    //Ponemos el boton de eliminar animado
    let botoncin = document.createElement("button")
    botoncin.id = pos+"c_AN" // Le ponemos el id con la posicion en la que esta para luego poder quitarlo al borrar el piloto

    botoncin.onclick = () => {
        quitaPiloto('animado',botoncin.id) // Le pasamos la ID ya que es lo que lleva en que pos estamos 
    };
    botoncin.textContent = "BORRAR_An"
    botoncin.className = "boton_control"
    fila_borrar.append(botoncin)

    //Ponemos el boton de eliminar seco
    let botoncin2 = document.createElement("button")
    botoncin2.id = pos+"c" // Le ponemos el id con la posicion en la que esta para luego poder quitarlo al borrar el piloto

    botoncin2.onclick = () => {
        quitaPiloto('seco',botoncin2.id); // Le pasamos la ID ya que es lo que lleva en que pos estamos 
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
    console.log("Metido en: "+pos+" "+tiempo)
}

// Arregla las posiciones de abajo
function arreglar_pos_control(pos) {
    if (pos < (filas_control.length)) { // Si la posicion se cuela entre y otras 
        // Ordenamos las filas de control
        ordenar_control()

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
                quitaPiloto('seco',boton_seco.id); // Le pasamos la ID ya que es lo que lleva en que pos estamos 
            };

            boton_anim.onclick = () => {
                quitaPiloto('seco',boton_anim.id); // Le pasamos la ID ya que es lo que lleva en que pos estamos 
            };

        }    
    }else{
        ordenar_control()
    }
}


function ordenar_control() {
    var tiempos_ord_cont = [];

    // Función para convertir el tiempo de formato MM:SS:XXX a segundos
    function convertirTiempoAMilisegundos(tiempo) {
        let partes = tiempo.split(':');
        let minutos = Number(partes[0]) * 60;
        let segundos = Number(partes[1]);
        let milisegundos = Number(partes[2]) * 0.001;
        return minutos + segundos + milisegundos;
    }
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
        
        
        // ESTA LINEA ES UNA BENDICION LA AMO
        fila.style.order = nuevaPosicion; // Establecer el orden con CSS CSS 
    });
    
}


// Funciones para modificar la informacion del ranking

// Función para mostrar el tiempo en la fila
function mostrarTiempo(){
    let estado;
    if (tiempo_visible){
        // Ocultar tiempos
        estado = "none";
        boton_tiempo.textContent = "Mostrar Tiempos"
        tiempo_visible = false;
    }else{
        // Mostrar tiempos
        estado = "flex";
        boton_tiempo.textContent = "Ocultar Tiempos"
        tiempo_visible = true;
    }
    for (var i = 0; i < tiempos.length;i++){
        tiempos[i].style.display = estado
    }

}

// Función para mostrar el peso en la fila
function mostrarPeso(){
    let estado;
    if (peso_visible){
        // Ocultar pesos
        estado = "none";
        boton_peso.textContent = "Mostrar Pesos"
        peso_visible = false;
    }else{
        // Mostrar pesos
        estado = "flex";
        boton_peso.textContent = "Ocultar Pesos"
        peso_visible = true;
    }
    for (var i = 0; i < pesos.length;i++){
        pesos[i].style.display = estado
    }
}

// Función para alternar el peso con el tiempo y viceversa
function cambiazoPesoTiempos(){
    if ((!tiempo_visible && !peso_visible) ||(tiempo_visible && peso_visible) ) {
        return
    }else{
        mostrarTiempo();
        mostrarPeso();
    }
}