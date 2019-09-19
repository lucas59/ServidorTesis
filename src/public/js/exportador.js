function descargarAsistenciaspdf(documento) {
    if (documento) {
        location.replace("/exportarAsistenciaspdf?doc="+documento);
    } else {
        location.replace("/exportarAsistenciaspdf");
    }
}

function descargarTareascsv(documento) {
    if (documento) {
        location.replace("/exportarTareas?doc="+documento);
    } else {
        location.replace("/exportarTareas");
    }
}

function descargarAsistenciascsv(documento) {
    if (documento) {
        location.replace("/exportarAsistencias?doc="+documento);
    } else {
        location.replace("/exportarAsistencias");
    }
}

function descargarTareaspdf(documento) {
    if (documento) {
        location.replace("/exportarTareaspdf?doc="+documento);
    } else {
        location.replace("/exportarTareaspdf");
    }
}