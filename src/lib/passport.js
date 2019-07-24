const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const pool = require("../database");
const helpers = require("./helpers");
const image2base64 = require('image-to-base64');



passport.use('local.iniciar', new LocalStrategy({
    usernameField: 'identificador',
    passwordField: 'password',
    passReqToCallback: true
}, async(req, username, password, done) => { //SELECT * FROM `empresa` as emp, usuario as u WHERE ( u.nombreUsuario = 'pedro' OR u.email="pedro" )  and emp.id = u.nombreUsuario 
    const rows = await pool.query('SELECT * FROM `empresa` as emp, usuario as u WHERE ( u.nombreUsuario = ? OR u.email= ? )  and emp.id = u.nombreUsuario ', [username, username]);
    const rows2 = await pool.query('SELECT * FROM `empleado` as emp, usuario as u WHERE ( u.nombreUsuario = ? OR u.email="?" )  and emp.id = u.nombreUsuario ', [username, username]);

    if (rows.length > 0) { ///usuarios empresas
        const user = rows[0];
        console.log(user);
        console.log(username);
        const validPassword = await helpers.compararContraseña(password, user.contrasenia)

        if (validPassword) {
            done(null, user, req.flash('success', 'Bienvenido ' + user.nombre));
        } else {
            done(null, false, req.flash('message', 'Contraseña incorrecta.'));
        }
    } else if (rows2.length > 0) { //usuaris empleados
        return done(null, false, req.flash('message', 'No tiene permitido iniciar vía web .'));
    } else {
        return done(null, false, req.flash('message', 'El usuario no existe.'));
    }
}));


//registro de usuario
passport.use('local.signup', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async(req, username, password, done) => {


    const { email, nombre, apellido, tel, tipo, fotoPerfil } = req.body;

    const usuario = {
        nombreUsuario: username,
        contrasenia: password,
        email: email,
        estado: true,
        fotoPerfil_id: null,
        pais_id: 1,
        ciudad_id: 1

    }

    usuario.contrasenia = await helpers.encryptPassword(password);
    // Saving in the Database

    const result = await pool.query('INSERT INTO usuario SET ? ', usuario);
    console.log(tipo);
    if (result) {
        if (tipo == 'empleado') {
            const empleado = {
                apellido,
                celular: tel,
                pin: 1,
                fechaNacimiento: null,
                nombre,
                id: username
            }
            const resultEmpleado = await pool.query('INSERT INTO empleado SET ? ', empleado);
            console.log('usuario empresa insertado');
            return true;
            //   return done(null, empleado, req.flash('success', 'Bienvenido ' + nombre));
        } else {
            const empresa = {
                nombre: nombre,
                id: username
            }
            const resultEmpresa = await pool.query('INSERT INTO empresa SET ? ', empresa);
            console.log(resultEmpresa);
            console.log('usuario empresa insertado');
            return done(null, empresa, req.flash('success', 'Bienvenido ' + nombre));

        }
    }

}));


passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async(id, done) => {
    const rows = await pool.query('SELECT * FROM usuario as u, empresa as emp WHERE (u.email = ? OR u.nombreUsuario = ?) and emp.id = u.nombreUsuario  ', [id, id]);
    const rows2 = await pool.query('SELECT * FROM usuario as u, empleado as emp WHERE  (u.email = ? OR u.nombreUsuario = ?) and emp.id = u.nombreUsuario ', [id, id]);
    if (rows.length > 0) {
        rows[0]['tipo'] = 0;
        return done(null, rows[0]);
    } else if (rows2.length > 0) {
        rows[0]['tipo'] = 1;
        return done(null, rows2[0]);
    }

});