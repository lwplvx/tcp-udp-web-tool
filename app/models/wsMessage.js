
var wsMessageTypes = require('./wsMessageTypes');
var netProtocolTypes = require('./netProtocolTypes');


function wsMessage() {

    this.messageType = wsMessageTypes.unset;
    this.protocol = netProtocolTypes.unset;
    this.server = {};
    this.client = {};

    /*
     server client 没有值的时候 这个值才可靠
    */
    this.data = '';

};
module.exports = wsMessage;