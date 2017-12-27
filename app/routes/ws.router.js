
var WebSocket = require('ws');
var tcpServer = require('../models/net/tcpServer');
var udpClient = require('../models/net/udpClient');
var wsMessage = require('../models/wsMessage');
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

            console.log(data, 'data  message');
            try {
                var wsData = new wsMessage();
                wsData.messageType = wsMessageTypes.info;
                wsData.protocol = netProtocolTypes.Ws; //  'ws'; 
                wsData.data = 'echo ' + data;
                ws.send(JSON.stringify(wsData));

            } catch (e) {
                console.log(e, 'on message');
            }


            //wsRouter.group
            var conf = JSON.parse(data);
            console.log(conf, 'data  message conf');
            try {
                switch (conf.event) {
                    case "join":
                        var groupItem = {
                            uid: conf.uid,
                            token: conf.token,
                            client: ws,
                        };
                        wsRouter.group.push(groupItem);
                        //加入服务器成功，服务器回复 
                        let wsData = new wsMessage();
                        wsData.type = wsMessageTypes.info;
                        wsData.protocol = netProtocolTypes.Ws; //  'ws'; 
                        wsData.data = `${conf.event} ${conf.uid}-${conf.token}`;

                        ws.send(JSON.stringify(wsData));

                        //给上线的客户端 发送当前 UDP 服务列表 
                        udpClient.clients.forEach((item) => {
                            var info = item.info;
                            var wsData = new wsMessage();
                            wsData.protocol = info.protocol;

                            wsData.messageType = wsMessageTypes.onListening;

                            wsData.client = info;
                            wsData.data = `udp onListening ${info.address}:${info.port}`;

                            ws.send(JSON.stringify(wsData));
                        });

                        //给上线的客户端 发送当前 TCP 服务列表 
                        //   item 是 类型 netItemServer
                        tcpServer.servers.forEach((serverItem) => {
                            //发送 onListening  事件
                            var info = serverItem.info;
                            var wsData = new wsMessage();
                            wsData.protocol = info.protocol;
                            wsData.messageType = wsMessageTypes.onListening;
                            wsData.server = info;
                            //wsData.data = `tcp server onListening ${info.address}:${info.port}`;

                            ws.send(JSON.stringify(wsData));

                            //发送 server 下的 clients  
                            //  remoteClients 存的是 类型  clientItem 的对象
                            serverItem.info.remoteClients.forEach((clientItem) => {

                                var info = clientItem.info;
                                var wsData = new wsMessage();
                                wsData.protocol = info.protocol;
                                wsData.messageType = wsMessageTypes.onConnected;
                                wsData.client = info;
                                //wsData.data = `tcp server onListening ${info.address}:${info.port}`;

                                ws.send(JSON.stringify(wsData));

                            });
                        });

                        break;
                    case "tcp-server":

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
