const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

const User = require('./public/classes/user.js');
const FretboardSession = require('./public/classes/fretboard_session.js');

let fretboardSession = new FretboardSession();

app.use(express.static(__dirname + '/public'));

function onConnection(socket){
  
  let currentUser = new User(socket.id)

  fretboardSession.addUser(currentUser);
  
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
    fretboardSession.removeUser(currentUser);
  });
}

io.on('connection', onConnection);

http.listen(port, () => console.log('listening on port ' + port));

let lastSentMessage = "";

setInterval(() => {
  // don't double send the same information
  if (JSON.stringify(fretboardSession) != lastSentMessage) {
    io.emit(
      'fretboard_session_update', fretboardSession
    );
  }
  lastSentMessage = JSON.stringify(fretboardSession)
}, 1000/60);


