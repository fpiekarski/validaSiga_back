const pool = require("../../Services/pool");
const getPrefixoAutorizado = require("../Services/getPrefixoAutorizado");
const makeLog = require("../Services/makeLog");
const retornaPerguntasProtocolo = require("./retornaPerguntasProtocolo");

module.exports = {

    async recuperaProtocolos(req, res) {
        const { status, protocolo } = req.query
        const autorizados = await getPrefixoAutorizado.recuperaPrfSub(req.session.prefixo)
        const subordinante = await getPrefixoAutorizado.recuperaPrfSub(req.session.prefixo)
        var filtoPref = req.session.prefixo != 9600 && req.session.prefixo != 4011 ? `and (pref_slc = ${req.session.prefixo}` : ""
        if(filtoPref !="" && autorizados){
            autorizados.map(o=>{
                filtoPref += ` or pref_slc = ${o.prf_sub}`
            })
        }
        if(filtoPref !="" && subordinante){
            subordinante.map(o=>{
                filtoPref += ` or pref_slc = ${o.prf_princ}`
            })
        }
        if(filtoPref!=""){
            filtoPref+=")"
        }
        const st = status.replace(/[aA-zZ]/g, "")
        const q = protocolo !=0? ` A.id = ${protocolo} `:`prc_confirm in(${st.toString()})`
        pool.query(`SELECT A.*, B.cd_status, C.nome, D.tx_tipo, E.tx_status, H.NOME_GUERRA_215 AS NOME, I.gsol FROM appDiope.tb_sltc A  LEFT JOIN appDiope.tb_status_prc B ON A.id = B.cd_prc 
        LEFT JOIN  appDiope.Produto C ON C.produtoId = A.cd_assunto  LEFT JOIN appDiope.tb_tipo D ON A.tipo = D.id   
        LEFT JOIN appDiope.tip_status E ON B.cd_status = E.id
        left join appDiope.tb_nomeguerra H on A.cd_funci_rsp_incl = H.matricula
        left join (SELECT * FROM appDiope.tb_gsol_prtc GROUP BY prtc)  I on A.id = I.prtc
        WHERE (${q} AND A.tipo IN (1,3,2,4) and A.prc_confirm in (2,3)  ${filtoPref} ) order by A.id `, async (err, response) => {
                // ${st}
            if (err) {
                console.log(err)
                res.status(500).send({ msg: "houve um erro não identificado, por favor tente novamente" })
            } else {
                const protocolos = []
                response.map(o => {
                    if (o.tx_status == null) {
                        o.tx_status = "Pendente de Validação pelo Comitê da Dependência"
                    }
                    protocolos.push(o.id)
                })
                const perguntasProtocolos = await retornaPerguntasProtocolo.retornaPerguntasProtocolos(protocolos,req)
                for (let p of response) {
                    const perguntas = perguntasProtocolos.filter(o => o.nr_siga == p.id)
                    p.perguntas = perguntas
                }
                res.status(200).send(response)
            }
        })
    },
    async countProtocolos(req, res) {
        const { status, protocolo } = req.query
        const q = protocolo !=0? ` A.id = ${protocolo} and`:""
        const filtoPref = req.session.prefixo != 9600 && req.session.prefixo != 4011 ? `and pref_slc = ${req.session.prefixo}` : ""
        // const st = status.replace(/[aA-zZ]/g, "")
        pool.query(`SELECT count(*) as quantidade, D.tx_tipo as tipo, D.id  FROM appDiope.tb_sltc A  LEFT JOIN appDiope.tb_status_prc B ON A.id = B.cd_prc 
            LEFT JOIN  appDiope.Produto C ON C.produtoId = A.cd_assunto  LEFT JOIN appDiope.tb_tipo D ON A.tipo = D.id   
            LEFT JOIN appDiope.tip_status E ON B.cd_status = E.id
            WHERE prc_confirm in(1) AND A.tipo IN (1,2,3) and A.status not in (4,8)  group by D.tx_tipo  `, async (err, response) => {
                // ${st}
            if (err) {
                console.log(err)
                res.status(500).send({ msg: "houve um erro não identificado, por favor tente novamente" })
            } else {
                const protocolos = []
                res.status(200).send(response)
            }
        })
    },
    async procuraProtocolo(req, res) {
        const { protocolo } = req.body
        const filtoPref = req.session.prefixo != 9600 && req.session.prefixo != 4011 ? `and pref_slc = ${req.session.prefixo}` : ""
        pool.query(`SELECT A.*, B.cd_status, C.nome, D.tx_tipo, E.tx_status, H.NOME_GUERRA_215 AS NOME FROM appDiope.tb_sltc A  LEFT JOIN appDiope.tb_status_prc B ON A.id = B.cd_prc 
                    LEFT JOIN  appDiope.Produto C ON C.produtoId = A.cd_assunto  LEFT JOIN appDiope.tb_tipo D ON A.tipo = D.id   
                    LEFT JOIN appDiope.tip_status E ON B.cd_status = E.id
                    LEFT JOIN appDiope.tb_nomeguerra H ON A.cd_funci_rsp_incl = H.matricula
                    WHERE A.tipo IN (1,3,2) and A.prc_confirm in (1,2,3) AND A.id = ?`, [protocolo], async (err, response) => {
            if (err) {
                console.log(err)
                res.status(500).send({ msg: "houve um erro não identificado, por favor tente novamente" })
                makeLog.gravaLog(req,err)
            } else {
                response.map(o => {
                    if (o.tx_status == null) {
                        o.tx_status = "Pendente de Validação pelo Comitê da Dependência"
                    }
                })
                if (response[0]) {
                    const perguntasProtocolos = await retornaPerguntasProtocolo.retornaPerguntasProtocolos(protocolo,req)
                    if (filtoPref != "") {
                        const autorizado = await getPrefixoAutorizado.recuperaPrfPrinc(req.session.prefixo)
                        const subordinante = await getPrefixoAutorizado.recuperaPrfSub(req.session.prefixo)
                        const prefixo = response[0].pref_slc
                        if (req.session.prefixo == prefixo ||autorizado.find(l=>l.prf_sub == prefixo)||subordinante.find(l=>l.prf_pric == prefixo) ) {

                            res.status(200).send({ status: 200, dados: response, perguntasProtocolos })
                        } else {
                            res.status(200).send({ status: 401, msg: "Atenção, protocolo não pertence ao seu prefixo" })
                            makeLog.gravaLog(req,`${req.session.prefixo} - protocolo não pertence ao prefixo`, protocolo)
                        }
                    } else {
                        res.status(200).send({ status: 200, dados: response, perguntasProtocolos })
                    }
                } else {
                    res.status(200).send({ status: 401, msg: "Protocolo não encontrado" })
                }
            }
        })
    },
    async recuperaProtocolosValidados(req, res) {
        const { status, protocolo } = req.query
        const q = protocolo !=0? ` A.id = ${protocolo} `:`prc_confirm in(${status.toString()})`
        const filtoPref = req.session.prefixo != 9600 && req.session.prefixo != 4011 ? `and pref_slc = ${req.session.prefixo}` : ""
        pool.query(`SELECT A.*, B.cd_status, C.nome, D.tx_tipo, E.tx_status,  H.NOME_GUERRA_215 AS NOME FROM appDiope.tb_status_prc Y
            LEFT JOIN appDiope.tb_sltc A  ON Y.cd_prc = A.id
            LEFT JOIN appDiope.tb_status_prc B ON A.id = B.cd_prc 
            LEFT JOIN appDiope.Produto C ON C.produtoId = A.cd_assunto  
            LEFT JOIN appDiope.tb_tipo D ON A.tipo = D.id   
            LEFT JOIN appDiope.tip_status E ON B.cd_status = E.id
            left join appDiope.tb_nomeguerra H on A.cd_funci_rsp_incl = H.matricula
            WHERE ${q} AND A.tipo IN (1,3,2) ${filtoPref}`, [status], async (err, response,t) => {
            if (err) {
                console.log(err)
                res.status(500).send({ msg: "houve um erro não identificado, por favor tente novamente" })
                makeLog.gravaLog(req,err)
            } else {
                response.map(o => {
                    if (o.tx_status == null) {
                        o.tx_status = "Pendente de Validação pelo Comitê da Dependência"
                    }
                })
                const protocolos = []
                response.map(o => {
                    if (o.tx_status == null) {
                        o.tx_status = "Pendente de Validação pelo Comitê da Dependência"
                    }
                    protocolos.push(o.id)
                })
                if(response.length == 0){

                    res.status(200).send(response)
                    return false
                }
                const perguntasProtocolos = await retornaPerguntasProtocolo.retornaPerguntasProtocolos(protocolos,req)
                for (let p of response) {
                    const perguntas = perguntasProtocolos.filter(o => o.nr_siga == p.id)
                    p.perguntas = perguntas
                }
                res.status(200).send(response)
            }
        })
    }
}


