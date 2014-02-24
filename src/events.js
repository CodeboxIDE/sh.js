function EventEmitter() {
    this._events = this._events || {}
}

EventEmitter.prototype.addListener = function (a, c) {
    this._events[a] = this._events[a] || [];
    this._events[a].push(c)
};

EventEmitter.prototype.removeListener = function (a, c) {
    if (this._events[a])
        for (var k = this._events[a], f = k.length; f--;)
            if (k[f] === c || k[f].listener === c) {
                k.splice(f, 1);
                break
            }
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;


EventEmitter.prototype.removeAllListeners = function (a) {
    this._events[a] && delete this._events[a]
};

EventEmitter.prototype.once = function (a, c) {
    function k() {
        var f = Array.prototype.slice.call(arguments);
        this.removeListener(a, k);
        return c.apply(this, f)
    }
    k.listener = c;
    return this.on(a, k)
};

EventEmitter.prototype.emit = function (a) {
    if (this._events[a])
        for (var c = Array.prototype.slice.call(arguments, 1), k = this._events[a], f = k.length, v = 0; v < f; v++) k[v].apply(this, c)
};

EventEmitter.prototype.listeners = function (a) {
    return this._events[a] = this._events[a] || []
};

function on(a, c, k, f) {
    a.addEventListener(c, k, f || !1)
}

function off(a, c, k, f) {
    a.removeEventListener(c, k, f || !1)
}

function cancel(e) {
    e.preventDefault();
    e.stopPropagation && e.stopPropagation();
    e.cancelBubble = !0;
    return !1
}

module.exports= {
    'EventEmitter': EventEmitter,
    'on': on,
    'off': off,
    'cancel': cancel
};