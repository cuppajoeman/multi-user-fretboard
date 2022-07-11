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
      
      // TODO THIS IS BROKEN
      // let clientUser = clientFretboardSession.getUser(socket.id);
      
      // if (clientUser) {
      //   clientUser.position[0] = mouse.x;
      //   clientUser.position[1] = mouse.y;
      // }
      
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

      currentUser.position[0] = user.position[0]; // We can update their position twice that's fine
      currentUser.position[1] = user.position[1]; // We can update their position twice that's fine
      

      // But don't click twice.
      if (user.id != socket.id) {

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

      if (user.id == socket.id) {
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
