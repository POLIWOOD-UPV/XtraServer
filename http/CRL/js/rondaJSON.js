const urlQuery = new URLSearchParams(window.location.search);
var ronda = urlQuery.get("ronda");
var equipo = urlQuery.get("equipo");

const loadJSON = async () => {
    response = (await fetch("/data/equipos.json"));
    equipos = await response.json();
    response = (await fetch("/data/rondas.json"));
    rondas = await response.json();
    response = (await fetch("/data/carga.json"));
    conversion = await response.json();
};

const loadInfo = async (rond, equip) => {
    response = (await fetch(`/data/${rond}/${equip}.json`));
    try {
        info = await response.json();
        return info;
    } catch { // No se ha completado correctamente
        return;
    }
};

const update = () => {
    var form = Object();
    var inputs = document.querySelectorAll("form input");
    inputs.forEach((element) => {
        form[element.getAttribute("name")] = element.value;
    });
    fetch(`/data/${ronda}/${equipo}.json`, {
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify(form)
    })
    .then((res) => {console.log(res)})
    .catch((res) => {console.log(res)});
}

const actualizarInfo = () => {
    if (ronda == null || equipo == null) {
        return;
    }

    if (info == null) {
        return;
    }
    for (const key in info) {
        if (Object.hasOwnProperty.call(info, key)) {
            let element = document.getElementById(key.toLowerCase())
            if (element == null) {
                continue;
            }
            if (element.type == "checkbox") {
                if (info[key] == "on") {
                    element.checked = true;
                    element.value = "on";
                } else {
                    element.checked = false;
                    element.value = "";
                }
            } else {
                element.value = info[key];
            }
            
        }
    }
};

const upload = async () => {
    var msg = ""
    var inputs = document.querySelectorAll("form input");
    inputs.forEach((element) => {
        msg += element.name;
        msg += "=";
        if (element.type = "checkbox") {
            msg += element.checked
        } else {
            msg += element.value;
        }
        msg += "&"
    });
    var response = await fetch("/vuelo", {
        method: "POST",
        body: msg.slice(0,-1)
    });
    console.log(".")
}

/*
window.addEventListener('load', () => {
    loadJSON();
    if (ronda != null && equipo != null) {
        loadInfo(ronda, equipo);
    }
});
*/