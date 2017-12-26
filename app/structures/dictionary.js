

// Dictionary ��

function Dictionary() {
    this.datastore = new Array();
    this.add = add;
    this.find = find;
    this.remove = remove;
    this.showAll = showAll;
    this.count = count;
    this.clear = clear;
    this.forEach = forEach;
}

function add(key, value) {
    this.datastore[key] = value;
}

function find(key) {
    return this.datastore[key];
}

function remove(key) {
    delete this.datastore[key];
}

function showAll() {
    Object.keys(this.datastore).forEach((key) => {
        console.log(`${key} -> ${this.datastore[key]}`);
    });
}

function showSortAll() {
    // sort ������ 
    Object.keys(this.datastore).sort().forEach((key) => {
        console.log(`${key} -> ${this.datastore[key]}`);
    });
}

function count() {
    var n = 0;
    Object.keys(this.datastore).forEach(() => {
        n++;
    });
    return n;
}

function clear() {
    Object.keys(this.datastore).forEach((key) => {
        delete this.datastore[key];
    });
}

/* ʵ�� callback (value,key)*/
function forEach(callback) {
    Object.keys(this.datastore).forEach((key) => {
        callback(this.datastore[key], key);
    });
}

module.exports = Dictionary;
