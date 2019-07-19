const express = require("express");

const {haySession, noHaySession} = require('../lib/session');
const router = express.Router();
const usuarioControlador = require("../controladores/usuarioControlador");

router.get('/', usuarioControlador.inicio);
router.get('/login', usuarioControlador.login);
router.post('/login', noHaySession, usuarioControlador.iniciar);
router.get('/logout', usuarioControlador.salir);
router.get('/registrarse', usuarioControlador.singin);
router.post('/signup', usuarioControlador.registrarse);

router.get('/perfil',haySession,usuarioControlador.perfil);
//recibo los datos

//faltan las demas peticiones de la parte de tareas etc



module.exports = router;