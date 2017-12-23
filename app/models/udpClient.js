import { on } from 'cluster';

 
var config = require('../../config/config.default');
var host = config.host;
var dgram=require('dgram');



var udpServer = {

    create: function (port, onBind,onListening) { 
        var server=dgram.createSocket('udp4'); 
       
        server.on('listening', function () {
            var address=server.address();
            console.log('Listening ' + address.address + ': ' + address.port);
            onListening(server);
        });

        server.on('messsage', function (msg,rinfo) { 
            console.log(`server got:${msg} from ${rinfo.address}:${rinfo.port}`); 
        });

        server.on('error', function (err) { 
            console.log(err,'udp err');
        });
        
        server.bind(port);
        console.log('udpServer bind ' + host + ':' + port); 
        onBind(server);
    }
};


module.exports = tcpServer;