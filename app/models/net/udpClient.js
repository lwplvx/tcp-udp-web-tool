
var config = require('../../../config/config.default');
var dgram = require('dgram');
var dictionary = require('../../structures/dictionary');

var udpClient = {
    clients: new dictionary(),
    create: function (port, onListening, error) {
        try {

            var udp = dgram.createSocket('udp4');

            udp.on('listening', function () {
                var address = udp.address();
                console.log('UDP Listening ' + address.address + ': ' + address.port);
                onListening(udp);
            });

            udp.on('messsage', function (data, rinfo) {
                console.log(`udp-${rinfo.address}:${rinfo.port}-> ${data}`);
            });

            udp.on('error', function (err) {
                console.log(err, 'udp err');
                error(err);
            });

            udp.bind(port);

        } catch (err) {
            error(err);
        }
    }
}; 

module.exports = udpClient;