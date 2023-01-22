const pool = require('../../Services/pool');
module.exports = {
    async recuperaPrfSub(prf_princ) {
        return await new Promise((resolve, reject) => {
            pool.query('select * from appDiope.tb_prf_sub where prf_princ = ?', [prf_princ], (err, response) => {
                resolve(response)
            })
        })

    },
    async recuperaPrfPrinc(prf_sub) {
        return await new Promise((resolve, reject) => {
            pool.query('select * from appDiope.tb_prf_sub where prf_sub = ?', [prf_sub], (err, response) => {
                resolve(response)
            })
        })

    }

}