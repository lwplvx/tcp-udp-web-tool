var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser')
var tcpServer = require('../models/tcpServer');

var app = express()
  .use(bodyParser.json());

const tcpServers = [];

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.json(tcpServers);
});

//GET /tcpServers/:id => 404
router.get('/:port', function (req, res, next) {
  var tcpServer;
  tcpServers.forEach((item) => {
    if (item.port == req.params.port) {
      tcpServer = item;
      return;
    }
  });
  if (!tcpServer) {
    res.statusCode = 404;
    return res.send('Error 404: No tcpServer found')
  }
  //GET /tcpServers/:id => 200
  res.json(tcpServer);
});


//POST /users => 201  sign up
router.post('/:port', function (req, res) {
  var port = req.param('port');
  //POST /users => 400  HTTP 400 错误 - 请求无效 (Bad request) 
  if (typeof port === "undefined") {
    res.statusCode = 400;
    res.send('Error 400: user properties missing');
  }
  tcpServer.create(port, function (server) {
     
    tcpServers.push(server);
    console.log(server, "serverListen");

    res.json(server);

  }, onConnected);

});


function onConnected(sock) {  
  console.log('server onConnected: ' +  sock.remoteAddress + ':' + sock.remotePort);

  sock.on('data',(data)=>{onData(data,sock)}); 
  sock.on('close',(data)=>{onClose(data,sock)});  
}

function onData(data,sock) {
  console.log('server onData ' + sock.remoteAddress + ': ' + data);
  // 回发该数据，客户端将收到来自服务端的数据
  sock.write('You said "' + data + '"');
}

function onClose(data) {
   console.log('server onClose: ' +    sock.remoteAddress + ' ' + sock.remotePort);
}


//Delete /tcpServers/:port
router.delete('/:port', function (req, res, next) {
  //POST /users => 400  HTTP 400 错误 - 请求无效 (Bad request) 
  var port = req.param('port');
  if (typeof req.param('port') === "undefined") {
    res.statusCode = 400;
    res.send('Error 400: user properties missing');
  }
  var server;
  var servers = [];
  tcpServers.forEach((item) => {
    if (item.port == port) {
      server = item;
    }
    else {
      servers.push(item);

    }
  });
  tcpServers = servers;
  if (server) {
    server.close();
  }
  res.json(true);
});


module.exports = router;
