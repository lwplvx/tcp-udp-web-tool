var express = require('express');
var router = express.Router();

var config = require('../config/config');
var tcpServer = require('../models/tcpServer');
var tcpClient = require('../models/tcpClient');
var tcpC = config.tcp;
var udpC = config.udp;
tcpServer.start(tcpC.port, tcpC.host);


/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'tcp/udp web 测试工具', tcp: tcpC, udp: udpC });
});

router.get('/client', function (req, res, next) {

  tcpClient.connect(tcpC.port, tcpC.host);
 
  res.render('index', { title: 'tcp/udp client', tcp: tcpC, udp: udpC });
});

module.exports = router;
