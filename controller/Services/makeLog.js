
const pool = require('../../Services/pool')

module.exports = {
    async gravaLog(req, texto, protocolo=0) {

        const { chave } = req.session
        const rota = req.route.path
        return await new Promise((resolve, reject) => {
            pool.query("insert into appDiope.tb_log_erro (chave, erro, rota, protocolo) values(?,?,?)", [chave, texto, rota, protocolo], (err, response) => {
                if (err) {
                    console.log(err)
                    resolve(false)
                } else {
                    resolve(true)
                }
            })
        })
    }
}