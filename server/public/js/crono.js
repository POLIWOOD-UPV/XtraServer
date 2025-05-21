"use strict";

import form from "/js/form.js";
import tipos from "/templates/cronoType.json" with {type: "json"};

let select_tipo;

addEventListener("DOMContentLoaded", () => {
    select_tipo = document.querySelector("form select[name=tipo]");

    select_tipo.oninput = form.changeID;
    for (const key in tipos) {
        let option = document.createElement("option");
        option.innerText = `${key}`;
        option.value = tipos[key];
        if (key == "AUXI") {
            option.selected = true;
        }
        select_tipo.appendChild(option);
    }
});