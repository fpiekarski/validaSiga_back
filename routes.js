
const validaAcesso = require('./Services/validaAcesso');
const retornaProtocolos = require('./controller/getters/retornaProtocolos');
const retornaPerguntasProtocolo = require('./controller/getters/retornaPerguntasProtocolo');
const retornaAndamentosProtocolo = require('./controller/getters/retornaAndamentosProtocolo');
const retornaAnexos = require('./controller/getters/retornaAnexos');
const controleStatusPrc = require('./controller/Services/controleStatusPrc');
const retornaGsol = require('./controller/getters/retornaGsol');
const retornaFasesProtocolo = require('./controller/getters/retornaFasesProtocolo');
const acessControl = require('./controller/Services/acessControl');
const retornaFasesPossiveis = require('./controller/getters/retornaFasesPossiveis');
const { retornaStatus } = require('./controller/getters/retornaStatusProtocolo');
const retornaStatusProtocolo = require('./controller/getters/retornaStatusProtocolo');
const retornaPrtcPergunta = require('./controller/util/retornaPrtcPergunta');
const updateResposta = require('./controller/setters/updateResposta');
const retornaImagemComLog = require('./controller/getters/retornaImagemComLog');
const retornaPrefixos = require('./controller/Services/retornaPrefixos');
const getDadosFunci = require('./controller/Services/getDadosFunci');
const validaToken = require('./Services/validatoken')
const logAcesso = require('./Services/logAcesso')
const router = require ("express").Router()


router.post("/perguntasProtocolo", validaToken.validaToken, validaAcesso.acesso, retornaPerguntasProtocolo.getPerguntasProtocolos)
router.post("/andamentosProtocolo", validaToken.validaToken, validaAcesso.acesso, retornaAndamentosProtocolo.getAndamentosProtocolos)
router.get('/verificaAcesso', validaToken.validaToken, logAcesso.verificaAcesso)
router.get("/protocolos", validaToken.validaToken, validaAcesso.acesso, retornaProtocolos.recuperaProtocolos)
router.get("/countProtocolos", validaToken.validaToken, validaAcesso.acesso, retornaProtocolos.countProtocolos)
router.get("/protocolosValidados", validaToken.validaToken, validaAcesso.acesso, retornaProtocolos.recuperaProtocolosValidados)
router.post("/anexos", validaToken.validaToken, validaAcesso.acesso, retornaAnexos.consultaAnexos)
router.post("/updateStatus", validaToken.validaToken, validaAcesso.acesso, controleStatusPrc.updateStatus)
router.post("/updateResposta", validaToken.validaToken, validaAcesso.acesso, updateResposta.updateResposta)
router.post("/getStatus", validaToken.validaToken, validaAcesso.acesso, controleStatusPrc.retornaStatus)
router.get("/gerSolucao", validaToken.validaToken, validaAcesso.acesso, retornaGsol.retornaGsol)
router.post("/getFases", validaToken.validaToken, retornaFasesProtocolo.getAndamentosProtocolos)
router.post("/getStatusAtual", validaToken.validaToken, controleStatusPrc.retornaStatusAtual)
router.get("/acessosComissao", validaToken.validaToken, acessControl.verificaFasesAcesso)
router.post("/getAcessoFases", retornaFasesPossiveis.getFasesPossiveis)
router.get("/getObsNecessaria", retornaFasesPossiveis.getObsNecessaria)
router.get("/prefixos", retornaPrefixos.retornaPrefixosDiope)
router.post("/permiteEdicao", retornaPrtcPergunta.verificaPermissao)
router.post("/searchProtocolo", validaToken.validaToken, retornaProtocolos.procuraProtocolo)
router.post("/dadosFunci", validaToken.validaToken, getDadosFunci.getFunci)
router.get("/chavesTeste", (req, res) => {
  pool.query("select * from routerDiope.teste_chaves", (err, response) => {
    req.session.teste = response
    res.status(200).send(response)
  })
})
router.get('/retornaPrefixoSubordinado', retornaPrefixos.retornaPrefixoSubordinado)
router.get("/imagemDiope", retornaImagemComLog.sendImage)
module.exports = router