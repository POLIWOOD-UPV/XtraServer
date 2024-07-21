//////////////////////////////////////////////////////////////
// Funciones para modificar filas y sus contenidos en Puntos//
//////////////////////////////////////////////////////////////

// Variables de visibilidad específicas
let puntos_visibles = true;
let puntos_dto = document.getElementsByClassName("puntos");

// Crea la fila donde se meten los datos
function creaFila(nom,pos, puntos){
    // Creamos la fila con sus partes
    let fila = document.createElement("div")
    fila.className = "fila"
    // Creamos la zona del numero
    let numero = document.createElement("div")
    numero.className = "numero"
    numero.textContent = pos

    // Si es un club, que el numero sea de otro color
    if (nom === "XALOC" || nom.substring(0, 4) === "EAFT") {
        numero.style.backgroundColor = "rgb(70 157 243)";
        numero.style.color = "white"
    }
    // Creamos la zona del nombre, peso/tiempo
    let resto = document.createElement("div")
    resto.className = "resto"

    // Ponemos el nombre
    let nombre = document.createElement("div")
    nombre.className = "nombre"
    nombre.textContent = nom

    // Metemos la imagen
    logo = meterLogos(nom)

    // Metemos el dorsal
    dor = meterDorsal(nom);
    // Informativos

    // Puntos
    let puntazos = document.createElement("div")
    puntazos.className = "puntos"
    puntazos.textContent = puntos
    
    if (!puntos_visibles){
        puntazos.style.display = "none"
    }

    if (logos_visibles){
        logo.style.display = "flex"
    }
    if (dorsal_visible){
        dor.style.display = "flex"
    }
    if (!despegues_visibles){
        circulo.style.display = "none"
    }

    // Le ponemos de ID la posicion
    fila.id = pos
    fila.append(numero,logo,dor,nombre,puntazos)

    // Ponemos la fila en la izquierda para que se mueva mas tarde
    fila.style.left = "-500px"
    return fila
}

// Función para mostrar los puntos en la fila
function mostrarPuntos() {
    let estado = puntos_visibles ? "none" : "flex";
    puntos_visibles = !puntos_visibles;
    document.getElementById("cab_pun").style.display = puntos_visibles ? "block" : "none";
    for (let i = 0; i < puntos_dto.length; i++) {
        puntos_dto[i].style.display = estado;
    }
}

