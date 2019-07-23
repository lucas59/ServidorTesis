const passport = require('passport');
exports.inicio = function (req, res) {
    if (req.isAuthenticated()) { //si hay session 
        console.log(req.user.tipo); //ahora me fijo de que tipo es la session
        var titulo = "Inicio";
        if(req.user.tipo==0){
            res.render("registros/empresaRegistros", { titulo });
        }else{
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
    successRedirect: '/perfil',
    failureRedirect: '/login',
    failureFlash: true
});
exports.salir = function (req, res) {
    req.logOut();
    res.redirect('/login');
}

exports.perfil = function (req, res) {
    var titulo = "Inicia Sesión";
    res.render("perfil", { titulo });
};

exports.registrarse = passport.authenticate('local.signup', {
    successRedirect: '/perfil',
    failureRedirect: '/registrarse',
    failureFlash: true
});

exports.singin = function (req, res) {
    var titulo = "Registrarse";
    res.render("autenticacion/singin", { titulo });
};


