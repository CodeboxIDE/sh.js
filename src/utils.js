function inherits(a, c) {
    function k() {
        this.constructor = a
    }
    k.prototype = c.prototype;
    a.prototype = new k
}

function isBoldBroken() {
    var a = z.createElement("span");
    a.innerHTML =
        "hello world";
    z.body.appendChild(a);
    var c = a.scrollWidth;
    a.style.fontWeight = "bold";
    var k = a.scrollWidth;
    z.body.removeChild(a);
    return c !== k
}