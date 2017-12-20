var net = require('net');
 
var tcpServer = {
    start: function (port, host) {
        net.createServer(function (sock) {

            // 我们获得一个连接 - 该连接自动关联一个socket对象
            console.log('CONNECTED: ' +
                sock.remoteAddress + ':' + sock.remotePort);

            // 为这个socket实例添加一个"data"事件处理函数
            sock.on('data', function (data) {
                console.log('DATA ' + sock.remoteAddress + ': ' + data);
                // 回发该数据，客户端将收到来自服务端的数据
                sock.write('You said "' + data + '"');
            });

            // 为这个socket实例添加一个"close"事件处理函数
            sock.on('close', function (data) {
                console.log('CLOSED: ' +
                    sock.remoteAddress + ' ' + sock.remotePort);
            });

        }).listen(port, host);

        console.log('tcpServer listening on ' + host + ':' + port);
    },
    close: function () {
        net.close();
        console.log('tcpServer.close');
    }
};
 

module.exports = tcpServer;