const express = require("express");
var multer = require('multer');
var upload = multer({dest:'uploads/'});

const { haySession, noHaySession } = require('../lib/session');
const router = express.Router();
const usuarioControlador = require("../controladores/usuarioControlador");

router.get('/', usuarioControlador.inicio);
router.get('/login', noHaySession, usuarioControlador.login);
router.post('/login', noHaySession, usuarioControlador.iniciar);
router.get('/logout', haySession, usuarioControlador.salir);
router.get('/registrarse', noHaySession, usuarioControlador.singin);
router.post('/signup', upload.single('fotoPerfil'), usuarioControlador.registrarse);

router.get('/perfil', haySession, usuarioControlador.perfil);
//recibo los datos

//faltan las demas peticiones de la parte de tareas etc



module.exports = router;