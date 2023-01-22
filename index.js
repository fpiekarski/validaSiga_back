const bodyparser = require('body-parser');
const express = require('express');
var cookieParser = require('cookie-parser');
const httpsPort = process.env.PORT || 7000;
const fs = require('fs');
const requestIp = require('request-ip');
var session = require('express-session');
var key = fs.readFileSync('./ssl/key.pem', 'utf8');
var cert = fs.readFileSync('./ssl/server.crt', 'utf8');
const https = require('https');
const bd = require("./Services/bd")
const pool = require('./Services/pool')
const mysql = require('mysql')
const routes = require('./routes')
var MySQLStore = require('express-mysql-session')(session);

const corsOptions = {
  credentials: true,
  origin: true
}
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const { use } = require('./routes');

app = express();
app.use(cookieParser())
app.use(bodyparser.urlencoded({
  extended: true
}));

app.use(bodyparser.json());
app.use(cors(corsOptions));
app.use(express.static('public'))
app.use(cookieParser())
app.disable('x-powered-by');
var credentials = {
  key: key,
  cert: cert
};

const database = process.env.DATABASE

var connection = mysql.createPool(bd.conexaoSession)
var options = {
  database: database,
  schema: {
    tableName: 'tb_users_online',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires_column_name',
      data: 'data_column',

    }
  },
  endConnectionOnClose: true,
  expiration: 3000000,
  clearExpired: true,
  checkExpirationInterval: 900000,
}

var sessionStore = new MySQLStore(options, connection);
app.use(session({
  secret: process.env.SECRET,
  key: process.env.KEY,
  resave: false,
  genid: function (req) {
    return uuidv4();
  },
  saveUninitialized: false,
  store: sessionStore,
  maxAge: 600000,
  cookie: { secure: true }
})
)
app;use(routes)
const ipMiddleware = function (req, res, next) {
  // var ip = req.headers["X-Forwarded-For"]
  // console.log(req.headers['X-Real-IP'])
  // console.log(ip)
  // if(!ip){
  var ip = requestIp.getClientIp(req);
  // }
  req.session.ip = ip;
  next();
};
const sessionId = function (req, res, next) {
  if (req.session.chave && !req.session.up) {
    pool.query(`update ${database}.tb_users_online set chave = ? where session_id = ?`, [req.session.chave, req.session.id])
    req.session.up = true
  }
  next()
}
app.use(sessionId)
app.use(ipMiddleware)

var httpsServer = https.createServer(credentials, app);
httpsServer.listen(httpsPort, () => {
  console.log("Https server listing on port : " + httpsPort);
});