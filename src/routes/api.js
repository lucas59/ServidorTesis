const express = require("express");
const router = express.Router();
const apiControlador = require("../controladores/api.controlador");

router.get('/',apiControlador.inicio);
router.post('/login',apiControlador.login);
router.post('/signup',apiControlador.signup);



module.exports=router;