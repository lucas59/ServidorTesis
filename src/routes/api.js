const express = require("express");
const router = express.Router();
const apiControlador = require("../controladores/api.controlador");
const bodyParser = require('body-parser');
const http = require("http");

const path = require("path");
const multer = require('multer');
const storage = multer.diskStorage({
    destination: path.join(__dirname, "../public/img/perfiles"),
    filename: (req, file, cb) => {
        const { documento } = req.body;
        console.log('documento', req.body);
        cb(null, documento + path.extname(file.originalname).toLocaleLowerCase());
    }
});



router.get('/', apiControlador.inicio);
router.post('/user', apiControlador.user);
router.post('/userEmpresa', apiControlador.userEmpresa);
router.post('/desactivar', apiControlador.desactivar);
router.post('/login', apiControlador.login);
router.post('/update', apiControlador.updatePerfil);
router.post('/login_tablet', apiControlador.login_tablet);
router.post('/signup', apiControlador.signup);
router.post('/signup2', apiControlador.signup2);
router.post('/signup2Empresa', apiControlador.signup2Empresa);
router.post('/Alta_tarea', apiControlador.Alta_tarea);
router.post('/Alta_asistencia', apiControlador.Alta_asistencia);
router.post('/Modificar_tarea', apiControlador.Modificar_tarea);
router.post('/EliminarTarea', apiControlador.EliminarTarea);
router.post('/Tareas/ListaTareas', apiControlador.ListaTareas);
router.post('/Tareas/ListaEmpresas', apiControlador.ListaEmpresas);
router.post('/Tareas/ListaAsistencias', apiControlador.ListaAsistencias);
router.get('/misEmpleados', apiControlador.misEmpleados);
router.get('/listaAsistencias', apiControlador.asistencias);
router.post('/configuraciones_empresa', apiControlador.configuraciones_empresa);
router.post('/fotoSeguridad', apiControlador.fotoSeguridad);

module.exports = router;
