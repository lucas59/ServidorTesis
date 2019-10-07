import { url } from "inspector";

const urlBase = 'http://localhost:4005/';

function exportarAsistencias(documento) {
    console.log("pru");
    $("#btnDesAsisPDF").attr("onclick","descargarAsistenciaspdf("+documento+")")
    $("#btnDesAsisCSV").attr("onclick","descargarAsistenciascsv("+documento+")")
    
    $("#modalAsistencias").modal("show");
}

function exportarTareas(documento){
    $("#btnDesTareaPDF").attr("onclick","descargarTareaspdf("+documento+")")
    $("#btnDesTareaCSV").attr("onclick","descargarTareascsv("+documento+")")
    $("#modalTareas").modal("show");
}

$("#btnEnviarMsj").click(function() {
    var contenido = $("#contenidoMsj").val();
    var asunto = $("#asuntoMsj").val();
    
    console.log(contenido);
    console.log(asunto);
    /*var head = {
        "mensaje":contenido,
        "asunto":asunto,

    }

    fetch(urlBase + "mensaje", {
        method: 'POST',
        body: JSON.stringify(head),
        headers: {
            'Content-Type': 'application/json'
        }
    })*/
})