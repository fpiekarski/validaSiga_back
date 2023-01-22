const { default: axios } = require("axios")
const https = require('https')


module.exports= {

    async getFunci(req,res){

        const {funci} = req.body
        const objetoHeader = {}
        objetoHeader.cookie = req.headers.cookie
        const url = `https://redediope.intranet.bb.com.br/humanograma/${funci}.json`
        return await axios({
            method: 'GET',
            url: url,
            strictSSL: false,
            json: true,
            headers: objetoHeader,
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