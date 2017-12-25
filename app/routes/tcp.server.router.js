var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser')
var tcpServer = require('../models/tcpServer');
var wsRouter = require('./ws.router');
var wsMessage = require('../models/wsMessage');
var wsMessageTypes = require('../models/wsMessageTypes');

var app = express()
    .use(bodyParser.json());

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.json(tcpServer.servers);
});

//GET /tcpServers/:id => 404
router.get('/:port', function (req, res, next) {
    var tcpServer;
    tcpServer.servers.forEach((item) => {
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
    tcpServer.create(port, (server) => {
        var address = server.address();
        var tcpserver = {
            type: "tcp",
            address: address.address,
            port: address.port
        };
        tcpServer.servers.push(tcpserver);

        var data = new wsMessage();
        data.type = wsMessageTypes.onListening;
        data.protocol = 'tcp';
        data.remoteAddress = address.address;
        data.remotePort = address.port;
        data.data = 'tcp server onListening: ' + address.address + ': ' + address.port;

        wsRouter.send(JSON.stringify(data));

        res.json(tcpServer);

    }, onConnected, (e) => {
        console.log(e);
        res.statusCode = 500;
        res.send(e);
    });

});


function onConnected(sock,server) {
    var address = server.address(); 

    var data = new wsMessage();
    data.type = wsMessageTypes.onConnected;
    data.protocol = 'tcp';
    data.address = address.address;
    data.port = address.port;  
    data.remoteAddress = sock.remoteAddress;
    data.remotePort = sock.remotePort;

    data.data = 'tcp server onConnected: ' + sock.remoteAddress + ':' + sock.remotePort;
     
    wsRouter.send(JSON.stringify(data));
    sock.on('data', (data) => { onData(data, sock, server) });
    sock.on('close', (data) => { onClose(data, sock, server) });
}

function onData(data, sock,server) {
    // 回发该数据，客户端将收到来自服务端的数据
    sock.write('tcp echo "' + data + '"');
      
    var address = server.address(); 
    var wsData = new wsMessage();
    wsData.type = wsMessageTypes.onData;
    wsData.protocol = 'tcp';
    wsData.address = address.address;
    wsData.port = address.port;
    wsData.remoteAddress = sock.remoteAddress;
    wsData.remotePort = sock.remotePort;

    wsData.data = '' + data;

    wsRouter.send(JSON.stringify(wsData));
}

function onClose(data, sock) {
    console.log('tcp server onClose: ' + sock.remoteAddress + ' ' + sock.remotePort);
      
    var address = server.address();
    var wsData = new wsMessage();
    wsData.type = wsMessageTypes.onClose;
    wsData.protocol = 'tcp';
    wsData.address = address.address;
    wsData.port = address.port;
    wsData.remoteAddress = sock.remoteAddress;
    wsData.remotePort = sock.remotePort;
     
    wsData.data = 'tcp server onClose: ' + sock.remoteAddress + ' ' + sock.remotePort;

    wsRouter.send(JSON.stringify(wsData));
     
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
