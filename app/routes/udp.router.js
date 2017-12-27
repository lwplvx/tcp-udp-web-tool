var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser')
var udpClient = require('../models/net/udpClient');
var wsRouter = require('./ws.router'); 
var netItemClient = require('../models/netItemClient'); 
var wsMessage = require('../models/wsMessage');
var wsMessageTypes = require('../models/wsMessageTypes');
var netProtocolTypes = require('../models/netProtocolTypes');


var app = express().use(bodyParser.json());
 
// udp server  begin --

/* GET users listing. */
router.get('/', function (req, res, next) {
    var arr = [];
    udpClient.clients.forEach((item) => {
        arr.push(item.info);
    });
    res.json(arr);
});

//GET /udpServers/:id => 404
router.get('/:port', function (req, res, next) {
    var udpItem;
    udpClient.clients.forEach((item) => {
        if (item.port === req.params.port) {
            udpItem = item;
            return;
        }
    });
    if (!udpItem) {
        res.statusCode = 404;
        return res.send('Error 404: No udpServer found')
    }
    //GET /udpServers/:id => 200
    res.json(udpItem);
});


//POST /users => 201  sign up
router.post('/:port', function (req, res) {
    var port = req.param('port');
    //POST /users => 400  HTTP 400 错误 - 请求无效 (Bad request) 
    if (typeof port === "undefined") {
        res.statusCode = 400;
        res.send('Error 400: user properties missing');
    }

    udpClient.create(port, (udp) => {

        var netItem = getNetItem(udp);
        var info = netItem.info;

        udpClient.clients.add(info.key, netItem);

        var wsMsg = new wsMessage();

        wsMsg.messageType = wsMessageTypes.onListening;   

        wsMsg.protocol = info.protocol;
        wsMsg.client = info;

        wsMsg.data = 'udp onListening: ' + info.address + ':' + info.port;

        wsRouter.send(JSON.stringify(wsMsg));

        onListening(udp);

        res.json(info);

    }, (e) => {
        console.log(e);
        res.statusCode = 500;
        res.send(e);
    });

});


function getNetItem(server) {

    var address = server.address();
    var item = new netItemClient();
    var info = item.info;
    // 有tcp udp 之分 所有要在这里赋值
    info.protocol = netProtocolTypes.UDP;
    info.address = address.address;   // 监听的地址
    info.port = address.port;   //  监听的 端口

    info.name = `${info.address}:${info.port}`;
    info.key = `${info.protocol}-${info.address}:${info.port}`;

    item._socket = server;

    return item;
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
