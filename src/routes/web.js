const express = require("express");
const router = express.Router();
const usuarioControlador = require("../controladores/usuarioControlador");

router.get('/',usuarioControlador.inicio);
router.get('/login',usuarioControlador.login);
router.get('/singin',usuarioControlador.singin);

//faltan las demas peticiones de la parte de tareas etc



module.exports=router;