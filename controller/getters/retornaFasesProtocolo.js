const pool = require("../../Services/pool");


module.exports= {


async getAndamentosProtocolos(req,res){
    const {protocolo} = req.body

    pool.query(`SELECT A.*, B.tx_status, C.nome FROM appDiope.tb_andamentos_prc A LEFT JOIN appDiope.tip_status B ON A.cd_status = B.id 
    LEFT JOIN ARH.arhfot01 C ON A.funci = C.matricula
     WHERE A.cd_prc =? order by A.id `,[protocolo],(err, response)=>{
        if(err){
            console.log(err)
            
            res.status(500).send({msg: "houve um erro não identificado, por favor tente novamente"})

        }else{
            res.status(200).send(response)
        }

    })

}




}