import upload from "/js/upload.js";
import equipos from "/v2/entities/?type=Equipo&options=keyValues" with {type: "json"};
import rondas from "/v2/entities/?type=Ronda&options=keyValues" with {type: "json"};

const setOptions = () => {
    let select_ronda = document.querySelector("form select[name=ronda]");
    let select_equipo = document.querySelector("form select[name=equipo]");

    select_ronda.oninput = upload.changeID;
    rondas.forEach(element => {
        let option = document.createElement("option");
        option.innerText = `${element.type} ${element.num}`;
        option.value = element.num;
        if (element.dorsal == 0) {
            option.selected = true;
        }
        select_ronda.appendChild(option);
    });

    select_equipo.oninput = upload.changeID;
    equipos.forEach(element => {
        let option = document.createElement("option");
        option.innerText = `${element.dorsal} ${element.name}`;
        option.value = element.dorsal;
        if (element.dorsal == 0) {
            option.selected = true;
        }
        select_equipo.appendChild(option);
    });
}

addEventListener("DOMContentLoaded", setOptions);

export default {
    changeID: upload.changeID
};