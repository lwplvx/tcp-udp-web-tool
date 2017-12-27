
var netProtocolTypes = require('./netProtocolTypes');

function NetServerInfo() {

    // NetProtocolTypes .TCP .UDP
    this.protocol = netProtocolTypes.TCP;
    this.key = '';
    this.name = '';
    this.address = '';
    this.port = 0;
    this.data = '';
    this.remoteInfo = new NetInfo();

     
    this. remoteAutoCloseSeconds= 30;
    this. remoteAutoClose = false;

    //  NetInfo[]
    this. remoteClients=[];


};
module.exports = NetServerInfo;
 