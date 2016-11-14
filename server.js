var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var jQuery = require('jQuery');
var unique = require('uniq');

var operationManager = require('./src/operation');
var OTManager = require('./src/ot');

var PORT = process.env.port || 3000;

// An array containing the incoming buffer arrays for each client
var incomingBuffers = [];
var outgoingBuffers = [];
var ILTOArray = []; // Identifier of Last Tramsformed Operation

// Map a clientId with the index of the respective incoming buffer 
var clientMap = new Map();

// Total number of clients who have connected to this session
var clientCounter = 0;

// A list of currently connected clients
var clientList = [];

/************************************
 * Listen for incoming connections
 ************************************/
http.listen(PORT, function() {
    console.log('listening on port ' + PORT);
    //testOperation();
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
    clientMap.set(socket.id, clientCounter);
    clientList.push(socket.id);
    incomingBuffers[clientCounter] = [];
    outgoingBuffers[clientCounter] = [];

    // For testing purposes only
    printClientList();

    socket.on('disconnect', function() {
        console.log('A user disconnected: ' + socket.id);
        clientList.splice(clientList.indexOf(socket.id), 1);

        // For testing purposes only
        printClientList();
    });

    socket.on('update', function(operations, ILPO) {
        var incomingBufferIndex = clientMap.get(socket.id);
        console.log(ILPO);
        for (var i = 0; i < operations.length; i++) {
            console.log(operations[i]);
            incomingBuffers[incomingBufferIndex].push(operations[i]);
        }
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

function printClientList() {
    for (var i = 0; i < clientList.length; i++) {
        console.log("Index: " + i + ", ClientId: " + clientList[i]);
    }
}