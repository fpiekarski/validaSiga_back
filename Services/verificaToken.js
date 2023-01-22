const os = require('os')
module.exports = {

    async filtro(req, res, next) {
        if (req.cookies.BBSSOToken) {
            
            next();
        } else {
        

                res.redirect("https://login.intranet.bb.com.br/sso/XUI/#login/&goto=https://"+req.headers.host + req.url)
        

            return false;
        }
    },
    async filtroLogin(req, res, next) {
        if (req.cookies.BBSSOToken) {
            
            next();
        } else {
            res.setHeader('Content-Type', 'application/json;charset=utf-8')
            // res.setHeader('Access-Control-Allow-Origin', 'https://localhost.bb.com.br:3804',)
            res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
            res.setHeader('Access-Control-Allow-Credentials', 'true')
            //res.redirect("https://login.intranet.bb.com.br/sso/XUI/#login/&goto=https://"+req.headers.host + req.url)
            res.status(200).send({ status: false,msg: "Efetue login na intranet e tente novamente 1" });

            return false;
        }
    }
}