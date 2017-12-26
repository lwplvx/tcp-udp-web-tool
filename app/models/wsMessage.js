
function wsMessage() {
    this.key = '';
    this.name = '';
    this.type = '';
    this.protocol = '';
    this.address = '';
    this.port = 0; 
    this.data = '';
    this.remoteInfo={};

};
module.exports = wsMessage;