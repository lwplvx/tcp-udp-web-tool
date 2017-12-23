var net = require('net');
var config = require('../../config/config.default');
var host = config.host;

var tcpServer = {

    create: function (port, onListening, onConnected) {
        var socket;
        net.createServer(function (sock) {
            socket = sock;
            // 我们获得一个连接 - 该连接自动关联一个socket对象
            console.log('CONNECTED: ' +
                sock.remoteAddress + ':' + sock.remotePort);

            onConnected(sock);

            // 为这个socket实例添加一个"data"事件处理函数
            sock.on('data', function (data) {
                console.log('DATA ' + sock.remoteAddress + ': ' + data);
            });

            // 为这个socket实例添加一个"close"事件处理函数
            sock.on('close', function (data) {
                console.log('CLOSED: ' +
                    sock.remoteAddress + ' ' + sock.remotePort);
            });

        }).listen(port, host);

        console.log('tcpServer listening on ' + host + ':' + port);
        onListening({
            host: host,
            port: port
        });
    }
};


module.exports = tcpServer;