module.exports = {
    haySession(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        return res.redirect('/login');
    },
    noHaySession(req, res, next) {
        if (!req.isAuthenticated()) {
            return next();
        }
        return res.redirect('/login');
    }
}