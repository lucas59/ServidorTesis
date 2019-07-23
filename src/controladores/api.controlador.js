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
        const validacion = await helpers.compararContraseña(pass,user.contrasenia);
        if (validacion) {
            res.send(JSON.stringify({ retorno: true, mensaje:'Un exito.' }));
        } else {
            res.send(JSON.stringify({ retorno: false,mensaje:'Contraseña incorrecta.' }));
        }
    } else {
        res.send(JSON.stringify({ retorno: false, mensaje:'No existe este usuario.'}));
    }
};


/*
exports.login = function(req,res){
    res.send(JSON.stringify({coso:'Esto es la api' }));

};*/