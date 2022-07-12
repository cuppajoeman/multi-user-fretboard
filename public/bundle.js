(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
class ClientMessage {
    constructor(position, mousePressed) {
        this.position = position;
        this.mousePressed = mousePressed;
    }
}

module.exports = ClientMessage;

},{}],2:[function(require,module,exports){
class FretboardSession {
  constructor() {
      this.connectedUsers = [];
      this.timeCreated = new Date(); 
  }
  
  getUser(id) {
    return this.connectedUsers.find(u => u.id === id);
  }
  
  addUser(user) {
      this.connectedUsers.push(user);
  }
    
  removeUser(user) {
    const index = this.connectedUsers.indexOf(user);
      
    if (index > -1) { // only splice array when item is found
      this.connectedUsers.splice(index, 1); // 2nd parameter means remove one item only
    }
  }

}

module.exports = FretboardSession;
},{}],3:[function(require,module,exports){
class User {
    constructor(id) {
        this.position = [0, 0];
        this.id = id;
        this.mousePressed = false;
        this.mouseHeld = false;
    }
    
    setPosition(newPosition) {
        this.position = newPosition;
    }
}

module.exports = User;
},{}],4:[function(require,module,exports){
'use strict';

const ClientMessage = require( "./classes/client_message.js");
const FretboardSession = require('./classes/fretboard_session.js');
const User = require('./classes/user.js');
const constants = require('./constants');

// Create client player and then draw that separately by storing a version of the serverMessage and updates that player in there.
//separate draw loop using timeout.  

(function() {

  var socket = io();

  var canvas = document.getElementById('draw');
  var cursorCanvas = document.getElementById('cursor');
  var colors = document.getElementsByClassName('color');
  

  var context = canvas.getContext('2d');
  var cursorContext = cursorCanvas.getContext('2d');
  
  var clientFretboardSession = new FretboardSession();

  var mouse = {
    x: 0,
    y: 0,
  }

  var current = {
    color: 'black'
  };

  var drawing = false;

  var mousePressed = 0;

  document.body.onmousedown = function() { 
    ++mousePressed;
  }
  document.body.onmouseup = function() {
    --mousePressed;
  }
  
  
  setInterval(() => {
    socket.emit('client_message',
      new ClientMessage(getRelativeLocation(), mousePressed)
    );
  }, 1000/constants.CLIENT_SEND_FREQUENCY);

  setInterval(draw, 1000/constants.CLIENT_DRAW_FREQUENCY);
  
  function getRelativeLocation() {
    return [mouse.x / canvas.width, mouse.y / canvas.height]
  }

 canvas.addEventListener('mousemove', 
    function (e) {
      mouse.x = e.clientX||e.touches[0].clientX;
      mouse.y = e.clientY||e.touches[0].clientY;
      
      let clientUser = clientFretboardSession.getUser(socket.id);

      if (clientUser) {
        clientUser.position[0] = mouse.x/canvas.width;
        clientUser.position[1] = mouse.y/canvas.height;
      }
      
    }
  , false);

 canvas.addEventListener('mousedown', 
    function (e) {
      clickOnHTML(mouse.x, mouse.y);
    }
  , false);
  
  
  socket.on('fretboard_session_update', processUpdate);

  window.addEventListener('resize', onResize, false);
  onResize();

  function drawCursor(x, y, color){
    cursorContext.beginPath();
    cursorContext.arc(x, y, 5, 0, 2 * Math.PI);
    cursorContext.stroke(); 
    cursorContext.fillStyle = color;
    cursorContext.fill();
    cursorContext.closePath();
  }
  
  
  function clickOnHTML(x, y) {

    let clickedElement = document.elementsFromPoint(x, y)[constants.LAYERS_ABOVE_HTML];
    clickedElement.click();

  }

  
  function processUpdate(serverMessage) {
    // data is a FretboardSession 
    // 
    for (const user of serverMessage.connectedUsers) {
      let currentUser = clientFretboardSession.getUser(user.id);
      

      if (!currentUser) {
        clientFretboardSession.addUser(new User(user.id));
        currentUser = clientFretboardSession.getUser(user.id);
      } 

      // But don't click twice.
      if (user.id !== socket.id) {

        currentUser.position[0] = user.position[0]; // We can update their position twice that's fine
        currentUser.position[1] = user.position[1]; // We can update their position twice that's fine

        let x = user.position[0] * cursorCanvas.width;
        let y = user.position[1] * cursorCanvas.height;
        
        if (user.mousePressed && ! user.mouseHeld) {
           clickOnHTML(x, y); 
        }
      }
    }
  }

  function draw() {
    // Clear the screen
    cursorContext.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
    for (const user of clientFretboardSession.connectedUsers) {
      // Draw their cursor
      let x = user.position[0] * cursorCanvas.width;
      let y = user.position[1] * cursorCanvas.height;

      if (user.id === socket.id) {
        drawCursor(x, y, "red");
      } else {
        drawCursor(x, y, "grey");
      }
    }
  }

  // make the canvas fill its parent
  function onResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    cursorCanvas.width = window.innerWidth;
    cursorCanvas.height = window.innerHeight;
  }

})();

},{"./classes/client_message.js":1,"./classes/fretboard_session.js":2,"./classes/user.js":3,"./constants":5}],5:[function(require,module,exports){
module.exports = Object.freeze({
    PEN_COLOR: 'black',
    CURSOR_COLOR: 'red',
    OTHER_CURSOR_COLOR: 'grey',
    LAYERS_ABOVE_HTML: 2,
    CLIENT_SEND_FREQUENCY: 60, // hz
    SERVER_SEND_FREQUENCY: 60, // hz
    CLIENT_DRAW_FREQUENCY: 120, // hz
});
},{}]},{},[4]);
