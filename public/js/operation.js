// Define constants
var OP_INSERT = 1;
var OP_DELETE = 2;
var OP_UPDATE = 3;

var OP_NAME_INSERT = "INSERT";
var OP_NAME_DELETE = "DELETE";
var OP_NAME_UPDATE = "UPDATE";

// Declare and initialise variables of the Operation "class"
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