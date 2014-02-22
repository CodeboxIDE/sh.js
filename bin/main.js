var pty = require('pty.js');
var io = require('socket.io'),
    express = require('express'),
    http = require('http');


var app = express();
 
app.configure(function () {
    app.use(express.cookieParser());
    app.use(express.static(__dirname + '/../build'));
    app.use(express.static(__dirname + '/../examples'));
});
 
var server = http.createServer(app).listen(5000);
var sio = io.listen(server);
 
sio.sockets.on('connection', function (socket) {
    console.log('A socket connected!');

    var term = pty.spawn('bash', [], {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: "./",
        env: process.env
    });

    term.on('data', function(data) {
        socket.emit('output', { content: data });
    });

    socket.on('input', function (data) {
        term.write(data.content);
    });

    socket.on('resize', function (data) {
        term.resize(data.w, data.h);
    });
});