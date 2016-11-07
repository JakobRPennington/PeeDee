var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var jQuery = require('jQuery');
var PORT = process.env.port || 3000;

/* Serve static files */
app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket) {
    console.log('A new user connected');
    socket.emit('connected');

    socket.on('disconnect', function() {
        console.log('A user disconnected');
    });

    socket.on('update', function(delta) {
        console.log("Delta: " + JSON.stringify(delta));
        socket.broadcast.emit('push-update', delta);
    });
});

http.listen(PORT, function() {
    console.log('listening on *:3018');
});