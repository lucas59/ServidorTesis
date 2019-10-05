
const urlBase = 'https://servidortesis2019.herokuapp.com/';
//https://servidortesis2019.herokuapp.com/api/
function FiltrarTabla() {

    var tableReg = document.getElementById('tabla');
    var aBuscar = document.getElementById('buscar').value.toLowerCase();
    var celdas = "";
    var encontrado = false;
    var compararCon = "";

    // Recorremos todas las filas con contenido de la tabla
    for (var i = 1; i < tableReg.rows.length; i++) {
        celdas = tableReg.rows[i].getElementsByTagName('td');
        encontrado = false;
        // Recorremos todas las celdas
        for (var j = 0; j < celdas.length && !encontrado; j++) {
            compararCon = celdas[j].innerHTML.toLowerCase();
            // Buscamos el texto en el contenido de la celda
            if (aBuscar.length == 0 || (compararCon.indexOf(aBuscar) > -1)) {
                encontrado = true;
            }
        }
        if (encontrado) {
            tableReg.rows[i].style.display = '';
        } else {
            tableReg.rows[i].style.display = 'none';
        }
    }
}

function buscarUsuario() {
    var input = document.getElementById('buscadorUsuario');
    var identificador = input.value;
    if (identificador == "") return;
    fetch(urlBase + 'busquedaEmpleado?identificador=' + identificador)
        .then(function (response) {
            return response.json();
        })
        .then(function (myJson) {

            myJson.forEach(element => {
                insertarEnTabla(element);
            });
        });
}



function abrirModalMensaje(cedula) {
    console.log(cedula);
    $("#modalMensaje").modal("show");
    $("#empleadoidMsj").val(cedula);    
}

function insertarEnTabla(element) {
    var table = document.getElementById('tablaUsuarios');
    table.style.display = 'block';
    var tbody = document.getElementById('tbody');
    vaciarTabla();
    console.log(element.nombre);
    var tr = document.createElement('tr');
    var tdUsuario = document.createElement('td');
    var tdNombre = document.createElement('td');
    var tdOpciones = document.createElement('td');
    var agregar = document.createElement('button');
    var img = document.createElement('img');
    var nombre = document.createElement('p');
    nombre.innerHTML = element.nombre + ' ' + element.apellido;
    var correo = document.createElement('p');
    correo.innerHTML = element.email;
    img.setAttribute('class', 'rounded-circle imgTablaEmpleado')
    if (element.fotoPerfil) {
        img.setAttribute('src', urlBase + 'img/perfiles/' + element.fotoPerfil + '');
    } else {
        img.setAttribute('src', urlBase + 'img/user.jpg');
    }

    agregar.setAttribute('class', 'btn btn-success');
    agregar.setAttribute('onClick', 'agregarAempresa(this)');
    agregar.setAttribute('value', element.documento);
    agregar.innerText = "Agregar";

    tdOpciones.appendChild(agregar);


    img.setAttribute('src', urlBase + 'img/perfiles/' + element.fotoPerfil + '')
    tr.appendChild(tdUsuario);
    tr.appendChild(tdNombre);
    tr.appendChild(tdOpciones);
    tdUsuario.appendChild(img);
    tdUsuario.appendChild(nombre);
    tdNombre.appendChild(correo);
    tbody.appendChild(tr);

}



function vaciarTabla() {
    var tbody = document.getElementById("tbody");

    var child = tbody.lastElementChild;
    while (child) {
        tbody.removeChild(child);
        child = tbody.lastElementChild;
    }
}

function agregarAempresa(componente) {
    showSpinner()
    var datos = { documento: componente.value };
    console.log(JSON.stringify(datos));
    fetch(urlBase + 'agregarAEmp ', {
        body: JSON.stringify(datos),
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (myJson) {

            if (myJson.retorno == true) {
                console.log(myJson);
                vaciarTabla();
                window.location.reload();
            }
        });
}


function despedirEmpleado(documento) {
    showSpinner()
    var datos = { documento: documento };
    fetch(urlBase + 'despedirEmpleado ', {
        body: JSON.stringify(datos),
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (myJson) {
            if (myJson.retorno == true) {
                console.log(myJson);
                window.location.reload();
            }
        });


}


const spinner = document.getElementById("spinner");

function showSpinner() {
  spinner.className = "show";
  setTimeout(() => {
    spinner.className = spinner.className.replace("show", "");
  }, 5000);
}
/*
function descargarAsistencias(){
    fetch(urlBase + 'exportarAsistencias ')
    .then(function (response){
        console.log(response);

    })
}*/