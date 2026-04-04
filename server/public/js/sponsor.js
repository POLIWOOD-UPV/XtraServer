// Declaramos el valor que va a hacer que cambie el evento (True/False)
let showMainBlock = true;

// Cogemos los elementos del HTML
const button = document.getElementById("up_down_button");
const main_block = document.querySelector("footer");

// Evento para el botón, se activa al hacer click
button.addEventListener("click", function () {
    showMainBlock = !showMainBlock;

    // Si showMainBlock es true, el bloque vuelve a la posición original
    if (showMainBlock) {
        main_block.style.transform = "translateY(0px)";
    }

    // Si showMainBlock es false, se oculta el bloque hacia abajo
    else {
        main_block.style.transform = "translateY(100%)";
    }
});