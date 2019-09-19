function exportarAsistencias(documento){
    $("#btnDesAsisPDF").attr("onclick","descargarAsistenciaspdf("+documento+")")
    $("#btnDesAsisCSV").attr("onclick","descargarAsistenciascsv("+documento+")")
    
    $("#modalAsistencias").modal("show");
}

function exportarTareas(documento){
    $("#btnDesTareaPDF").attr("onclick","descargarTareaspdf("+documento+")")
    $("#btnDesTareaCSV").attr("onclick","descargarTareascsv("+documento+")")
    $("#modalTareas").modal("show");
}