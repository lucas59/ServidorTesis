const pool = require("../database");
const helpers = require("../lib/helpers");
const bodyParser = require('body-parser');

exports.inicio = function (req, res) {
    res.send(JSON.stringify({ coso: 'Esto es la api' }));

};

exports.login = async function (req, res) {
    var id = req.param('email');
    var pass = req.param('password');

    const rows = await pool.query('SELECT * FROM usuario WHERE email = ? OR nombreUsuario = ?', [id, id]);
    console.log(id);
    console.log(pass);

    if (rows.length > 0) {
        console.log('asdasdasdasd');

        const user = rows[0];
        const validacion = await helpers.compararContraseña(pass, user.contrasenia);
        if (validacion) {
            console.log("correo", id);
            var tipo = await obtenerTipoUsuario(id);
            console.log('tipo', tipo);
            res.send(JSON.stringify({ retorno: true, mensaje: 'Un exito.', tipo: tipo, id: rows[0].documento }));
        } else {
            res.send(JSON.stringify({ retorno: false, mensaje: 'Contraseña incorrecta.' }));
        }
    } else {
        res.send(JSON.stringify({ retorno: false, mensaje: 'No existe este usuario.' }));
    }
};

exports.login_tablet = async function (req, res) {
    var pass = req.param('codigo');
    const rows = await pool.query('SELECT * FROM empleado WHERE pin = ?', [pass]);
    if (rows.length > 0) {
        var id = rows[0].id;
        const reentrada = await pool.query('SELECT * FROM asistencia WHERE empleado_id = ?', [id]);
        if (reentrada.length > 0) {
            res.send(JSON.stringify({ retorno: true, mensaje: 'Un exito.', id: id, estado_ree: 0 }));
        }
        else {
            res.send(JSON.stringify({ retorno: true, mensaje: 'Un exito.', id: id, estado_ree: 1 }));
        }

    } else {
        res.send(JSON.stringify({ retorno: false, mensaje: 'Contraseña incorrecta' }));
    }
};

async function obtenerTipoUsuario(id) {
    const rows = await pool.query('SELECT * FROM usuario as u, empresa as emp WHERE (u.email = ? OR u.nombreUsuario = ?) and emp.id = u.documento', [id, id]);
    const rows2 = await pool.query('SELECT * FROM usuario as u, empleado as emp WHERE  (u.email = ? OR u.nombreUsuario = ?) and (emp.id = u.documento)', [id, id]);
    console.log(rows);
    console.log(rows2);
    if (rows.length > 0) {
        return 0;
    } else if (rows2.length > 0) {
        return 1;
    }
}

exports.signup = async function (req, res) {
    var correo = req.param('email');
    var pass = req.param('password');
    var documento = req.param('documento');
    var fullName = req.param('fullName');
    var tipo = req.param('tipo');
    const rows = await pool.query('SELECT * FROM usuario WHERE email = ? OR nombreUsuario = ? OR documento = ?', [correo, fullName, documento]);

    if (rows.length == 0) {
        const usuario = {
            nombreUsuario: fullName,
            contrasenia: pass,
            email: correo,
            estado: true,
            fotoPerfil: null,
            documento
        }
        usuario.contrasenia = await helpers.encryptPassword(pass);

        const user = rows[0];
        const result = await pool.query('INSERT INTO usuario SET ? ', usuario);
        if (result) {
            if (tipo == 0) {
                const empresa = {
                    nombre: null,
                    id: documento
                }
                const resultEmpresa = await pool.query('INSERT INTO empresa SET ? ', empresa);
                console.log(resultEmpresa);
                console.log('usuario empresa insertado');
                res.send(JSON.stringify({ retorno: true, mensaje: 'Un exito.' }));
            } else {
                var pin = await obtenerPin(documento);
                const empleado = {
                    apellido: null,
                    celular: null,
                    pin: pin,
                    fechaNacimiento: null,
                    nombre: null,
                    id: documento
                }
                const resultEmpleado = await pool.query('INSERT INTO empleado SET ? ', empleado);
                console.log('usuario empleado insertado');
                res.send(JSON.stringify({ retorno: true, mensaje: 'Un exito.' }));
            }
        }
    } else {
        res.send(JSON.stringify({ retorno: false, mensaje: 'Ya existe este usuario.' }));
    }
};

exports.signup2 = async function (req, res) {///////Registro dos de la aplicacion movil
    var email = req.param('email');
    var fullName = req.param('fullName');
    var documento = req.param('documento');
    var nacimiento = req.param('nacimiento');
    var nombre = req.param('nombre');
    var apellido = req.param('apellido');
    var celular = req.param('celular');
    var image = req.param('image');
    console.log(documento);
    const insertEmpleado = await pool.query("UPDATE `empleado` SET `apellido` = ?, `celular` = ?, `fechaNacimiento` = ?, `nombre` = ? WHERE `empleado`.`id` = ?", [apellido, celular, nacimiento, nombre, documento]);
    res.send(JSON.stringify({ retorno: true, mensaje: 'Un exito' }));
};



exports.signup2Empresa = async function (req, res) {///////Registro dos de la aplicacion movil
    var email = req.param('email');
    var fullName = req.param('fullName');
    var nombre = req.param('nombre');
    var image = req.param('image');
    var documento = req.param('documento');
    const insertEmpresa = await pool.query("UPDATE `empresa` SET `nombre` = ? WHERE `empresa`.`id` = ?", [nombre, documento]);
    res.send(JSON.stringify({ retorno: true, mensaje: 'Un exito' }));
};

async function obtenerPin(documento) { //saco los ultimos cuatro digitos de la cedula
    var digitos = documento.split("");
    var pin = "";
    for (let index = digitos.length - 4; index < digitos.length; index++) {
        pin = pin + digitos[index];
    }
    return pin;
}




exports.ListaTareas = async function (req, res) {
    const rows = await pool.query('SELECT * FROM tarea');
    if (rows.length > 0) {
        res.send(JSON.stringify({ retorno: true, mensaje: rows }));
    } else {
        res.send(JSON.stringify({ retorno: false, mensaje: 'No existen tareas' }));
    }
};

exports.ListaEmpresas = async function (req, res) {
    const filas = await pool.query('SELECT * FROM empresa');
    if (filas.length > 0) {
        res.send(JSON.stringify({ retorno: true, mensaje: filas }));
    } else {
        res.send(JSON.stringify({ retorno: false, mensaje: 'No existen empresas' }));
    }
};

exports.Alta_tarea = async function (req, res) {
    var titulo = req.param('titulo');
    var inicio = req.param('inicio');
    var fin = req.param('fin');
    var long = req.param('long');
    var lat = req.param('lat');
    var empleado_id = req.param('empleado_id');
    var empresa_id = req.param('empresa_id');

    await pool.query('INSERT INTO tarea (`estado`,`fin`,`inicio`,`titulo`,`empleado_id`,`empresa_id`) VALUES (?,?,?,?,?,?)', [1, fin, inicio, titulo, empleado_id,empresa_id]);
    await pool.query('INSERT INTO ubicacion (`latitud`,`longitud`) VALUES (?,?)', [lat,long]);

    var id_tarea = await pool.query('SELECT MAX(id) AS id FROM tarea');
    var id_ubicacion = await pool.query('SELECT MAX(id) AS id FROM ubicacion');

    await pool.query('INSERT INTO tarea_ubicacion (`Tarea_id`,`ubicaciones_id`) VALUES (?,?)', [id_tarea[0].id,id_ubicacion[0].id]);

    res.send(JSON.stringify({ retorno: true, mensaje: 'Tarea ingresada correctamente' }));
};

exports.Alta_asistencia = async function (req, res) {
    var inicio = req.param('inicio');
    var fin = req.param('fin');
    var foto = req.param('foto');
    var id = req.param('empleado_id');
    if (fin == null) {
        await pool.query('INSERT INTO asistencia (`inicio`,`fin`,`foto`,`empleado_id`) VALUES (?,?,?,?)', [inicio, fin, foto, id]);
        res.send(JSON.stringify({ retorno: true, mensaje: 'asistencia ingresada correctamente' }));
    } else {
        await pool.query('UPDATE asistencia set fin = ? WHERE fin IS null AND empleado_id = ?', [fin,id]);
        res.send(JSON.stringify({ retorno: true, mensaje: 'asistencia actualizada correctamente' }));
    }
};


/*
exports.login = function(req,res){
    res.send(JSON.stringify({coso:'Esto es la api' }));

};*/