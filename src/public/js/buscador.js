function FiltrarTabla()
{
    var tableReg = document.getElementById('tabla');
    var aBuscar = document.getElementById('buscar').value.toLowerCase();
    var celdas = "";
    var encontrado = false;
    var compararCon = "";

    // Recorremos todas las filas con contenido de la tabla
    for (var i = 1; i < tableReg.rows.length; i++)
    {
        celdas = tableReg.rows[i].getElementsByTagName('td');
        encontrado = false;
        // Recorremos todas las celdas
        for (var j = 0; j < celdas.length && !encontrado; j++)
        {
            compararCon = celdas[j].innerHTML.toLowerCase();
            // Buscamos el texto en el contenido de la celda
            if (aBuscar.length == 0 || (compararCon.indexOf(aBuscar) > -1))
            {
                encontrado = true;
            }
        }
        if (encontrado)
        {
            tableReg.rows[i].style.display = '';
        } else {
            // si no ha encontrado ninguna coincidencia, esconde la
            // fila de la tabla
            tableReg.rows[i].style.display = 'none';
        }
    }
}