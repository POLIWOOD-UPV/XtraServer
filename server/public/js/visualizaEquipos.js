// HTML
select = document.getElementById("selector");
form = document.getElementById("equipo-form");
resultado = document.getElementById("resultado");
checkbox = document.getElementById("abrir");

// Coger los equipos para poner en el dropdown
fetch("http://localhost:80/v2/entities?type=Equipo")
.then(response => response.json())  // pasamos a un JSON
.then(data => {
    select.innerHTML = "";
    data.forEach(equipo => {
        //  Coger los valores del JSON
        nombre = equipo.name?.value || "Equipo sin nombre";
        id = equipo.id;

        // Crear las opciones del dropdown
        option = document.createElement("option");
        option.value = id;
        option.textContent = `${equipo.dorsal.value} - ${nombre}`;
        select.appendChild(option); // Meterlos en el select
    });
})

// Por si el servidor se caga encima
.catch(error => {
    console.error("Error al obtener los equipos:", error);
    select.innerHTML = "<option>Error al cargar</option>";
});

// FORMS
// Evento de envío del formulario
form.addEventListener("submit", function(evento) {
    evento.preventDefault(); // Esto hace que al hacer el submit del forms no te recargue la pagina automaticamente
    
    const id = select.value; // (La ID del select del forms)
    if (!id) return; // Si no hay ID, a tomar por culo
    const url = "http://localhost:80/v2/entities/" + encodeURIComponent(id);

    // Si esta marcado -> Pagina nueva
    if (checkbox.checked) {
        window.open(url, "_blank"); // _blank es para que abra en otra pestanya 

    // No esta marcardo -> En la misma web
    } else {
        fetch(url)
            .then(res => res.json()) // Pasar a JSON
            .then(data => {
                resultado.textContent = JSON.stringify(data, null, 2); // Pasar a string y meter en el pre
            })

        // Por si el servidor se caga encima
        .catch(err => {
            resultado.textContent = "Error al obtener los datos del equipo.";
            console.error(err);
        });
    }
});