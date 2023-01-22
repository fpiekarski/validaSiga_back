require('dotenv').config();
const pool = require('../../Services/pool');
const database = process.env.DATABASE
module.exports = {
    async retornaTexto(status) {
        return new Promise((resolve, reject) => {
            pool.query(`select * from ${database}.tx_email where id = ?`, [status], (err, response) => {
                if (err) {
                    resolve(err)
                } else {
                    resolve(response)
                }
            })
        })
    }
}