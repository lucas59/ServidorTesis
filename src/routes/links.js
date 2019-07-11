const express = require('express');
const router = express.Router();
const pool = require("../database");//conexion a la base de datos


router.get('/add', (req, res) => {
    res.render("links/add");
});


router.post("/add", async (req, res) => {
    try {
        const { titulo, url, descripcion } = req.body;
        const nuevoLink = {
            'title': titulo,
            'url': url,
            'descripcion': descripcion
        };

        await pool.query('INSERT INTO links set ?', [nuevoLink]);
        req.flash("success","Link guardado correctamente");
        res.redirect('/links');
    } catch (err) {
        res.status(err.response.status)
        return res.send(err.message);
    }
});

router.get("/", async (req, res) => {
    const links = await pool.query('SELECT * FROM `links`');
//console.log(links);
    links.forEach(element => {
        console.log("elemento",element.title);
    });
    res.render("links/list", { links });
});

router.get("/delete/:id", async (req, res) => {
    const {id}=req.params;
    pool.query("DELETE FROM links WHERE id = ?",[id]);
    req.flash("success","Link borrado correctamente");
    res.redirect("/links");
});

router.get("/editar/:id", async (req, res) => {
    const {id}=req.params;
    const links = await pool.query("SELECT * FROM links WHERE id = ? ",[id])
    res.render("links/edit",{links: links[0]});
});


router.post("/editar/:id",async (req,res)=>{
const {id} =req.params;
const {titulo, descripcion,url} =req.body;
const nuevoLink = {
    'title':titulo,
    'descripcion':descripcion,
    'url':url
};

await pool.query("UPDATE links SET ? WHERE id = ?",[nuevoLink,id]);

req.flash("success","Link editado correctamente");
res.redirect("/links");


});

module.exports = router;