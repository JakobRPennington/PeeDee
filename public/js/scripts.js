var Delta = Quill.import('delta');

var socket = io();

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
    console.log("Local Delta" + JSON.stringify(delta));
    socket.emit('update', delta);
});

/* -- Socket.io Scripts -- */
socket.on('connected', function() {
    console.log("Connected!");
    testOperation();
});

socket.on('push-update', function(delta) {
    // Handle incoming updates from the server
    editor.updateContents(delta, 'silent');
});



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