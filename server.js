var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var jQuery = require('jQuery');
var PORT = process.env.port || 3000;

var operationManager = require('./public/js/operation');
var OTManager = require('./public/js/ot');

/************************************
 * Listen for incoming connections
 ************************************/
http.listen(PORT, function() {
    console.log('listening on port ' + PORT);
    testOperation();
});

/************************************
 * Serve static files
 ************************************/
app.use(express.static(__dirname + '/public'));

/************************************
 * Handle socket connections
 ************************************/
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

/************************************
 * Testing functions
 ************************************/

/* Test the creation and update of an operation */
function testOperation() {
    var testOperation1 = new operationManager.create(1, 1, 10, 4, "Shia", 1, 0);
    console.log("Test: Operation creation")
    console.log(JSON.stringify(testOperation1));

    var testOperation2 = testOperation1.clone();
    console.log("Test: Operation cloning")
    console.log(JSON.stringify(testOperation2));

    testOperation2.setClientId(2);
    testOperation2.setType(2);
    testOperation2.setOffset(20);
    testOperation2.setLength(7);
    testOperation2.setText("LaBeouf");
    testOperation2.setKey(2);
    testOperation2.setValue(2);
    console.log("Test: Operation updating")
    console.log(JSON.stringify(testOperation2));

    console.log("Test: SIT test")
    OTManager.doSIT(testOperation1, testOperation2);
}