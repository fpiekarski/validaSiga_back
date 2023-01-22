const pool = require("../../Services/pool");


module.exports = {


    async permiteEdicaoPergunta() {
        return new Promise((resolve,reject)=>{

            pool.query(`select * from appDiope.fase_edit_pergunta`, (err, response) => {
                if (err) {
                    console.log(err)
                   resolve({status:500, msg: "houve um erro não identificado, por favor tente novamente" })
                } else {
                  resolve({status:200, msg:response})
                }
            })
        })
    }
}