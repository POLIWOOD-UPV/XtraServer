////////////////////////////////////////////////////
// Funciones de aparicion y desaparicion del informativo //
////////////////////////////////////////////////////

var informativo = document.querySelector("table")

function aparecerInfor(){
    console.log("Informativo ha aparecido")
    console.log(informativo)
    informativo.style.left = "0px"
}

function deaparecerInfor(){
    console.log("Informativo despaparecido")
    informativo.style.left = "-500px"
}