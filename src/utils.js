function inherits(a, c) {
    function k() {
        this.constructor = a
    }
    k.prototype = c.prototype;
    a.prototype = new k
}

function isBoldBroken() {
    var a = document.createElement("span");
    a.innerHTML =
        "hello world";
    document.body.appendChild(a);
    var c = a.scrollWidth;
    a.style.fontWeight = "bold";
    var k = a.scrollWidth;
    document.body.removeChild(a);
    return c !== k
}

module.exports = {
    'inherits': inherits,
    'isBoldBroken': isBoldBroken
};