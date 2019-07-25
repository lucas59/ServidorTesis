const pool = require("../database");
const helpers = require("../lib/helpers");


exports.inicio = function (req, res) {
    res.send(JSON.stringify({ coso: 'Esto es la api' }));

};

exports.login = async function (req, res) {
    var id = req.param('email');
    var pass = req.param('password');

    const rows = await pool.query('SELECT * FROM usuario WHERE email = ? OR nombreUsuario = ?', [id, id]);

    if (rows.length > 0) {
        const user = rows[0];
        const validacion = await helpers.compararContraseña(pass, user.contrasenia);
        if (validacion) {
            res.send(JSON.stringify({ retorno: true, mensaje: 'Un exito.' }));
        } else {
            res.send(JSON.stringify({ retorno: false, mensaje: 'Contraseña incorrecta.' }));
        }
    } else {
        res.send(JSON.stringify({ retorno: false, mensaje: 'No existe este usuario.' }));
    }
};

exports.signup = async function (req, res) {

    var correo = req.param('email');
    var pass = req.param('password');
    var fullName = req.param('fullName');
    var tipo = req.param('tipo');

    const rows = await pool.query('SELECT * FROM usuario WHERE email = ? OR nombreUsuario = ?', [correo, fullName]);

    if (rows.length == 0) {
        const usuario = {
            nombreUsuario: fullName,
            contrasenia: pass,
            email: correo,
            estado: true,
            fotoPerfil_id: null,
            pais_id: null,
            ciudad_id: null

        }
        const user = rows[0];
        const result = await pool.query('INSERT INTO usuario SET ? ', usuario);
        if (result) {
            if (tipo == 0) {
                const empresa = {
                    nombre: null,
                    id: fullName
                }
                const resultEmpresa = await pool.query('INSERT INTO empresa SET ? ', empresa);
                console.log(resultEmpresa);
                console.log('usuario empresa insertado');
                res.send(JSON.stringify({ retorno: true, mensaje: 'Un exito.' }));
            } else {
                const empleado = {
                    apellido: null,
                    celular: null,
                   // pin: 11,
                    fechaNacimiento: null,
                    nombre: null,
                    id: fullName
                }
                const resultEmpleado = await pool.query('INSERT INTO empleado SET ? ', empleado);
                console.log('usuario empresa insertado');
                return true;
            }
        }
        res.send(JSON.stringify({ retorno: true, mensaje: 'Un exito.' }));
    } else {
        res.send(JSON.stringify({ retorno: false, mensaje: 'Ya existe este usuario.' }));
    }
};


/*
exports.login = function(req,res){
    res.send(JSON.stringify({coso:'Esto es la api' }));

};*/