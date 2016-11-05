var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var jQuery = require('jQuery');

/* Serve static files */
app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket) {
    console.log('A new user connected');
    socket.emit('connected', "Shia LaBeouf");

    socket.on('disconnect', function() {
        console.log('A user disconnected');
    });

    socket.on('update', function(delta) {
        console.log("Delta: " + JSON.stringify(delta));
        console.log(delta);
        var opNumber = 0;
        for (var operation in delta) {
            console.log("Operation");
            console.log(operation[opNumber].retain);
            opNumber++;
        }

        io.emit('push-update', delta);
    });
});

http.listen(3018, function() {
    console.log('listening on *:3018');
});