var wsMessageTypes = {

    serverList: 0x01,
    onListening: 0x02,
    onConnected: 0x03,
    onData: 0x04,
    info: 0x05,

    error: 0xff,
}

module.exports = wsMessageTypes;