const pool2 = require("../../Services/pool2");
const pool = require("../../Services/pool");
const retornaStatusProtocolo = require("../getters/retornaStatusProtocolo");
const acessControl = require("./acessControl");
const sendMail = require("./sendMail");
const axios = require('axios')
const https = require('https');
const retornaTextoEmail = require("./retornaTextoEmail");
const retornaDestinatario = require("./retornaDestinatario");
const retornaFasesPossiveis = require("../getters/retornaFasesPossiveis");
const getPrefixoAutorizado = require("./getPrefixoAutorizado");
const controllerPrefixoDemandado = require("./controllerPrefixoDemandado");
const makeLog = require("./makeLog");
require('dotenv').config();
module.exports = {
    async retornaStatus(req, res) {
        const { protocolo } = req.body
        const status = await retornaStatusProtocolo.retornaStatus(protocolo)
        // pool.query(`select A.*, B.tx_status from appDiope.tb_status_prc A left join appDiope.tip_status B on A.cd_status = B.id where cd_prc = ?`, [protocolo], (err, response) => {
        if (status.status == 500) {
            console.log(err)
            res.status(500).send(status)
        } else {
            res.status(200).send(status.msg)
        }
        // })
    },
    async retornaStatusAtual(req, res) {
        const { protocolo } = req.body
        const status = await retornaStatusProtocolo.retornaStatusAtual(protocolo)
        // pool.query(`select A.*, B.tx_status from appDiope.tb_status_prc A left join appDiope.tip_status B on A.cd_status = B.id where cd_prc = ?`, [protocolo], (err, response) => {
        if (status.status == 500) {
            console.log(err)
            res.status(500).send(status)
        } else {
            res.status(200).send(status.msg)
        }
        // })
    },
    async updateStatus(req, res) {
        const { protocolo, status, obs } = req.body
        var gsol = ""
        var msgResposta = ""
        const prtcAtual = await retornaStatusProtocolo.retornaStatusAtual(protocolo)
        const prtc = await retornaStatusProtocolo.retornaProtocolo(protocolo)
        const destinatarios = await retornaDestinatario.retornaDestinatarios(req, status, protocolo, prtc.pref_slc)
        if (!prtcAtual.msg[0]) {
            prtcAtual.msg.push({ cd_status: 0 })
        }
        //    return false
        console.log(prtcAtual)
        if (status == prtcAtual.msg[0].cd_status) {
            res.status(401).send({ msg: "atenção, status não permitido" })
            makeLog.gravaLog(req,`${protocolo} - status não permitido ${prtcAtual.msg[0].cd_status} > ${status}`)
            

            return false
        }
        // const fasesPossiveis =await  retornaFasesPossiveis.getFasesPossiveisInterna(prtcAtual.msg[0].cd_status)

        // if(!fasesPossiveis.find(o=> o.fase_liberada == status)){
        //     res.status(401).send({ msg: "atenção, status não permitido" })

        //     return false
        // }
        if (prtcAtual.msg[0].cd_status == status) {
            res.status(401).send({ msg: "atenção, status não permitido" })
            return false
        }
        if (prtcAtual.msg[0].cd_status != 0 && prtcAtual.msg[0].cd_status != 1 && status > prtcAtual.msg[0].cd_status - 1 && status < 5) {
            res.status(401).send({ msg: "atenção, status não permitido" })
            return false
        }
        const verificaPrefixo = await verificaPrefixoPorFase(req, status, protocolo)
        const verificaAcesso = await acessControl.verificaAcessoFase(status, req.session.comissao)
        const teste = await retornaChavesTeste()
        if (status == 3) {
            gsol = req.body.gsol
            if (!gsol || gsol == "") {
                res.status(401).send({ status: 401, msg: "Atenção, você não selecionou um gerente de Soluções para despachar pela DIOPE" })
                return false
            }
        }

     
        if ((!verificaPrefixo || !verificaAcesso) && !teste.find(u => u.chave == req.session.chave)) {
            res.status(401).send({ status: 401, msg: "Atenção, você não possui acesso para essa transação" })
            return false
        }
            //return false
        pool.query(`update appDiope.tb_andamentos_prc set vigente = 0 where cd_prc = ?`, [protocolo], (err, response, fields) => {
            if (err) {
                console.log(err)
                res.status(500).send({ msg: "houve um erro não identificado, por favor tente novamente" })
            } else {
                pool.query("insert into appDiope.tb_andamentos_prc (cd_prc, cd_status, datetime,funci,ip,vigente, tx_obs) values(?,?,now(),?,?,1,?)",
                    [protocolo, status, req.session.chave, req.session.ip, obs], async (error, resposta) => {
                        if (error) {
                            console.log(error)
                            const r = await roolbackUpdate(protocolo)
                            console.log(r)
                            res.status(500).send({ msg: "houve um erro ao atualizar por favor tente novamente", status: 500 })
                        } else {
                            console.log(resposta)
                            const id = resposta.insertId
                            if (await updateStatusAtual(protocolo, status, prtcAtual)) {
                              
                                    if (status == 13) {
                                       
                                        controllerPrefixoDemandado.inputDemandado(req.body.prefixo,protocolo,id)
                                    }
                                const tx = await retornaTextoEmail.retornaTexto(status)
                                if (tx.length > 0) {
                                    const e = await sendMail.SendMail(req, destinatarios, tx[0].tx_html, tx[0].tx, tx[0].titulo, protocolo, id)

                                    if (e) {
                                        if (gsol) {

                                            pool.query('insert into appDiope.tb_gsol_prtc (prtc, gsol) values(?,?)', [protocolo, gsol], (err, response) => {
                                                console.log(err)
                                            })
                                        }
                                        res.status(200).send({ msg: "protocolo atualizado com sucesso", status: 200 })
                                    }
                                } else {
                                    res.status(200).send({ msg: "protocolo atualizado com sucesso", status: 200 })
                                }
                                // } else {
                                //     res.status(200).send({ msg: "protocolo atualizado com sucesso", status: 200 })
                                // }
                            } else {
                                res.status(500).send({ msg: "houve um erro ao atualizar por favor tente novamente", status: 500 })
                            }
                        }
                    })
            }
        })
        async function roolbackUpdate(protocolo) {
            return new Promise((resolve, reject) => {
                pool.query("select max(id) as id from  appDiope.tb_andamentos_prc where cd_prc = ? ", [protocolo], (erro, resposta) => {
                    pool.query("update appDiope.tb_andamentos_prc set   vigente = 1 where id = ?", [resposta[0].id], (error, response) => {
                        if (error) {
                            resolve(false)
                        } else {
                            resolve(true)
                        }
                    })
                })
            })
        }
        async function updateStatusAtual(protocolo, status, prtcAtual) {
            const arrayUpdate = [
                {
                    status: 3,
                    rota: "aprovadependencia/",
                    codigoConfirmacao: "3"
                },
                {
                    status: 5,
                    rota: "aprovadiope/",
                },
                {
                    status: 8,
                    rota: "alterastatusconfirmacao/",
                    codigoConfirmacao: 4
                },
                {
                    status: 6,
                    rota: "alterastatusconfirmacao/",
                    codigoConfirmacao: 4
                },
                {
                    status: 7,
                    rota: "alterastatusconfirmacao/",
                    codigoConfirmacao: 4
                },

            ]
            const statusAtual = prtcAtual.cd_status
            if (status == 11) {
                status = 1
            } else if (status == 12) {
                status = 3
            } else if (status == 14) {
                status = 3
            }
            return new Promise((resolve, reject) => {

                pool.query("delete from appDiope.tb_status_prc where cd_prc = ? ", [protocolo], (err, response) => {
                    if (err) {
                        resolve(false)
                    } else {
                        pool.query("insert into appDiope.tb_status_prc (cd_prc, cd_status) values (?,?)", [protocolo, status], async (error, response1) => {
                            if (err) {
                                resolve(false)
                            } else {
                                const updateSiga = arrayUpdate.find(p => p.status == status)
                                if (updateSiga) {
                                    updateSiga.funciResp = req.session.chave
                                    updateSiga.id = protocolo
                                    await updateStatusProtocolo(updateSiga.rota, updateSiga)
                                }
                                if(status == 5){
                                    await updateStatusProtocolo("abreGsv/",{id: protocolo})
                                }
                                resolve(true)
                            }
                        })
                    }
                })
            })
        }
        async function verificaPrefixoPorFase(req, status, protocolo) {
            const prtc = await retornaStatusProtocolo.retornaProtocolo(protocolo)
            if (status == 14) {
                    const autorizado = await getPrefixoAutorizado.recuperaPrfSub(req.session.prefixo)
                    const subordinante = await getPrefixoAutorizado.recuperaPrfPrinc(req.session.prefixo)
                    const st = retornaStatusProtocolo.retornaStatus(protocolo)
                    const atual = st.find(l => l.vigente == 1)
                    const v = await controllerPrefixoDemandado.validaPrfDemandado(atual.id, req.session.prefixo)
                    if (!v && !(autorizado.find(p => p.prf_princ == prtc.pref_slc) || subordinante.find(l => l.prf_sub == prtc.pref_slc))) {
                        res.status(401).send({ status: 401, msg: "Atenção, somente o prefixo demandado pode responder ao questionamento atual" })
                        makeLog.gravaLog(req,`${protocolo} - resposta andamento prefixo não autorizado ${req.sesion.prefixo}`)
                        return false
                    }else{
                        return true
                    }
            } 
            return new Promise((resolve, reject) => {

                pool.query('select restritoPrefixo from appDiope.tip_status where id = ?', [status], async (err, response) => {
                    if (response[0].restritoPrefixo == 2) {
                        if (req.session.prefixo == "9600") {
                            resolve(true)
                        } else {
                            resolve(false)
                        }
                    } else {
                        const autorizado = await getPrefixoAutorizado.recuperaPrfSub(req.session.prefixo)
                        const subordinante = await getPrefixoAutorizado.recuperaPrfPrinc( prtc.pref_slc)
                        if (req.session.prefixo == prtc.pref_slc || autorizado.find(p => p.prf_princ == prtc.pref_slc) || subordinante.find(l => l.prf_sub == prtc.pref_slc)) {
                            resolve(true)
                        } else {
                            resolve(false)
                        }
                    }
                })
            })
        }
    },

}
async function retornaChavesTeste() {
    return new Promise((resolve, reject) => {
        pool.query("select * from appDiope.teste_chaves", (err, response) => {
            resolve(response)
        })
    })
}
async function updateStatusProtocolo(path, objeto, req) {
    const url = process.env.SIGA_API
    
    return await axios({
        method: 'post',
        url: url + path,
        strictSSL: false,
        data: objeto,
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

