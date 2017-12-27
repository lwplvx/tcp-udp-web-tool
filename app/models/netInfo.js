
var netProtocolTypes = require('./netProtocolTypes');
 
function NetInfo() {

    this.protocol = netProtocolTypes.unset;
    this.key = '';
    this.name = '';
    this.address = '';
    this.port = 0;
    this.data = '';
    
    this.remoteInfo = {};

};
module.exports = NetInfo;

