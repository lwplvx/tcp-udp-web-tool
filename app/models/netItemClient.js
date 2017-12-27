
var netInfo = require('./netInfo');

function NetItemClient() {
     
    this.info = new netInfo();
    this._socket = {}; 
}; 

module.exports = NetItemClient;
 