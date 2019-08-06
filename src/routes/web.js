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
        cb(null, documento + path.extname(file.originalname).toLocaleLowerCase());
    }
});

router.get('/', usuarioControlador.inicio);
router.get('/login', noHaySession, usuarioControlador.login);
router.post('/login', noHaySession, usuarioControlador.iniciar);
router.get('/logout', haySession, usuarioControlador.salir);
router.get('/registrarse', noHaySession, usuarioControlador.singin);

router.post('/signup', multer({
    storage,
    limits: { fileSize: 2000000 },
    fileFilter: (res, file, cb) => {
        const type = /jpeg|jpg|png/;
        const mimetype = type.test(file.mimetype);
        const extname = type.test(path.extname(file.originalname));
       // const existe = usuarioControlador.checkUser();
        if (mimetype && extname ) {
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
        if (mimetype && extname ) {
            return cb(null, true);
        }
        return cb('Error: Archivo no valido');
    }
}).single('fotoPerfil'), usuarioControlador.update);



router.get('/perfil', haySession, usuarioControlador.perfil);
//recibo los datos

//faltan las demas peticiones de la parte de tareas etc



module.exports = router;