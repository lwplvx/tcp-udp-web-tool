 
var wsDataTypes = require('./wsDataTypes');

  
function wsData() {
    this.event = wsDataTypes.unset; 
    this.data = {};  // ���ֶ���  Ŀǰ �� entityUser  entitySender
};
module.exports = wsData;