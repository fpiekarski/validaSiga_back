const mysql = require('mysql');
require('dotenv').config();

const pool2 = mysql.createPool({
    connectionLimit:50,
 
    host: process.env.HOSTSQL2,
    user: process.env.USER2,
    password: process.env.PASS2,
    waitForConnections: true,
  
});

process.on('SIGINT', () => 
    pool2.end(err => {
        if(err) return console.log(err);
        console.log('pool => fechado');
        process.exit(0);
    })
); 


module.exports = pool2;
