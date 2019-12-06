const express = require("express");
const app = express();
const morgan = require("morgan");
const expresshbs = require("express-handlebars");
const path = require("path");
const flash = require("connect-flash");
const session = require("express-session");
const MYSQStore = require("express-mysql-session");
const passport = require("passport");
const { database } = require("./keys");
const bodyParse = require("body-parser");
const hbs = require("handlebars");
var cors = require("cors");
app.use(cors());
var paginate = require("handlebars-paginate");
hbs.registerHelper('paginate', paginate);

hbs.registerHelper("dateFormat", require("handlebars-dateformat"));
hbs.registerHelper("ifCond", function(v1, operator, v2, options) {
  switch (operator) {
    case "==":
      return v1 == v2 ? options.fn(this) : options.inverse(this);
    case "===":
      return v1 === v2 ? options.fn(this) : options.inverse(this);
    case "!==":
      return v1 !== v2 ? options.fn(this) : options.inverse(this);
    case "<":
      return v1 < v2 ? options.fn(this) : options.inverse(this);
    case "<=":
      return v1 <= v2 ? options.fn(this) : options.inverse(this);
    case ">":
      return v1 > v2 ? options.fn(this) : options.inverse(this);
    case ">=":
      return v1 >= v2 ? options.fn(this) : options.inverse(this);
    case "&&":
      return v1 && v2 ? options.fn(this) : options.inverse(this);
    case "||":
      return v1 || v2 ? options.fn(this) : options.inverse(this);
    default:
      return options.inverse(this);
  }
}); //settings

hbs.registerHelper("pagAsis", function(cant) {
  const element = "";
  for (let index = 0; index < cant; index++) {
    const element = items.map(
      item => "<li class=page-item><a class=page-link>" + index + "</a></li>"
    );
  }
  return element;
});

app.set("port", process.env.PORT || 4005);

app.set("views", path.join(__dirname, "views"));

app.engine(
  ".hbs",
  expresshbs({
    defaultLayout: "main",
    layoutsDir: path.join(app.get("views"), "layouts"),
    partialsDir: path.join(app.get("views"), "partials"),
    extname: ".hbs",
    helpers: require("./lib/handlebars")
  })
);

//app.set(require("express-paginatorjs"), "paginator");

app.set("view engine", ".hbs");
app.set("view engines", hbs);

//middleware
app.use(
  session({
    secret: "faxmysqlnodesession",
    resave: false,
    saveUninitialized: false,
    store: new MYSQStore(database)
  })
);
app.use(morgan("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParse.urlencoded({ limit: "50mb" }, { extends: false }));

//static file image

app.use(express.static(path.join(__dirname, "public")));

//inicializacion
require("./lib/passport");

//global variable

app.use((req, res, next) => {
  app.locals.success = req.flash("success");
  app.locals.message = req.flash("message");
  app.locals.user = req.user;
  next();
});

app.use("/api", require("./routes/api")); //url que devuelta solo objetos json APIREST

app.use(require("./routes/web")); //llamada desde la web que devuelve vistas hbs

//public
app.use(express.static(path.join(__dirname, "public")));

//starting the server
app.listen(app.get("port"), () => {
  console.log("Server on port ", app.get("port"));
});
