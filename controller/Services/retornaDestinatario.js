require('dotenv').config();
const pool = require('../../Services/pool');
const getPrefixoAutorizado = require('./getPrefixoAutorizado');
const database = process.env.DATABASE
module.exports = {
    async retornaDestinatarios(req, status, protocolo, prefixo) {
        const dest = [
            {
                status: 2,
                retornos: [solicitante(status, protocolo, prefixo, req)]
            },
            {
                status: 3,
                retornos: [RetornaGsol(status, protocolo, prefixo, req)]
            },
            {
                status: 4,
                retornos: [solicitante(status, protocolo, prefixo, req), comite(status, protocolo, prefixo, req)]
            },
            {
                status: 5,
                retornos: [solicitante(status, protocolo, prefixo, req), comite(status, protocolo, prefixo, req)]
            },
            {
                status: 6,
                retornos: [solicitante(status, protocolo, prefixo, req)]
            },
            {
                status: 7,
                retornos: [solicitante(status, protocolo, prefixo, req), comite(status, protocolo, prefixo, req)]
            },
            {
                status: 8,
                retornos: [solicitante(status, protocolo, prefixo, req)]
            },
            {
                status: 9,
                retornos: [demandante(status, protocolo, prefixo, req), comite(status, protocolo, prefixo, req)]
            },
            {
                status: 11,
                retornos: [demandante(status, protocolo, prefixo, req)]
            },
            {
                status: 10,
                retornos: [demandante(status, protocolo, prefixo, req)]
            }, {
                status: 12,
                retornos: [demandante(status, protocolo, prefixo, req)]
            },
            {
                status: 13,
                retornos: [comiteOutroPrefixo(status, protocolo, req)]
            },
            {
                status: 14,
                retornos: [demandante(status, protocolo, prefixo, req)]
            },

        ]

        var destinatarios = []
        const sitDiope = [2, 3, 6, 7, 8, 9, 10]
        if (prefixo == 9600 && !sitDiope.find(k => k == status)) {
            const slct = await solicitante(status, protocolo, prefixo, req)
            const dados = await retornaComissaoEquipeFunci(slct[0].destino)
            if (dados.desc_cargo.match(/assessor/i)) {
                const destinatario = await retornaGsolEquipe(dados.uor_trabalho)
                destinatarios.push({ destino: destinatario.matricula, copia: 0 })
            } else if (dados[0].desc_cargo.match(/soluc/i)) {

                destinatarios.push({ destino: slct, copia: 0 })
            }
        } else {
            const f = await dest.find(k => k.status == status)
            if (f) {
                for await (let r of f.retornos) {
                    const g = await r
                    destinatarios = [...destinatarios, ...g]
                }
            }
        }
        return destinatarios
    },
    async retornaNome(chave) {
        return await new Promise((resolve, reject) => {
            pool.query("SELECT nome FROM ARH.arhfot01 WHERE matricula = ?", [chave], (err, response) => {
                if (err) {
                    resolve(err)
                } else {
                    resolve(response[0].nome)
                    // resolve({tipo:"comite", data:response})
                }
            })
        })
    }
}
async function comite(status, protocolo, prefixo, req) {
    const autorizado = await getPrefixoAutorizado.recuperaPrfPrinc(prefixo)
    const subordinante = await getPrefixoAutorizado.recuperaPrfSub(prefixo)
    if (autorizado && autorizado.length > 0) {
        subordinante.map(l => {
            prefixo += ` or ag_localiz = ${l.prf_princ}`
        })
    }
    if (subordinante && subordinante.length > 0) {
        subordinante.map(l => {
            prefixo += ` or ag_localiz = ${l.prf_sub}`
        })
    }
    return await new Promise((resolve, reject) => {
        pool.query("SELECT matricula  as destino, desc_cargo FROM ARH.arhfot01 WHERE ag_localiz = ? AND (desc_cargo LIKE '%area%' OR desc_cargo LIKE '%geral%')", [prefixo], (err, response) => {
            if (err) {
                resolve(err)
            } else {
                const retorno = []
                response.map(o => {
                    if (o.desc_cargo.match(/(GERAL)/g)) {
                        retorno.push({ destino: o.destino, copia: 0 })
                    } else {
                        retorno.push({ destino: o.destino, copia: 1 })
                    }
                })
                resolve(response)
            }
        })
    })
}
async function demandante(status, protocolo, prefixo, req) {
    return await new Promise((resolve, reject) => {
        pool.query(`select funci as destino from ${database}.tb_andamentos_prc where cd_prc = ? and vigente = 1`, [protocolo], (err, response) => {
            if (err) {
                resolve(err)
            } else {
                resolve(response)
                // resolve({tipo:"demandante", data:response})
            }
        })
    })
}
async function solicitante(status, protocolo, prefixo, req) {
    return await new Promise((resolve, reject) => {
        pool.query(`select cd_funci_rsp_incl  as destino from ${database}.tb_sltc where id = ?`, [protocolo], (err, response) => {
            if (err) {
                resolve(err)
            } else {
                resolve(response)
                // resolve({tipo:"solicitante", data:response})
            }
        })
    })
}
async function RetornaGsol(status, protocolo, prefixo, req) {
    return await new Promise((resolve, reject) => {

        pool.query("SELECT A.*,B.TX_EMAI_UOR FROM ARH.gsolucao_9600 A INNER JOIN appDiope.emai_uor B ON A.uor_trabalho = B.cd_uor WHERE A.matricula = ?", [req.body.gsol], (err, response) => {

            const retorno = [{ destino: req.body.gsol, equipe: 0 }]
            if (response[0]) {
                retorno.push({ destino: response[0].TX_EMAI_UOR, equipe: 1, copia: 1 })
            }
            resolve(retorno)
        })
        // return {tipo:"gsol", data:req.body.gsol}
    })
}
async function retornaComissaoEquipeFunci(chave) {
    return await new Promise((resolve, reject) => {

        pool.query("SELECT A.nome, A.desc_cargo, A.uor_trabalho, A.cod_uor_grupo FROM ARH.arhfot01 A WHERE A.matricula =  ?", [chave], (err, response) => {

            if (err) {
                reject(err)
            } else {
                resolve(response[0])
            }
        })
    })
}
async function retornaGsolEquipe(uor) {
    return await new Promise((resolve, reject) => {

        pool.query("SELECT matricula  FROM ARH.gsolucao_9600 A WHERE A.uor_trabalho = ?", [uor], (err, response) => {

            if (err) {
                reject(err)
            } else {
                if (response[0]) {
                    resolve(response[0])
                } else {
                    pool.query("SELECT matricula  FROM ARH.gequipe_9600 A WHERE A.uor_trabalho = ?", [uor], (err, response) => {
                        resolve(response[0])
                    })
                }
            }
        })
    })
}
async function comiteOutroPrefixo(status, protocolo, req) {
    const prefixo = req.body.prefixoSolicitado
    if (!prefixo) return false
    const retorno = await comite(status, protocolo, prefixo, req)
    return retorno
}

