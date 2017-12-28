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
        res.send('Error 400: udp client properties missing');
    }

    udpClient.create(port, (udp) => {

        onListening(udp);

        res.json({ data: 'OK 200: udp onListening ' + port });

    }, (e) => {
        console.log(e);
        res.statusCode = 500;
        res.send(e);
    });

});


function getNetItemKey(address) {
    return `udp-${address.address}:${address.port}`;
}
function getNetItem(server) {

    var address = server.address();
    var item = new netItemClient();
    var info = item.info;
    // 有tcp udp 之分 所有要在这里赋值
    info.protocol = netProtocolTypes.UDP;
    info.address = address.address;   // 监听的地址
    info.port = address.port;   //  监听的 端口

    info.name = `${info.address}:${info.port}`;
    info.key = getNetItemKey(address);

    item._socket = server;

    return item;
}

function getRemoteNetItem(rInfo) {

    var item = new netItemClient();
    var info = item.info;
    // 有tcp udp 之分 所有要在这里赋值
    info.protocol = netProtocolTypes.UDP;
    info.address = rInfo.address;   // 监听的地址
    info.port = rInfo.port;   //  监听的 端口

    info.name = `${info.address}:${info.port}`;
    info.key = getNetItemKey(rInfo);
    // upd 时  getRemoteNetItem _socket  没有
    //item._socket = rInfo;

    return item;
}

function onListening(udp) {

    var netItem = getNetItem(udp);
    var info = netItem.info;

    udpClient.clients.add(info.key, netItem);

    var wsMsg = new wsMessage();

    wsMsg.messageType = wsMessageTypes.onListening;

    wsMsg.protocol = info.protocol;
    wsMsg.client = info;

    wsMsg.data = 'udp onListening: ' + info.address + ':' + info.port;

    wsRouter.send(JSON.stringify(wsMsg));

    udp.on('message', (msg, rinfo) => { onMessage(udp, msg, rinfo) });
}

function onMessage(udp, data, rinfo) {

    //socket.send(msg, [offset, length,] port [, address] [, callback]) 
    // 回发该数据，客户端将收到来自服务端的数据 
    // 可能死循环  千万不能自动回复 

    //udp.send('Udp echo "' + data + '"', rinfo.port, rinfo.address);

    //{ address: '127.0.0.1', family: 'IPv4', port: 8400, size: 6 } '看看 rinfo 对象'

    var address = udp.address();
    var key = getNetItemKey(address);

    //   udpItem 是 类型 netItem
    var udpItem = udpClient.clients.find(key);
    if (udpItem) {

        var wsMsg = new wsMessage();
        wsMsg.messageType = wsMessageTypes.onData;

        //    remoteClients 存的是 类型  clientItem 的对象
        var remoteUdpItem = getRemoteNetItem(rinfo);

        // server  是 接收端的信息  就是 当前udp 监听信息
        wsMsg.server = udpItem.info;

        // client  就是远程信息  udp 需要
        wsMsg.client = remoteUdpItem.info;
        wsMsg.protocol = remoteUdpItem.info.protocol;

        wsMsg.client.data = '' + data;
        wsMsg.data = '' + data;

        wsRouter.send(JSON.stringify(wsMsg));


    } else {
        //错误消息

    }
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
