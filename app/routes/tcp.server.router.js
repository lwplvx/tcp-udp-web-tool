var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser')
var tcpServer = require('../models/tcpServer');
var wsRouter = require('./ws.router');
var serverInfo = require('../models/serverInfo');
var netInfo = require('../models/netInfo');
var wsMessage = require('../models/wsMessage');
var wsMessageTypes = require('../models/wsMessageTypes');

var app = express()
    .use(bodyParser.json());

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
        var serverInfo = getServerInfo(server);
        tcpServer.servers.add(serverInfo.info.key, serverInfo);

        var data = serverInfo.info;
        data.type = wsMessageTypes.onListening;

        data.data = 'tcp server onListening: ' + data.address + ':' + data.port;

        wsRouter.send(JSON.stringify(data));

        res.json(serverInfo.info);

    }, onConnected, (e) => {
        console.log(e);
        res.statusCode = 500;
        res.send(e);
    });

});

function getServerKey(server) {
    var address = server.address();
    return `tcp-${address.address}:${address.port}`;
}
function getClientKey(sock) {
    return `client-${sock.remoteAddress}:${sock.remotePort}`;
}

function getServerInfo(server) {

    var address = server.address();
    var tcpS = new serverInfo();
    tcpS.info.protocol = "tcp";
    tcpS.info.mode = "server";
    tcpS.info.address = address.address;   // 监听的地址
    tcpS.info.port = address.port;   //  监听的 端口
    tcpS.info.name = `${address.address}:${address.port}`;
    tcpS.info.key = getServerKey(server);
    tcpS.server = server;

    return tcpS;
}

function onConnected(sock, server) {

    var key = getServerKey(server);
    var serverInfo = tcpServer.servers.find(key);
    if (serverInfo) {
        var data = serverInfo.info;

        data.type = wsMessageTypes.onConnected;

        var remote = new clientInfo();
        remote.client = sock;
        remote.info.key = getClientKey(sock);
        remote.info.name = sock.remoteAddress + ':' + sock.remotePort;
        remote.info.address = sock.remoteAddress;
        remote.info.port = sock.remotePort;
        remote.info.protocol = 'tcp';
        remote.info.mode = 'client';

        serverInfo.clients.add(remote.info.key, remote);
        data.remoteInfo = remote.info;

        data.data = data.key + ' onConnected: ' + remote.info.name;

        wsRouter.send(JSON.stringify(data));

        sock.on('data', (data) => { onData(data, sock, server) });
        sock.on('close', (data) => { onClose(data, sock, server) });
    } else {
        //错误消息

    }


}

function onData(data, sock, server) {
    // 回发该数据，客户端将收到来自服务端的数据
    sock.write('tcp echo "' + data + '"');
  
    var key = getServerKey(server);
    var serverInfo = tcpServer.servers.find(key);
    if (serverInfo) {
        var wsData = serverInfo.info;
        wsData.type = wsMessageTypes.onData;
        var remotekey = getClientKey(sock);
        var remote = serverInfo.clients.find(remotekey);
        if (remote) {  
            wsData.remoteInfo = remote.info;
 
            wsData.data = '' + data; 

            wsRouter.send(JSON.stringify(wsData));

        } else {
            //錯誤處理

        }

    } else {
        //错误消息

    }

}

function onClose(data, sock, server) {
    console.log('tcp server onClose: ' + sock.remoteAddress + ' ' + sock.remotePort);


    var key = getServerKey(server);
    var serverInfo = tcpServer.servers.find(key);
    if (serverInfo) {
        var data = serverInfo.info;
        data.type = wsMessageTypes.onClose;
        var remotekey = getClientKey(sock);
        var remote = serverInfo.clients.find(remotekey);
        if (remote) {
            serverInfo.clients.remove(remote.info.key);

            data.remoteInfo = remote.info;

            data.data = 'tcp server onClose: ' + sock.remoteAddress + ' ' + sock.remotePort;


            wsRouter.send(JSON.stringify(data));

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

// tcp server  end ----


module.exports = router;
