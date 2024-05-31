////////////////////////////////////////////////////
// Funciones de aparicion y desaparicion del informativo //
////////////////////////////////////////////////////

var informativo = document.querySelector("table")
fetch('info_equipos.json', {
    method: 'GET',
    mode: 'cors'
})
  .then(response => response.json())
  .then(data => {
    console.log(data);
  })
  .catch(error => {
    console.error('Error:', error);
  });


function aparecerInfor(){
    console.log("Informativo ha aparecido")
    console.log(informativo)
    informativo.style.left = "0px"
}

function deaparecerInfor(){
    console.log("Informativo despaparecido")
    informativo.style.left = "-500px"
}