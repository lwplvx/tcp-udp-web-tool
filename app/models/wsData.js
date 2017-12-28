 
var wsDataTypes = require('./wsDataTypes');

  
function wsData() {
    this.event = wsDataTypes.unset; 
    this.data = {};  // 各种对象  目前 有 entityUser  entitySender
};
module.exports = wsData;