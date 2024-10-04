var conn;
var peer = new Peer();
peer.on('open', function(id) {
document.getElementById("peerid").value=id;
});
conn.on('open', function() {
// Receive messages
conn.send('Hello!');
conn.on('data', function(data) {
  alert('Received', data);
});

// Send messages
conn.send('Hello!');
});