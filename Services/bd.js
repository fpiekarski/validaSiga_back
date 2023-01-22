require('dotenv').config();
module.exports = {
    conexao: {
        connectionLimit: 20,
        host: process.env.HOSTSQL,
        user: process.env.USER,
        password: process.env.PASS,
        waitForConnections: true,
    },


    conexaoSession: {
        port: 3306,
        host: process.env.HOSTSQL,
        user: process.env.USER,
        password: process.env.PASS,
        waitForConnections: true,
        database: process.env.DATABASE,
        connectionLimit: 10,
    }


}