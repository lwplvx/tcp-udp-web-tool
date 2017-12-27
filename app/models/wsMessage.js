
function wsMessage() {

    this.messageType;
    this.protocol;
    this.server;
    this.client;

    /*
     server client 没有值的时候 这个值才可靠
    */
    this.data = '';

};
module.exports = wsMessage;