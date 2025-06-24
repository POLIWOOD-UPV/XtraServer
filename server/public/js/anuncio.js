// DOM - HTML
const socket = io();
contenedor_anuncio = document.querySelector("#contenedor_anuncios");
anuncio = document.querySelector("#anunciero");


// Eventos
document.addEventListener("DOMContentLoaded", function () {
    // Cogemos el  anuncio inicial
    cogerAnuncio()
});

socket.addEventListener("message", (event)=>{
    if (event === "!entityUpdate urn:ngsi-ld:Anuncio:001"){cogerAnuncio() }
    
});

function cogerAnuncio() {
    fetch("http://localhost/v2/entities?type=Anuncio")
        .then(res => {
            if (!res.ok) throw new Error("No se pudo obtener el anuncio");
            return res.json();
        })
        .then(json => {
            mostrarAnuncio(json[0].texto.value);
        })
        .catch(err => {
            console.error("Error al recibir anuncio:", err);
        });
}
function mostrarAnuncio(texto) {
    anuncio.textContent = texto;
    contenedor_anuncio.style.display = "block";
}

