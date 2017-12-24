
var WebSocket = require('ws');
var tcpServer = require('../models/tcpServer');
var udpServer = require('../models/udpServer');

var wsRouter = {};
wsRouter.group = [];

wsRouter.wss;
wsRouter.init = function (server) {
    wss = new WebSocket.Server({ server });

    wss.on('connection', function connection(ws) {
        console.log('链接成功！');
        ws.on('message', function incoming(data) {

            console.log(data, 'data  message');

            ws.send(JSON.stringify({
                type: "echo",
                data: `${data}`
            }));  

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
                        var reMsg = {
                            type: "message",
                            data: `${conf.event}   ${conf.uid}-${conf.token}`
                        }
                        ws.send(JSON.stringify(reMsg));

                        //给上线的客户端 发送当前 UDP 服务列表 
                        udpServer.servers.forEach((serverItem) => {  
                            var address = serverItem.address();
                            var data = {
                                type: 'message',
                                data: 'udp server onListening: ' + address.address + ': ' + address.port
                            };
                            ws.send(JSON.stringify(data));  
                        }); 

                        //给上线的客户端 发送当前 TCP 服务列表 
                        tcpServer.servers.forEach((serverItem) => { 
                            var data = {
                                type: 'message',
                                data: 'tcp server onListening: ' + serverItem.address + ': ' + serverItem.port
                            };
                            ws.send(JSON.stringify(data));
                        }); 

                        break;
                    case "tcp-server":

                        break;
                    case "tcp-client":
                        break;
                    case "udp-listen":
                        // udpServer.start(udpC.port, udpC00000000000000.host);
                        break;
                    case "udp-client":
                        // udpServer.start(udpC.port, udpC.host);
                        break;
                }
            }
            catch (e) {
                console.log(e);
                ws.send(JSON.stringify(e));
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
