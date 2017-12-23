var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {action:"home", title: 'tcp/udp web 测试工具' });
});
  

module.exports = router;
