function descargarAsistenciaspdf(documento) {
    var fechaIni = $("#inputAsisInicio").val();
    var fechaFin = $("#inputAsisFin").val();

    if (!fechaIni || !fechaFin) {
        alert("falta fecha");
        return;
    }

    if (fechaIni > fechaFin) {
        alert("inicio mas grande que la de fin");
        return;
    }

    if (documento) {
        location.replace("/exportarAsistenciaspdf?doc=" + documento + "&fechaIni=" + fechaIni + "&fechaFin=" + fechaFin);
    } else {
        location.replace("/exportarAsistenciaspdf?fechaIni=" + fechaIni + "&fechaFin=" + fechaFin);
    }
}

function descargarTareascsv(documento) {
    var fechaIni = $("#inputTareaInicio").val();
    var fechaFin = $("#inputTareaFin").val();

    
    if (!fechaIni || !fechaFin) {
        alert("falta fecha");
        return;
    }

    if (fechaIni > fechaFin) {
        alert("inicio mas grande que la de fin");
        return;
    }



    if (documento) {
        location.replace("/exportarTareas?doc=" + documento + "&fechaIni=" + fechaIni + "&fechaFin=" + fechaFin);
    } else {
        location.replace("/exportarTareas?fechaIni=" + fechaIni + "&fechaFin=" + fechaFin);
    }
}

function descargarAsistenciascsv(documento) {

    var fechaIni = $("#inputAsisInicio").val();
    var fechaFin = $("#inputAsisFin").val();
    
    
    if (!fechaIni || !fechaFin) {
        alert("falta fecha");
        return;
    }

    if (fechaIni > fechaFin) {
        alert("inicio mas grande que la de fin");
        return;
    }


    if (documento) {
        location.replace("/exportarAsistencias?doc=" + documento + "&fechaIni=" + fechaIni + "&fechaFin=" + fechaFin);
    } else {
        location.replace("/exportarAsistencias?fechaIni=" + fechaIni + "&fechaFin=" + fechaFin);
    }
}

function descargarTareaspdf(documento) {
    var fechaIni = $("#inputTareaInicio").val();
    var fechaFin = $("#inputTareaFin").val();

    
    if (!fechaIni || !fechaFin) {
        alert("falta fecha");
        return;
    }

    if (fechaIni > fechaFin) {
        alert("inicio mas grande que la de fin");
        return;
    }


    if (documento) {
        location.replace("/exportarTareaspdf?doc=" + documento + "&fechaIni=" + fechaIni + "&fechaFin=" + fechaFin);
    } else {
        location.replace("/exportarTareaspdf?fechaIni=" + fechaIni + "&fechaFin=" + fechaFin);
    }
}