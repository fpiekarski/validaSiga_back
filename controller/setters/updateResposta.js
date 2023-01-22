const retornaStatusProtocolo = require("../getters/retornaStatusProtocolo");
const pool = require("../../Services/pool");
const retornaPrtcPergunta = require("../util/retornaPrtcPergunta");
const verificaFasePergunta = require("../util/verificaFasePergunta");
const axios = require('axios')
const https = require('https')
module.exports = {

    async updateResposta(req, res) {
        const { id, resposta } = req.body
        const protocolo = await retornaPrtcPergunta.getProtocolo(id)
        const statusAtual = await retornaStatusProtocolo.retornaStatusAtual(protocolo.msg[0].nr_siga)
        const permite = await verificaFasePergunta.permiteEdicaoPergunta()
        if (statusAtual) {
            const verifica = permite.msg.find(k => k.id == statusAtual.msg[0].cd_status)
            if (!verifica || !verifica.permite) {
                res.status(401).send({ status: 401, msg: "Etapa atual não permite edição das respostas" })
                return false
            }
            if (statusAtual.msg[0].pref_slc != req.session.prefixo && !req.session.teste.find(o => o.chave == req.session.chave)) {
                res.status(401).send({ status: 401, msg: "Somente funcionários do prefixo de origem do protocolo, podem editar as respostas" })
                return false
            }
        }
        const retorno = await requestUpdateQuestion(id, resposta)
        if (!retorno) {
            res.status(500).send({ msg: "Houve um erro não identificado, por favor tente novamente" })
        } else {
            pool.query("insert into appDiope.tb_log_perguntas (id_pergunta, cd_prc, chave, datetime,tx,ip) values(?,?,?,now(),?,?)", [id, protocolo.msg[0].nr_siga, req.session.chave, resposta, req.session.ip], (error, response) => {
                if (error) {
                    console.log(error)
                }
                res.status(200).send({ msg: "resposta atualizada com sucesso" })
            })
        }
    }
}

async function requestUpdateQuestion(id, resposta) {

    const url = `https://pxl0hosp0266.dispositivos.bb.com.br/api/siga/alteraresposta/`
    return await axios({
        method: 'post',
        url: url,
        strictSSL: false,
        data: { id, texto: resposta },
        json: true,
        httpsAgent: new https.Agent({
            rejectUnauthorized: false
        }), validateStatus: function (status) {

            if (status < 300) {
                return true
            }
        }
    }).then(o => {
        console.log(o.status)
        return true
    }).catch(err => {
        console.log(err)
        return false
    })
}