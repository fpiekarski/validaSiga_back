const axios = require ('axios');
const https = require('https')
const pool = require('../../Services/pool')
const makeLog = require('./makeLog')
module.exports = {
    async retornaPrefixosDiope(req,res) {
        var header = req.headers
        var objetoHeader = {};

        objetoDados = [];
        objetoHeader.cookie = header.cookie
        const query =  "SELECT NM_UOR,CD_DEPE_UOR,CD_UOR_VCLD FROM DB2UOR.VCL_UOR A LEFT JOIN DB2UOR.UOR B ON A.CD_UOR_VCLD = B.CD_UOR WHERE A.CD_UOR_VCLR = 19982 AND A.CD_TIP_VCL = 9191 AND B.CD_ITEM_AQTT_UOR = 919 AND CD_TIP_UOR = 4"
        const url = process.env.URL_API_DB2
        return await axios({
            method: 'post',
            url: url,
            headers: objetoHeader,
            data:{query},
            strictSSL: false,
            json: true,
            httpsAgent: new https.Agent({
                rejectUnauthorized: false
            }),validateStatus:function(status){

                if(status < 501){
                    return true
                }

            }
        }).then(async response => {

            res.status(200).send(response.data)


        }).catch(erro=>{
            console.log(erro)
        })

    },
    async retornaPrefixoSubordinado(req,res) {
        var header = req.headers
        var objetoHeader = {};

        objetoDados = [];
        objetoHeader.cookie = header.cookie
        const query =  "select * from appDiope.tb_prf_sub "
        pool.query(query,(err, response)=>{
            if(err){
                res.status(500).send({msg:"houve um erro ao recuperar os dados, por favor tente novamente"})
                makeLog.gravaLog(req,"erro ao recuperar prefixo", "")
            }else{
                res.status(200).send(response)
            }

        })
    }
}