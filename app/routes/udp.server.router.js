var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser')
var udpServer = require('../models/udpServer');
var wsRouter = require('./ws.router');
var serverInfo = require('../models/serverInfo');
var wsMessage = require('../models/wsMessage');
var wsMessageTypes = require('../models/wsMessageTypes');

var app = express().use(bodyParser.json());



// udp server  begin --

/* GET users listing. */
router.get('/', function (req, res, next) {
    var arr = [];
    udpServer.servers.forEach((item) => {
        arr.push(item.info);
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

        var serverInfo = getServerInfo(server);
        udpServer.servers.add(serverInfo.info.key, serverInfo);
         
        var wsData = serverInfo.info;
        wsData.type = wsMessageTypes.onListening;   

        wsData.data = 'udp server onListening: ' + wsData.address + ':' + wsData.port;

        wsRouter.send(JSON.stringify(wsData));

        onListening(server);

        res.json(serverInfo.info);
    }, (e) => {
        console.log(e);
        res.statusCode = 500;
        res.send(e);
    });

});

function getServerInfo(server) {

    var address = server.address();
    var udpS = new serverInfo(); 
    udpS.info.protocol= "udp";
    udpS.info.address=address.address;   // 监听的地址
    udpS.info.port=address.port;   //  监听的 端口 
    udpS.info.name= `${address.address}:${address.port}`; 
    udpS.info.key= `${udpS.info.protocol}-${udpS.info.name}`;
    udpS.server=server;

    return udpS;
}


function onListening(server) { 

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
    var key = `udp-0.0.0.0:${port}`;
    var server = udpServers.find(key);
    if (server) {
        server.close();
        udpServers.remove(key);
    }
    res.json(true);
});

// udp server  begin ----


module.exports = router;
