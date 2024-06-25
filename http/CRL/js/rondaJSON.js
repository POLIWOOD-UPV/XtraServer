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
    info = await response.json();
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

/*
window.addEventListener('load', () => {
    loadJSON();
    if (ronda != null && equipo != null) {
        loadInfo(ronda, equipo);
    }
});
*/