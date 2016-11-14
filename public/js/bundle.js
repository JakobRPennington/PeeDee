(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Define constants
var OP_INSERT = 1;
var OP_DELETE = 2;
var OP_UPDATE = 3;

var OP_NAME_INSERT = "INSERT";
var OP_NAME_DELETE = "DELETE";
var OP_NAME_UPDATE = "UPDATE";

// Declare and initialise variables of the Operation "class"
var operationId = "";
var clientId = "";
var type = OP_INSERT;
var offset = 0;
var length = 1;
var text = "";

// For supporting update operations
var key = 1;
var value = 0;

module.exports = {
    OP_INSERT: OP_INSERT,
    OP_DELETE: OP_DELETE,
    OP_INSERT_NAME: OP_NAME_INSERT,
    OP_DELETE_NAME: OP_NAME_DELETE,
    create: function(clientId, type, offset, length, text) {
        return new Operation(clientId, type, offset, length, text);
    }
};

/* Define the Operation "class" */
var Operation = function(clientId, type, offset, length, text, key, value) {
    this.operationId = '_' + Math.random().toString(36).substr(2, 9);
    this.clientId = clientId;
    this.type = type;
    this.opName = this.setName(type);
    this.offset = offset;
    this.length = length;
    this.text = text;
    this.key = key;
    this.value = value;
};

/***********************************************
 * Operation "class" methods
 ***********************************************/
Operation.prototype.getOperationId = function() {
    return this.operationId;
};

Operation.prototype.setOperationId = function(operationId) {
    this.operationId = operationId;
};

Operation.prototype.getClientId = function() {
    return this.clientId;
};

Operation.prototype.setClientId = function(clientId) {
    this.clientId = clientId;
};

Operation.prototype.getType = function() {
    return this.type;
};

Operation.prototype.setType = function(type) {
    this.type = type;
    this.setName(type);
};

Operation.prototype.getOffset = function() {
    return this.offset;
};

Operation.prototype.setOffset = function(offset) {
    this.offset = offset;
};

Operation.prototype.getLength = function() {
    return this.length;
};

Operation.prototype.setLength = function(length) {
    this.length = length;
};

Operation.prototype.getText = function() {
    return this.text;
};

Operation.prototype.setText = function(text) {
    this.text = text;
};

Operation.prototype.getName = function() {
    return this.opName;
};

Operation.prototype.setName = function(type) {
    switch (type) {
        case 1:
            return OP_NAME_INSERT;
        case 2:
            return OP_NAME_DELETE;
        case 3:
            return OP_NAME_UPDATE;
        default:
            return null;
    }
};

Operation.prototype.getKey = function() {
    return this.key;
};

Operation.prototype.setKey = function(key) {
    this.key = key;
};

Operation.prototype.getValue = function() {
    return this.value;
};

Operation.prototype.setValue = function(value) {
    this.value = value;
};

Operation.prototype.clone = function() {
    return new Operation(this.clientId, this.type, this.offset, this.length, this.text, this.key, this.value)
};

Operation.prototype.set = function(operation) {
    this.setType(operation.getType());
    this.setName(operation.getName());
    this.setOffset(operation.getOffset());
    this.setLength(operation.getLength());
    this.setText(operation.getText());
    this.setKey(operation.getKey());
    this.setValue(operation.getValue());
    this.setClientId(operation.getClientId());
};
},{}],2:[function(require,module,exports){
var operationManager = require('./operation');
/************************************
 * Operational Transformation using SLOT
 ************************************/

module.exports = {
    /* Symmetrically transform all items in two lists against each other */
    doSLOT: function(list1, list2) {
        if (list1.length === 0 || list2.length === 0) {
            return;
        }

        for (var i = 0; i < list2.length; i++) {
            for (var j = 0; j < list1.length; j++) {
                this.doSIT(list2[i], list1[j]);
            }
        }
        return [list1, list2];
    },
    /* Symmetrically transform one operation against a list of operations */
    doSLOTSingle: function(operation, list) {
        if (list.length === 0) {
            return;
        }

        for (var i = 0; i < list.length; i++) {
            this.doSIT(operation, list[i]);
        }
        return [operation, list];
    },
    /* Symetrically transform two operations against each other */
    doSIT: function(operation1, operation2) {
        var tempOperation1 = operation1.clone();
        var tempOperation2 = operation2.clone();
        console.log(JSON.stringify(tempOperation1));

        this.doInclusionTransformation(operation1, tempOperation2);
        this.doInclusionTransformation(operation2, tempOperation1);
    },
    /* Determine the type of transformation that needs to occur */
    doInclusionTransformation: function(operation1, operation2) {
        if (operation1.getType() == operationManager.OP_INSERT && operation2.getType() == operationManager.OP_INSERT) {
            // insert:insert
            this.ITInsertInsert(operation1, operation2);
        } else if (operation1.getType() == operationManager.OP_INSERT && operation2.getType() == operationManager.OP_DELETE) {
            // insert:delete
            this.ITInsertDelete(operation1, operation2);
        } else if (operation1.getType() == operationManager.OP_INSERT && operation2.getType() == operationManager.OP_UPDATE) {
            // insert:update
            this.ITInsertUpdate(operation1, operation2);
        } else if (operation1.getType() == operationManager.OP_DELETE && operation2.getType() == operationManager.OP_INSERT) {
            // delete:insert
            this.ITDeleteInsert(operation1, operation2);
        } else if (operation1.getType() == operationManager.OP_DELETE && operation2.getType() == operationManager.OP_DELETE) {
            // delete:delete
            this.ITDeleteDelete(operation1, operation2);
        } else if (operation1.getType() == operationManager.OP_DELETE && operation2.getType() == operationManager.OP_UPDATE) {
            // delete:update
            this.ITDeleteUpdate(operation1, operation2);
        } else if (operation1.getType() == operationManager.OP_UPDATE && operation2.getType() == operationManager.OP_INSERT) {
            // update:insert
            this.ITUpdateInsert(operation1, operation2);
        } else if (operation1.getType() == operationManager.OP_UPDATE && operation2.getType() == operationManager.OP_DELETE) {
            // update:delete
            this.ITUpdateDelete(operation1, operation2);
        } else if (operation1.getType() == operationManager.OP_UPDATE && operation2.getType() == operationManager.OP_UPDATE) {
            // update:update
            this.ITUpdateUpdate(operation1, operation2);
        }
    },
    /* Perform all permutations of INSERT, DELETE and UPDATE operations */
    ITInsertInsert: function(operation1, operation2) {
        if (operation1.getOffset() > operation2.getOffset()) {
            operation1.setOffset(operation1.getOffset() + operation2.getLength());
        } else if ((operation1.getOffset() == operation2.getOffset()) && operation1.getClientId() > operation2.getClientId()) {
            operation1.setOffset(operation1.getOffset() + operation2.getLength());
        } else return;
    },
    ITInsertDelete: function(operation1, operation2) {
        if (operation2.getLength() == 0 || operation1.getOffset() <= operation2.getOffset()) {
            return;
        } else if (operation1.getOffset() > (operation2.getOffset() + operation2.getLength())) {
            operation1.setOffset(operation1.getOffset() - operation2.getLength());
        } else if (operation1.getOffset() == (operation2.getOffset() + operation2.getLength())) {
            operation1.setOffset(operation2.getOffset());
        } else {
            operation1.setOffset(operation2.getOffset());
            operation1.setLength(0);
            operation1.setText("");
        }
    },
    ITInsertUpdate: function(operation1, operation2) {
        return;
    },
    ITDeleteInsert: function(operation1, operation2) {
        if (operation2.getOffset() >= (operation1.getOffset() + operation1.getLength())) {
            return;
        } else if (operation1.getOffset() >= operation2.getOffset()) {
            operation1.setOffset(operation1.getOffset() + operation2.getLength());
        } else {
            operation1.setLength(operation1.getLength() + operation2.getLength());
        }
    },
    ITDeleteDelete: function(operation1, operation2) {
        if (operation2.getLength() == 0 || operation2.getOffset() >= (operation1.getOffset() + operation1.getLength())) {
            // Operation1 ---------- || ----------
            // Operation2            ||             ----------
            return;
        } else if (operation1.getOffset() >= (operation2.getOffset() + operation2.getLength())) {
            // Operation1         ---------- 
            // Operation2 ------          
            operation1.setOffset(operation1.getOffset() - operation2.getLength());
        } else if ((operation2.getOffset() <= operation1.getOffset()) && (operation1.getOffset() + operation1.getLength() <= operation2.getOffset() + operation2.getLength())) {
            // Operation1    ---------- 
            // Operation2 ---------------         
            operation1.setLength(0);
        } else if (operation2.getOffset() <= operation1.getOffset() && operation1.getOffset() + operation1.getLength() > operation2.getOffset() + operation2.getLength()) {
            // Operation1      -----------
            // Operation2 ----------
            var tempOffset = operation1.getOffset();
            operation1.setOffset(operation2.getOffset());
            operation1.setLength((tempOffset + operation1.getLength()) - (operation2.getOffset() + operation2.getLength()))
        } else if (operation2.getOffset() > operation1.getOffset() && operation2.getOffset() + operation2.getLength() >= operation1.getOffset() + operation1.getLength()) {
            // Operation1 --------
            // Operation2    --------
            operation1.setLength(operation2.getOffset() - operation1.getOffset());
        } else if (operation2.getOffset() > operation1.getOffset() && operation2.getOffset() + operation2.getLength() > operation1.getOffset() + operation1.getLength()) {
            // Operation 1 -------------
            // Operation2     ------
            operation1.setLength(operation1.getLength() - operation2.getLength())
        } else {
            return;
        }
    },
    ITDeleteUpdate: function(operation1, operation2) {
        return;
    },
    ITUpdateInsert: function(operation1, operation2) {
        if (op2.getOffset() >= operation1.getOffset() + operation1.getLength()) {
            return;
        } else if (operation1.getOffset() >= operation2.getOffset()) {
            operation1.setOffset(operation1.getOffset() + operation2.getLength());
        } else {
            operation1.setLength(operation1.getLength() + operation2.getLength());
        }
    },
    ITUpdateDelete: function(operation1, operation2) {
        if (operation2.getLength() == 0 || operation2.getOffset() >= (operation1.getOffset() + operation1.getLength())) {
            // Operation1 ---------- || ----------
            // Operation2            ||             ----------
            return;
        } else if (operation1.getOffset() >= (operation2.getOffset() + operation2.getLength())) {
            // Operation1         ---------- 
            // Operation2 ------          
            operation1.setOffset(operation1.getOffset() - operation2.getLength());
        } else if ((operation2.getOffset() <= operation1.getOffset()) && (operation1.getOffset() + operation1.getLength() <= operation2.getOffset() + operation2.getLength())) {
            // Operation1    ---------- 
            // Operation2 ---------------         
            operation1.setLength(0);
        } else if (operation2.getOffset() <= operation1.getOffset() && operation1.getOffset() + operation1.getLength() > operation2.getOffset() + operation2.getLength()) {
            // Operation1      -----------
            // Operation2 ----------
            var tempOffset = operation1.getOffset();
            operation1.setOffset(operation2.getOffset());
            operation1.setLength((tempOffset + operation1.getLength()) - (operation2.getOffset() + operation2.getLength()))
        } else if (operation2.getOffset() > operation1.getOffset() && operation2.getOffset() + operation2.getLength() >= operation1.getOffset() + operation1.getLength()) {
            // Operation1 --------
            // Operation2    --------
            operation1.setLength(operation2.getOffset() - operation1.getOffset());
        } else if (operation2.getOffset() > operation1.getOffset() && operation2.getOffset() + operation2.getLength() > operation1.getOffset() + operation1.getLength()) {
            // Operation 1 -------------
            // Operation2     ------
            operation1.setLength(operation1.getLength() - operation2.getLength())
        } else {
            return;
        }
    },
    ITUpdateUpdate: function(operation1, operation2) {
        if (operation1.getKey() != operation2.getKey()) {
            return;
        } else if (operation2.getLength() == 0 || operation2.getOffset() >= operation1.getOffset() + operation1.getLength() || operation1.getOffset() >= (operation2.getOffset() + operation2.getLength())) {
            // Operation1 ---------- || ----------              ||            ----------
            // Operation2            ||             ----------  || ---------
            return;
        } else if ((operation2.getOffset() <= operation1.getOffset()) && (operation1.getOffset() + operation1.getLength() <= operation2.getOffset() + operation2.getLength())) {
            // Operation1    ---------- 
            // Operation2 --------------- 
            operation1.setLength(0);
        } else if (operation2.getOffset() <= operation1.getOffset() && operation1.getOffset() + operation1.getLength() > operation2.getOffset() + operation2.getLength()) {
            // Operation1      -----------
            // Operation2 ----------
            if (operation1.getClientId() > operation2.getClientId()) {
                operation1.setOffset(operation2.getOffset() + operation2.getLength());
                operation1.setLength(operation1.getOffset() + operation1.getLength() - (operation2.getOffset() + operation2.getLength()));
            } else {
                return;
            }
        } else if (operation2.getOffset() > operation1.getOffset() && operation2.getOffset() + operation2.getLength() >= operation1.getOffset() + operation1.getLength()) {
            // Operation1 --------
            // Operation2    --------
            if (operation1.getClientId() > operation2.getClientId()) {
                operation1.setLength(operation2.getOffset - operation1.getOffset());
            } else {
                return;
            }
        } else if (operation2.getOffset() > operation1.getOffset() && operation2.getOffset() + operation2.getLength() > operation1.getOffset() + operation1.getLength()) {
            // Operation 1 -------------
            // Operation2     ------
            return;
        } else {
            return;
        }
    },
}
},{"./operation":1}],3:[function(require,module,exports){
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
            console.log("New item in outgoing buffer");
            sendOutgoingBuffer();
        }
    } else {
        // Handle the case for before the ILPO is set
        if (outgoingBuffer.length > 0 && ILPO === -1) {
            console.log("First item in outgoing buffer");
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
},{"./operation.js":1,"./ot":2}]},{},[3]);
