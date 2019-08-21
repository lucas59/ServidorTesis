const pool = require("../database");
const helpers = require("../lib/helpers");
const bodyParser = require('body-parser');
const buffer = require('buffer');
exports.inicio = function (req, res) {
    res.send(JSON.stringify({ coso: 'Esto es la api' }));

};


exports.user = async function (req, res) {
    const id = req.body.session;
    console.log(id);

    const sql = await pool.query('SELECT u.documento, u.email,u.fotoPerfil,u.nombreUsuario, emp.celular, emp.nombre, emp.apellido FROM `empleado` as emp, usuario as u WHERE u.documento = emp.id and emp.id = ?', [id]);

    res.send(JSON.stringify({ datos: sql }));
};

exports.desactivar = async function (req, res) {
    const id = req.body.session;
    console.log(id);
    try {
        const sql = await pool.query('UPDATE `usuario` SET `estado` = 0 WHERE `usuario`.`documento` = ?', [id]);
        res.send(JSON.stringify({ retorno: true }));
    } catch (error) {
        res.send(JSON.stringify({ retorno: false }));
    }
};

exports.login = async function (req, res) {
    var id = req.param('email');
    var pass = req.param('password');

    const rows = await pool.query('SELECT * FROM usuario WHERE email = ? OR nombreUsuario = ?', [id, id]);

    if (rows.length > 0) {

        const user = rows[0];
        console.log('usuario', user.documento);
        const validacion = await helpers.compararContraseña(pass, user.contrasenia);
        if (validacion) {
            if (user.estado == 0) {
                await pool.query('UPDATE `usuario` SET `estado` = 1 WHERE `usuario`.`documento` = ?',[user.documento]);
            }
            var tipo = await obtenerTipoUsuario(id);
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
    var long_ini = req.param('long_ini');
    var lat_ini = req.param('lat_ini');
    var long_fin = req.param('long_fin');
    var lat_fin = req.param('lat_fin');
    var empleado_id = req.param('empleado_id');
    var empresa_id = req.param('empresa_id');

    //inserta la tarea y la ubicación de inicio
    await pool.query('INSERT INTO tarea (`estado`,`fin`,`inicio`,`titulo`,`empleado_id`,`empresa_id`) VALUES (?,?,?,?,?,?)', [1, fin, inicio, titulo, empleado_id, empresa_id]);
    await pool.query('INSERT INTO ubicacion (`latitud`,`longitud`,`tipo`) VALUES (?,?,?)', [lat_ini, long_ini, 0]);

    //busca la ultima tarea y la ultima ubicación ingresada
    var id_tarea = await pool.query('SELECT MAX(id) AS id FROM tarea');
    var id_ubicacion = await pool.query('SELECT MAX(id) AS id FROM ubicacion');

    //ingresa la conexión entre la tarea y la ubicación
    await pool.query('INSERT INTO tarea_ubicacion (`Tarea_id`,`ubicaciones_id`) VALUES (?,?)', [id_tarea[0].id, id_ubicacion[0].id]);

    //inserta la ubicación del final
    await pool.query('INSERT INTO ubicacion (`latitud`,`longitud`,`tipo`) VALUES (?,?,?)', [lat_fin, long_fin, 1]);

    //busca la ultima tarea y la ultima ubicación ingresada
    var id_tarea = await pool.query('SELECT MAX(id) AS id FROM tarea');
    var id_ubicacion = await pool.query('SELECT MAX(id) AS id FROM ubicacion');

    //ingresa la conexión entre la tarea y la ubicación
    await pool.query('INSERT INTO tarea_ubicacion (`Tarea_id`,`ubicaciones_id`) VALUES (?,?)', [id_tarea[0].id, id_ubicacion[0].id]);

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
        await pool.query('UPDATE asistencia set fin = ? WHERE fin IS null AND empleado_id = ?', [fin, id]);
        res.send(JSON.stringify({ retorno: true, mensaje: 'asistencia actualizada correctamente' }));
    }
};


/*
exports.login = function(req,res){
    res.send(JSON.stringify({coso:'Esto es la api' }));

};*/