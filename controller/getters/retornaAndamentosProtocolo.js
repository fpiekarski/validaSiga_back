const pool2 = require("../../Services/pool2");


module.exports= {


async getAndamentosProtocolos(req,res){
    const {protocolo} = req.body

    pool2.query(`SELECT A.id, B.cd_funci_msg, B.mensagem, B.ts_msg FROM siga.tb_sltc A RIGHT JOIN siga.tb_chat B ON B.id_sltc= A.id WHERE A.id = ? ORDER BY id`,[protocolo],(err, response)=>{
        if(err){
            console.log(err)
            
            res.status(500).send({msg: "houve um erro não identificado, por favor tente novamente"})

        }else{
            res.status(200).send(response)
        }

    })

}




}