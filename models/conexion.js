var mysql = require('mysql');
var express = require('express');
var http = require('http');
var app = express();
var flash = require('connect-flash');
var bodyParser = require('body-parser');
port = process.env.PORT || 4434;


app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs')


if (port === 4434) {
    var connection = mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '',
        database: 'sistema',
        insecureAuth: true
    });
} else { console.log("No hay conexión"); }
connection.connect();
module.exports = connection;