
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));

function onConnection(socket){
  // when a client sends us drawing data, we send it to everyone else.
  socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));
  socket.on('cursor', (data) => socket.broadcast.emit('cursor', data));
  socket.on('click', (data) => socket.broadcast.emit('click', data));
}

io.on('connection', onConnection);

http.listen(port, () => console.log('listening on port ' + port));
