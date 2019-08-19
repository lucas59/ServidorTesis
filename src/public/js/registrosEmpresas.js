
var map;

$(document).ready(function () {
    console.log('todo listo');
    map = L.map('mapid', {
        center: [-32.314347, -58.076697],
        zoom: 13
    }).setView([-32.314347, -58.076697], 14);



    L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
//        maxZoom: 20,
        attribution: '&copy; Openstreetmap France | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    map.invalidateSize();

    $('#modalUbicacion').on('show.bs.modal', function () {
        setTimeout(function () {
            map.invalidateSize();
        }, 10);
    });
});

function abrirMapa(latitud, longitud) {
    $('#modalUbicacion').modal('show');
    agregarMarcador(latitud, longitud);
}

function agregarMarcador(lat, long) {
    console.log(lat, long);
    L.marker([lat, long]).addTo(map);
    map.panTo(new L.LatLng(lat, long));
}