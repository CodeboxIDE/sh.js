var pty = require('pty.js');
var io = require('socket.io'),
    express = require('express'),
    http = require('http');

var btoa = function(s) {
    return (new Buffer(s)).toString('base64');
};

var atob = function(s) {
    return (new Buffer(s, 'base64')).toString('binary');
};

var app = express();

app.use(express.cookieParser());
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/build'));
 
var server = http.createServer(app);
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
        socket.emit('output', btoa(data));
    });

    socket.on('input', function (data) {
        term.write(atob(data));
    });

    socket.on('resize', function (data) {
        term.resize(data.w, data.h);
    });
});

var port = 5000;
var host = "0.0.0.0";

server.listen(port, host, function() {
    console.log("Listening on %s:%d in %s mode", host, port, app.settings.env);
});