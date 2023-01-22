const pool = require("../../Services/pool");



module.exports = {

    async verificaFasesAcesso(req, res) {

        const comissao = req.session.comissao

        pool.query("select id_fase from appDiope.tb_acesso_fases where comissao= ?", [comissao], (error, response) => {

            if (error) {
                res.status(500).send({ status: 500, msg: "houve um erro ao recuperar os acesso, por favor tente novamente", action: "reload" })
            } else {
                res.status(200).send(response)
            }


        })
    },
    async verificaAcessoFase(fase, comissao) {
        return await new Promise((resolve, reject) => {

            pool.query("select id_fase from appDiope.tb_acesso_fases where comissao= ? and id_fase = ?", [comissao, fase], (error, response) => {

                if (error) {
                    resolve(false)
                } else {
                    if (response.length > 0) {
                        resolve(true)
                    } else {
                        resolve(false)
                    }
                }
            })
        })
    },
    async verificaAcessoPrefixo(fase, protocolo) {
        return await new Promise((resolve, reject) => {

            pool.query("select id_fase from appDiope.tb_acesso_fases where comissao= ? and id_fase = ?", [comissao, fase], (error, response) => {

                if (error) {
                    resolve(false)
                } else {
                    if (response.length > 0) {
                        resolve(true)
                    } else {
                        resolve(false)
                    }
                }
            })
        })
    }
}