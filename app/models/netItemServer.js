
var netServerInfo = require('./netServerInfo');

function NetItemServer() {
     
    this.info = new netServerInfo();
    this._socket = {};
    
}; 

module.exports = NetItemServer;
 