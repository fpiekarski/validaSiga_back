const pool = require("../../Services/pool");


module.exports = {


    async getFasesPossiveis(req, res) {
        const { status } = req.body

        const possiveis = await retornaFasesPossiveis(status)
        res.status(200).send(possiveis)

    },
    async getFasesPossiveisInterna(status) {

        const possiveis = await retornaFasesPossiveis(status)
       return possiveis

    },
    async getObsNecessaria(req, res) {
       
        pool.query(`select id,obs from appDiope.tip_status `, (err, response) => {
            if (err) {
                console.log(err)

                res.status(500).send({ msg: "houve um erro não identificado, por favor tente novamente" })

            } else {
                res.status(200).send(response)
            }

        })

    }
}
async function retornaFasesPossiveis(status){
    
    return new Promise((resolve, reject)=>{

        pool.query(`select A.*, B.restritoPrefixo as restrito from appDiope.tb_ctrl_btn A left join appDiope.tip_status B on A.fase_liberada = B.id  where A.id_fase =  ? `, [status], (err, response) => {
            if (err) {
                console.log(err)
                
                reject({ msg: "houve um erro não identificado, por favor tente novamente" })
                
            } else {
                resolve(response)
            }
        })

    })
}