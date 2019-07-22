const express = require("express");
const router = express.Router();
const apiControlador = require("../controladores/api.controlador");

router.get('/',apiControlador.inicio);
router.post('/login',apiControlador.login);



module.exports=router;