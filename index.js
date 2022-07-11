const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

const User = require('./public/classes/user.js');
const ServerMessage = require('./public/classes/server_message.js');

let serverMessage = new ServerMessage();

app.use(express.static(__dirname + '/public'));

function onConnection(socket){
  
  let currentUser = new User(socket.id)

  serverMessage.addUser(currentUser);
  
  // when a client sends us drawing data, we send it to everyone else.
  
  socket.on('client_message', 
    function (clientMessage) {
      currentUser.position = clientMessage.position;
      
      if (clientMessage.mousePressed && currentUser.mousePressed) {
        currentUser.mouseHeld = true;
      } else {
        currentUser.mousePressed = clientMessage.mousePressed;
        currentUser.mouseHeld = false;
      }
    }
  );
  
  socket.join("fretboard");

  socket.on('disconnect', () => {
    serverMessage.removeUser(currentUser);
  });
}

io.on('connection', onConnection);

http.listen(port, () => console.log('listening on port ' + port));

let lastSentMessage = "";

setInterval(() => {
  // don't double send the same information
  if (JSON.stringify(serverMessage) != lastSentMessage) {
    io.emit(
      'fretboard_session_update', serverMessage
    );
  }
  lastSentMessage = JSON.stringify(serverMessage)
}, 1000/60);


