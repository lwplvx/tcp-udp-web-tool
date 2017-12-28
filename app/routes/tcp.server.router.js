var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser')
var tcpServer = require('../models/net/tcpServer');
var wsRouter = require('./ws.router'); 
var netItemServer = require('../models/netItemServer');
var netItemClient = require('../models/netItemClient');

var netProtocolTypes = require('../models/netProtocolTypes');

var wsMessage = require('../models/wsMessage');
var wsMessageTypes = require('../models/wsMessageTypes');

var app = express().use(bodyParser.json());

// tcp server  begin --

/* GET users listing. */
router.get('/', function (req, res, next) {
    var arr = [];
    tcpServer.servers.forEach((item) => {
        arr.push(item.info);
    });
    res.json(arr);
});

//GET /tcpServers/:id => 404
router.get('/:port', function (req, res, next) {
    var tcpServer;
    tcpServer.servers.forEach((item) => {
        if (item.port === req.params.port) {
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


//POST /  create tcpserver
router.post('/:port', function (req, res) {
    var port = req.param('port');
    //POST /  => 400  HTTP 400 错误 - 请求无效 (Bad request) 
    if (typeof port === "undefined") {
        res.statusCode = 400;
        res.send('Error 400: user properties missing');
    }
    tcpServer.create(port, (server) => {
        var netItem = getNetItemServer(server);
        var info = netItem.info;
        tcpServer.servers.add(info.key, netItem);

        var wsMsg = new wsMessage();
        wsMsg.messageType = wsMessageTypes.onListening;
        wsMsg.server = info;
        wsMsg.protocol = info.protocol;
        wsMsg.data = 'tcp server onListening: ' + info.address + ':' + info.port;

        wsRouter.send(JSON.stringify(wsMsg));

        res.json(info);

    }, onConnected, (e) => {
        console.log(e);
        res.statusCode = 500;
        res.send(e);
    });

});


function getNetItemServer(server) {

    var address = server.address();
    var item = new netItemServer();
    var info = item.info;
    info.address = address.address;   // 监听的地址
    info.port = address.port;   //  监听的 端口

    info.name = `${info.address}:${info.port}`;
    info.key = getServerKey(server);

    item._socket = server;

    return item;
}

function getServerKey(server) {
    var address = server.address();
    return `tcp-server-${address.address}:${address.port}`;
}
function getClientKey(sock) {
    return `tcp-client-${sock.remoteAddress}:${sock.remotePort}`;
}

function onConnected(sock, server) {

    var key = getServerKey(server);
    //   serverItem 是 类型 netItemServer
    var serverItem = tcpServer.servers.find(key);

    if (serverItem) {
        var wsMsg = new wsMessage();

        wsMsg.messageType = wsMessageTypes.onConnected;

        var clientItem = new netItemClient();
        var remote = clientItem.info;

        clientItem._socket = sock;

        remote.key = getClientKey(sock);
        remote.name = sock.remoteAddress + ':' + sock.remotePort;
        remote.address = sock.remoteAddress;
        remote.port = sock.remotePort;
        remote.protocol = netProtocolTypes.TCP;
        wsMsg.protocol = netProtocolTypes.TCP;

        serverItem.info.remoteClients.add(remote.key, clientItem);

        wsMsg.client = remote;
        // 告诉界面是连接到了哪个 服务器 
        wsMsg.server = serverItem.info;

        wsMsg.data = serverItem.info.key + ' onConnected: ' + remote.name;

        wsRouter.send(JSON.stringify(wsMsg));

        sock.on('data', (data) => { onData(data, sock, server) });
        sock.on('close', () => { onClose(sock, server) });
    } else {
        //错误消息

    }


}

function onData(data, sock, server) {
    // 回发该数据，客户端将收到来自服务端的数据
    sock.write('tcp echo "' + data + '"');

    var key = getServerKey(server);
    //   serverItem 是 类型 netItemServer
    var serverItem = tcpServer.servers.find(key);
    if (serverItem) {
        var wsMsg = new wsMessage();
        wsMsg.messageType = wsMessageTypes.onData;

        var remotekey = getClientKey(sock);
        //    remoteClients 存的是 类型  clientItem 的对象
        var clientItem = serverItem.info.remoteClients.find(remotekey);

        if (clientItem) {
            wsMsg.client = clientItem.info;

            wsMsg.client.data = '' + data;
            wsMsg.data = '' + data;
            wsMsg.protocol = netProtocolTypes.TCP;

            wsRouter.send(JSON.stringify(wsMsg));

        } else {
            //錯誤處理

        }

    } else {
        //错误消息

    }

}

function onClose(sock, server) {
    console.log('tcp server onClose: ' + sock.remoteAddress + ' ' + sock.remotePort);

    var key = getServerKey(server);
    //   serverItem 是 类型 netItemServer
    var serverItem = tcpServer.servers.find(key);
    if (serverItem) {
        var wsMsg = new wsMessage();
        wsMsg.messageType = wsMessageTypes.onClose;
       

        var clientItemkey = getClientKey(sock);

        //    remoteClients 存的是 类型  clientItem 的对象
        var clientItem = serverItem.info.remoteClients.find(clientItemkey); 
        if (clientItem) {
            //移除客户端连接
            serverItem.info.remoteClients.remove(clientItem.info.key);

            wsMsg.client = clientItem.info;
            wsMsg.protocol = clientItem.info.protocol;

            wsMsg.data = 'tcp server onClose: ' + sock.remoteAddress + ' ' + sock.remotePort;

            wsRouter.send(JSON.stringify(wsMsg));

        } else {
            //錯誤處理

        }

    } else {
        //错误消息

    }


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
        if (item.port === port) {
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

// tcp server  end ----


module.exports = router;
