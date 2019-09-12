const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const pool = require("../database");
const helpers = require("./helpers");
var multer = require('multer');
const path = require("path");
const fs = require('fs')
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);


passport.use('local.iniciar', new LocalStrategy({
    usernameField: 'identificador',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, username, password, done) => { //SELECT * FROM `empresa` as emp, usuario as u WHERE ( u.nombreUsuario = 'pedro' OR u.email="pedro" )  and emp.id = u.nombreUsuario 
    const rows = await pool.query('SELECT * FROM `empresa` as emp, usuario as u WHERE ( u.nombreUsuario = ? OR u.email= ? )  and emp.id = u.documento and u.estado = 1 ', [username, username]);
    const rows2 = await pool.query('SELECT * FROM `empleado` as emp, usuario as u WHERE ( u.nombreUsuario = ? OR u.email="?" )  and emp.id = u.documento and u.estado = 1', [username, username]);

    if (rows.length > 0) { ///usuarios empresas
        const user = rows[0];
        console.log(user);
        console.log(username);
        const validPassword = await helpers.compararContraseña(password, user.contrasenia);

        if (validPassword) {
            console.log('valido', user);
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


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '/public/img/')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
})

var upload = multer({ storage: storage }).single('fotoPerfil');

//registro de usuario
passport.use('local.signup', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, username, password, done) => {

    const { email, nombre, apellido, tel, tipo, documento, fotoPerfil } = req.body;

    const check = await pool.query('SELECT * FROM usuario as u WHERE (u.email = ? OR u.nombreUsuario = ? OR u.documento = ?)', [email, username, documento]);
    if (check.length > 0) {
        console.log('check', check.length);

        console.log('ruta archivo', req.file.path);
        await unlinkAsync(req.file.path)

        return done(null, false, req.flash('message', 'Usuario ya registrado.'));
    }

    var nombreArchivo = (documento + path.extname(req.file.originalname)).toLocaleLowerCase();


    const usuario = {
        documento,
        nombreUsuario: username,
        contrasenia: password,
        email: email,
        estado: true,
        fotoPerfil: nombreArchivo
    }

    usuario.contrasenia = await helpers.encryptPassword(password);

    const result = await pool.query('INSERT INTO usuario SET ? ', usuario);
    console.log(tipo);
    if (result) {
        if (tipo == 'empleado') {
            const pin = await obtenerPin(documento);
            const empleado = {
                apellido,
                celular: tel,
                pin: pin,
                fechaNacimiento: null,
                nombre,
                id: documento
            }
            const resultEmpleado = await pool.query('INSERT INTO empleado SET ? ', empleado);
            return done(null, false, req.flash('success', 'Bienvenido ' + nombre));
        } else {
            const empresa = {
                nombre: nombre,
                id: documento
            }
            const resultEmpresa = await pool.query('INSERT INTO empresa SET ? ', empresa);
            var config = await pool.query("INSERT INTO `configuracion`(`id`, `asistencias`, `camara`, `modoTablet`, `tareas`, `empresa_id`) VALUES (?,?,?,?,?,?)", [null, true, true, true, true, documento]);

            console.log(resultEmpresa);
            console.log('usuario empresa insertado');
            return done(null, false, req.flash('success', 'Bienvenido ' + nombre));
        }
    }
}));

passport.use('local.updateEmpresa', new LocalStrategy({
    usernameField: 'nombreUsuario',
    passwordField: 'password'
}, async (req, username, password, done) => {
    console.log('nombre, email, username, documento');

    const { nombre, email, documento } = req.body;
    console.log(nombre, email, username, documento);

    var check = await checkUsuario(documento, email, username);

    var nombreArchivo = (documento + path.extname(req.file.originalname)).toLocaleLowerCase();

    if (check.valor = true) {
        return done(null, req.flash('message', check.mensaje));
    }

    const sql = await pool.query('UPDATE `empresa` as emp SET emp.nombre = ? WHERE `empresa`.`id` = ? ', [nombre, documento]);


    return done(null, req.flash('sucess', 'Datos actualizados correctamente'));
}));


async function checkUsuario(documento, email, username) {

    var retorno = {
        valor: false,
        mensaje: ''
    }

    if (documento) {
        const sql = await pool.query('SELECT * FROM usuario WHERE documento = ? ', [documento]);
        if (sql.length > 0) {
            retorno.mensaje = 'Esta cedula ya existe';
            retorno.valor = true;
            return retorno;
        }
    }

    if (email) {
        const sql = await pool.query('SELECT * FROM usuario WHERE email = ? ', [email]);
        if (sql.length > 0) {
            retorno.mensaje = 'Este correo ya existe';
            retorno.valor = true;
            return retorno;
        }
    }

    if (username) {
        const sql = await pool.query('SELECT * FROM usuario WHERE nombreUsuario = ? ', [username]);
        if (sql.length > 0) {
            retorno.mensaje = 'Nombre de usuario ya existe';
            retorno.valor = true;
            return retorno;
        }
    }

    return retorno;
}




async function obtenerPin(documento) { //saco los ultimos cuatro digitos de la cedula
    var digitos = documento.split("");
    var pin = "";
    for (let index = digitos.length - 4; index < digitos.length; index++) {
        pin = pin + digitos[index];
    }
    return pin;
}

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const rows = await pool.query('SELECT * FROM usuario as u, empresa as emp WHERE (u.email = ? OR u.nombreUsuario = ? OR u.documento = ?) and emp.id = u.documento  ', [id, id, id]);
    const rows2 = await pool.query('SELECT * FROM usuario as u, empleado as emp WHERE  (u.email = ? OR u.nombreUsuario = ? OR u.documento = ?) and emp.id = u.documento ', [id, id, id]);
    if (rows.length > 0) {
        rows[0]['tipo'] = 0;
        return done(null, rows[0]);
    } else if (rows2.length > 0) {
        return true;
    }

});


