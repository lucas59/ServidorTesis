function descargarAsistenciaspdf(documento) {
    var fechaIni = null;
    var fechaFin =null;

    if (documento) {
     fechaIni = $("#inputAsisInicioEmp").val();
     fechaFin = $("#inputAsisFinEmp").val();
            
    }else{
    fechaIni = $("#inputAsisInicio").val();
    fechaFin = $("#inputAsisFin").val();

    }

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
    var fechaIni = null;
    var fechaFin =null;

    if (documento) {
        fechaIni = $("#inputTareaInicioEmp").val();
        fechaFin = $("#inputTareaFinEmp").val();       
    }else{
     fechaIni = $("#inputTareaInicio").val();
     fechaFin = $("#inputTareaFin").val();

    }
    
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
    var fechaFin=null;
    var fechaIni=null;

    if (documento) {
         fechaIni = $("#inputAsisInicioEmp").val();
         fechaFin = $("#inputAsisFinEmp").val();
    }else{
         fechaIni = $("#inputAsisInicio").val();
         fechaFin = $("#inputAsisFin").val();
    }
   
    
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
    var fechaIni = null;
    var fechaFin = null;

    if (documento) {
     fechaIni = $("#inputTareaInicioEmp").val();
     fechaFin = $("#inputTareaFinEmp").val();        
    }else{
     fechaIni = $("#inputTareaInicio").val();
     fechaFin = $("#inputTareaFin").val();
    }

    
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