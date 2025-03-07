/////////////////////////////////////////////////////////////
// Funciones del base del control   de puntos              //
/////////////////////////////////////////////////////////////

let puntos_visibles = true
// Cogemos los botones
var boton_puntos = document.getElementById("mostrar_puntos_id");
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

// Función para validar si el valor es un número
function validarNumero(valor) {
    return /^\d+$/.test(valor); // No se como va pero va :)
}