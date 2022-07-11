'use strict';

import {ClientMessage} from "./classes/client_message.js";

(function() {

  var socket = io();

  var canvas = document.getElementById('draw');
  var cursorCanvas = document.getElementById('cursor');
  var colors = document.getElementsByClassName('color');
  

  var context = canvas.getContext('2d');
  var cursorContext = cursorCanvas.getContext('2d');

  let CONSTANTS = {
    PEN_COLOR: 'black',
    CURSOR_COLOR: 'red',
    OTHER_CURSOR_COLOR: 'grey',
    LAYERS_ABOVE_HTML: 2,
    CLIENT_SEND_FREQUENCY: 60 // hz
  }
  
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
  // }, 1000/CONSTANTS.CLIENT_SEND_FREQUENCY);
  }, 1000/60);
  
  function getRelativeLocation() {
    return [mouse.x / canvas.width, mouse.y / canvas.height]
  }

 canvas.addEventListener('mousemove', 
    function (e) {
      mouse.x = e.clientX||e.touches[0].clientX;
      mouse.y = e.clientY||e.touches[0].clientY;
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

    let clickedElement = document.elementsFromPoint(x, y)[CONSTANTS.LAYERS_ABOVE_HTML];
    clickedElement.click();

  }

  
  function processUpdate(serverMessage) {
    // data is a FretboardSession 
    
    // Clear the screen
    cursorContext.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
    for (const user of serverMessage.connectedUsers) {
      // Draw their cursor
      let x = user.position[0] * cursorCanvas.width;
      let y = user.position[1] * cursorCanvas.height;
      
      
      drawCursor(x, y, "red");

      if (user.mousePressed && ! user.mouseHeld) {
          console.log("user pressing");
         clickOnHTML(x, y); 
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
