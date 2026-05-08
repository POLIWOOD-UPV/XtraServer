window.onload = () => {

    console.log(document.getElementById("map_block"));

    const map = L.map('map_block').setView([39.45544113234502, -0.35173511779024313], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    setTimeout(() => {
        map.invalidateSize();
    }, 200);

};