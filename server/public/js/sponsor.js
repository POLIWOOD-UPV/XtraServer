// Declaramos el valor que va a hacer que cambie el evento (True/False)
let showMainBlock = true;

// Cogemos los elementos del HTML
const button = document.getElementById("up_down_button");
const main_block = document.querySelector("footer");

// Evento para el botón, se activa al hacer click
button.addEventListener("click", function () {
    showMainBlock = !showMainBlock;

    // Si showMainBlock es true, el bloque vuelve a la posición original (slide in desde abajo)
    if (showMainBlock) {
        main_block.classList.remove("hidden");
    }

    // Si showMainBlock es false, se oculta el bloque hacia abajo
    else {
        main_block.classList.add("hidden");
    }
});

// AÑADIDO: lista de sponsors con su nombre y ruta de imagen
const sponsors = [
    { name: "AERCO",  img: "../img/Equipos/AERCO.png"  },
    { name: "AURA",   img: "../img/Equipos/AURA.png"   },
    { name: "DSDTA",  img: "../img/Equipos/DSDTA.png"  },
    { name: "ECL",    img: "../img/Equipos/ECL.png"    },
    { name: "SAETA",  img: "../img/Equipos/SAETA.png"  },
    { name: "SAKA",   img: "../img/Equipos/SAKA.png"   },
    { name: "TRENC",  img: "../img/Equipos/TRENC.png"  },
    { name: "UA1",    img: "../img/Equipos/UA1.png"    },
    { name: "UA2",    img: "../img/Equipos/UA2.png"    },
    { name: "VLAIR",  img: "../img/Equipos/VLAIR.png"  },
    { name: "ZENIT",  img: "../img/Equipos/ZENIT.png"  },
];

const track = document.querySelector(".sponsors-track");

// AÑADIDO: crea las tarjetas de sponsor a partir de la lista
function buildCards(list) {
    return list.map(s => {
        const card = document.createElement("div");
        card.className = "sponsor-card";
        const img = document.createElement("img");
        img.src = s.img;
        img.alt = s.name;
        card.appendChild(img);
        return card;
    });
}

// AÑADIDO: inserta los logos dos veces seguidas para que el bucle sea continuo y sin saltos
const originals = buildCards(sponsors);
const clones    = buildCards(sponsors);

originals.forEach(c => track.appendChild(c));
clones.forEach(c    => track.appendChild(c));