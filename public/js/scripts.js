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
});

socket.on('push-update', function(delta) {
    // Logging for testing
    // console.log("Remote delta: " + JSON.stringify(delta.ops));
    // console.log("Position: " + delta.ops[0].retain);
    // console.log("Value: " + delta.ops[1].insert);

    // Handle incoming updates from the server
    editor.updateContents(delta, 'silent');
});