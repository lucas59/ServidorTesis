const express = require("express");
const router = express.Router();
const apiControlador = require("../controladores/api.controlador");

router.get('/',apiControlador.inicio);
router.post('/login',apiControlador.login);router.post('/signup',apiControlador.signup);
router.post('/Alta_tarea',apiControlador.Alta_tarea);




module.exports=router;
