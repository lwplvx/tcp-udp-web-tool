
function wsMessage() {

    this.messageType;
    this.protocol;
    this.server;
    this.client;

    /*
     server client û��ֵ��ʱ�� ���ֵ�ſɿ�
    */
    this.data = '';

};
module.exports = wsMessage;