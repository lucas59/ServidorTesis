const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const pool = require("../database");
const helpers = require("./helpers");

passport.use("local.signup", new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, username, password, done) => {
    const { fullname } = req.body;
    const nuevoUsuario = {
        username,
        password,
        fullname
    };
    nuevoUsuario.password = await helpers.encryptPassword(password);
    const result = await pool.query("INSERT INTO users SET ? ", [nuevoUsuario]);
    nuevoUsuario.id = result.insertId;
    return done(null, nuevoUsuario);
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id,done)=>{
const rows = await pool.query("SELECT * FROM users WHERE id = ?",[id]);
done(null,rows[0]);
});


/*
passport.serializeUser((usr,done=>{

}));*/