
var wsMessageTypes = require('./wsMessageTypes');
var netProtocolTypes = require('./netProtocolTypes');


function wsMessage() {

    this.messageType = wsMessageTypes.unset;
    this.protocol = netProtocolTypes.unset;
    this.server = {};
    this.client = {};

    /*
     server client û��ֵ��ʱ�� ���ֵ�ſɿ�
    */
    this.data = '';

};
module.exports = wsMessage;