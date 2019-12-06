var map;
var layerGroup;
var marker2 = null;
var marker = null;
const server = "https://servidortesis2019.herokuapp.com/";
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
  if (marker != null) {
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
  var img = "img/asistencias/" + base64 + ".jpg";
  $("#imgCaptura").attr("src", img);
}

function abrirMapa(latitud_ini, longitud_ini, latitud_fin, longitud_fin) {
  $("#modalUbicacion").modal("show");
  agregarMarcador(latitud_ini, longitud_ini, latitud_fin, longitud_fin);
}

$("li").click(function() {
  $(this)
    .addClass("active")
    .siblings()
    .removeClass("active");
});

$("#pagination-container").pagination({
  dataSource: [1, 2, 3, 4, 5, 6, 7, 195],
  callback: function(data, pagination) {
    var html = Handlebars.compile($("#template-demo").html(), {
      data: data
    });
    $("#data-container").html(html);
  }
});

function verTareas(pagina) {
  $.ajax({
    url: server + "tareas?pag= " + pagina + "",
    success: function(data) {
      console.log("dataaa: ", data);
      listarTareas(data);
    },
    error: function(err) {
      console.log("error: ", err);
    }
  });
}

function verAsistencias(pagina) {
  $.ajax({
    url: server+"asistencias?pag= " + pagina + "",
    success: function(data) {
      listarAsistencias(data);
    },
    error: function(err) {
      console.log("error: ", err);
    }
  });
}

function listarTareas(data) {
  console.log("tareas, ", data);
  var body = document.getElementById("bodyTareas");
  console.log(body);
  body.innerHTML = "";
  data.forEach(element => {
    var tr = document.createElement("tr");
    var thUsuario = document.createElement("th");
    thUsuario.setAttribute("class", "columnaUsuario");
    var img = document.createElement("img");
    img.setAttribute("class", "rounded-circle userTarea");

    if (element.foto) {
      img.setAttribute("src", "img/perfil/" + element.foto + "");
    } else {
      img.setAttribute("src", "img/user.jpg");
    }

    var nombreapellido = document.createElement("p");
    nombreapellido.innerHTML = element.nombre + " " + element.apellido;
    thUsuario.appendChild(img);
    thUsuario.appendChild(nombreapellido);
    tr.appendChild(thUsuario);

    var tdTarea = document.createElement("td");
    tdTarea.setAttribute("class", "columnaTarea");
    tdTarea.innerHTML = element.titulo;
    tr.appendChild(tdTarea);

    var tdFecha = document.createElement("td");
    tdFecha.setAttribute("class", "columnaTiempo");
    var date = new Date(element.fin);
    var fecha =
      date.getDay() +
      "/" +
      date.getMonth() +
      "/" +
      date.getFullYear() +
      ", " +
      date.getHours() +
      ":" +
      date.getMinutes() +
      ": " +
      date.getSeconds() +
      " hs";
    tdFecha.innerHTML = fecha;
    tr.appendChild(tdFecha);

    var tdCaptura = document.createElement("td");
    var button = document.createElement("button");
    button.setAttribute(
      "onClick",
      "abrirMapa(" +
        element.latitud_ini +
        "," +
        element.longitud_ini +
        "," +
        element.latitud_fin +
        "," +
        element.longitud_fin +
        ")"
    );
    button.setAttribute("class", "btnUbicacion");
    var i = document.createElement("i");
    i.innerHTML = "my_location";
    i.setAttribute("class", "material-icons");
    button.appendChild(i);
    button.appendChild(i);
    tdCaptura.appendChild(button);
    tdCaptura.setAttribute("class", "columnaUbicacion");
    tr.appendChild(tdCaptura);

    body.appendChild(tr);
  });
}

function listarAsistencias(data) {
  var body = document.getElementById("bodyAsistencias");
  body.innerHTML = "";
  data.forEach(element => {
    var tr = document.createElement("tr");
    var thUsuario = document.createElement("th");
    thUsuario.setAttribute("class", "columnaUsuario");
    var img = document.createElement("img");
    img.setAttribute("class", "rounded-circle userTarea");
    if (element.foto) {
      img.setAttribute("src", "img/perfil/" + element.foto + "");
    } else {
      img.setAttribute("src", "img/user.jpg");
    }

    var nombreapellido = document.createElement("p");
    nombreapellido.innerHTML = element.nombre + " " + element.apellido;
    thUsuario.appendChild(img);
    thUsuario.appendChild(nombreapellido);
    tr.appendChild(thUsuario);

    var tdFecha = document.createElement("td");
    tdFecha.setAttribute("class", "columnaFecha");
    var date = new Date(element.fecha);
    var fecha =
      date.getDay() + "/" + date.getMonth() + "/" + date.getFullYear();
    tdFecha.innerHTML = fecha;
    tr.appendChild(tdFecha);

    var tdHora = document.createElement("td");
    tdHora.setAttribute("class", "columnaHora");
    var hora = date.getHours() + ":" + date.getMinutes() + " hs";
    tdHora.innerHTML = hora;
    tr.appendChild(tdHora);

    var tdCaptura = document.createElement("td");
    var button = document.createElement("button");
    button.setAttribute("onClick", "mostrarCaptura(this)");
    button.setAttribute("value", element.captura);

    var i = document.createElement("i");
    i.innerHTML = "photo_camera";
    i.setAttribute("class", "material-icons");
    button.appendChild(i);
    button.appendChild(i);
    tdCaptura.appendChild(button);
    tdCaptura.setAttribute("class", "columnaCaptura");
    tr.appendChild(tdCaptura);

    var tdEstado = document.createElement("td");
    tdEstado.setAttribute("class", "columnaTipo");
    console.log("estado", element.tipo);
    if (element.tipo == 1) {
      var estado = document.createElement("div");
      estado.setAttribute("class", "indicadorVerde bg-success");
      tdEstado.appendChild(estado);
    } else {
      var estado = document.createElement("div");
      estado.setAttribute("class", "indicadorRojo bg-danger");
      tdEstado.appendChild(estado);
    }
    tr.appendChild(tdEstado);

    /*
     <td class="columnaCaptura">
                            <button id="captura" onclick="mostrarCaptura(this)" value="{{foto}}"><i
                                    class="material-icons">photo_camera</i></button>
                        </td>
                        <td class="columnaTipo">
                            {{#ifCond tipo "===" 0}}
                            <div class="indicadorRojo bg-danger"></div>
                            {{/ifCond}}
                            {{#ifCond tipo "===" 1}}
                            <div class="indicadorVerde bg-success"></div>
                            {{/ifCond}}
                        </td>*/

    body.appendChild(tr);
  });
}
