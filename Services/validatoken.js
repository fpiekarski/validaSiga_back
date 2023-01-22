
const axios = require('axios');
const https = require('https');
require('dotenv').config();
module.exports = {
    async validaToken(req, res, next) {
        var header = req.headers
        var objetoHeader = {};

        objetoDados = [];
        delete objetoHeader["content-length"]
        objetoHeader.cookie = header.cookie
        objetoHeader.host = "sso13.intranet.bb.com.br";
        
        if (!req.cookies.BBSSOToken) {
        
            res.status(200).send({action:"redirect", host:"https://redediope.intranet.bb.com.br/validasiga", erro: "Efetue login na intranet e tente novamente" });

            return false;
        }
    
        objetoHeader["user-agent"] = "Mozilla/5.0 (Windows NT 10.0; WOW64; rv:60.0) Gecko/20100101 Firefox/60.0"
        var endereco = process.env.URL_AUTENTICA //era = https://sso13.intranet.bb.com.br/sso/identity/json/attributes - alterado 11-11-2019
      
        return await axios({
            method: 'GET',
            headers: objetoHeader,
            url: endereco,
            strictSSL: false,
            json: true,
            httpsAgent: new https.Agent({
                rejectUnauthorized: false
            })
        }).then(async response => {
            if (response.status > 300) {
                res.charset = 'UTF-8';
                  res.status(401).send({msg:'Acesso negado', status:401, action:"redirect"})
                return false
            } else {
                const usuario = response.data.attributes;
                //console.log(usuario)
                for await (objeto of usuario) {
                    if (objeto.name == "cd-cmss-usu") {
                        req.sessionStore.comissao = objeto.values[0]
                        req.session.comissao = objeto.values[0]
                    }
                    if (objeto.name == "chaveFuncionario") {
                        req.sessionStore.chave = objeto.values + ""
                        req.session.chave = objeto.values + ""
                    }
                    if (objeto.name == "cd-pref-depe") {
                        req.sessionStore.prefixo = objeto.values[0]
                        req.session.prefixo = objeto.values[0]
                    }
                    if (objeto.name == "nm-idgl") {
                        req.sessionStore.nome = objeto.values[0]
                        req.session.nome = objeto.values[0]
                    }
                    if (objeto.name == "prefixoDiretoria") {
                        req.session.prefixoDiretoria = objeto.values
                    }
                    if (objeto.name == "cd-eqp") {
                        req.session.prefixoDiretoria= objeto.values[0]
                    }
                    if(objeto.name == "tx-cmss-usu"){
                        req.session.tx_comissao= objeto.values[0]
                    }
                }   
                if (req.session.prefixoDiretoria == 9600) {
                       next();
                } else {
                    const funci = req.session.chave
                     res.status(401).send({ erro: "Seu prefixo não está autorizado a utilizar essa ferramenta, voce será redirecionado" , "funcionario" : funci})
                }
            }
        }).catch(err => {

            var prf = req.session.prefixo ? req.session.prefixo : null
            const funci = req.session.chave ? req.session.chave : null
            const ip = req.session.ip
            var sumula = req.session.sumulaCplt ? req.session.sumulaCplt : null
            res.status(200).send({action:"redirect",  host:"https://redediope.intranet.bb.com.br/validasiga", erro: "Efetue login na intranet e tente novamente" });
            //  res.status(301).redirect("https://login.intranet.bb.com.br/sso/XUI/#login/&goto=https://" + req.headers.host + req.url)
        })
    }
}
