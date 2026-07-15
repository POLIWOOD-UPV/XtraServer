let rutaActual = "";

async function cargar(ruta = "") {

    rutaActual = ruta;

    const respuesta = await fetch("/api/list" + ruta);
    const archivos = await respuesta.json();

    const explorer = document.getElementById("explorer");

    explorer.innerHTML = "";

    // ===== Breadcrumb =====

    const breadcrumb = document.createElement("div");
    breadcrumb.className = "explorer-path";

    const inicio = document.createElement("span");
    inicio.textContent = "Inicio";
    inicio.onclick = () => cargar("");

    breadcrumb.appendChild(inicio);

    const partes = ruta.split("/").filter(Boolean);

    let acumulado = "";

    partes.forEach(parte => {

        breadcrumb.append(" / ");

        acumulado += "/" + parte;

        const span = document.createElement("span");

        span.textContent = parte;

        const destino = acumulado;

        span.onclick = () => cargar(destino);

        breadcrumb.appendChild(span);

    });

    explorer.appendChild(breadcrumb);

    // ===== Botón atrás =====

    if (ruta !== "") {

        const volver = document.createElement("div");

        volver.className = "explorer-back";

        volver.textContent = "⬅ Subir un nivel";

        volver.onclick = () => {

            const padre = ruta.split("/").slice(0, -1).join("/");

            cargar(padre);

        };

        explorer.appendChild(volver);

    }

    // ===== Archivos =====

    archivos.forEach(file => {

        const item = document.createElement("div");

        item.className = "explorer-item";

        let icono = "📄";

        if (file.isDirectory)
            icono = "📁";

        else {

            const ext = file.name.split(".").pop().toLowerCase();

            if (["png","jpg","jpeg","gif","svg","webp"].includes(ext))
                icono = "🖼";

            else if (["mp4","webm","mpeg"].includes(ext))
                icono = "🎥";

            else if (["mp3","wav","ogg"].includes(ext))
                icono = "🎵";

            else if (["zip","rar","7z"].includes(ext))
                icono = "📦";

            else if (ext=="pdf")
                icono = "📕";

        }

        item.textContent = icono + " " + file.name;

        if(file.isDirectory){

            item.onclick = () => {

                cargar(ruta + "/" + file.name);

            };

        }else{

            item.onclick = () => {

                window.open("/browse" + ruta + "/" + file.name, "_blank");

            };

        }

        explorer.appendChild(item);

    });

}

cargar();