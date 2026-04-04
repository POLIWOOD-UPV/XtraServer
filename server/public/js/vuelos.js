// Declaramos el valor que va hacer que cambie el evento (True/False)
let showMainBlock = true;


// Cogemos los elementos del HTML
const button = document.getElementById("up_down_button");
const main_block = document.getElementById("main_block");

// Evento para el botón, se activaa al hacer click en la pestaña naranja
button.addEventListener("click", function () {
    showMainBlock = !showMainBlock; // Cambia el valor de la variable cada vez que se hace click

    // Si showMainBlock es true, el bloque principal vuelve a la posición original
    if (showMainBlock) {
        main_block.style.transform = "translateX(0px)";
    }

    // Si showMainBlock es false, se oculta el bloque principal
    else {
        main_block.style.transform = "translateX(-302px)";
    }
});
