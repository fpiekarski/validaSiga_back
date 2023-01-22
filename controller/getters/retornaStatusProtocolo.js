

const pool = require("../../Services/pool");


module.exports = {

    async retornaStatus(protocolo) {
        return await new Promise((resolve,reject)=>{

            pool.query(`select A.*, B.tx_status from appDiope.tb_andamentos_prc A left join appDiope.tip_status B on A.cd_status = B.id where cd_prc = ?`, [protocolo], (err, response) => {
                if (err) {
                    console.log(err)
                    resolve({status:500, msg: "houve um erro não identificado, por favor tente novamente" })
                } else {
                    resolve({status:200, msg :response})                }
            })
        })
    },
    async retornaStatusAtual(protocolo) {
        return await new Promise((resolve,reject)=>{

            pool.query(`select A.*, B.tx_status, C.* from appDiope.tb_status_prc A left join appDiope.tip_status B on A.cd_status = B.id left join appDiope.tb_sltc C on A.cd_prc
            = C.id where cd_prc = ?`, [protocolo], (err, response) => {
                if (err) {
                    console.log(err)
                    resolve({status:500, msg: "houve um erro não identificado, por favor tente novamente" })
                } else {
                    resolve({status:200, msg :response})                }
            })
        })
    },
    async retornaProtocolo(protocolo){
        return new Promise((resolve,reject)=>{

            pool.query(`SELECT * FROM appDiope.tb_sltc where id = ?`, [protocolo],(err, response)=>{
                if(err){
                    throw new Error("Protocolo não localizado")
                }else{

                    resolve(response[0])  
                }
            })

        })

    }
}