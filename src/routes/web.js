const express = require("express");
const { haySession, noHaySession } = require('../lib/session');
const router = express.Router();
const usuarioControlador = require("../controladores/usuarioControlador");
const path = require("path");
const multer = require('multer');

const storage = multer.diskStorage({
    destination: path.join(__dirname, "../public/img/perfiles"),
    filename: (req, file, cb) => {
        const { documento } = req.body;
        console.log('documento', req.body.documento);
        cb(null, documento + path.extname(file.originalname).toLocaleLowerCase());
    }
});


router.get('/', usuarioControlador.inicio);
router.get('/login', noHaySession, usuarioControlador.login);
router.post('/login', noHaySession, usuarioControlador.iniciar);
router.get('/logout', haySession, usuarioControlador.salir);
router.get('/registrarse', noHaySession, usuarioControlador.singin);
router.get('/mail', noHaySession, usuarioControlador.mail);

router.get('/personal', haySession, usuarioControlador.personal);
router.post('/agregarAEmp', haySession, usuarioControlador.agregarAEmp);
router.post('/despedirEmpleado', haySession, usuarioControlador.despedirEmpleado);


router.post('/signup', multer({
    storage,
    limits: { fileSize: 2000000 },
    fileFilter: (res, file, cb) => {
        const type = /jpeg|jpg|png/;
        const mimetype = type.test(file.mimetype);
        const extname = type.test(path.extname(file.originalname));
        // const existe = usuarioControlador.checkUser();
        if (mimetype && extname) {
            return cb(null, true);
        }
        return cb('Error: Archivo no valido');
    }
}).single('fotoPerfil'), usuarioControlador.registrarse);

router.post('/update', multer({
    storage,
    limits: { fileSize: 2000000 },
    fileFilter: (res, file, cb) => {
        const type = /jpeg|jpg|png/;
        const mimetype = type.test(file.mimetype);
        const extname = type.test(path.extname(file.originalname));
        if (mimetype && extname) {
            return cb(null, true);
        }
        return cb('Error: Archivo no valido');
    }
}).single('fotoPerfil'), usuarioControlador.update);

router.get('/perfil', haySession, usuarioControlador.perfil);
//router.get('/empleado/:documento', haySession, usuarioControlador.perfilEmpleado);

router.post('/desactivar', haySession, usuarioControlador.desactivar);
router.post('/resetPass', noHaySession, usuarioControlador.resetPass);

router.get('/busquedaEmpleado', haySession, usuarioControlador.busquedaEmpleado);

router.get('/exportarAsistencias', haySession, usuarioControlador.exportarAsistenciascsv);
router.get('/exportarTareas', haySession, usuarioControlador.exportarTareascsv);

router.get('/exportarAsistenciaspdf', haySession, usuarioControlador.exportarAsistenciaspdf);
router.get('/exportarTareaspdf', haySession, usuarioControlador.exportarTareaspdf);

router.get("/getConfig", haySession, usuarioControlador.getConfig);
router.post("/actualizarConfiguracion", haySession, usuarioControlador.actualizarConfiguracion);


module.exports = router;