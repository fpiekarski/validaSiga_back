const { default: axios } = require("axios")
const https = require('https')


module.exports= {

    async consultaAnexos(req,res){

        const {protocolo} = req.body
        const url = `https://redediope.intranet.bb.com.br/apps/siga/ajax/anexoIncluido.ajax.php?protocolo=`
        return await axios({
            method: 'GET',
            url: url+protocolo,
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
    }

}