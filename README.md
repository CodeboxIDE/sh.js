# sh.js
> Terminal emulator in Javascript (for running in browser)

There is a release as a desktop application using node-webkit.

### How to use it?

```
<html>
    <head>
        <script type="text/javascript" src="/sh.min.js"></script>
    </head>
    <body>
        <div id="terminal"></div>
        <script>
            var term = new Terminal({
                theme: "default",
                cols: 80,
                rows: 24
            });

            term.open(document.getElementById("terminal"));

            term.on("data", function (c) {
                socket.emit('input', { content: c });
            });

            term.write("Hello World!");

            term.sizeToFit();
            term.focus();
        </script>
    </body>
</html>
```