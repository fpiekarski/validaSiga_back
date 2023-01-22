require('dotenv').config();

const pool = require('./pool');
const database = process.env.DATABASE
module.exports = {


    async verificaAcesso(req, res) {
        const usuario ={
            chave:req.session.chave,
            prefixo:req.session.prefixo,
            equipe:req.session.equipe,
            comissao: req.session.comissao,
            nome:req.session.nome
        }
        if(req.session.log){
            res.status(200).send({msg:'Logado com sucesso', status:200, action:"load",user:usuario})
            return false
        }
        pool.query(`insert into ${database}.log_acesso (chave,ip,prefixo, data) values(?,?,?,now())`,[req.session.chave, req.session.ip, req.session.prefixo ],(err, response)=>{
            if(err){
                console.log(err)
                if(!req.session.reload){
                    req.session.reload = 1
                }
                req.session.reload ++
                if(req.session.reload > 3){
                    res.status(401).send({msg:'Acesso negado', status:401, action:"redirect"})
                }else{

                res.status(500).send({msg:'Houve um erro ao recuperar os dados', host:"https://redediope.intranet.bb.com.br/validasiga", status:500, action:"reload"})
                }
            }else{
                const prefixos=[3901,1962,1908,9600,4011]
                // :if (prefixos.find(l=> l == req.session.prefixo)){
                 if(req.session.prefixoDiretoria == 9600 ||  req.session.prefixo == 4011){
                    req.session.log = true
                    res.status(200).send({msg:'Logado com sucesso', status:200, action:"load", user:usuario})
                }else{
                    res.status(401).send({msg:'Acesso negado', status:401, host:"https://diope.bb.com.br", action:"redirect"})
                }
            }

        })
        
    }

}