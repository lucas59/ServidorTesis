const pool = require("../database");

module.exports = {
    haySession(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        return res.redirect('/');
    },
    noHaySession(req, res, next) {
        if (!req.isAuthenticated()) {
            return next();
        }
        return res.redirect('/');
    } 
}