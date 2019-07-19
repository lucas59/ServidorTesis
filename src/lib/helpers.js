const bcrypt = require("bcryptjs");
const helpers = {};


helpers.encryptPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
};

helpers.compararContraseña = async (password, contraseñaGuardada) => {
    try {
        return await bcrypt.compare(password, contraseñaGuardada);
    } catch (e) {
        console.log(e)
    }
}

module.exports = helpers;