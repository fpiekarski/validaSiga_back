const pool = require("../../Services/pool");



module.exports = {

    inputDemandado(prefixo, protocolo, idAndamento) {
        return new Promise((resolve, reject) => {

            pool.query("insert into appDiope.tb_prf_demandado (id_andamento,prf_demandado, cd_prtc) values(?,?,?)", [idAndamento, prefixo, protocolo], (err, response) => {

                if (err) {
                    resolve(false)
                } else {
                    resolve(true)
                }

            })
        })

    },
    validaPrfDemandado(idAndamento, prefixoAtual) {
        return new Promise((resolve, reject) => {

            pool.query("select * from appDiope.tb_prf_demandado where idAndamento = ? and prf_demandado = ?", [idAndamento, prefixoAtual], (err, response) => {

                if (err) {
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
    updatePrfDemandado(idAndamento) {
        return new Promise((resolve, reject) => {

            pool.query("update appDiope.tb_prf_demandado set respondido = 1 where idAndamento = ?", [idAndamento, prefixoAtual], (err, response) => {

                if (err) {
                    resolve(false)
                } else {
                    resolve(true)
                }

            })
        })
    }


}