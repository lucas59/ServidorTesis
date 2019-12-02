var map;
var layerGroup;
var marker2=null;
var marker=null;
$(document).ready(function() {
  
  map = L.map("mapid", {
    center: [-32.314347, -58.076697],
    zoom: 16
  }).setView([-32.314347, -58.076697], 14);
  layerGroup = L.layerGroup().addTo(map);

  L.tileLayer("https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png", {
    //        maxZoom: 20,
    attribution:
      '&copy; Openstreetmap France | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  map.invalidateSize();

  $("#modalUbicacion").on("show.bs.modal", function() {
    setTimeout(function() {
      map.invalidateSize();
    }, 10);
  });
});

function agregarMarcador(latIni, longIni, latFin, longFin) {
  if (marker!=null) {
    map.removeLayer(marker);
    map.removeLayer(marker2); 
  }
  var greenIcon = new L.Icon({
    iconUrl:
      "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  var redIcon = new L.Icon({
    iconUrl:
      "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

   marker = L.marker([latIni, longIni], { icon: greenIcon }).addTo(map);

   marker2 = L.marker([latFin, longFin], { icon: redIcon }).addTo(map);

  map.panTo([latIni, longIni]);
  layerGroup.clearLayers();
 
}
function mostrarCaptura(btn) {
  var base64 = btn.value;
  console.log(base64);
  $("#modalCaptura").modal("show");
  var img = "img/asistencias/"+base64+".jpg";
  $("#imgCaptura").attr("src", img);
}

function abrirMapa(latitud_ini, longitud_ini, latitud_fin, longitud_fin) {
  $("#modalUbicacion").modal("show");
  agregarMarcador(latitud_ini, longitud_ini, latitud_fin, longitud_fin);
}
