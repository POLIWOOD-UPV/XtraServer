var oculto = false;

function mover(){
    const ventana = document.getElementById("contenedor-mejores");

    if (!oculto) {
        ventana.classList.add("oculto-derecha");
        oculto = true;      
    } else {
        ventana.classList.remove("oculto-derecha");
        oculto = false; 
    }
    
}