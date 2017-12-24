
var config = require('../../config/config.default');
var dgram = require('dgram');

var udpServer = { 
    servers: [],
    create: function (port, onListening,error) {
        try {

        var server = dgram.createSocket('udp4');

        server.on('listening', function () {
            var address = server.address();
            console.log('Listening ' + address.address + ': ' + address.port);
            onListening(server);
        });

        server.on('messsage', function (msg, rinfo) {
            console.log(`server got:${msg} from ${rinfo.address}:${rinfo.port}`);
        });

        server.on('error', function (err) {
            console.log(err, 'udp err');
            error(err);
        });

        server.bind(port);
        console.log('udpServer bind :' + port);
        } catch (err) {
            error(err);
        }
    }
};


module.exports = udpServer;