
var netProtocolTypes = require('./netProtocolTypes');
var netInfo = require('./netInfo');
var dictionary = require('../structures/dictionary');

function NetServerInfo() {

    // NetProtocolTypes .TCP .UDP
    this.protocol = netProtocolTypes.TCP; 
    this.key = '';
    this.name = '';
    this.address = '';
    this.port = 0;
    this.data = '';
    this.remoteInfo = {};   

    this.remoteAutoCloseSeconds = 30;
    this.remoteAutoClose = false; 
    //  NetInfo[]
    this.remoteClients = new dictionary();
    
};


module.exports = NetServerInfo;


//var wsMessage=require('./wsMessage');
//var dictionary = require('../structures/dictionary');

//function serverInfo() {  
//    this.info =new wsMessage();
//    this.clients=new dictionary(); 
//    this.server;

//};

//module.exports = serverInfo;
