const pool = require("../Services/pool");


module.exports = {


    async setStatusProtocolos(req, res) {
        const { protocolo, obs, status } = req.body
        await updateProtocolo(protocolo, obs, status )
     
       async function verificaStatusAtual(protocolo){
            pool.query("select * from appDiope.tb_andamentos_prc   where cd_prc  = ? and vigente = 1",[protocolo],(error,response)=>{
                const status = response[0].cd_status
                if(status == 11 ){
                    

                }

            })

        }
        async function updateProtocolo(protocolo, obs, status ){
            pool.query(`update appDiope.tb_andamentos_prc set vigente = 0  where cd_prc  = ?`, [protocolo], (err, response) => {
                if (err) {
                    console.log(err)
    
                    res.status(500).send({ msg: "houve um erro não identificado, por favor tente novamente" })
    
                } else {
                    pool.query("insert into appDiope.tb_andamentos_prc (cd_prc,cd_status, datetime, funci, ip, vigente, tx_obs) values(?,?,now(),?,?,?,?)",
                    [protocolo,status,req.session.chave,req.session.ip,1, obs ],(erro , response1)=>{
                        //await verificaStatusAtual(protocolo)
                        res.status(200).send(response)
                    })
                }
            })
        }
    }
}