var Operation = require('./operation.js');
var OTManager = require('./ot');
var Delta = Quill.import('delta');
var socket = io();

var clientId = 0;
var outgoingBuffer = [];
var incomingBuffer = [];
var ILPO = -1; //Identifier of Last Propagated Operation
var ILAO = -1; //Identifier of Last Accepted Operation

/* -- Quill Scripts -- */
/* Initialise Quill editor */
var change = new Delta();
var editor = new Quill('#editor', {
    modules: {
        toolbar: true
    },
    placeholder: '',
    theme: 'snow'
});

/* Send updates to server */
editor.on('text-change', function(delta) {
    // For testing purposes only
    console.log("Local Delta" + JSON.stringify(delta));

    // Parse the delta JSON
    var retain = 0;
    var type = 0;
    var insertedText = "";
    var deletedLength = 0;
    for (var i = 0; i < delta.ops.length; i++) {
        if (delta.ops[i].retain) {
            retain = delta.ops[i].retain;
        }
        if (delta.ops[i].insert) {
            type = Operation.OP_INSERT;
            insertedText = delta.ops[i].insert;
        }
        if (delta.ops[i].delete) {
            type = Operation.OP_DELETE;
            deletedLength = delta.ops[i].delete;
        }
    }

    // Construct operation from parsed delta
    if (type === Operation.OP_INSERT) {
        var operation = new Operation.create(clientId, type, retain, insertedText.length, insertedText, 1, 0);
    } else if (type === Operation.OP_DELETE) {
        var operation = new Operation.create(clientId, type, retain, deletedLength, "", 1, 0);
    } else {
        // Something went wrong..
    }

    // Add the operation to the outgoing buffer (OB)
    outgoingBuffer.push(operation);
});

/* -- Socket.io Scripts -- */
/* A callback when a successful connection to the server is made */
socket.on('connected', function() {
    console.log("Connected! " + socket.id);
    clientId = socket.id;

    // For testing purposes only 
    createDummyData();
    //testOperation();
});

/* Recieve an update from the server */
socket.on('push-update', function(operation) {
    // This will likely be a list of operations, not just one operation
    incomingBuffer.push(operation);
});

/* Send and apply recieved operations on a timer */
setInterval(function() {
    // Only process the incoming buffer if there are new operations
    if (getOperationIndex(outgoingBuffer, ILPO) >= 0) {
        if (getOperationIndex(outgoingBuffer, ILPO) < (outgoingBuffer.length - 1)) {
            sendOutgoingBuffer();
        }
    } else {
        // Handle the case for before the ILPO is set
        if (outgoingBuffer.length > 0 && ILPO === -1) {
            sendOutgoingBuffer();
        }
    }

    // Incoming buffer can be applied regardless
    applyIncomingBuffer();
}, 200);

/* Apply the incoming buffer to the local instance of Quill */
function sendOutgoingBuffer() {
    // Only transform agains the incoming buffer if there are new items
    if (ILAO < incomingBuffer.length - 1) {
        // Mutually transform the incoming and outgoing buffers against each other
        var transformationResult = OTManager.doSLOT(outgoingBuffer.slice(getOperationIndex(outgoingBuffer, ILPO) + 1, outgoingBuffer.length), incomingBuffer);

        // Update the outgoing and incoming buffers with the transformed operations
        outgoingBuffer = outgoingBuffer.slice(0, getOperationIndex(outgoingBuffer, ILPO) + 1);
        outgoingBuffer.concat(transformationResult[0]);
        incomingBuffer = transformationResult[1];
    }

    // Send the unpropagated operation(s) to the server
    var unpropagatedOperations = outgoingBuffer.slice(getOperationIndex(outgoingBuffer, ILPO) + 1, outgoingBuffer.length);
    //console.log(unpropagatedOperations);
    socket.emit('update', outgoingBuffer.slice(getOperationIndex(outgoingBuffer, ILPO) + 1, outgoingBuffer.length), ILPO);

    // Update ILPO
    ILPO = outgoingBuffer[outgoingBuffer.length - 1].getOperationId();
}

/* Apply the incoming buffer to the local instance of Quill */
function applyIncomingBuffer() {
    while (ILAO < (incomingBuffer.length - 1)) {
        ILAO++;
        applyOperation(incomingBuffer[ILAO]);
    }
}

/* Apply an operation to the local instance of the Quill text editor */
function applyOperation(operation) {
    switch (operation.getType()) {
        case Operation.OP_INSERT:
            console.log("Operation: insert, Retain: " + operation.getOffset() + ", Text: " + operation.getText());
            editor.insertText(operation.getOffset(), operation.getText(), "silent");
            break;
        case Operation.OP_DELETE:
            console.log("Operation: delete, Retain: " + operation.getOffset() + ", Length: " + operation.getLength());
            editor.deleteText(operation.getOffset(), operation.getLength(), "silent");
            break;
    }
}

function getOperationIndex(qwe, id) {
    for (var i = 0; i < qwe.length; i++) {
        if (qwe[i].getOperationId() == id) {
            return i;
        }
    }
}

/************************************
 * Testing functions
 ************************************/
/* Test the creation and update of an operation */
function testOperation() {
    var testOperation1 = new Operation.create(1, 1, 10, 4, "Shia", 1, 0);
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

function printBuffer(list) {
    console.log("Printing buffer");
    for (var i = 0; i < list.length; i++) {
        console.log(list[i]);
    }
}

function createDummyData() {
    var testOperation1 = new Operation.create(1, Operation.OP_INSERT, 0, 5, "Shia ", 1, 0);
    var testOperation2 = new Operation.create(1, Operation.OP_INSERT, 5, 7, "LaBeouf", 1, 0);
    var testOperation3 = new Operation.create(1, Operation.OP_INSERT, 12, 1, "\n", 1, 0);
    incomingBuffer.push(testOperation1);
    incomingBuffer.push(testOperation2);
    incomingBuffer.push(testOperation3);
}