const axios = require('axios');
const { copyFileSync } = require('fs');
const https = require('https')
require('dotenv').config();
const pool = require('../../Services/pool');
const retornaDestinatario = require('./retornaDestinatario');
const teste = false
module.exports = {
    async SendMail(req, destinatarios, html, tx, titulo, protocolo, id) {
        const enviado = []
        var nome = ""
        var destinos = ""
        var copia = ""
        for await (let d of destinatarios) {

            if (destinos != "") {
                destinos += ", "
            }

            if (enviado.find(o => o.destino == d.destino)) {
                console.log("duplicado", d.destino)
                continue
            }
            if (!d.equipe || d.equipe == 0) {

                nome = await retornaDestinatario.retornaNome(d.destino)
            }
            console.log(nome)
            console.log(d.destino)
            // destinos += `${d.destino}@bb.com.br`
            if (enviado.find(o => o.destino == d.destino)) {
                console.log("duplicado", d.destino)
                continue
            }
            enviado.push(d)
            if(teste){
                destinos += `${req.session.chave}@bb.com.br`
            }else{

                if (!d.equipe || d.equipe == 0 && !d.copia) {
                    destinos += `${d.destino}@bb.com.br`
                } else {
                if (copia != "") {
                    copia += ", "
                }
                if (!d.equipe) {
                    copia += `${d.destino}@bb.com.br`
                }else{

                    copia += d.destino
                }
            }
            }
            // enviado.push({ destino: req.session.chave })
            const { chave, tx_comissao, prefixo } = req.session
            const nomeUser = req.session.nome.toUpperCase()
            var protocoloReg = new RegExp('{protocolo}', "g")
            var tx_comissaoReg = new RegExp('{tx_comissao}', "g")
            var chaveReg = new RegExp('{chave}', "g")
            var regId = new RegExp('{id}', "g")
            var nomeReg = new RegExp('{nome}', "g")
            var nomeUserReg = new RegExp('{nomeUser}', "g")
            var prefixoReg = new RegExp('{prefixo}', "g")
            var chaveGsol = new RegExp('{chaveGsol}', "g")
            // protocolo.replace(protocoloReg,protocolo)
            // protocolo.replace(tx_comissaoReg,tx_comissao)
            // protocolo.replace(chaveReg,chave)
            // protocolo.replace(nomeReg,nome)
            // protocolo.replace(prefixoReg,prefixo)
            html = html.replace(protocoloReg, protocolo)
            html = html.replace(tx_comissaoReg, tx_comissao)
            html = html.replace(chaveReg, chave)
            html = html.replace(nomeReg, nome)
            html = html.replace(nomeUserReg, nomeUser)


            html = html.replace(prefixoReg, prefixo)
            html = html.replace(chaveGsol, d.destino)
            html = html.replace(regId, id)
            titulo = titulo.replace(protocoloReg, protocolo)
            titulo = titulo.replace(tx_comissaoReg, tx_comissao)
            titulo = titulo.replace(chaveReg, chave)
            titulo = titulo.replace(nomeReg, nome)
            titulo = titulo.replace(prefixoReg, prefixo)
            tx = tx.replace(protocoloReg, protocolo)
            tx = tx.replace(tx_comissaoReg, tx_comissao)
            tx = tx.replace(chaveReg, chave)
            tx = tx.replace(nomeReg, nome)
            tx = tx.replace(prefixoReg, prefixo)
            // for(let c in copias){
            //     ccs += `${c}@bb.com.br`
            // }
            // continue
        }
        const dados = {
            from: process.env.EMAIL,
            to: destinos,
            subject: titulo,
            cc:copia,
            text: tx,
            html: html,
            title: titulo,
            id_ferramenta: 1
        }

        var geters = new Array();
        const objetoHeader = {}
        objetoHeader.cooki = req.headers.cookie
       
        const endereco = process.env.URL_MAIL
        console.log("entrour")
        await axios({
            method: 'post',
            url: endereco,
            data: dados,
            headers: objetoHeader,
            strictSSL: false,
            json: true,
            httpsAgent: new https.Agent({
                rejectUnauthorized: false
            })
        }).then(data => {
            console.log(data.data)
            return true
        }).catch(err => {
            console.log(err)
            return false
        })
        return true
    }
}
