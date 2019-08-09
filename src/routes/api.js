const express = require("express");
const router = express.Router();
const apiControlador = require("../controladores/api.controlador");
const bodyParser = require('body-parser');

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
router.post('/login', apiControlador.login);
router.post('/login_tablet', apiControlador.login_tablet);
router.post('/signup', apiControlador.signup);
router.post('/signup2', apiControlador.signup2);

router.post('/signup2Empresa', apiControlador.signup2Empresa);

router.post('/Alta_tarea', apiControlador.Alta_tarea);
router.post('/Alta_asistencia', apiControlador.Alta_asistencia);

router.post('/Tareas/ListaTareas', apiControlador.ListaTareas);
router.post('/Tareas/ListaEmpresas', apiControlador.ListaEmpresas);

module.exports = router;
