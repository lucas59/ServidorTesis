const sql = require('mysql');
const {database} = require('./keys');
const {promisify} = require("util");

const pool = sql.createPool(database);
pool.getConnection((err, connection)=>{
    if(err){
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error("base de datos coneccion cerrada");
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error("ERROR DE CONECCION");
        }
        if (err.code === 'ECONNREFUSED') {
            console.error("BASE DE DATOS REFUSED");
        }
        
    }

    if (connection) {
        console.log('DB conectada');
        return;
    }
});
//esto permite promesas
pool.query = promisify(pool.query)

module.exports = pool;