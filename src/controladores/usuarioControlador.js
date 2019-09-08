const passport = require('passport');
var fs = require('fs');
const pool = require("../database");
const path = require("path");
var multer = require('multer');
const helpers = require("../lib/helpers");
const nodeMailer = require('nodemailer');
var handlebars = require('handlebars');
var templeateMail = require('../views/autenticacion/mail');
var html = fs.readFileSync(__dirname + '\\expAsis.hbs', 'utf8');
var htmlTareas = fs.readFileSync(__dirname + '\\expTareas.hbs', 'utf8');
var dateFormat = require('dateformat');
const { parse } = require('json2csv');
let PDF = require('handlebars-pdf');

exports.inicio = async function (req, res) {
    if (req.isAuthenticated()) { //si hay session 
        var titulo = "Inicio";
        if (req.user.tipo == 0) {
            const tareas = await pool.query('SELECT td.*, empleado.*, u.*, ubic.latitud, ubic.longitud, ubic.tipo as tipoUbic FROM `tarea` as td, empleado AS empleado, usuario as u, tarea_ubicacion as tdUbic, ubicacion as ubic WHERE td.empresa_id = ? AND td.empleado_id = empleado.id AND empleado.id=u.documento AND tdUbic.Tarea_id=td.id AND ubic.id= tdUbic.ubicaciones_id ORDER BY td.inicio ASC', [req.user.documento])
            const asistencias = await pool.query('SELECT asi.* FROM asistencia AS asi WHERE asi.id and asi.empleado_id=?', [req.user.documento])

            res.render("registros/empresaRegistros", { titulo, tareas, asistencias });
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

exports.mail = function (req, res) {
    var titulo = "Inicia Sesión";
    var pass = "Coso";

    res.render("autenticacion/mail", { titulo, pass });
};


exports.personal = async function (req, res) {
    const { passport } = req.session;
    var session = passport.user;
    const sql = await pool.query('SELECT u.*, col.* FROM `empresa_empleado` as ee, usuario as u, empleado as col WHERE  u.documento = col.id AND u.documento = ee.empleados_id AND ee.empresa_id = ? ', [session]);
    let listaPersonal = sql;

    var titulo = "Personal";
    res.render("empresa/personal", { titulo, listaPersonal });
};

exports.agregarAEmp = function (req, res) {
    const documento = req.body.documento;
    const { passport } = req.session;
    var session = passport.user;
    console.log(session);
    try {
        const sql = pool.query('INSERT INTO `empresa_empleado` (`Empresa_id`, `empleados_id`) VALUES (?,?)', [session, documento]);
        res.send(JSON.stringify({ retorno: true }));
    } catch (error) {
        console.log("Error: ", error);
    }
}

exports.despedirEmpleado = function (req, res) {
    const documento = req.body.documento;
    const { passport } = req.session;
    var session = passport.user;
    try {
        const sql = pool.query('DELETE FROM `empresa_empleado` WHERE `Empresa_id` = ? AND `empleados_id`=?', [session, documento]);
        res.send(JSON.stringify({ retorno: true }));
    } catch (error) {
        console.log("Error: ", error);
    }
}


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
    var documento = req.query.doc;
    var session = passport.user;
    var titulo = "Inicia Sesión";
    var datos;
    if (session) {
        if (documento) {
            const rows = await pool.query('SELECT * FROM usuario as u, empleado as emp WHERE u.documento = ? and emp.id = u.documento ', [documento]);
            if (rows.length > 0) {
                datos = rows[0];

                console.log(datos);
                datos['contrasenia'] = "";
                res.render("perfil", { titulo, datos });
            } else {
                res.redirect('/');
            }
        } else {
            const rows = await pool.query('SELECT * FROM usuario as u, empresa as emp WHERE u.documento = ? and emp.id = u.documento  ', [session]);
            const rows2 = await pool.query('SELECT * FROM usuario as u, empleado as emp WHERE u.documento = ? and emp.id = u.documento ', [session]);

            if (rows.length > 0) {
                datos = rows[0];
            } else {
                datos = rows2[0];
            }
            datos['contrasenia'] = "";
            res.render("perfil", { titulo, datos });
        }
    } else {
        res.redirect("/login");
    }

};



exports.perfilEmpleado = async function (req, res) {
    var titulo = "Perfil";
    const documento = req.params;
    console.log(documento.documento);
    var datos;
    if (documento.documento) {
        const rows = await pool.query('SELECT * FROM usuario as u, empleado as emp WHERE u.documento = ? and emp.id = u.documento ', [documento.documento]);
        if (rows.length > 0) {
            datos = rows[0];

            console.log(datos);
            datos['contrasenia'] = "";
            res.render("perfil", { titulo, datos });
        } else {
            res.redirect('/');
        }

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
    console.log("documento", req.file);
    var nombreFinal = null;
    if (req.file) {
        var extension = path.extname(req.file.originalname).toLocaleLowerCase()
        nombreFinal = documento + extension;
        fs.rename(req.file.path, req.file.destination + "/" + nombreFinal, function (err) {
            console.log("Error: ", err);
        });
    }

    const { passport } = req.session;
    var session = passport.user;
    var check = await checkUsuario(email, username, session);

    if (check.valor == true) {
        req.flash("message", check.mensaje);
        res.redirect('/perfil');
        return;
    }
    const sql = await pool.query('UPDATE `empresa` SET nombre = ? WHERE `empresa`.`id` = ? ', [nombre, documento]);

    if (sql.affectedRows == 1) {
        var editUsuario = null;
        if (nombreFinal) {
            editUsuario = await pool.query("UPDATE `usuario` SET  `nombreUsuario` = ?,fotoPerfil = ?, email = ? WHERE `usuario`.`documento` = ?", [username, nombreFinal, email, documento]);
        } else {
            editUsuario = await pool.query("UPDATE `usuario` SET  `nombreUsuario` = ?, email = ? WHERE `usuario`.`documento` = ?", [username, email, documento]);
        }

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


exports.desactivar = async function (req, res) {
    const { documento, pass } = req.body;
    console.log(documento, pass);
    const rows = await pool.query('SELECT u.*, emp.* FROM `empresa` as emp, usuario as u  WHERE  emp.id = ? and u.documento = emp.id  ', [documento]);
    console.log(rows);
    if (rows.length > 0) {
        const user = rows[0];
        const checkPass = await helpers.compararContraseña(pass, user.contrasenia);

        if (checkPass) {
            const sql = await pool.query('UPDATE `usuario` SET `estado` = 0 WHERE `usuario`.`documento` = ?', [documento]);
            if (sql.affectedRows == 1) {
                req.logOut();
                req.flash('success', 'Nos vemos pronto ' + user.nombre)
                res.redirect('/login');
                return;
            }
        } else {
            req.flash('message', 'Contraseña incorrecta.');
            res.redirect('/');
            return;
        }
    } else {
        res.redirect('/');
        return;
    }
};

exports.busquedaEmpleado = async function (req, res) {
    const { identificador } = req.query;
    const session = req.user.documento;
    const sql = await pool.query('SELECT * FROM usuario as u, empleado as emp WHERE u.documento=emp.id AND emp.id = ' + identificador + ' AND emp.id NOT IN (SELECT empleados_id FROM empresa_empleado WHERE empresa_id = ' + session + ')');
    res.send(JSON.stringify(sql));
}


exports.resetPass = async function (req, res) {
    const { identificador } = req.body;
    console.log('identificador', identificador);
    const sql = await pool.query('SELECT * FROM usuario as u WHERE u.documento = ? or u.nombreUsuario = ? or u.email = ? ', [identificador, identificador, identificador]);
    if (sql.length > 0) {
        const user = sql[0];

        let transporter = nodeMailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'idevelopcomunidad@gmail.com',
                pass: 'idevelop2019'
            }
        });

        var passGenerate = generar(8);
        var hash = await helpers.encryptPassword(passGenerate);

        const updatePass = await pool.query('UPDATE `usuario` SET `contrasenia`= ? WHERE `documento` = ? ', [hash, identificador]);

        var source = fs.readFileSync(path.join(__dirname, '../views/autenticacion/mail.hbs'), 'utf8');
        var template = handlebars.compile(source);
        var replacements = {
            pass: passGenerate
        };
        var htmlAEnviar = template(replacements);

        let mailOptions = {
            from: '"Tine" <Tine@gmail.com>', // sender address
            to: user.email, // list of receivers
            subject: "Restauración de contraseña", // Subject line
            html: htmlAEnviar
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message %s sent: %s', info.messageId, info.response);
            req.flash('success', 'Contraseña restaurada y enviada a su casilla de correo.');
            res.redirect('/login');
            return;
        });

    }
}
exports.exportarAsistenciascsv = async function (req, res) {
    asistencias(req.user.id).then((asistencias) => {

        asistencias.forEach(element => {
            element.inicio = dateFormat(element.inicio, "dd,dm,yyyy hh:mm:ss");
            element.fin = dateFormat(element.fin, "dd,dm,yyyy hh:mm:ss");

        });
        var fields = ['id', 'idEmpleado', 'inicio', 'fin'];
        try {
            var data = parse(asistencias, {fields});
            console.log("data", data);

            res.attachment(req.user.id + "-Asistencias.csv");
            res.status(200).send(data);
        } catch (err) {
            console.log(err);
        }
    })
}
exports.exportarAsistenciaspdf = async function (req, res) {
    asistencias(req.user.id).then((asistencias) => {

        let document = {
            template: html,
            context: {
                asistencias: asistencias
            },
            path: "./test-" + Math.random() + ".pdf"
        }

        PDF.create(document)
            .then(result => {
                console.log(result.filename);
                res.sendFile(result.filename);
                res.end();

            })
            .catch(error => {
                console.error(error)
            })
    })
}



exports.exportarTareascsv = async function (req, res) {
    tareas(req.user.id).then((tareas) => {

        tareas.forEach(element => {
            element.inicio = dateFormat(element.inicio, "dd,dm,yyyy hh:mm:ss");
            element.fin = dateFormat(element.fin, "dd,dm,yyyy hh:mm:ss");

        });

        try {
            var data = parse(tareas);
            console.log("data", data);

            res.attachment(req.user.id + "-Tareas.csv");
            res.status(200).send(data);
        } catch (err) {
            console.log(err);
        }
    })
}


exports.exportarTareaspdf = async function (req, res) {
    tareas(req.user.id).then((tareas) => {

        tareas.forEach(element => {
            element.inicio = dateFormat(element.inicio, "dd,dm,yyyy");
            element.fin = dateFormat(element.fin, "dd,dm,yyyy");

        });

        let document = {
            template: htmlTareas,
            context: {
                tareas: tareas
            },
            path: "./test-" + Math.random() + ".pdf"
        }

        PDF.create(document)
            .then(result => {
                console.log(result.filename);
                // res.sendFile(result.filename);
                var buffer = fs.readFileSync(result.filename);

                res.writeHead(200, {
                    'Content-Type': 'pdf',
                    'Content-disposition': 'attachment;filename=Tareas' + req.user.id + ".pdf",
                    'Content-Length': buffer.length
                });
                res.end(Buffer.from(buffer, 'binary'));
                fs.unlinkSync(result.filename);


            })
            .catch(error => {
                console.error(error)
            })




    })
}



let asistencias = (documento) => {
    return new Promise((res, rej) => {
        var asistencias = pool.query('SELECT asi.* FROM asistencia AS asi WHERE asi.id and asi.empleado_id=?', [documento]);
        res(asistencias);
    });
}

let tareas = (documento) => {
    return new Promise((res, rej) => {
        var asistencias = pool.query('SELECT td.empleado_id, td.titulo,td.inicio,td.fin FROM `tarea` as td, empleado AS empleado, usuario as u, tarea_ubicacion as tdUbic, ubicacion as ubic WHERE td.empresa_id = ? AND td.empleado_id = empleado.id AND empleado.id=u.documento AND tdUbic.Tarea_id=td.id AND ubic.id= tdUbic.ubicaciones_id ORDER BY td.inicio ASC', [documento]);
        res(asistencias, (err) => {
            console.log(err);
        });
    });
}




function generar(longitud) {
    var caracteres = "abcdefghijkmnpqrtuvwxyzABCDEFGHIJKLMNPQRTUVWXYZ2346789";
    var contraseña = "";
    for (i = 0; i < longitud; i++) contraseña += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    return contraseña;
}

