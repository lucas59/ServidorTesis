
exports.inicio = function(req,res){
    var titulo = "Inicio";
    res.render("autenticacion/inicio", { titulo });
};

exports.login = function(req,res){
    var titulo = "Inicia Sesión";
    res.render("autenticacion/login", { titulo });
};

exports.singin = function(req,res){
    var titulo = "Registrarse";
    res.render("autenticacion/singin", { titulo });
};