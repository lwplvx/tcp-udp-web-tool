var wsMessage=require('./wsMessage'); 

function clientInfo() {  
    this.info =new wsMessage(); 
    this.client={};

};
module.exports = clientInfo;