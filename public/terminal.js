(function (exports, global) {function EventEmitter() {
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

function cancel(a) {
    a.preventDefault && a.preventDefault();
    a.returnValue = !1;
    a.stopPropagation && a.stopPropagation();
    a.cancelBubble = !0;
    return !1
};function inherits(a, c) {
    function k() {
        this.constructor = a
    }
    k.prototype = c.prototype;
    a.prototype = new k
};
function Terminal(a, k, y) {
    EventEmitter.call(this);

    var f;
    "object" === typeof a && (f = a, a = f.cols, k = f.rows, y = f.handler);
    this._options = f || {};
    this.cols = a || Terminal.geometry[0];
    this.rows = k || Terminal.geometry[1];
    if (y) this.on("data", y);
    this.cursorState = this.y = this.x = this.ydisp = this.ybase = 0;
    this.convertEol = this.cursorHidden = !1;
    this.state = 0;
    this.queue = "";
    this.scrollTop = 0;
    this.scrollBottom = this.rows - 1;
    this.wraparoundMode = this.insertMode = this.originMode = this.applicationCursor = this.applicationKeypad = !1;
    this.normal = null;
    this.virtualAltKey = this.virtualCtrlKey = this.selectionMode = !1;
    this.gcharset = this.charset = null;
    this.glevel = 0;
    this.charsets = [null];
    this.decLocator;
    this.x10Mouse;
    this.vt200Mouse;
    this.vt300Mouse;
    this.normalMouse;
    this.mouseEvents;
    this.sendFocus;
    this.utfMouse;
    this.sgrMouse;
    this.urxvtMouse;
    this.element;
    this.children;
    this.refreshStart;
    this.refreshEnd;
    this.savedX;
    this.savedY;
    this.savedCols;
    this.writable = this.readable = !0;
    this.curAttr = this.defAttr = 131840;
    this.params = [];
    this.currentParam = 0;
    this.postfix = this.prefix = "";
    this.lines = [];
    for (a = this.rows; a--;) this.lines.push(this.blankLine());
    this.tabs;
    this.setupStops()
}

function A() {
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
var v = this,
    z = this.document,
    s = 1;

inherits(Terminal, EventEmitter);
Terminal.colors =
    "#000000 #c81908 #00c01d #c8c221 #0033c5 #c73ac5 #00c6c7 #c7c7c7 #686868 #8a8a8a #67f86e #fff970 #6678fc #ff7cfd #65fdff #ffffff".split(" ");
Terminal.colors = function () {
    function a(a, c, f) {
        y.push("#" + k(a) + k(c) + k(f))
    }

    function k(a) {
        a = a.toString(16);
        return 2 > a.length ? "0" + a : a
    }
    var y = Terminal.colors,
        f = [0, 95, 135, 175, 215, 255],
        v;
    for (v = 0; 216 > v; v++) a(f[v / 36 % 6 | 0], f[v / 6 % 6 | 0], f[v % 6]);
    for (v = 0; 24 > v; v++) f = 8 + 10 * v, a(f, f, f);
    return y
}();
Terminal.defaultColors = {
    bg: "#000000",
    fg: "#f0f0f0"
};
Terminal.colors[256] = Terminal.defaultColors.bg;
Terminal.colors[257] = Terminal.defaultColors.fg;
Terminal.termName = "xterm";
Terminal.geometry = [80, 24];
Terminal.visualBell = !1;
Terminal.popOnBell = !1;
Terminal.scrollback = 1E3;
Terminal.screenKeys = !1;
Terminal.programFeatures = !1;
Terminal.debug = !1;
Terminal.focus = null;
Terminal.prototype.focus = function () {
    this.selectionMode = !1;
    this.inputElement.focus();
    Terminal.focus !== this && (Terminal.focus && (Terminal.focus.cursorState = 0, Terminal.focus.refresh(Terminal.focus.y, Terminal.focus.y), Terminal.focus.sendFocus && Terminal.focus.send("\u001b[O")), Terminal.focus = this, this.sendFocus && this.send("\u001b[I"), this.showCursor())
};
Terminal.prototype.toggleVirtualCtrlKey = function () {
    this.virtualCtrlKey = !this.virtualCtrlKey;
    this.ctrlKeyElement.className = this.virtualCtrlKey ? "active" : ""
};
Terminal.prototype.toggleVirtualAltKey = function () {
    this.virtualAltKey = !this.virtualAltKey;
    this.altKeyElement.className = this.virtualAltKey ? "active" : ""
};
Terminal.prototype.applyVirtualKey = function (a) {
    if (!this.virtualCtrlKey && !this.virtualAltKey) return a;
    var c = {
        altGraphKey: a.altGraphKey,
        altKey: a.altKey,
        charCode: a.charCode,
        ctrlKey: a.ctrlKey,
        keyCode: a.keyCode,
        metKey: a.metaKey,
        shiftKey: a.shiftKey,
        type: a.type,
        which: a.which,
        preventDefault: function () {
            a.preventDefault &&
                a.preventDefault()
        },
        stopPropagation: function () {
            a.stopPropagation && a.stopPropagation()
        }
    };
    this.virtualCtrlKey && (Terminal.ctrlKey = !0, this.toggleVirtualCtrlKey());
    this.virtualAltKey && (Terminal.altKey = !0, this.toggleVirtualAltKey());
    return c
};
Terminal.prototype.bindKeys = function () {
    if (!Terminal.focus) {
        var a = this;
        on(this.tabKeyElement, "touchend", function (c) {
            a.keyDown({
                keyCode: 9
            })
        }, !0);
        on(this.ctrlKeyElement, "touchend", function (c) {
            a.toggleVirtualCtrlKey()
        }, !0);
        on(this.altKeyElement, "touchend", function (c) {
            a.toggleVirtualAltKey()
        }, !0);
        on(this.escKeyElement,
            "touchend", function (c) {
                a.keyDown({
                    keyCode: 27
                })
            }, !0);
        on(this.leftKeyElement, "touchend", function (c) {
            a.keyDown({
                keyCode: 37
            })
        }, !0);
        on(this.downKeyElement, "touchend", function (c) {
            a.keyDown({
                keyCode: 40
            })
        }, !0);
        on(this.upKeyElement, "touchend", function (c) {
            a.keyDown({
                keyCode: 38
            })
        }, !0);
        on(this.rightKeyElement, "touchend", function (c) {
            a.keyDown({
                keyCode: 39
            })
        }, !0);
        for (var v = 0, y = [this.tabKeyElement, this.ctrlKeyElement, this.altKeyElement, this.escKeyElement, this.leftKeyElement, this.downKeyElement, this.upKeyElement, this.rightKeyElement,
                this.screenKeysElement
            ]; v < y.length; v++) on(y[v], "touchend", function (c) {
            a.focus();
            cancel(c)
        });
        on(this.inputElement, "keydown", function (c) {
            return a.keyDown(c)
        }, !0);
        on(this.inputElement, "keypress", function (c) {
            return a.keyPress(c)
        }, !0);
        on(z, "keydown", function (c) {
            var k = (isMac && c.metaKey || !isMac && c.ctrlKey) && 67 === c.keyCode;
            a.selectionMode && (!k && 48 <= c.keyCode && 222 >= c.keyCode && -1 === [91, 92, 93, 144, 145].indexOf(c.keyCode)) && a.inputElement.focus();
            !isMac && (k && c.shiftKey && z.execCommand) && (z.execCommand("copy", !0, null), cancel(c))
        })
    }
};
Terminal.prototype.open =
    function () {
        var a = this,
            E = 0,
            y;
        this.element = z.createElement("div");
        this.element.className = "terminal";
        for (this.children = []; E < this.rows; E++) y = z.createElement("div"), y.className = "terminal-row", y.setAttribute("data-row", (E + 1).toString()), this.element.appendChild(y), this.children.push(y);
        this.inputElement = z.createElement("textarea");
        this.inputElement.className = "terminal-input";
        this.inputElement.rows = "1";
        this.inputElement.autocorrect = "off";
        this.inputElement.autocapitalize = "off";
        this.containerElement = z.createElement("div");
        this.containerElement.type = "text";
        this.containerElement.className = "terminal-container";
        this.containerElement.id = "terminal_" + s++;
        this.sizeIndicatorElement = z.createElement("div");
        this.sizeIndicatorElement.className = "terminal-size-indicator";
        this.sizeIndicatorElement.innerHTML = "80x25";
        this.sizeIndicatorElement.style.display = "none";
        this.screenKeysElement = z.createElement("div");
        this.screenKeysElement.className = "terminal-screen-keys";
        this.tabKeyElement = z.createElement("button");
        this.ctrlKeyElement = z.createElement("button");
        this.altKeyElement = z.createElement("button");
        this.escKeyElement = z.createElement("button");
        this.leftKeyElement = z.createElement("button");
        this.downKeyElement = z.createElement("button");
        this.upKeyElement = z.createElement("button");
        this.rightKeyElement = z.createElement("button");
        this.tabKeyElement.innerHTML = "Tab";
        this.ctrlKeyElement.innerHTML = "Ctrl";
        this.altKeyElement.innerHTML = "Alt";
        this.escKeyElement.innerHTML = "Esc";
        this.leftKeyElement.innerHTML = "\u2190";
        this.downKeyElement.innerHTML = "\u2193";
        this.upKeyElement.innerHTML =
            "\u2191";
        this.rightKeyElement.innerHTML = "\u2192";
        this.screenKeysElement.appendChild(this.tabKeyElement);
        this.screenKeysElement.appendChild(this.ctrlKeyElement);
        this.screenKeysElement.appendChild(this.altKeyElement);
        this.screenKeysElement.appendChild(this.escKeyElement);
        this.screenKeysElement.appendChild(this.leftKeyElement);
        this.screenKeysElement.appendChild(this.downKeyElement);
        this.screenKeysElement.appendChild(this.upKeyElement);
        this.screenKeysElement.appendChild(this.rightKeyElement);
        this.containerElement.appendChild(this.element);
        this.containerElement.appendChild(this.inputElement);
        this.containerElement.appendChild(this.screenKeysElement);
        this.containerElement.appendChild(this.sizeIndicatorElement);
        z.body.appendChild(this.containerElement);
        this.screenKeysElement.style.display = v.navigator.userAgent.match(/(iPad|iPhone|Android)/) ? "block" : "none";
        this.refresh(0, this.rows - 1);
        this.bindKeys();
        this.focus();
        on(this.element, "mousedown", function (c) {
            c = null != c.button ? +c.button : null != c.which ? c.which - 1 : null;~
            navigator.userAgent.indexOf("MSIE") &&
                (c = 1 === c ? 0 : 4 === c ? 1 : c);
            2 === c && (a.element.contentEditable = "true", L(function () {
                a.element.contentEditable = "inherit"
            }, 1))
        }, !0);
        on(this.inputElement, "paste", function (c) {
            v.setTimeout(function () {
                a.commitInput("", c)
            }, 20)
        });
        this.bindMouse();
        null == Terminal.brokenBold && (Terminal.brokenBold = A());
        this.element.style.backgroundColor = Terminal.defaultColors.bg;
        this.element.style.color = Terminal.defaultColors.fg
};
Terminal.prototype.sizeToFit = function () {
    var a = z.createElement("div");
    a.className = "terminal";
    a.style.width = "0";
    a.style.height = "0";
    a.style.visibility =
        "hidden";
    var c = z.createElement("div");
    c.style.position = "absolute";
    c.innerHTML = "W";
    a.appendChild(c);
    this.containerElement.insertBefore(a, this.element.nextSibling);
    var k = this.element.clientWidth,
        f = this.element.clientHeight,
        v;
    for (v = 1; 2E3 > v && !(c.innerHTML += "W", c.offsetWidth > k); v++);
    c.innerHTML = "W";
    for (k = 1; 2E3 > k && !(c.innerHTML += "<br />W", c.offsetHeight > f); k++);
    c.parentNode.removeChild(c);
    a.parentNode.removeChild(a);
    this.resize(v, k)
};
Terminal.prototype.bindMouse = function () {
    function a(a) {
        var c, k, p, y;
        switch (a.type) {
        case "mousedown":
            c =
                null != a.button ? +a.button : null != a.which ? a.which - 1 : null;~
            navigator.userAgent.indexOf("MSIE") && (c = 1 === c ? 0 : 4 === c ? 1 : c);
            break;
        case "mouseup":
            c = 3;
            break;
        case "DOMMouseScroll":
            c = 0 > a.detail ? 64 : 65;
            break;
        case "mousewheel":
            c = 0 < a.wheelDeltaY ? 64 : 65
        }
        p = a.shiftKey ? 4 : 0;
        y = a.metaKey ? 8 : 0;
        k = a.ctrlKey ? 16 : 0;
        p = p | y | k;
        s.vt200Mouse ? p &= k : s.normalMouse || (p = 0);
        c = 32 + (p << 2) + c;
        if (k = u(a)) switch (f(c, k), a.type) {
        case "mousedown":
            F = c;
            break;
        case "mouseup":
            F = 32
        }
    }

    function c(a) {
        var k = F;
        (a = u(a)) && f(k + 32, a)
    }

    function y(a, c) {
        s.utfMouse ? 128 > c ? a.push(c) :
            (2046 < c && (c = 2046), a.push(192 | c >> 6), a.push(128 | c & 63)) : (254 < c && (c = 254), a.push(c))
    }

    function f(a, c) {
        if (s.vt300Mouse) {
            a &= 3;
            c.x -= 32;
            c.y -= 32;
            var f = "\u001b[24";
            if (0 === a) f += "1";
            else if (1 === a) f += "3";
            else if (2 === a) f += "5";
            else {
                if (3 === a) return;
                f += "0"
            }
            f += "~[" + c.x + "," + c.y + "]\r";
            s.send(f)
        } else s.decLocator ? (a &= 3, c.x -= 32, c.y -= 32, 0 === a ? a = 2 : 1 === a ? a = 4 : 2 === a ? a = 6 : 3 === a && (a = 3), s.send("\u001b[" + a + ";" + (3 === a ? 4 : 0) + ";" + c.y + ";" + c.x + ";" + (c.page || 0) + "&w")) : s.urxvtMouse ? (c.x -= 32, c.y -= 32, s.send("\u001b[" + a + ";" + c.x + ";" + c.y + "M")) :
            s.sgrMouse ? (c.x -= 32, c.y -= 32, s.send("\u001b[<" + (3 === (a & 3) ? a & -4 : a) + ";" + c.x + ";" + c.y + (3 === (a & 3) ? "m" : "M"))) : (f = [], y(f, a), y(f, c.x), y(f, c.y), s.send("\u001b[M" + H.fromCharCode.apply(H, f)))
    }

    function u(a) {
        if (null != a.pageX) {
            for (var c = a.pageX, f = a.target;
                "terminal-row" !== f.className;)
                if (f = f.parentNode, null == f) return;
            for (var k = f; k !== z.documentElement;) c -= k.offsetLeft, k = k.parentNode;
            c = Math.ceil(c / f.offsetWidth * s.cols);
            f = v.parseInt(f.getAttribute("data-row") || 1, 10);
            1 > c && (c = 1);
            1 > f && (f = 1);
            c > s.cols && (c = s.cols);
            f > s.rows &&
                (f = s.rows);
            return {
                x: c + 32,
                y: f + 32,
                down: "mousedown" === a.type,
                up: "mouseup" === a.type,
                wheel: a.type === p,
                move: "mousemove" === a.type
            }
        }
    }
    var q = this.element,
        s = this,
        F = 32,
        p = "onmousewheel" in v ? "mousewheel" : "DOMMouseScroll";
    on(q, "mousedown", function (f) {
        if (s.mouseEvents) {
            a(f);
            s.selectionMode || s.focus();
            if (s.vt200Mouse) return a({
                __proto__: f,
                type: "mouseup"
            }), cancel(f);
            s.normalMouse && on(z, "mousemove", c);
            if (!s.x10Mouse) {
                var p = function (f) {
                    a(f);
                    off(z, "mousemove", c);
                    off(z, "mouseup", p);
                    off(z, "mousedown", p);
                    return cancel(f)
                };
                on(z, "mouseup", p);
                on(z, "mousedown", p)
            }
            return cancel(f)
        }
    });
    on(q, "mouseup", function (a) {
        v.getSelection && 0 < v.getSelection().toString().length && (s.selectionMode = !0);
        v.setTimeout(function () {
            v.getSelection && 0 === v.getSelection().toString().length && (s.selectionMode = !1)
        }, 0)
    });
    on(q, "touchend", function (a) {
        s.selectionMode || s.focus();
        a.stopPropagation()
    });
    on(q, "click", function (a) {
        s.selectionMode || s.focus()
    });
    on(q, p, function (c) {
        if (s.mouseEvents && !s.x10Mouse && !s.vt300Mouse && !s.decLocator) return a(c), cancel(c)
    });
    on(q, p, function (a) {
        if (!s.mouseEvents && !s.applicationKeypad) return "DOMMouseScroll" === a.type ? s.scrollDisp(0 > a.detail ? -5 : 5) : s.scrollDisp(0 < a.wheelDeltaY ? -5 : 5), cancel(a)
    })
};
Terminal.prototype.destroy = function () {
    this.writable = this.readable = !1;
    this._events = {};
    this.handler = function () {};
    this.write = function () {}
};
Terminal.prototype.refresh = function (a, k) {
    var y, f, v, z, s, u, p, q, t, x, F, A, H, L = Terminal.focus === this;
    k - a >= this.rows / 2 && (H = this.element.parentNode) && H.removeChild(this.element);
    p = this.cols;
    for (f = a; f <= k; f++) {
        y = f + this.ydisp;
        z = this.lines[y];
        s = "";
        y = f === this.y && this.cursorState &&
            this.ydisp === this.ybase && !this.cursorHidden ? this.x : -1;
        x = this.defAttr;
        for (v = 0; v < p; v++) {
            q = z[v][0];
            u = z[v][1];
            v === y && (t = q, q = -1);
            q !== x && (x !== this.defAttr && (s += "</span>"), q !== this.defAttr && (s += "<span ", -1 === q ? (s += 'class="terminal-cursor" ', L ? (F = t >> 9 & 511, x = t & 511) : (F = t & 511, x = t >> 9 & 511), A = t >> 18) : (F = q & 511, x = q >> 9 & 511, A = q >> 18), s += 'style="', !L && -1 === q && (s += "outline:1px solid " + Terminal.colors[x] + ";"), A & 1 && (Terminal.brokenBold || (s += "font-weight:bold;"), 8 > x && (x += 8)), A & 2 && (s += "text-decoration:underline;"), 256 !== F && (s += "background-color:" +
                Terminal.colors[F] + ";"), 257 !== x && (s += "color:" + Terminal.colors[x] + ";"), s += '">'));
            switch (u) {
            case "&":
                s += "&amp;";
                break;
            case "<":
                s += "&lt;";
                break;
            case ">":
                s += "&gt;";
                break;
            default:
                s = " " >= u ? s + "&nbsp;" : s + u
            }
            x = q
        }
        x !== this.defAttr && (s += "</span>");
        this.children[f].innerHTML = s
    }
    H && H.appendChild(this.element)
};
Terminal.prototype.redrawCursor = function () {
    this.refresh(this.y, this.y)
};
Terminal.prototype.showCursor = function () {
    this.cursorState || (this.cursorState = 1);
    this.redrawCursor()
};
Terminal.prototype.scroll = function () {
    var a;
    ++this.ybase === Terminal.scrollback &&
        (this.ybase = this.ybase / 2 | 0, this.lines = this.lines.slice(-(this.ybase + this.rows) + 1));
    this.ydisp = this.ybase;
    a = this.ybase + this.rows - 1;
    a -= this.rows - 1 - this.scrollBottom;
    a === this.lines.length ? this.lines.push(this.blankLine()) : this.lines.splice(a, 0, this.blankLine());
    0 !== this.scrollTop && (0 !== this.ybase && (this.ybase--, this.ydisp = this.ybase), this.lines.splice(this.ybase + this.scrollTop, 1));
    this.updateRange(this.scrollTop);
    this.updateRange(this.scrollBottom)
};
Terminal.prototype.scrollDisp = function (a) {
    this.ydisp += a;
    this.ydisp >
        this.ybase ? this.ydisp = this.ybase : 0 > this.ydisp && (this.ydisp = 0);
    this.refresh(0, this.rows - 1)
};
Terminal.prototype.write = function (a) {
    var k = a.length,
        y = 0,
        f;
    this.refreshEnd = this.refreshStart = this.y;
    this.ybase !== this.ydisp && (this.ydisp = this.ybase, this.maxRange());
    for (; y < k; y++) switch (f = a[y], this.state) {
    case 0:
        switch (f) {
        case "\u0007":
            this.bell();
            break;
        case "\n":
        case "\x0B":
        case "\f":
            this.convertEol && (this.x = 0);
            this.y++;
            this.y > this.scrollBottom && (this.y--, this.scroll());
            break;
        case "\r":
            this.x = 0;
            break;
        case "\b":
            0 < this.x &&
                this.x--;
            break;
        case "\t":
            this.x = this.nextStop();
            break;
        case "\u000e":
            this.setgLevel(1);
            break;
        case "\u000f":
            this.setgLevel(0);
            break;
        case "\u001b":
            this.state = 1;
            break;
        default:
            " " <= f && (this.charset && this.charset[f] && (f = this.charset[f]), this.x >= this.cols && (this.x = 0, this.y++, this.y > this.scrollBottom && (this.y--, this.scroll())), this.lines[this.y + this.ybase][this.x] = [this.curAttr, f], this.x++, this.updateRange(this.y))
        }
        break;
    case 1:
        switch (f) {
        case "[":
            this.params = [];
            this.currentParam = 0;
            this.state = 2;
            break;
        case "]":
            this.params = [];
            this.currentParam = 0;
            this.state = 3;
            break;
        case "P":
            this.params = [];
            this.currentParam = 0;
            this.state = 5;
            break;
        case "_":
            this.state = 6;
            break;
        case "^":
            this.state = 6;
            break;
        case "c":
            this.reset();
            break;
        case "E":
            this.x = 0;
        case "D":
            this.index();
            break;
        case "M":
            this.reverseIndex();
            break;
        case "%":
            this.setgLevel(0);
            this.setgCharset(0, Terminal.charsets.US);
            this.state = 0;
            y++;
            break;
        case "(":
        case ")":
        case "*":
        case "+":
        case "-":
        case ".":
            switch (f) {
            case "(":
                this.gcharset = 0;
                break;
            case ")":
                this.gcharset = 1;
                break;
            case "*":
                this.gcharset =
                    2;
                break;
            case "+":
                this.gcharset = 3;
                break;
            case "-":
                this.gcharset = 1;
                break;
            case ".":
                this.gcharset = 2
            }
            this.state = 4;
            break;
        case "/":
            this.gcharset = 3;
            this.state = 4;
            y--;
            break;
        case "N":
            break;
        case "O":
            break;
        case "n":
            this.setgLevel(2);
            break;
        case "o":
            this.setgLevel(3);
            break;
        case "|":
            this.setgLevel(3);
            break;
        case "}":
            this.setgLevel(2);
            break;
        case "~":
            this.setgLevel(1);
            break;
        case "7":
            this.saveCursor();
            this.state = 0;
            break;
        case "8":
            this.restoreCursor();
            this.state = 0;
            break;
        case "#":
            this.state = 0;
            y++;
            break;
        case "H":
            this.tabSet();
            break;
        case "=":
            this.log("Serial port requested application keypad.");
            this.applicationKeypad = !0;
            this.state = 0;
            break;
        case ">":
            this.log("Switching back to normal keypad.");
            this.applicationKeypad = !1;
            this.state = 0;
            break;
        default:
            this.state = 0, this.error("Unknown ESC control: %s.", f)
        }
        break;
    case 4:
        switch (f) {
        case "0":
            f = Terminal.charsets.SCLD;
            break;
        case "A":
            f = Terminal.charsets.UK;
            break;
        case "B":
            f = Terminal.charsets.US;
            break;
        case "4":
            f = Terminal.charsets.Dutch;
            break;
        case "C":
        case "5":
            f = Terminal.charsets.Finnish;
            break;
        case "R":
            f = Terminal.charsets.French;
            break;
        case "Q":
            f = Terminal.charsets.FrenchCanadian;
            break;
        case "K":
            f = Terminal.charsets.German;
            break;
        case "Y":
            f = Terminal.charsets.Italian;
            break;
        case "E":
        case "6":
            f = Terminal.charsets.NorwegianDanish;
            break;
        case "Z":
            f = Terminal.charsets.Spanish;
            break;
        case "H":
        case "7":
            f = Terminal.charsets.Swedish;
            break;
        case "=":
            f = Terminal.charsets.Swiss;
            break;
        case "/":
            f = Terminal.charsets.ISOLatin;
            y++;
            break;
        default:
            f = Terminal.charsets.US
        }
        this.setgCharset(this.gcharset, f);
        this.gcharset = null;
        this.state = 0;
        break;
    case 3:
        if ("\u001b" === f || "\u0007" === f) {
            "\u001b" === f && y++;
            this.params.push(this.currentParam);
            switch (this.params[0]) {
            case 0:
            case 1:
            case 2:
                this.params[1] && (this.title = this.params[1], this.handleTitle(this.title))
            }
            this.params = [];
            this.state = this.currentParam = 0
        } else this.params.length ? this.currentParam += f : "0" <= f && "9" >= f ? this.currentParam = 10 * this.currentParam + f.charCodeAt(0) - 48 : ";" === f && (this.params.push(this.currentParam), this.currentParam = "");
        break;
    case 2:
        if ("?" === f || ">" === f || "!" === f) {
            this.prefix = f;
            break
        }
        if ("0" <= f && "9" >= f) {
            this.currentParam = 10 * this.currentParam + f.charCodeAt(0) - 48;
            break
        }
        if ("$" ===
            f || '"' === f || " " === f || "'" === f) {
            this.postfix = f;
            break
        }
        this.params.push(this.currentParam);
        this.currentParam = 0;
        if (";" === f) break;
        this.state = 0;
        switch (f) {
        case "A":
            this.cursorUp(this.params);
            break;
        case "B":
            this.cursorDown(this.params);
            break;
        case "C":
            this.cursorForward(this.params);
            break;
        case "D":
            this.cursorBackward(this.params);
            break;
        case "H":
            this.cursorPos(this.params);
            break;
        case "J":
            this.eraseInDisplay(this.params);
            break;
        case "K":
            this.eraseInLine(this.params);
            break;
        case "m":
            this.charAttributes(this.params);
            break;
        case "n":
            this.deviceStatus(this.params);
            break;
        case "@":
            this.insertChars(this.params);
            break;
        case "E":
            this.cursorNextLine(this.params);
            break;
        case "F":
            this.cursorPrecedingLine(this.params);
            break;
        case "G":
            this.cursorCharAbsolute(this.params);
            break;
        case "L":
            this.insertLines(this.params);
            break;
        case "M":
            this.deleteLines(this.params);
            break;
        case "P":
            this.deleteChars(this.params);
            break;
        case "X":
            this.eraseChars(this.params);
            break;
        case "`":
            this.charPosAbsolute(this.params);
            break;
        case "a":
            this.HPositionRelative(this.params);
            break;
        case "c":
            this.sendDeviceAttributes(this.params);
            break;
        case "d":
            this.linePosAbsolute(this.params);
            break;
        case "e":
            this.VPositionRelative(this.params);
            break;
        case "f":
            this.HVPosition(this.params);
            break;
        case "h":
            this.setMode(this.params);
            break;
        case "l":
            this.resetMode(this.params);
            break;
        case "r":
            this.setScrollRegion(this.params);
            break;
        case "s":
            this.saveCursor(this.params);
            break;
        case "u":
            this.restoreCursor(this.params);
            break;
        case "I":
            this.cursorForwardTab(this.params);
            break;
        case "S":
            this.scrollUp(this.params);
            break;
        case "T":
            2 > this.params.length && !this.prefix && this.scrollDown(this.params);
            break;
        case "Z":
            this.cursorBackwardTab(this.params);
            break;
        case "b":
            this.repeatPrecedingCharacter(this.params);
            break;
        case "g":
            this.tabClear(this.params);
            break;
        case "p":
            switch (this.prefix) {
            case "!":
                this.softReset(this.params)
            }
            break;
        default:
            this.error("Unknown CSI code: %s.", f)
        }
        this.postfix = this.prefix = "";
        break;
    case 5:
        if ("\u001b" === f || "\u0007" === f) {
            "\u001b" === f && y++;
            switch (this.prefix) {
            case "":
                break;
            case "$q":
                f = this.currentParam;
                var v = !1;
                switch (f) {
                case '"q':
                    f = '0"q';
                    break;
                case '"p':
                    f = '61"p';
                    break;
                case "r":
                    f = "" + (this.scrollTop + 1) + ";" + (this.scrollBottom + 1) + "r";
                    break;
                case "m":
                    f = "0m";
                    break;
                default:
                    this.error("Unknown DCS Pt: %s.", f), f = ""
                }
                this.send("\u001bP" + +v + "$r" + f + "\u001b\\");
                break;
            case "+p":
                break;
            case "+q":
                f = this.currentParam;
                v = !1;
                this.send("\u001bP" + +v + "+r" + f + "\u001b\\");
                break;
            default:
                this.error("Unknown DCS prefix: %s.", this.prefix)
            }
            this.currentParam = 0;
            this.prefix = "";
            this.state = 0
        } else this.currentParam ? this.currentParam +=
            f : !this.prefix && "$" !== f && "+" !== f ? this.currentParam = f : 2 === this.prefix.length ? this.currentParam = f : this.prefix += f;
        break;
    case 6:
        if ("\u001b" === f || "\u0007" === f) "\u001b" === f && y++, this.state = 0
    }
    this.updateRange(this.y);
    this.refresh(this.refreshStart, this.refreshEnd)
};
Terminal.prototype.writeln = function (a) {
    this.write(a + "\r\n")
};
Terminal.prototype.keyDown = function (a) {
    a = this.applyVirtualKey(a);
    var c = this,
        k = null;
    switch (a.keyCode) {
    case 8:
        if (a.shiftKey) {
            k = "\b";
            break
        }
        k = "\u007f";
        break;
    case 9:
        if (a.shiftKey) {
            k = "\u001b[Z";
            break
        }
        k =
            "\t";
        break;
    case 13:
        k = "\r";
        break;
    case 27:
        k = "\u001b";
        break;
    case 37:
        if (this.applicationCursor) {
            k = "\u001bOD";
            break
        }
        k = "\u001b[D";
        break;
    case 39:
        if (this.applicationCursor) {
            k = "\u001bOC";
            break
        }
        k = "\u001b[C";
        break;
    case 38:
        if (this.applicationCursor) {
            k = "\u001bOA";
            break
        }
        if (a.ctrlKey) return this.scrollDisp(-1), t(a);
        k = "\u001b[A";
        break;
    case 40:
        if (this.applicationCursor) {
            k = "\u001bOB";
            break
        }
        if (a.ctrlKey) return this.scrollDisp(1), t(a);
        k = "\u001b[B";
        break;
    case 46:
        k = "\u001b[3~";
        break;
    case 45:
        k = "\u001b[2~";
        break;
    case 36:
        if (this.applicationKeypad) {
            k =
                "\u001bOH";
            break
        }
        k = "\u001bOH";
        break;
    case 35:
        if (this.applicationKeypad) {
            k = "\u001bOF";
            break
        }
        k = "\u001bOF";
        break;
    case 33:
        if (a.shiftKey) return this.scrollDisp(-(this.rows - 1)), cancel(a);
        k = "\u001b[5~";
        break;
    case 34:
        if (a.shiftKey) return this.scrollDisp(this.rows - 1), cancel(a);
        k = "\u001b[6~";
        break;
    case 112:
        k = "\u001bOP";
        break;
    case 113:
        k = "\u001bOQ";
        break;
    case 114:
        k = "\u001bOR";
        break;
    case 115:
        k = "\u001bOS";
        break;
    case 116:
        k = "\u001b[15~";
        break;
    case 117:
        k = "\u001b[17~";
        break;
    case 118:
        k = "\u001b[18~";
        break;
    case 119:
        k = "\u001b[19~";
        break;
    case 120:
        k = "\u001b[20~";
        break;
    case 121:
        k = "\u001b[21~";
        break;
    case 122:
        k = "\u001b[23~";
        break;
    case 123:
        k = "\u001b[24~";
        break;
    default:
        if (a.ctrlKey && !a.altKey)!isMac && a.shiftKey && 86 === a.keyCode ? (k = "", v.setTimeout(function () {
            Terminal.commitInput("", a)
        }, 20)) : 65 <= a.keyCode && 90 >= a.keyCode ? k = H.fromCharCode(a.keyCode - 64) : 32 === a.keyCode ? k = H.fromCharCode(0) : 51 <= a.keyCode && 55 >= a.keyCode ? k = H.fromCharCode(a.keyCode - 51 + 27) : 56 === a.keyCode ? k = H.fromCharCode(127) : 219 === a.keyCode ? k = H.fromCharCode(27) : 221 === a.keyCode && (k = H.fromCharCode(29));
        else if (isMac && a.metaKey && 86 === a.keyCode) k = "", v.setTimeout(function () {
            Terminal.commitInput("", a)
        }, 20);
        else if (!a.ctrlKey && (!isMac && a.altKey || isMac && a.metaKey)) 65 <= a.keyCode && 90 >= a.keyCode ? k = "\u001b" + H.fromCharCode(a.keyCode + 32) : 192 === a.keyCode ? k = "\u001b`" : 48 <= a.keyCode && 57 >= a.keyCode && (k = "\u001b" + (a.keyCode - 48))
    }
    if (k) return this.commitInput(k, a), cancel(a);
    "" !== k && this.showBufferedText();
    return !0
};
Terminal.prototype.showBufferedText = function () {
    var a = this.inputElement;
    v.setTimeout(function () {
        0 < a.value.length && -1 === a.className.indexOf(" visible") &&
            (a.className += " visible")
    }, 0)
};
Terminal.prototype.commitInput = function (a, c) {
    var k = this.inputElement.value;
    0 < k.length && (a = k + a, this.inputElement.value = "", this.inputElement.className = this.inputElement.className.replace(" visible", ""));
    this.emit("key", a, c);
    this.showCursor();
    this.handler(a)
};
Terminal.prototype.setgLevel = function (a) {
    this.glevel = a;
    this.charset = this.charsets[a]
};
Terminal.prototype.setgCharset = function (a, c) {
    this.charsets[a] = c;
    this.glevel === a && (this.charset = c)
};
Terminal.prototype.keyPress = function (a) {
    a = this.applyVirtualKey(a);
    var c;
    if (a.metaKey && 118 === a.charCode) return !1;
    cancel(a);
    if (a.charCode) c = a.charCode;
    else if (null == a.which) c = a.keyCode;
    else if (0 !== a.which && 0 !== a.charCode) c = a.which;
    else return !1; if (c && !a.ctrlKey || c && a.altKey && a.ctrlKey || c && a.altKey || c && a.altGraphKey) c = H.fromCharCode(c), this.commitInput(c, a);
    return !1
};
Terminal.prototype.send = function (a) {
    var c = this;
    this.queue || L(function () {
        Terminal.handler(Terminal.queue);
        Terminal.queue = ""
    }, 1);
    this.queue += a
};
Terminal.prototype.bell = function () {
    if (Terminal.visualBell) {
        var a = this;
        this.element.style.borderColor = "white";
        L(function () {
            a.element.style.borderColor = ""
        }, 10);
        Terminal.popOnBell && this.focus()
    }
};
Terminal.prototype.log = function () {
    if (Terminal.debug && v.console && v.console.log) {
        var a = Array.prototype.slice.call(arguments);
        v.console.log.apply(v.console, a)
    }
};
Terminal.prototype.error = function () {
    if (Terminal.debug && v.console && v.console.error) {
        var a = Array.prototype.slice.call(arguments);
        v.console.error.apply(v.console, a)
    }
};
Terminal.prototype.resize = function (a, c) {
    var k, f, v;
    1 > a && (a = 1);
    1 > c && (c = 1);
    v = this.cols;
    if (v < a) {
        f = [this.defAttr, " "];
        for (k = this.lines.length; k--;)
            for (; this.lines[k].length <
                a;) this.lines[k].push(f)
    } else if (v > a)
        for (k = this.lines.length; k--;)
            for (; this.lines[k].length > a;) this.lines[k].pop();
    this.setupStops(v);
    this.cols = a;
    v = this.rows;
    if (v < c)
        for (f = this.element; v++ < c;) this.lines.length < c + this.ybase && this.lines.push(this.blankLine()), this.children.length < c && (k = z.createElement("div"), k.className = "terminal-row", k.setAttribute("data-row", v.toString()), f.appendChild(k), this.children.push(k));
    else if (v > c)
        for (; v-- > c;) this.lines.length > c + this.ybase && this.lines.shift(), this.children.length >
            c && (f = this.children.pop()) && f.parentNode.removeChild(f);
    this.rows = c;
    this.y >= c && (this.y = c - 1);
    this.x >= a && (this.x = a - 1);
    this.scrollTop = 0;
    this.scrollBottom = c - 1;
    this.refresh(0, this.rows - 1);
    this.normal = null;
    this.showSize(a, c);
    this.emit("resize", a, c)
};
Terminal.prototype.showSize = function (a, c) {
    var k = this.sizeIndicatorElement;
    k.innerHTML = a + "x" + c;
    k.style.display = "block";
    void 0 != this.showSizeTimeout && v.clearTimeout(this.showSizeTimeout);
    this.showSizeTimeout = v.setTimeout(function () {
        k.style.display = "none"
    }, 2E3)
};
Terminal.prototype.updateRange =
    function (a) {
        a < this.refreshStart && (this.refreshStart = a);
        a > this.refreshEnd && (this.refreshEnd = a)
};
Terminal.prototype.maxRange = function () {
    this.refreshStart = 0;
    this.refreshEnd = this.rows - 1
};
Terminal.prototype.setupStops = function (a) {
    null != a ? this.tabs[a] || (a = this.prevStop(a)) : (this.tabs = {}, a = 0);
    for (; a < this.cols; a += 8) this.tabs[a] = !0
};
Terminal.prototype.prevStop = function (a) {
    null == a && (a = this.x);
    for (; !this.tabs[--a] && 0 < a;);
    return a >= this.cols ? this.cols - 1 : 0 > a ? 0 : a
};
Terminal.prototype.nextStop = function (a) {
    null == a && (a = this.x);
    for (; !this.tabs[++a] &&
        a < this.cols;);
    return a >= this.cols ? this.cols - 1 : 0 > a ? 0 : a
};
Terminal.prototype.eraseRight = function (a, c) {
    for (var k = this.lines[this.ybase + c], f = [this.curAttr, " "]; a < this.cols; a++) k[a] = f;
    this.updateRange(c)
};
Terminal.prototype.eraseLeft = function (a, c) {
    var k = this.lines[this.ybase + c],
        f = [this.curAttr, " "];
    for (a++; a--;) k[a] = f;
    this.updateRange(c)
};
Terminal.prototype.eraseLine = function (a) {
    this.eraseRight(0, a)
};
Terminal.prototype.blankLine = function (a) {
    a = [a ? this.curAttr : this.defAttr, " "];
    for (var c = [], k = 0; k < this.cols; k++) c[k] = a;
    return c
};
Terminal.prototype.ch =
    function (a) {
        return a ? [this.curAttr, " "] : [this.defAttr, " "]
};
Terminal.prototype.is = function (a) {
    return 0 === ((this.termName || Terminal.termName) + "").indexOf(a)
};
Terminal.prototype.handler = function (a) {
    this.emit("data", a)
};
Terminal.prototype.handleTitle = function (a) {
    this.emit("title", a)
};
Terminal.prototype.index = function () {
    this.y++;
    this.y > this.scrollBottom && (this.y--, this.scroll());
    this.state = 0
};
Terminal.prototype.reverseIndex = function () {
    var a;
    this.y--;
    this.y < this.scrollTop && (this.y++, this.lines.splice(this.y + this.ybase, 0, this.blankLine(!0)), a =
        this.rows - 1 - this.scrollBottom, this.lines.splice(this.rows - 1 + this.ybase - a + 1, 1), this.updateRange(this.scrollTop), this.updateRange(this.scrollBottom));
    this.state = 0
};
Terminal.prototype.reset = function () {
    Terminal.call(this, this.cols, this.rows);
    this.refresh(0, this.rows - 1)
};
Terminal.prototype.tabSet = function () {
    this.tabs[this.x] = !0;
    this.state = 0
};
Terminal.prototype.cursorUp = function (a) {
    a = a[0];
    1 > a && (a = 1);
    this.y -= a;
    0 > this.y && (this.y = 0)
};
Terminal.prototype.cursorDown = function (a) {
    a = a[0];
    1 > a && (a = 1);
    this.y += a;
    this.y >= this.rows && (this.y = this.rows -
        1)
};
Terminal.prototype.cursorForward = function (a) {
    a = a[0];
    1 > a && (a = 1);
    this.x += a;
    this.x >= this.cols && (this.x = this.cols - 1)
};
Terminal.prototype.cursorBackward = function (a) {
    a = a[0];
    1 > a && (a = 1);
    this.x -= a;
    0 > this.x && (this.x = 0)
};
Terminal.prototype.cursorPos = function (a) {
    var c;
    c = a[0] - 1;
    a = 2 <= a.length ? a[1] - 1 : 0;
    0 > c ? c = 0 : c >= this.rows && (c = this.rows - 1);
    0 > a ? a = 0 : a >= this.cols && (a = this.cols - 1);
    this.x = a;
    this.y = c
};
Terminal.prototype.eraseInDisplay = function (a) {
    switch (a[0]) {
    case 0:
        this.eraseRight(this.x, this.y);
        for (a = this.y + 1; a < this.rows; a++) this.eraseLine(a);
        break;
    case 1:
        this.eraseLeft(this.x, this.y);
        for (a = this.y; a--;) this.eraseLine(a);
        break;
    case 2:
        for (a = this.rows; a--;) this.eraseLine(a)
    }
};
Terminal.prototype.eraseInLine = function (a) {
    switch (a[0]) {
    case 0:
        this.eraseRight(this.x, this.y);
        break;
    case 1:
        this.eraseLeft(this.x, this.y);
        break;
    case 2:
        this.eraseLine(this.y)
    }
};
Terminal.prototype.charAttributes = function (a) {
    for (var c = a.length, k = 0, f, v; k < c; k++)
        if (f = a[k], 30 <= f && 37 >= f) this.curAttr = this.curAttr & -261633 | f - 30 << 9;
        else if (40 <= f && 47 >= f) this.curAttr = this.curAttr & -512 | f - 40;
    else if (90 <=
        f && 97 >= f) f += 8, this.curAttr = this.curAttr & -261633 | f - 90 << 9;
    else if (100 <= f && 107 >= f) f += 8, this.curAttr = this.curAttr & -512 | f - 100;
    else if (0 === f) this.curAttr = this.defAttr;
    else if (1 === f) this.curAttr |= 262144;
    else if (4 === f) this.curAttr |= 524288;
    else if (7 === f || 27 === f) {
        if (7 === f) {
            if (this.curAttr >> 18 & 4) continue;
            this.curAttr |= 1048576
        } else if (27 === f) {
            if (~(this.curAttr >> 18) & 4) continue;
            this.curAttr &= -1048577
        }
        f = this.curAttr & 511;
        v = this.curAttr >> 9 & 511;
        this.curAttr = this.curAttr & -262144 | f << 9 | v
    } else 22 === f ? this.curAttr &= -262145 :
        24 === f ? this.curAttr &= -524289 : 39 === f ? (this.curAttr &= -261633, this.curAttr |= (this.defAttr >> 9 & 511) << 9) : 49 === f ? (this.curAttr &= -512, this.curAttr |= this.defAttr & 511) : 38 === f ? 5 === a[k + 1] && (k += 2, f = a[k] & 255, this.curAttr = this.curAttr & -261633 | f << 9) : 48 === f && 5 === a[k + 1] && (k += 2, f = a[k] & 255, this.curAttr = this.curAttr & -512 | f)
};
Terminal.prototype.deviceStatus = function (a) {
    if (this.prefix) {
        if ("?" === this.prefix) switch (a[0]) {
        case 6:
            this.send("\u001b[?" + (this.y + 1) + ";" + (this.x + 1) + "R")
        }
    } else switch (a[0]) {
    case 5:
        this.send("\u001b[0n");
        break;
    case 6:
        this.send("\u001b[" + (this.y + 1) + ";" + (this.x + 1) + "R")
    }
};
Terminal.prototype.insertChars = function (a) {
    var c, k, f;
    a = a[0];
    1 > a && (a = 1);
    c = this.y + this.ybase;
    k = this.x;
    for (f = [this.curAttr, " "]; a-- && k < this.cols;) this.lines[c].splice(k++, 0, f), this.lines[c].pop()
};
Terminal.prototype.cursorNextLine = function (a) {
    a = a[0];
    1 > a && (a = 1);
    this.y += a;
    this.y >= this.rows && (this.y = this.rows - 1);
    this.x = 0
};
Terminal.prototype.cursorPrecedingLine = function (a) {
    a = a[0];
    1 > a && (a = 1);
    this.y -= a;
    0 > this.y && (this.y = 0);
    this.x = 0
};
Terminal.prototype.cursorCharAbsolute =
    function (a) {
        a = a[0];
        1 > a && (a = 1);
        this.x = a - 1
};
Terminal.prototype.insertLines = function (a) {
    var c, k;
    a = a[0];
    1 > a && (a = 1);
    c = this.y + this.ybase;
    k = this.rows - 1 - this.scrollBottom;
    for (k = this.rows - 1 + this.ybase - k + 1; a--;) this.lines.splice(c, 0, this.blankLine(!0)), this.lines.splice(k, 1);
    this.updateRange(this.y);
    this.updateRange(this.scrollBottom)
};
Terminal.prototype.deleteLines = function (a) {
    var c, k;
    a = a[0];
    1 > a && (a = 1);
    c = this.y + this.ybase;
    k = this.rows - 1 - this.scrollBottom;
    for (k = this.rows - 1 + this.ybase - k; a--;) this.lines.splice(k + 1, 0, this.blankLine(!0)),
    this.lines.splice(c, 1);
    this.updateRange(this.y);
    this.updateRange(this.scrollBottom)
};
Terminal.prototype.deleteChars = function (a) {
    var c, k;
    a = a[0];
    1 > a && (a = 1);
    c = this.y + this.ybase;
    for (k = [this.curAttr, " "]; a--;) this.lines[c].splice(this.x, 1), this.lines[c].push(k)
};
Terminal.prototype.eraseChars = function (a) {
    var c, k, f;
    a = a[0];
    1 > a && (a = 1);
    c = this.y + this.ybase;
    k = this.x;
    for (f = [this.curAttr, " "]; a-- && k < this.cols;) this.lines[c][k++] = f
};
Terminal.prototype.charPosAbsolute = function (a) {
    a = a[0];
    1 > a && (a = 1);
    this.x = a - 1;
    this.x >= this.cols && (this.x =
        this.cols - 1)
};
Terminal.prototype.HPositionRelative = function (a) {
    a = a[0];
    1 > a && (a = 1);
    this.x += a;
    this.x >= this.cols && (this.x = this.cols - 1)
};
Terminal.prototype.sendDeviceAttributes = function (a) {
    0 < a[0] || (this.prefix ? ">" === this.prefix && (this.is("xterm") ? this.send("\u001b[>0;276;0c") : this.is("rxvt-unicode") ? this.send("\u001b[>85;95;0c") : this.is("linux") ? this.send(a[0] + "c") : this.is("screen") && this.send("\u001b[>83;40003;0c")) : this.is("xterm") || this.is("rxvt-unicode") || this.is("screen") ? this.send("\u001b[?1;2c") : this.is("linux") &&
        this.send("\u001b[?6c"))
};
Terminal.prototype.linePosAbsolute = function (a) {
    a = a[0];
    1 > a && (a = 1);
    this.y = a - 1;
    this.y >= this.rows && (this.y = this.rows - 1)
};
Terminal.prototype.VPositionRelative = function (a) {
    a = a[0];
    1 > a && (a = 1);
    this.y += a;
    this.y >= this.rows && (this.y = this.rows - 1)
};
Terminal.prototype.HVPosition = function (a) {
    1 > a[0] && (a[0] = 1);
    1 > a[1] && (a[1] = 1);
    this.y = a[0] - 1;
    this.y >= this.rows && (this.y = this.rows - 1);
    this.x = a[1] - 1;
    this.x >= this.cols && (this.x = this.cols - 1)
};
Terminal.prototype.setMode = function (a) {
    if ("object" === typeof a)
        for (var k = a.length, v =
                0; v < k; v++) this.setMode(a[v]);
    else if (this.prefix) {
        if ("?" === this.prefix) switch (a) {
        case 1:
            this.applicationCursor = !0;
            break;
        case 2:
            this.setgCharset(0, Terminal.charsets.US);
            this.setgCharset(1, Terminal.charsets.US);
            this.setgCharset(2, Terminal.charsets.US);
            this.setgCharset(3, Terminal.charsets.US);
            break;
        case 3:
            this.savedCols = this.cols;
            this.resize(132, this.rows);
            break;
        case 6:
            this.originMode = !0;
            break;
        case 7:
            this.wraparoundMode = !0;
            break;
        case 9:
        case 1E3:
        case 1002:
        case 1003:
            this.x10Mouse = 9 === a;
            this.vt200Mouse = 1E3 === a;
            this.normalMouse = 1E3 <
                a;
            this.mouseEvents = !0;
            this.element.style.cursor = "default";
            this.log("Binding to mouse events.");
            break;
        case 1004:
            this.sendFocus = !0;
            break;
        case 1005:
            this.utfMouse = !0;
            break;
        case 1006:
            this.sgrMouse = !0;
            break;
        case 1015:
            this.urxvtMouse = !0;
            break;
        case 25:
            this.cursorHidden = !1;
            break;
        case 1049:
        case 47:
        case 1047:
            this.normal || (a = {
                lines: this.lines,
                ybase: this.ybase,
                ydisp: this.ydisp,
                x: this.x,
                y: this.y,
                scrollTop: this.scrollTop,
                scrollBottom: this.scrollBottom,
                tabs: this.tabs
            }, this.reset(), this.normal = a, this.showCursor())
        }
    } else switch (a) {
    case 4:
        this.insertMode = !0
    }
};
Terminal.prototype.resetMode = function (a) {
    if ("object" === typeof a)
        for (var c = a.length, k = 0; k < c; k++) this.resetMode(a[k]);
    else if (this.prefix) {
        if ("?" === this.prefix) switch (a) {
        case 1:
            this.applicationCursor = !1;
            break;
        case 3:
            132 === this.cols && this.savedCols && this.resize(this.savedCols, this.rows);
            delete this.savedCols;
            break;
        case 6:
            this.originMode = !1;
            break;
        case 7:
            this.wraparoundMode = !1;
            break;
        case 9:
        case 1E3:
        case 1002:
        case 1003:
            this.mouseEvents = this.normalMouse = this.vt200Mouse = this.x10Mouse = !1;
            this.element.style.cursor =
                "";
            break;
        case 1004:
            this.sendFocus = !1;
            break;
        case 1005:
            this.utfMouse = !1;
            break;
        case 1006:
            this.sgrMouse = !1;
            break;
        case 1015:
            this.urxvtMouse = !1;
            break;
        case 25:
            this.cursorHidden = !0;
            break;
        case 1049:
        case 47:
        case 1047:
            this.normal && (this.lines = this.normal.lines, this.ybase = this.normal.ybase, this.ydisp = this.normal.ydisp, this.x = this.normal.x, this.y = this.normal.y, this.scrollTop = this.normal.scrollTop, this.scrollBottom = this.normal.scrollBottom, this.tabs = this.normal.tabs, this.normal = null, this.refresh(0, this.rows - 1),
                this.showCursor())
        }
    } else switch (a) {
    case 4:
        this.insertMode = !1
    }
};
Terminal.prototype.setScrollRegion = function (a) {
    this.prefix || (this.scrollTop = (a[0] || 1) - 1, this.scrollBottom = (a[1] || this.rows) - 1, this.y = this.x = 0)
};
Terminal.prototype.saveCursor = function (a) {
    this.savedX = this.x;
    this.savedY = this.y
};
Terminal.prototype.restoreCursor = function (a) {
    this.x = this.savedX || 0;
    this.y = this.savedY || 0
};
Terminal.prototype.cursorForwardTab = function (a) {
    for (a = a[0] || 1; a--;) this.x = this.nextStop()
};
Terminal.prototype.scrollUp = function (a) {
    for (a = a[0] || 1; a--;) this.lines.splice(this.ybase +
        this.scrollTop, 1), this.lines.splice(this.ybase + this.scrollBottom, 0, this.blankLine());
    this.updateRange(this.scrollTop);
    this.updateRange(this.scrollBottom)
};
Terminal.prototype.scrollDown = function (a) {
    for (a = a[0] || 1; a--;) this.lines.splice(this.ybase + this.scrollBottom, 1), this.lines.splice(this.ybase + this.scrollTop, 0, this.blankLine());
    this.updateRange(this.scrollTop);
    this.updateRange(this.scrollBottom)
};
Terminal.prototype.initMouseTracking = function (a) {};
Terminal.prototype.resetTitleModes = function (a) {};
Terminal.prototype.cursorBackwardTab =
    function (a) {
        for (a = a[0] || 1; a--;) this.x = this.prevStop()
};
Terminal.prototype.repeatPrecedingCharacter = function (a) {
    a = a[0] || 1;
    for (var c = this.lines[this.ybase + this.y], k = c[this.x - 1] || [this.defAttr, " "]; a--;) c[this.x++] = k
};
Terminal.prototype.tabClear = function (a) {
    a = a[0];
    0 >= a ? delete this.tabs[this.x] : 3 === a && (this.tabs = {})
};
Terminal.prototype.mediaCopy = function (a) {};
Terminal.prototype.setResources = function (a) {};
Terminal.prototype.disableModifiers = function (a) {};
Terminal.prototype.setPointerMode = function (a) {};
Terminal.prototype.softReset = function (a) {
    this.applicationCursor =
        this.applicationKeypad = this.wraparoundMode = this.originMode = this.insertMode = this.cursorHidden = !1;
    this.scrollTop = 0;
    this.scrollBottom = this.rows - 1;
    this.curAttr = this.defAttr;
    this.x = this.y = 0;
    this.charset = null;
    this.glevel = 0;
    this.charsets = [null]
};
Terminal.prototype.requestAnsiMode = function (a) {};
Terminal.prototype.requestPrivateMode = function (a) {};
Terminal.prototype.setConformanceLevel = function (a) {};
Terminal.prototype.loadLEDs = function (a) {};
Terminal.prototype.setCursorStyle = function (a) {};
Terminal.prototype.setCharProtectionAttr = function (a) {};
Terminal.prototype.restorePrivateValues =
    function (a) {};
Terminal.prototype.setAttrInRectangle = function (a) {
    for (var c = a[0], k = a[1], f = a[2], v = a[3], s = a[4], z, u; c < f + 1; c++) {
        z = this.lines[this.ybase + c];
        for (u = k; u < v; u++) z[u] = [s, z[u][1]]
    }
    this.updateRange(a[0]);
    this.updateRange(a[2])
};
Terminal.prototype.savePrivateValues = function (a) {};
Terminal.prototype.manipulateWindow = function (a) {};
Terminal.prototype.reverseAttrInRectangle = function (a) {};
Terminal.prototype.setTitleModeFeature = function (a) {};
Terminal.prototype.setWarningBellVolume = function (a) {};
Terminal.prototype.setMarginBellVolume = function (a) {};
Terminal.prototype.copyRectangle =
    function (a) {};
Terminal.prototype.enableFilterRectangle = function (a) {};
Terminal.prototype.requestParameters = function (a) {};
Terminal.prototype.selectChangeExtent = function (a) {};
Terminal.prototype.fillRectangle = function (a) {
    for (var c = a[0], k = a[1], f = a[2], v = a[3], s = a[4], z, u; k < v + 1; k++) {
        z = this.lines[this.ybase + k];
        for (u = f; u < s; u++) z[u] = [z[u][0], H.fromCharCode(c)]
    }
    this.updateRange(a[1]);
    this.updateRange(a[3])
};
Terminal.prototype.enableLocatorReporting = function (a) {};
Terminal.prototype.eraseRectangle = function (a) {
    var c = a[0],
        k = a[1],
        f = a[2],
        v = a[3],
        s, z, u;
    for (u = [this.curAttr, " "]; c < f + 1; c++) {
        s = this.lines[this.ybase + c];
        for (z = k; z < v; z++) s[z] = u
    }
    this.updateRange(a[0]);
    this.updateRange(a[2])
};
Terminal.prototype.setLocatorEvents = function (a) {};
Terminal.prototype.selectiveEraseRectangle = function (a) {};
Terminal.prototype.requestLocatorPosition = function (a) {};
Terminal.prototype.insertColumns = function () {
    for (var a = params[0], c = this.ybase + this.rows, k = [this.curAttr, " "], f; a--;)
        for (f = this.ybase; f < c; f++) this.lines[f].splice(this.x + 1, 0, k), this.lines[f].pop();
    this.maxRange()
};
Terminal.prototype.deleteColumns = function () {
    for (var a =
        params[0], c = this.ybase + this.rows, k = [this.curAttr, " "], f; a--;)
        for (f = this.ybase; f < c; f++) this.lines[f].splice(this.x, 1), this.lines[f].push(k);
    this.maxRange()
};
Terminal.charsets = {};
Terminal.charsets.SCLD = {
    "`": "\u25c6",
    a: "\u2592",
    b: "\t",
    c: "\f",
    d: "\r",
    e: "\n",
    f: "\u00b0",
    g: "\u00b1",
    h: "\u2424",
    i: "\x0B",
    j: "\u2518",
    k: "\u2510",
    l: "\u250c",
    m: "\u2514",
    n: "\u253c",
    o: "\u23ba",
    p: "\u23bb",
    q: "\u2500",
    r: "\u23bc",
    s: "\u23bd",
    t: "\u251c",
    u: "\u2524",
    v: "\u2534",
    w: "\u252c",
    x: "\u2502",
    y: "\u2264",
    z: "\u2265",
    "{": "\u03c0",
    "|": "\u2260",
    "}": "\u00a3",
    "~": "\u00b7"
};
Terminal.charsets.UK = null;
Terminal.charsets.US = null;
Terminal.charsets.Dutch = null;
Terminal.charsets.Finnish = null;
Terminal.charsets.French = null;
Terminal.charsets.FrenchCanadian = null;
Terminal.charsets.German = null;
Terminal.charsets.Italian = null;
Terminal.charsets.NorwegianDanish = null;
Terminal.charsets.Spanish = null;
Terminal.charsets.Swedish = null;
Terminal.charsets.Swiss = null;
Terminal.charsets.ISOLatin = null;
var isMac = ~navigator.userAgent.indexOf("Mac"),
    H = this.String,
    L = this.setTimeout;
Terminal.EventEmitter = EventEmitter;
Terminal.isMac = isMac;
Terminal.on = on;
Terminal.off = off;
Terminal.cancel = cancel;

exports.Terminal = Terminal;

})('object' === typeof module ? module.exports : (this.terminal = {}), this);