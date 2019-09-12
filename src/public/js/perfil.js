var configuracion = null;
const urlBase = 'http://localhost:4005/';


function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#fotoUsuario').attr('src', e.target.result);
        }

        reader.readAsDataURL(input.files[0]);
    }
}

$("#inputFoto").change(function () {
    readURL(this);
});

$("document").ready(function () {

    fetch(urlBase + "getConfig")
        .then(function (response) {
            return response.json();
        })
        .then(function (json) {
            configuracion = json[0];
            console.log("configuracion", configuracion);
            mostrarConfiguracion();
        })

    function mostrarConfiguracion() {
        document.getElementById("checktarea").checked = configuracion.tareas
        document.getElementById("checkasistencia").checked = configuracion.asistencias;
        document.getElementById("checkcamaraFrontal").checked = configuracion.camara;
        document.getElementById("checkmodoTablet").checked = configuracion.modoTablet;
        console.log("asd");
        document.getElementById("btnGuardar").style.display = "none";
    }

});

function modificarConfiguracion() {
    document.getElementById("btnGuardar").style.display = "block";

}

function enviarConfiguracion() {
    var tareas = document.getElementById("checktarea").checked;
    var asistencias = document.getElementById("checkasistencia").checked;
    var camara = document.getElementById("checkcamaraFrontal").checked;
    var modoTablet = document.getElementById("checkmodoTablet").checked;
    var head = {
        tareas,
        asistencias,
        camara,
        modoTablet
    }

    fetch(urlBase + "actualizarConfiguracion", {
        method: 'POST',
        body: JSON.stringify(head),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(function (response) {
            if (response.status == 200) {
                console.log("todo ok")
                document.getElementById("btnGuardar").style.display = "none";
                

            } else {
                console.log("todo mal");
            }
        })
}