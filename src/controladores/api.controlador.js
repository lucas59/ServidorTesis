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
            console.log("correo",id);
            var tipo = await obtenerTipoUsuario(id);
            console.log('tipo', tipo);
            res.send(JSON.stringify({ retorno: true, mensaje: 'Un exito.', tipo: tipo }));
        } else {
            res.send(JSON.stringify({ retorno: false, mensaje: 'Contraseña incorrecta.' }));
        }
    } else {
        res.send(JSON.stringify({ retorno: false, mensaje: 'No existe este usuario.' }));
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

exports.Alta_tarea = async function (req, res) {
    var titulo = req.param('titulo');
    var inicio = req.param('inicio');
    var fin = req.param('fin');

    await pool.query('INSERT INTO tarea (`estado`,`fin`,`inicio`,`titulo`) VALUES (?,?,?,?)', [1, fin, inicio, titulo]);
    res.send(JSON.stringify({ retorno: true, mensaje: 'Usuario ingresado correctamente' }));
};


/*
exports.login = function(req,res){
    res.send(JSON.stringify({coso:'Esto es la api' }));

};*/