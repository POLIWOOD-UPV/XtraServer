document.addEventListener("DOMContentLoaded", function() {
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            const roundToThreeDigits = (value) => {
                const num = parseFloat(value);
                return num.toFixed(3);
            };

            // Extraer y redondear los valores
            const time = data.time;
            const peso = roundToThreeDigits(data.peso.split(' ')[0]) + ' g';
            const volumen = roundToThreeDigits(data.volumen.split(' ')[0]) + ' cm3';

            // Actualizar las celdas de la tabla
            document.getElementById('time').textContent = time;
            document.getElementById('peso').textContent = peso;
            document.getElementById('volumen').textContent = volumen;
        })
        .catch(error => console.error('Error al cargar el JSON:', error));
});

