const pool2 = require("../../Services/pool2");
const pool = require('../../Services/pool')

module.exports = {


    async verificaPermissao(req, res) {

        const permite = await retornaPermissao()

        res.status(200).send(permite)

    }, async getProtocolo(id){
        return await getProtocolo(id)
    }

}
async function getProtocolo(id) {
    return new Promise((resolve, reject) => {
        pool2.query(`select nr_siga from siga.FormularioResposta where id = ?`, [id], (err, response) => {
            if (err) {

                console.log(err)

                resolve({ status: 500, msg: "houve um erro não identificado, por favor tente novamente" })

            } else {
                resolve({ status: 200, msg: response })
            }
        })
    })
}
async function retornaPermissao() {

    const pergunta = await getProtocolo(42)
    console.log(pergunta)
    return new Promise((resolve, reject) => {
        pool.query(`select * from appDiope.fase_edit_pergunta`,  (err, response) => {
            if (err) {
                resolve({ status: 500, msg: "houve um erro não identificado, por favor tente novamente" })

            } else {
                resolve({ status: 200, msg: response })
            }
        })
    })

}


