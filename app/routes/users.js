var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser')

var app = express()
  .use(bodyParser.json());

const users = [{
  id: 1,
  name: 'lwp',
  password:"123456",
  email: 'email@user.com',
  phone: '12345678901',
  token: 'token'
}, {
  id: 2,
  name: 'zbh',
  password:"123456",
  email: 'email2@user.com',
  phone: '222222',
  token: 'token-2'
},];

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.json(users);
});

//GET /users/:id => 404
router.get('/:id', function (req, res, next) {
  if (users.length <= req.params.id || req.params.id < 0) {
    res.statusCode = 404;
    return res.send('Error 404: No user found')
  }

  //GET /users/:id => 200
  res.json(users[req.params.id]);

});


//POST /users => 201  sign up
router.post('/', function (req, res) {

  //POST /users => 400  HTTP 400 错误 - 请求无效 (Bad request) 
  if (typeof req.param('name') === "undefined" ||
    typeof req.param('email') === "undefined" ||
    typeof req.param('password') === "undefined") {
    res.statusCode = 400;
    res.send('Error 400: user properties missing');
  }

  var id = users.length + 1;
  var newUser = {
    id: id,
    name: req.param('name'),
    email: req.param('email'),
    password: req.param('password'),
    phone: req.param('phone'),
    token: "token"+id,
  };
  users.push(newUser);
  res.statusCode = 201;
  //res.location('/users/' + users.length);
  res.json(newUser);
});


//POST sign in
router.post('/login', function (req, res, next) {

  res.send('post with a resource');
});


router.put('/', function (req, res, next) {
  res.send('put with a resource');
});

router.delete('/', function (req, res, next) {
  res.send('现在不支持删除');
});

module.exports = router;
