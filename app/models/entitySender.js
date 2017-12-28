
var wsMessageTypes = require('./wsMessageTypes');
var netProtocolTypes = require('./netProtocolTypes');


function entitySender() { 
    // tcp udp 
    this.protocol = netProtocolTypes.unset;
    this.netInfo = {};  // netInfo 对象
    this.remoteNetInfo = {};  // netInfo 对象
    this.data = ''; 
};
module.exports = entitySender;