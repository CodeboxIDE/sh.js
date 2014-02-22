function inherits(a, c) {
    function k() {
        this.constructor = a
    }
    k.prototype = c.prototype;
    a.prototype = new k
}