const pool2 = require("../../Services/pool2");
const makeLog = require("../Services/makeLog");


module.exports= {


async getPerguntasProtocolos(req,res){
    const {protocolo} = req.body
const retorno = await retornaPerguntas(protocolo, req)
if(!retorno){

    res.status(500).send({msg: "houve um erro não identificado, por favor tente novamente"})
}else{

    res.status(200).send(retorno)
}
}
,
async  retornaPerguntasProtocolos(protocolo, req){
    if(protocolo.length == 0) return false
    return await new Promise((resolve,reject)=>{
        pool2.query(`SELECT A.id, A.nr_siga,A.id_pergunta, A.resposta, B.texto, B.descricao, B.perspectiva FROM siga.FormularioResposta A LEFT JOIN siga.FormularioPergunta B ON B.id = A.id_pergunta WHERE A.nr_siga in (${protocolo.toString()})`,(err, response)=>{
            if(err){
                console.log(err)
                
                resolve(false)
                makeLog.gravaLog(req,err.sqlMessage,protocolo)
               }else{
                   resolve(response)
               }
           })
   
       })
   }


}
async function retornaPerguntas(protocolo, req){
 return await new Promise((resolve,reject)=>{

     pool2.query(`SELECT A.id, A.nr_siga, A.resposta, B.texto, B.descricao, B.perspectiva FROM siga.FormularioResposta A LEFT JOIN siga.FormularioPergunta B ON B.id = A.id_pergunta WHERE A.nr_siga =?`,[protocolo],(err, response)=>{
         if(err){
             console.log(err)
             
             resolve(false)
             makeLog.gravaLog(req,err.sqlMessage,protocolo)
            }else{
                resolve(response)
            }
        })

    })
}
