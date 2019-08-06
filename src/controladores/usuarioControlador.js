const passport = require('passport');
const pool = require("../database");

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
        console.log(session);
        const rows = await pool.query('SELECT * FROM usuario as u, empresa as emp WHERE u.documento = ? and emp.id = u.documento  ', [session]);
        const rows2 = await pool.query('SELECT * FROM usuario as u, empleado as emp WHERE u.documento = ? and emp.id = u.documento ', [session]);

        if (rows.length > 0) {
            datos = rows[0];
        } else {
            datos = rows2[0];
        }

        datos['contrasenia'] = "";
        console.log(JSON.stringify(datos));
        //datos = JSON.stringify(datos);
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


exports.update = passport.authenticate('local.update', {
    successRedirect: '/',
    failureRedirect: '/perfil',
    failureFlash: true
});


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