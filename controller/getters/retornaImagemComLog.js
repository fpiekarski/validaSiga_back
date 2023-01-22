require('dotenv').config();
const path = require('path')
const pool = require('../../Services/pool');
const database = process.env.DATABASE
const axios = require('axios')
const https = require('https')
module.exports = {

    async sendImage(req, res) {
       const {protocolo} = req.query
       console.log(protocolo)
       const dados = protocolo.split("@")
       var chave = ""
       if (req.cookies.BBSSOToken) {

        const login = await getLogin(req)
        if(login){
            chave = login.authResponse.chave
        }
       }
        pool.query(`insert into ${database}.tb_gsol_prtc (prtc, original,lido,chave, id_andamento) values(?,?,?,?,?)`,[dados[0],dados[1],1, chave, dados[2] ],(err, response)=>{
            if(err){
                console.log(err)
            }
                    res.status(200).sendFile(path.resolve("public","diope.png"))
        })
    }
}
async function getLogin(req){
    var objetoHeader = {};
    objetoHeader.cookie = req.headers.cookie
    
    return await axios({
        method: 'GET',
        headers: objetoHeader,
        url: process.env.API_LOGIN,
        strictSSL: false,
        json: true,
        httpsAgent: new https.Agent({
            rejectUnauthorized: false
        })
    }).then(async response => {
        
      return response.data  
      
    })

}