const pool = require("../database");
const helpers = require("../lib/helpers");
const bodyParser = require("body-parser");
const buffer = require("buffer");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const nodeMailer = require("nodemailer");
var handlebars = require("handlebars");

exports.inicio = function(req, res) {
  res.send(JSON.stringify({ coso: "Esto es la api" }));
};

exports.user = async function(req, res) {
  const id = req.body.session;
  console.log(id);

  const sql = await pool.query(
    "SELECT u.documento, u.email,u.fotoPerfil,u.nombreUsuario, emp.celular, emp.nombre, emp.apellido FROM `empleado` as emp, usuario as u WHERE u.documento = emp.id and emp.id = ?",
    [id]
  );

  res.send(JSON.stringify(sql));
};

exports.userEmpresa = async function(req, res) {
  const id = req.body.session;
  console.log(id);

  const sql = await pool.query(
    "SELECT u.documento, u.email,u.fotoPerfil,u.nombreUsuario,  emp.nombre FROM `empresa` as emp, usuario as u WHERE u.documento = emp.id and emp.id = ?",
    [id]
  );

  res.send(JSON.stringify({ datos: sql }));
};

exports.desactivar = async function(req, res) {
  const id = req.body.session;
  console.log(id);
  try {
    const sql = await pool.query(
      "UPDATE `usuario` SET `estado` = 0 WHERE `usuario`.`documento` = ?",
      [id]
    );
    res.send(JSON.stringify({ retorno: true }));
  } catch (error) {
    res.send(JSON.stringify({ retorno: false }));
  }
};

exports.login = async function(req, res) {
  var id = req.param("email");
  var pass = req.param("password");

  const rows = await pool.query(
    "SELECT * FROM usuario WHERE email = ? OR nombreUsuario = ?",
    [id, id]
  );

  if (rows.length > 0) {
    const user = rows[0];
    console.log("usuario", user.documento);
    const validacion = await helpers.compararContraseña(pass, user.contrasenia);
    if (validacion) {
      if (user.estado == 0) {
        await pool.query(
          "UPDATE `usuario` SET `estado` = 1 WHERE `usuario`.`documento` = ?",
          [user.documento]
        );
      }
      var tipo = await obtenerTipoUsuario(id);
      if (tipo == 0) {
        var config = await pool.query(
          "SELECT * FROM configuracion WHERE empresa_id = ?",
          [user.documento]
        );
      }
      res.send(
        JSON.stringify({
          retorno: true,
          mensaje: "Un exito.",
          tipo: tipo,
          id: rows[0].documento,
          config: { config }
        })
      );
    } else {
      res.send(
        JSON.stringify({ retorno: false, mensaje: "Contraseña incorrecta." })
      );
    }
  } else {
    res.send(
      JSON.stringify({ retorno: false, mensaje: "No existe este usuario." })
    );
  }
};

exports.login_tablet = async function(req, res) {
  var id_usuario = req.param("id_usuario");
  var id_empresa = req.param("id_empresa");
  console.log(id_usuario);
  console.log(id_empresa);
  const reentrada = await pool.query(
    "SELECT * FROM asistencia WHERE id=(SELECT MAX(id) from asistencia) AND empleado_id = ? AND empresa_id = ? AND tipo = 1",
    [id_usuario, id_empresa]
  );
  if (reentrada.length > 0) {
    res.send(
      JSON.stringify({
        retorno: true,
        mensaje:
          "Su ultima asistencia fue una entrada,¿Usted esta ingresando o saliendo de la empresa?",
        estado_ree: 1
      })
    );
  } else {
    res.send(
      JSON.stringify({
        retorno: true,
        mensaje: "¿Usted esta ingresando o saliendo de la empresa?",
        estado_ree: 2
      })
    );
  }
};

exports.configuraciones_empresa = async function(req, res) {
  var id_empresa = req.param("id_empresa");
  const reentrada = await pool.query(
    "SELECT * FROM configuracion WHERE empresa_id = ?",
    [id_empresa]
  );
  if (reentrada.length > 0) {
    res.send(JSON.stringify({ retorno: true, mensaje: reentrada }));
  }
};

async function obtenerTipoUsuario(id) {
  const rows = await pool.query(
    "SELECT * FROM usuario as u, empresa as emp WHERE (u.email = ? OR u.nombreUsuario = ?) and emp.id = u.documento",
    [id, id]
  );
  const rows2 = await pool.query(
    "SELECT * FROM usuario as u, empleado as emp WHERE  (u.email = ? OR u.nombreUsuario = ?) and (emp.id = u.documento)",
    [id, id]
  );
  if (rows.length > 0) {
    return 0;
  } else if (rows2.length > 0) {
    return 1;
  }
}

exports.signup = async function(req, res) {
  var correo = req.param("email");
  var pass = req.param("password");
  var documento = req.param("documento");
  var fullName = req.param("fullName");
  var tipo = req.param("tipo");
  const rows = await pool.query(
    "SELECT * FROM usuario WHERE email = ? OR nombreUsuario = ? OR documento = ?",
    [correo, fullName, documento]
  );

  if (rows.length == 0) {
    const usuario = {
      nombreUsuario: fullName,
      contrasenia: pass,
      email: correo,
      estado: true,
      fotoPerfil: null,
      documento
    };
    usuario.contrasenia = await helpers.encryptPassword(pass);

    const user = rows[0];
    const result = await pool.query("INSERT INTO usuario SET ? ", usuario);
    if (result) {
      if (tipo == 0) {
        const empresa = {
          nombre: null,
          id: documento
        };
        const resultEmpresa = await pool.query(
          "INSERT INTO empresa SET ? ",
          empresa
        );
        var config = await pool.query(
          "INSERT INTO `configuracion`(`id`, `asistencias`, `camara`, `modoTablet`, `tareas`, `empresa_id`) VALUES (?,?,?,?,?,?)",
          [null, true, true, true, true, documento]
        );

        console.log("usuario empresa insertado");
        res.send(JSON.stringify({ retorno: true, mensaje: "Un exito." }));
      } else {
        var pin = await obtenerPin(documento);
        const empleado = {
          apellido: null,
          celular: null,
          pin: pin,
          fechaNacimiento: null,
          nombre: null,
          id: documento
        };
        const resultEmpleado = await pool.query(
          "INSERT INTO empleado SET ? ",
          empleado
        );
        console.log("usuario empleado insertado");
        res.send(JSON.stringify({ retorno: true, mensaje: "Un exito." }));
      }
    }
  } else {
    res.send(
      JSON.stringify({ retorno: false, mensaje: "Ya existe este usuario." })
    );
  }
};

exports.updatePerfil = async function(req, res) {
  let email = req.param("email");
  let nombre = req.param("nombre");
  let apellido = req.param("apellido");
  let celular = req.param("celular");
  let fullName = req.param("fullName");
  let documento = req.param("documento");

  const sql = await pool.query(
    "UPDATE `empleado` SET `nombre` = ?, apellido=?, celular=? WHERE `empleado`.`id` = ?",
    [nombre, apellido, celular, documento]
  );
  if (sql.affectedRows == 1) {
    res.send(JSON.stringify({ retorno: true, mensaje: "Datos actualizados." }));
  } else {
    res.send(
      JSON.stringify({
        retorno: false,
        mensaje: "No se actualizado el usuario."
      })
    );
  }
};

exports.signup2 = async function(req, res) {
  ///////Registro dos de la aplicacion movil
  var email = req.param("email");
  var fullName = req.param("fullName");
  var documento = req.param("documento");
  var nacimiento = req.param("nacimiento");
  var nombre = req.param("nombre");
  var apellido = req.param("apellido");
  var celular = req.param("celular");
  var image = req.param("image");
  console.log(documento);
  const insertEmpleado = await pool.query(
    "UPDATE `empleado` SET `apellido` = ?, `celular` = ?, `fechaNacimiento` = ?, `nombre` = ? WHERE `empleado`.`id` = ?",
    [apellido, celular, nacimiento, nombre, documento]
  );
  res.send(JSON.stringify({ retorno: true, mensaje: "Un exito" }));
};

exports.signup2Empresa = async function(req, res) {
  ///////Registro dos de la aplicacion movil
  var email = req.param("email");
  var fullName = req.param("fullName");
  var nombre = req.param("nombre");
  var image = req.param("image");
  var documento = req.param("documento");
  const insertEmpresa = await pool.query(
    "UPDATE `empresa` SET `nombre` = ? WHERE `empresa`.`id` = ?",
    [nombre, documento]
  );
  res.send(JSON.stringify({ retorno: true, mensaje: "Un exito" }));
};

async function obtenerPin(documento) {
  //saco los ultimos cuatro digitos de la cedula
  var digitos = documento.split("");
  var pin = "";
  for (let index = digitos.length - 4; index < digitos.length; index++) {
    pin = pin + digitos[index];
  }
  return pin;
}

exports.ListaTareas = async function(req, res) {
  var id = req.param("id");
  var id_empresa = req.param("id_empresa");
  const rows = await pool.query(
    "SELECT * FROM tarea WHERE empleado_id = ? AND empresa_id = ? GROUP BY inicio DESC",
    [id, id_empresa]
  );
  if (rows.length > 0) {
    console.log(rows[0]);
    res.send(JSON.stringify({ retorno: true, mensaje: rows }));
  } else {
    res.send(JSON.stringify({ retorno: false, mensaje: "No existen tareas" }));
  }
};

exports.ListaAsistencias = async function(req, res) {
  var id = req.param("id");
  var id_empresa = req.param("id_empresa");
  console.log(id);
  7;
  console.log(id_empresa);
  const rows = await pool.query(
    "SELECT id,fecha,tipo FROM asistencia WHERE empleado_id = ? AND empresa_id = ? GROUP BY fecha DESC",
    [id, id_empresa]
  );
  if (rows.length > 0) {
    console.log(rows[0]);
    res.send(JSON.stringify({ retorno: true, mensaje: rows }));
  } else {
    res.send(
      JSON.stringify({ retorno: false, mensaje: "No existen asistencias" })
    );
  }
};

exports.ListaEmpresas = async function(req, res) {
  var id = req.param("id");
  const filas = await pool.query(
    "SELECT empresa.nombre,empresa.id,usuario.fotoPerfil FROM empresa INNER JOIN usuario ON empresa.id = usuario.documento WHERE empresa.id IN (SELECT Empresa_id FROM empresa_empleado WHERE empleados_id = ?)",
    [id]
  );
  if (filas.length > 0) {
    res.send(JSON.stringify({ retorno: true, mensaje: filas }));
  } else {
    res.send(
      JSON.stringify({ retorno: false, mensaje: "No existen empresas" })
    );
  }
};

exports.Alta_tarea = async function(req, res) {
  var titulo = req.param("titulo");
  var inicio = req.param("inicio");
  var fin = req.param("fin");
  var long_ini = req.param("long_ini");
  var lat_ini = req.param("lat_ini");
  var long_fin = req.param("long_fin");
  var lat_fin = req.param("lat_fin");
  var empleado_id = req.param("empleado_id");
  var empresa_id = req.param("empresa_id");
  //inserta la tarea y la ubicación de inicio
  await pool.query(
    "INSERT INTO tarea (`estado`,`fin`,`inicio`,`titulo`,`empleado_id`,`empresa_id`,`latitud_fin`, `latitud_ini`, `longitud_ini`, `longitud_fin`) VALUES (?,?,?,?,?,?,?,?,?,?)",
    [
      1,
      fin,
      inicio,
      titulo,
      empleado_id,
      empresa_id,
      lat_fin,
      lat_ini,
      long_ini,
      long_fin
    ]
  );
  res.send(
    JSON.stringify({ retorno: true, mensaje: "Tarea ingresada correctamente" })
  );
};

exports.Modificar_tarea = async function(req, res) {
  var titulo = req.param("titulo");
  var inicio = req.param("inicio");
  var fin = req.param("fin");
  var id = req.param("id");
  console.log(titulo);
  console.log(inicio);
  console.log(fin);
  console.log(id);

  await pool.query(
    "UPDATE tarea SET estado = ? ,fin = ?, inicio = ?, titulo = ? WHERE id = ?",
    [1, fin, inicio, titulo, id]
  );
  res.send(
    JSON.stringify({ retorno: true, mensaje: "Tarea modificada correctamente" })
  );
};

exports.EliminarTarea = async function(req, res) {
  var id = req.param("id");
  console.log("prueba");
  await pool.query("DELETE FROM tarea WHERE tarea.id = ?", [id]);

  res.send(
    JSON.stringify({ retorno: true, mensaje: "Tarea eliminada correctamente" })
  );
};
exports.fotoSeguridad = async function(req, res) {
  var url = path.join(__dirname, "..//public//img//seguridad//");
  console.log(url);
  var foto = req.param("foto");
  var empleado = req.param("empleado");
  console.log(empleado);
  var nombreFoto = empleado + ".jpg";
  fs.writeFile(url + nombreFoto, foto, "base64", err => {
    console.log("error", err);
  });
  res.send(JSON.stringify({ retorno: true }));
};

let checkFoto = (id) => {
  var url = path.join(__dirname, "..//public//img//seguridad//");
  var fototemporal = url + id + "-temp" + ".jpg";
  var fotolocal = url + id + ".jpg";

  return new Promise((res, rej) => {
    var data = new URLSearchParams();
    data.append("face1", fotolocal);
    data.append("face2", fototemporal);

    console.log("data", data);
    fetch("https://theface-api.herokuapp.com/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: data
    })
      .then(res => {
        return res.json();
      })
      .then(async data => {
        console.log(data);
        if (data.isIdentical == true) {
          console.log("son identicas");
          console.log(data.confidence);
          res(true);
        } else {
          console.log("no son iguales");
          res(false);
        }
      })
      .catch(function(error) {
        console.log(error);
        res(false);
      });
  });
};

var enviarMail = (url, id) => {
  return new Promise(async (res, rej) => {
    var usuario = await pool.query("select * from usuario where documento=?", [
      id
    ]);
    var usuario = usuario[0];
    console.log(usuario.email);
    let transporter = nodeMailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "idevelopcomunidad@gmail.com",
        pass: "idevelop2019"
      }
    });

    let mailOptions = {
      from: '"Tine" <Tine@gmail.com>', // sender address
      to: usuario.email, // list of receivers
      subject: "Alerta", // Subject line
      html: "<h1>Alerta</h1>",
      attachments: [
        {
          filename: "imagen.jpg",
          content: fs.createReadStream(url)
        }
      ]
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        res(false);
      } else {
        console.log("mensaje enviado correctamente");
        res(true);
      }
    });
  });
};

exports.Alta_asistencia = async function(req, res) {
  var fecha = req.param("fecha");
  var foto = req.param("foto");
  var id = req.param("empleado_id");
  var tipo = req.param("estado");
  var empresa_id = req.param("empresa_id");
    
  await pool.query(
    "INSERT INTO asistencia (`fecha`,`foto`,`empleado_id`,`tipo`,`empresa_id`) VALUES (?,?,?,?,?)",
    [fecha, foto, id, tipo, empresa_id]
  );

  var url = path.join(__dirname, "..//public//img//");
  var fototemporal = url + id + "-temp" + ".jpg";
  var fotolocal = url + id + ".jpg";

  console.log("fotolocal", fotolocal);
  console.log("fotoTemporal", fototemporal);


  fs.writeFile(fototemporal, foto, "base64", err => {
    console.log("errorr: ", err);
    if (!err) {
      checkFoto(id).then(retorno => {
        console.log("retorno", retorno);
        if (retorno) {
          console.log("se checkeo que es igual");
        } else {
          enviarMail(fototemporal, empresa_id).then(data => {
            if (data) {
              console.log("se envio el mail ");
            }
            fs.unlinkSync(fototemporal);
          });
        }
      });
    }else{
      console.log(err);
    }
  });
  res.send(
    JSON.stringify({
      retorno: true,
      mensaje: "asistencia ingresada correctamente"
    })
  );
};

exports.misEmpleados = async function(req, res) {
  var id = req.param("documento");
  const sql = await pool.query(
    "SELECT u.*, emp.* FROM usuario as u, empresa_empleado as empE, empleado as emp WHERE emp.id=u.documento AND u.documento=empE.empleados_id and empE.Empresa_id=?",
    [id]
  );
  res.send(JSON.stringify({ filas: sql }));
};

exports.asistencias = async function(req, res) {
  var id = req.param("documento");
  const sql = await pool.query(
    "SELECT asi.* FROM asistencia as asi, empresa_empleado as empE  WHERE asi.empleado_id=empE.empleados_id AND empE.Empresa_id=?",
    [id]
  );
  res.send(JSON.stringify(sql));
};
