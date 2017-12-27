var wsMessageTypes = {

    unset: 0x00,

    serverList: 0x01,
    onListening: 0x02,
    onConnected: 0x03,
    onData: 0x04,
    onClose: 0x05,

    info: 0x06,
    error: 0xff,
}

module.exports = wsMessageTypes;