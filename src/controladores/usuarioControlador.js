const passport = require('passport');
const pool = require("../database");
const path = require("path");
var multer = require('multer');


exports.inicio = function (req, res) {
    if (req.isAuthenticated()) { //si hay session 
        console.log(req.user.tipo); //ahora me fijo de que tipo es la session
        var titulo = "Inicio";
        if (req.user.tipo == 0) {
            res.render("registros/empresaRegistros", { titulo });
        } else {
            res.render("autenticacion/inicio", { titulo });
        }
    } else {
        var titulo = "Inicio";
        res.render("autenticacion/inicio", { titulo });
    }

};

exports.login = function (req, res) {
    var titulo = "Inicia Sesión";
    res.render("autenticacion/login", { titulo });
};

exports.iniciar = passport.authenticate('local.iniciar', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
});
exports.salir = function (req, res) {
    req.logOut();
    res.redirect('/login');
}

exports.perfil = async function (req, res) {
    const { passport } = req.session;
    var session = passport.user;
    var titulo = "Inicia Sesión";
    var datos;
    if (session) {
        const rows = await pool.query('SELECT * FROM usuario as u, empresa as emp WHERE u.documento = ? and emp.id = u.documento  ', [session]);
        const rows2 = await pool.query('SELECT * FROM usuario as u, empleado as emp WHERE u.documento = ? and emp.id = u.documento ', [session]);

        if (rows.length > 0) {
            datos = rows[0];
        } else {
            datos = rows2[0];
        }

        datos['contrasenia'] = "";
        res.render("perfil", { titulo, datos });
    } else {
        res.redirect("/login");
    }

};

exports.registrarse = passport.authenticate('local.signup', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
});


exports.update = async function (req, res) {

    const { nombre, email, documento, username } = req.body;

    //console.log(nombre, email, documento, username);
    const { passport } = req.session;
    var session = passport.user;
    var check = await checkUsuario(email, username, session);

    // var nombreArchivo = (documento + path.extname(req.file.originalname)).toLocaleLowerCase();
    if (check.valor == true) {
        req.flash("message", check.mensaje);
        res.redirect('/perfil');
        return;
    }

    const sql = await pool.query('UPDATE `empresa` SET nombre = ? WHERE `empresa`.`id` = ? ', [nombre, documento]);

    if (sql.affectedRows == 1) {
        const editUsuario = await pool.query("UPDATE `usuario` SET  `nombreUsuario` = ?, email = ? WHERE `usuario`.`documento` = ?", [username, email, documento]);
        if (editUsuario.affectedRows == 1) {
            req.flash("succes", 'Cosooooo');
            res.redirect('/perfil');
            return;
        }
    }
}



async function checkUsuario(email, username, session) {


    var retorno = {
        valor: false,
        mensaje: ''
    }


    if (email) {
        const sql = await pool.query('SELECT * FROM usuario WHERE email = ? AND NOT documento = ?', [email, session]);

        if (sql.length > 0) {
            retorno.mensaje = 'Este correo ya existe';
            retorno.valor = true;
            return retorno;
        }
    }

    if (username) {
        const sql = await pool.query('SELECT * FROM usuario WHERE nombreUsuario = ? AND NOT documento = ? ', [username, session]);
        if (sql.length > 0) {
            retorno.mensaje = 'Nombre de usuario ya existe';
            retorno.valor = true;
            return retorno;
        }
    }

    return retorno;
}






exports.singin = function (req, res) {
    var titulo = "Registrarse";
    res.render("autenticacion/singin", { titulo });
};

exports.checkUser = async function (req, res) {
    const { username, email, documento } = req.body;
    //const sql = pool.query('');
    const check = await pool.query('SELECT * FROM usuario as u WHERE (u.email = ? OR u.nombreUsuario = ? OR u.documento = ?)', [email, username, documento]);
    if (check.length > 0) {
        return true;
    } else {
        return false;
    }
};