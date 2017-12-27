
var netProtocolTypes = require('./netProtocolTypes');

function NetInfo() {

    this.protocol = netProtocolTypes.UDP;
    this.key = '';
    this.name = '';
    this.address = '';
    this.port = 0;
    this.data = '';
    this.remoteInfo = new NetInfo();

};
module.exports = NetInfo;

