
var WebSocket = require('ws');

var wsRouter = {};
wsRouter.group = [];

wsRouter.wss;
wsRouter.init = function (server) {
    wss = new WebSocket.Server({ server });

    wss.on('connection', function connection(ws) {
        console.log('链接成功！');
        ws.on('message', function incoming(data) {

            console.log(data, 'data  message');
            ws.send(data + ' echo');

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
                        var reMsg = {
                            type: "message",
                            data: `${conf.event}   ${conf.uid}-${conf.token}`
                        }
                        ws.send(JSON.stringify(reMsg));
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
                ws.send(e);
            }

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
