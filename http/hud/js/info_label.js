
var JSONdata = {
    "equipos": [
        {
          "Dorsal": 0,
          "Team": "POLIWOOD",
          "Institucion": "Universitat Politècnica de València",
          "Members": 8,
          "TeamLeader": "Raul Rodríguez",
          "Pilot": "Abel Vidal",
          "img_logo": "test.png",
          "img_grupo": "test.png"
        },
        {
          "Dorsal": 1,
          "Team": "RUHE",
          "Institucion": "Universitat Politècnica de València",
          "Members": 6,
          "TeamLeader": "Adrián Montoya",
          "Pilot": "Adrián Montoya",
          "img_logo": "Ruhe.png",
          "img_grupo": "Ruhe.jpg"
        },
        {
          "Dorsal": 2,
          "Team": "UVigo Aerotech",
          "Institucion": "Universidad de Vigo",
          "Members": 8,
          "TeamLeader": "Pablo Magariños",
          "Pilot": "Marco Guiotto",
          "img_logo": "UVigo.png",
          "img_grupo": "uvigo_xtra.jpg"
        },
        {
          "Dorsal": 3,
          "Team": "G3",
          "Institucion": "Universitat Politècnica de València",
          "Members": 5,
          "TeamLeader": "Alex Radita",
          "Pilot": "Juan Carlos Juan Serrano",
          "img_logo": "G3.png",
          "img_grupo": "G3.jpg"
        },
        {
          "Dorsal": 4,
          "Team": "Matsia",
          "Institucion": "Universitat Politècnica de València",
          "Members": 6,
          "TeamLeader": "Ignacio Folch Ferrer",
          "Pilot": "Ignacio Folch Ferrer",
          "img_logo": "Matsia.png",
          "img_grupo": "Matisa.jpg"
        },
        {
          "Dorsal": 5,
          "Team": "LuftSieger",
          "Institucion": "Universitat Politècnica de València",
          "Members": 7,
          "TeamLeader": "Guillermo Velencoso García",
          "Pilot": "Lorena Abad Cuadros",
          "img_logo": "Luffsieger.png",
          "img_grupo": "Luffsieger.jpg"
        },
        {
          "Dorsal": 6,
          "Team": "ECLift",
          "Institucion": "École Centrale de Lyon (Francia)",
          "Members": 10,
          "TeamLeader": "Ethaniel Tobar",
          "Pilot": "Hugo Pamies Moreno",
          "img_logo": "EClift.png",
          "img_grupo": "ECLIFT-grupal.jpeg"
        },
        {
          "Dorsal": 7,
          "Team": "SAETA_T2",
          "Institucion": "Universidad Carlos III Madrid",
          "Members": 10,
          "TeamLeader": "Adrián Pajarón González",
          "Pilot": "Andrés Navarro Pedregal",
          "img_logo": "SAETA.png",
          "img_grupo": "SAETA_T2.jpg"
        },
        {
          "Dorsal": 8,
          "Team": "DIANA UCLM",
          "Institucion": "Universidad de Castilla-La Mancha",
          "Members": 9,
          "TeamLeader": "Pablo Zamorano Fernández",
          "Pilot": "Rodrigo Redondo Cabañas",
          "img_logo": "Diana.png",
          "img_grupo": "Diana.jpg"
        },
        {
          "Dorsal": 9,
          "Team": "Trencalòs Team",
          "Institucion": "Universitat Politècnica de Catalunya",
          "Members": 10,
          "TeamLeader": "Martí Badia Codina",
          "Pilot": "Javier Marcos Pérez",
          "img_logo": "Trencalos.png",
          "img_grupo": "Trencalosteam-2.png"
        },
        {
          "Dorsal": 10,
          "Team": "The North Pole",
          "Institucion": "Universitat Politècnica de València",
          "Members": 6,
          "TeamLeader": "Pasqual Ayet",
          "Pilot": "Pasqual Ayet",
          "img_logo": "TheNorthPole.png",
          "img_grupo": "TheNorthPole.jpg"
        },
        {
          "Dorsal": 11,
          "Team": "SAETA_T1",
          "Institucion": "Universidad Carlos III Madrid",
          "Members": 10,
          "TeamLeader": "Iago Senén Fernández García",
          "Pilot": "Carlos de Quinto",
          "img_logo": "SAETA.png",
          "img_grupo": "SAETA_T1.jpg"
        },
        {
          "Dorsal": 12,
          "Team": "UCA&Air",
          "Institucion": "Universidad de Cádiz",
          "Members": 6,
          "Team Leader": "Irene Molina Chicón",
          "Pilot": "Hugo Juan Hernández",
          "img_logo": "UCA&Air.png",
          "img_grupo": "UCA&Air.jpeg"
        },
        {
          "Dorsal": 13,
          "Team": "Club Xaloc",
          "Institucion": "Club d'Aeromodelisme Xaloc",
          "Members": 5,
          "TeamLeader": "Gregorio Moreno",
          "Pilot": "Volodymyr Klubow",
          "img_logo": "Xaloc.png",
          "img_grupo": "transparente.png"
        },
        {
          "Dorsal": 14,
          "Team": "Sky Eagle Team 1",
          "Institucion": "Club Aeromodelismo Alzira",
          "Members": 2,
          "TeamLeader": "Francisco Soto Morales",
          "Pilot": "Francisco Soto Morales",
          "img_logo": "FlyEagle.png",
          "img_grupo": "Fly_Eager.jpg"
        },
        {
          "Dorsal": 15,
          "Team": "Sky Eagle Team 2",
          "Institucion": "Club Aeromodelismo Alzira",
          "Members": 2,
          "TeamLeader": "Leopolgo Martinez Magraner",
          "Pilot": "Leopolgo Martinez Magraner",
          "img_logo": "FlyEagle.png",
          "img_grupo": "Fly_Eager.jpg"
        }
      ]
};

var logo = document.getElementById("logo");
var foto = document.getElementById("foto");
var nombre_grupo = document.getElementById("nombre_grupo");
var uni = document.getElementById("uni");
var miembros = document.getElementById("miembros");
var nombre_lider = document.getElementById("nombre_lider");

// fetch('../data/equipos.json', {
//     method: 'GET',
//     mode: 'cors'
// })
//     .then(response => response.json())
//     .then(data => {
            // name_logo = data.img_logo
            // logo.src = "../img/logos/" + name_logo;
            // name_foto = data.img_grupo
            // foto.src = "../img/grupos/" + name_foto;
            // nombre_grupo.textContent = data.Team;
            // uni.textContent = data.Institucion;
            // miembros.textContent = data.Members + "<br>ppl";
            // nombre_lider.innerHTML = "Team Leader:<br>" + data.TeamLeader;
//     console.log(data);
//     })
//     .catch(error => {
//     console.error('Error:', error);
//     });

var sele_pruv = document.getElementById("select");
sele_pruv.addEventListener("change", function() {
    var num_selec = sele_pruv.value;

    var data = JSONdata.equipos[num_selec];
    name_logo = data.img_logo
    logo.src = "../img/logos/" + name_logo;
    name_foto = data.img_grupo
    foto.src = "../img/grupos/" + name_foto;
    nombre_grupo.textContent = data.Team;
    uni.textContent = data.Institucion;
    miembros.innerHTML = data.Members + "<br>ppl";
    nombre_lider.innerHTML = "Team Leader:<br>" + data.TeamLeader;

});
