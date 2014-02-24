function inherits(a, c) {
    function k() {
        this.constructor = a
    }
    k.prototype = c.prototype;
    a.prototype = new k
}

function isVisible(el) {
    var eap,
        rect     = el.getBoundingClientRect(),
        docEl    = document.documentElement,
        vWidth   = window.innerWidth || docEl.clientWidth,
        vHeight  = window.innerHeight || docEl.clientHeight,
        efp      = function (x, y) { return document.elementFromPoint(x, y) },
        contains = "contains" in el ? "contains" : "compareDocumentPosition",
        has      = contains == "contains" ? 1 : 0x10;

    // Return false if it's not in the viewport
    if (rect.right < 0 || rect.bottom < 0 
            || rect.left > vWidth || rect.top > vHeight)
        return false;

    // Return true if any of its four corners are visible
    return (
          (eap = efp(rect.left,  rect.top)) == el || el[contains](eap) == has
      ||  (eap = efp(rect.right, rect.top)) == el || el[contains](eap) == has
      ||  (eap = efp(rect.right, rect.bottom)) == el || el[contains](eap) == has
      ||  (eap = efp(rect.left,  rect.bottom)) == el || el[contains](eap) == has
    );
}

function getSelection() {
    var html = "";
    if (typeof window.getSelection != "undefined") {
        return window.getSelection().toString();
    } else if (typeof document.selection != "undefined") {
        if (document.selection.type == "Text") {
            return document.selection.createRange().htmlText;
        }
    }
    return null;
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
    'isBoldBroken': isBoldBroken,
    'isVisible': isVisible,
    'getSelection': getSelection
};