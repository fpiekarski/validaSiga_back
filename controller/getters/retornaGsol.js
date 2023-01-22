const  axios  = require("axios")
const https = require('https')
const pool = require("../../Services/pool")


module.exports = {

    async retornaGsol(req, res) {

        pool.query(" SELECT * FROM ARH.gsolucao_9600", (err, response)=>{

            res.status(200).send(response)
        } )
        // var objetoHeader = {}
        // //delete objetoHeader["content-length"]
        // objetoHeader.cookie = req.headers.cookie
        // objetoHeader['Content-Type'] = 'application/json'
        // objetoHeader.Accept= "application/json";


        // //objetoHeader["user-agent"] = "Mozilla/5.0 (Windows NT 10.0; WOW64; rv:60.0) Gecko/20100101 Firefox/60.0"
        // var endereco = process.env.HUMANOGRAMA
        // return await axios({
        //     method: 'GET',
        //     headers: objetoHeader,
        //     url: endereco,
        //     strictSSL: false,
        //     json: true,
        //     timeout:20000,
        //     httpsAgent: new https.Agent({
        //         rejectUnauthorized: false
        //     })
        // }).then(async response => {
        //     const gerentes = response.data.funcionarios.filter(o => o.cargo.nome == "GER SOLUCOES UE")
        //     req.session.gSol = gerentes
        //     res.status(200).send(gerentes)

        // }).catch(erro=>{
        //     console.log(erro)
        // })


    }
}
