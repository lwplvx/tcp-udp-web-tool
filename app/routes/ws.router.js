
var WebSocket = require('ws');
var tcpServer = require('../models/net/tcpServer');
var tcpClient = require('../models/net/tcpClient');
var udpClient = require('../models/net/udpClient');
var wsMessage = require('../models/wsMessage');
var wsData = require('../models/wsData');
var wsDataTypes = require('../models/wsDataTypes');
var entitySender = require('../models/entitySender');
var wsMessageTypes = require('../models/wsMessageTypes');
var netProtocolTypes = require('../models/netProtocolTypes');

var wsRouter = {};
wsRouter.group = [];
wsRouter.wss;

wsRouter.init = function (server) {

    wss = new WebSocket.Server({ server });

    wss.on('connection', function connection(ws) {
        console.log('链接成功！');
        ws.on('message', function incoming(data) {

            // 打印 消息
            console.log(data, ' on message,_data');
            // 直接返回 收到的消息内容
            //try {
            //    var wsMsg = new wsMessage();
            //    wsMsg.messageType = wsMessageTypes.info;
            //    wsMsg.protocol = netProtocolTypes.Ws; //  'ws'; 
            //    wsMsg.data = 'ws echo ' + data;
            //    ws.send(JSON.stringify(wsMsg));

            //} catch (e) {
            //    console.log(e, 'on message');
            //}

            // 处理收到的消息
            var wsdata = new wsData();
            wsdata = JSON.parse(data);

            try {
                switch (wsdata.event) {
                    case wsDataTypes.join:  // join 
                        wsRouter.onUserJoin(ws, wsdata);
                        break;
                    case wsDataTypes.send:  // send
                        wsRouter.onSend(ws, wsdata);
                        break;
                    case "tcp-client":
                        break;
                    case "udp-listen":
                        // udpClient.start(udpC.port, udpC00000000000000.host);
                        break;
                    case "udp-client":
                        // udpClient.start(udpC.port, udpC.host);
                        break;
                }
            }
            catch (e) {
                console.log(e);
                //ws.send(JSON.stringify(e));
            }

        });
        ws.on('error', function () {

        });
    });
}

wsRouter.onSend = function (ws, wsdata) {
    // wsdata  是wsData  类型
    // 此处 wsdata.data  是 entitySender  类型
    var sender = new entitySender();
    sender = wsdata.data;

    console.log(sender, ' __sender');

    switch (sender.protocol) {
        case netProtocolTypes.TCP:
            // tcp  模式  netIfo  尝试 查找服务器 
            var netItemServer = tcpServer.servers.find(sender.netInfo.key); 
            if (netItemServer) {
                var tcpserver = netItemServer.info;
                //需要查找 remot 对应的 sock
                // sock.write('tcp echo "' + data + '"');  
                var remoteClient = tcpserver.remoteClients.find(sender.remoteNetInfo.key);

                console.log(remoteClient, ' finde remoteClient by: ' + sender.remoteNetInfo.key);

                if (remoteClient) {
                    remoteClient._socket.write(sender.data);
                }
            } else {
                // tcpClient 模式
                var tcpclient = tcpClient.clients.find(sender.netInfo.key);
                if (tcpclient) {
                    if (sender.remoteNetInfo) {
                        // sock.write('tcp echo "' + data + '"');    
                        tcpclient._socket.write(sender.data);
                    }
                }
            }

            break;
        case netProtocolTypes.UDP:
            var udp = udpClient.clients.find(sender.netInfo.key);
            if (udp) {
                if (sender.remoteNetInfo) {
                    var remote = sender.remoteNetInfo;

                    udp._socket.send(sender.data, remote.port, remote.address);
                }
            }
            break;
        default:
    }


};

wsRouter.onUserJoin = function (ws, wsdata) {

    // wsdata  是wsData  类型
    // 此处 wsdata.data  是 entityUser  类型


    var groupItem = {
        uid: wsdata.data.uid,
        username: wsdata.data.username,
        token: wsdata.data.token,
        client: ws,
    };
    wsRouter.group.push(groupItem);

    //加入服务器成功，服务器回复
    let wsMsg = new wsMessage();
    wsMsg.type = wsMessageTypes.info;
    wsMsg.protocol = netProtocolTypes.Ws; //  'ws'; 
    wsMsg.data = `${wsdata.event} ${wsdata.data.uid}-${wsdata.data.token}`;

    ws.send(JSON.stringify(wsMsg));

    //给上线的客户端 发送当前 UDP 服务列表 
    udpClient.clients.forEach((item) => {
        var info = item.info;
        var wsMsg = new wsMessage();
        wsMsg.protocol = info.protocol;

        wsMsg.messageType = wsMessageTypes.onListening;

        wsMsg.client = info;
        wsMsg.data = `udp onListening ${info.address}:${info.port}`;

        ws.send(JSON.stringify(wsMsg));
    });

    //给上线的客户端 发送当前 TCP 服务列表 
    //   item 是 类型 netItemServer
    tcpServer.servers.forEach((serverItem) => {
        //发送 onListening  事件
        var info = serverItem.info;
        var wsMsg = new wsMessage();
        wsMsg.protocol = info.protocol;
        wsMsg.messageType = wsMessageTypes.onListening;
        wsMsg.server = info;
        //wsData.data = `tcp server onListening ${info.address}:${info.port}`;

        ws.send(JSON.stringify(wsMsg));

        //发送 server 下的 clients  
        //  remoteClients 存的是 类型  clientItem 的对象
        serverItem.info.remoteClients.forEach((clientItem) => {

            var info = clientItem.info;
            var wsMsg = new wsMessage();
            wsMsg.protocol = info.protocol;
            wsMsg.messageType = wsMessageTypes.onConnected;
            wsMsg.client = info; 
            // 告诉界面是连接到了哪个 服务器 
            wsMsg.server = serverItem.info;
            //wsData.data = `tcp server onListening ${info.address}:${info.port}`;

            ws.send(JSON.stringify(wsMsg));

        });
    });

}

wsRouter.send = function (data) {
    //暂时发给所有人
    /**
            * 把消息发送到所有的客户端
           * wss.clients获取所有链接的客户端
           */
    wss.clients.forEach(function each(client) {
        client.send(data);
    });
}
module.exports = wsRouter;
