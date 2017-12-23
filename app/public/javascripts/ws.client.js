'use strict';

var ws = new WebSocket('ws://localhost:3000/ws');
var onmessages = [];

ws.onmessage = function (e) {
    console.log('_message');
    console.log(e.data);

    onmessages.forEach((itemFun, index) => {
        itemFun(e.data);
    });
};
ws.onerror = function (err) {
    console.log('_error');
    console.log(err);
};
ws.onopen = function () {
    console.log('_connect');

    ws.send('data  666666');
};
ws.onclose = function () {
    console.log('_close');
};


function send(message) {
    ws.send(message);
}

function onmessage(fun) {
    onmessages.push(fun);
}