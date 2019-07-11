const express = require('express');
const app = express();
const morgan = require('morgan');
const expresshbs = require("express-handlebars");
const path = require("path");
const flash = require("connect-flash");
const session = require("express-session");
const MYSQStore = require("express-mysql-session");
const passport = require("passport");

const { database } = require("./keys")



//settings
app.set('port', process.env.PORT || 4005);
app.set("views", path.join(__dirname, "views"))
app.engine(".hbs", expresshbs({
    defaultLayout: "main",
    layoutsDir: path.join(app.get("views"), "layouts"),
    partialsDir: path.join(app.get("views"), 'partials'),
    extname: ".hbs",
    helpers: require("./lib/handlebars")

}));

app.set("view engine", ".hbs");

//middleware
app.use(session({
    secret: 'faxmysqlnodesession',
    resave: false,
    saveUninitialized: false,
    store: new MYSQStore(database)
}));
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());


//inicializacion
require("./lib/passport");

//global variable

app.use((req, res, next) => {
    app.locals.success = req.flash("success");

    next();
});


//rutas

/*app.use(require("./routes/"));
app.use(require("./routes/autentication"));
app.use('/links', require("./routes/links"));*/

app.use('/api', require("./routes/api")); //url que devuelta solo objetos json APIREST

app.use(require("./routes/web")); //llamada desde la web que devuelve vistas hbs



//public
app.use(express.static(path.join(__dirname, "public")));


//starting the server
app.listen(app.get('port'), () => {
    console.log("Server on port ", app.get('port'));
});
