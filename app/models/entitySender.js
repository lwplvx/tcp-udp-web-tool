
var wsMessageTypes = require('./wsMessageTypes');
var netProtocolTypes = require('./netProtocolTypes');


function entitySender() { 
    // tcp udp 
    this.protocol = netProtocolTypes.unset;
    this.netInfo = {};  // netInfo ����
    this.remoteNetInfo = {};  // netInfo ����
    this.data = ''; 
};
module.exports = entitySender;