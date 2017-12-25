var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser')
var udpServer = require('../models/udpServer');
var wsRouter = require('./ws.router');
var wsMessage = require('../models/wsMessage');
var wsMessageTypes = require('../models/wsMessageTypes');

var app = express().use(bodyParser.json());


/* GET users listing. */
router.get('/', function (req, res, next) {
    var arr = [];
    udpServers.forEach((item) => {
        var address = item.address();
        var udpserver = {
            type: "udp",
            address: address.address,
            port: address.port
        };
        arr.push(udpserver);
    });

    res.json(arr);
});

//GET /udpServers/:id => 404
router.get('/:port', function (req, res, next) {
    var udpServer;
    udpServers.forEach((item) => {
        if (item.port == req.params.port) {
            udpServer = item;
            return;
        }
    });
    if (!udpServer) {
        res.statusCode = 404;
        return res.send('Error 404: No udpServer found')
    }
    //GET /udpServers/:id => 200
    res.json(udpServer);
});


//POST /users => 201  sign up
router.post('/:port', function (req, res) {
    var port = req.param('port');
    //POST /users => 400  HTTP 400 错误 - 请求无效 (Bad request) 
    if (typeof port === "undefined") {
        res.statusCode = 400;
        res.send('Error 400: user properties missing');
    }

    udpServer.create(port, (server) => {

        udpServer.servers.push(server);
        var address = server.address();
        var udpserver = {
            type: "udp",
            address: address.address,
            port: address.port
        };

        onListening(server);
        res.header("Access-Control-Allow-Origin", "*");
        res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.header('Access-Control-Allow-Headers', 'Content-Type');

        res.json(udpserver);
    }, (e) => {
        console.log(e);
        res.statusCode = 500;
        res.send(e);
        });

});

function onListening(server) {
    var address = server.address(); 
    
    var wsData = new wsMessage();
    wsData.type = wsMessageTypes.onListening;
    wsData.protocol = 'udp';
    wsData.address = address.address;
    wsData.port = address.port; 

    wsData.data = 'udp server onListening: ' + address.address + ': ' + address.port;

    wsRouter.send(JSON.stringify(wsData));
      
    server.on('message', (msg, rinfo) => { onMessage(server, msg, rinfo) });
}

function onMessage(server, data, rinfo) { 

    // 回发该数据，客户端将收到来自服务端的数据  
    //socket.send(msg, [offset, length,] port [, address] [, callback])
    server.send('Udp echo "' + data + '"', rinfo.port, rinfo.address);
     
    var address = server.address();
    var wsData = new wsMessage();
    wsData.type = wsMessageTypes.onData;
    wsData.protocol = 'udp';
    wsData.address = address.address;
    wsData.port = address.port;
    wsData.remoteAddress = rinfo.address;
    wsData.remotePort = rinfo.port;

    wsData.data = '' + data;

    wsRouter.send(JSON.stringify(wsData)); 

}

//Delete /udpServers/:port
router.delete('/:port', function (req, res, next) {
    //POST /users => 400  HTTP 400 错误 - 请求无效 (Bad request) 
    var port = req.param('port');
    if (typeof req.param('port') === "undefined") {
        res.statusCode = 400;
        res.send('Error 400: user properties missing');
    }
    var server;
    var servers = [];
    udpServers.forEach((item) => {
        if (item.port == port) {
            server = item;
        }
        else {
            servers.push(item);

        }
    });
    udpServers = servers;
    if (server) {
        server.close();
    }
    res.json(true);
});


module.exports = router;