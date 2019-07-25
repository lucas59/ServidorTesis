const express = require("express");
const router = express.Router();
const apiControlador = require("../controladores/api.controlador");

router.get('/',apiControlador.inicio);
router.post('/login',apiControlador.login);
router.post('/Alta_tarea',apiControlador.Alta_tarea);
router.post('/Tareas/ListaTareas',apiControlador.Listatarea);



module.exports=router;