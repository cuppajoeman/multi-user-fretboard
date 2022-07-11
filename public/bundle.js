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

  setInterval(draw, 1000/60);
  
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

    let clickedElement = document.elementsFromPoint(x, y)[CONSTANTS.LAYERS_ABOVE_HTML];
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

},{"./classes/client_message.js":1,"./classes/fretboard_session.js":2,"./classes/user.js":3}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsYXNzZXMvY2xpZW50X21lc3NhZ2UuanMiLCJjbGFzc2VzL2ZyZXRib2FyZF9zZXNzaW9uLmpzIiwiY2xhc3Nlcy91c2VyLmpzIiwiY2xpZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY2xhc3MgQ2xpZW50TWVzc2FnZSB7XG4gICAgY29uc3RydWN0b3IocG9zaXRpb24sIG1vdXNlUHJlc3NlZCkge1xuICAgICAgICB0aGlzLnBvc2l0aW9uID0gcG9zaXRpb247XG4gICAgICAgIHRoaXMubW91c2VQcmVzc2VkID0gbW91c2VQcmVzc2VkO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDbGllbnRNZXNzYWdlO1xuIiwiY2xhc3MgRnJldGJvYXJkU2Vzc2lvbiB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgICAgdGhpcy5jb25uZWN0ZWRVc2VycyA9IFtdO1xuICAgICAgdGhpcy50aW1lQ3JlYXRlZCA9IG5ldyBEYXRlKCk7IFxuICB9XG4gIFxuICBnZXRVc2VyKGlkKSB7XG4gICAgcmV0dXJuIHRoaXMuY29ubmVjdGVkVXNlcnMuZmluZCh1ID0+IHUuaWQgPT09IGlkKTtcbiAgfVxuICBcbiAgYWRkVXNlcih1c2VyKSB7XG4gICAgICB0aGlzLmNvbm5lY3RlZFVzZXJzLnB1c2godXNlcik7XG4gIH1cbiAgICBcbiAgcmVtb3ZlVXNlcih1c2VyKSB7XG4gICAgY29uc3QgaW5kZXggPSB0aGlzLmNvbm5lY3RlZFVzZXJzLmluZGV4T2YodXNlcik7XG4gICAgICBcbiAgICBpZiAoaW5kZXggPiAtMSkgeyAvLyBvbmx5IHNwbGljZSBhcnJheSB3aGVuIGl0ZW0gaXMgZm91bmRcbiAgICAgIHRoaXMuY29ubmVjdGVkVXNlcnMuc3BsaWNlKGluZGV4LCAxKTsgLy8gMm5kIHBhcmFtZXRlciBtZWFucyByZW1vdmUgb25lIGl0ZW0gb25seVxuICAgIH1cbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gRnJldGJvYXJkU2Vzc2lvbjsiLCJjbGFzcyBVc2VyIHtcbiAgICBjb25zdHJ1Y3RvcihpZCkge1xuICAgICAgICB0aGlzLnBvc2l0aW9uID0gWzAsIDBdO1xuICAgICAgICB0aGlzLmlkID0gaWQ7XG4gICAgICAgIHRoaXMubW91c2VQcmVzc2VkID0gZmFsc2U7XG4gICAgICAgIHRoaXMubW91c2VIZWxkID0gZmFsc2U7XG4gICAgfVxuICAgIFxuICAgIHNldFBvc2l0aW9uKG5ld1Bvc2l0aW9uKSB7XG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBuZXdQb3NpdGlvbjtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVXNlcjsiLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IENsaWVudE1lc3NhZ2UgPSByZXF1aXJlKCBcIi4vY2xhc3Nlcy9jbGllbnRfbWVzc2FnZS5qc1wiKTtcbmNvbnN0IEZyZXRib2FyZFNlc3Npb24gPSByZXF1aXJlKCcuL2NsYXNzZXMvZnJldGJvYXJkX3Nlc3Npb24uanMnKTtcbmNvbnN0IFVzZXIgPSByZXF1aXJlKCcuL2NsYXNzZXMvdXNlci5qcycpO1xuXG4vLyBDcmVhdGUgY2xpZW50IHBsYXllciBhbmQgdGhlbiBkcmF3IHRoYXQgc2VwYXJhdGVseSBieSBzdG9yaW5nIGEgdmVyc2lvbiBvZiB0aGUgc2VydmVyTWVzc2FnZSBhbmQgdXBkYXRlcyB0aGF0IHBsYXllciBpbiB0aGVyZS5cbi8vc2VwYXJhdGUgZHJhdyBsb29wIHVzaW5nIHRpbWVvdXQuICBcblxuKGZ1bmN0aW9uKCkge1xuXG4gIHZhciBzb2NrZXQgPSBpbygpO1xuXG4gIHZhciBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZHJhdycpO1xuICB2YXIgY3Vyc29yQ2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2N1cnNvcicpO1xuICB2YXIgY29sb3JzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnY29sb3InKTtcbiAgXG5cbiAgdmFyIGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgdmFyIGN1cnNvckNvbnRleHQgPSBjdXJzb3JDYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgXG4gIHZhciBjbGllbnRGcmV0Ym9hcmRTZXNzaW9uID0gbmV3IEZyZXRib2FyZFNlc3Npb24oKTtcblxuICBsZXQgQ09OU1RBTlRTID0ge1xuICAgIFBFTl9DT0xPUjogJ2JsYWNrJyxcbiAgICBDVVJTT1JfQ09MT1I6ICdyZWQnLFxuICAgIE9USEVSX0NVUlNPUl9DT0xPUjogJ2dyZXknLFxuICAgIExBWUVSU19BQk9WRV9IVE1MOiAyLFxuICAgIENMSUVOVF9TRU5EX0ZSRVFVRU5DWTogNjAgLy8gaHpcbiAgfVxuICBcbiAgdmFyIG1vdXNlID0ge1xuICAgIHg6IDAsXG4gICAgeTogMCxcbiAgfVxuXG4gIHZhciBjdXJyZW50ID0ge1xuICAgIGNvbG9yOiAnYmxhY2snXG4gIH07XG5cbiAgdmFyIGRyYXdpbmcgPSBmYWxzZTtcblxuICB2YXIgbW91c2VQcmVzc2VkID0gMDtcblxuICBkb2N1bWVudC5ib2R5Lm9ubW91c2Vkb3duID0gZnVuY3Rpb24oKSB7IFxuICAgICsrbW91c2VQcmVzc2VkO1xuICB9XG4gIGRvY3VtZW50LmJvZHkub25tb3VzZXVwID0gZnVuY3Rpb24oKSB7XG4gICAgLS1tb3VzZVByZXNzZWQ7XG4gIH1cbiAgXG4gIFxuICBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgc29ja2V0LmVtaXQoJ2NsaWVudF9tZXNzYWdlJyxcbiAgICAgIG5ldyBDbGllbnRNZXNzYWdlKGdldFJlbGF0aXZlTG9jYXRpb24oKSwgbW91c2VQcmVzc2VkKVxuICAgICk7XG4gIC8vIH0sIDEwMDAvQ09OU1RBTlRTLkNMSUVOVF9TRU5EX0ZSRVFVRU5DWSk7XG4gIH0sIDEwMDAvNjApO1xuXG4gIHNldEludGVydmFsKGRyYXcsIDEwMDAvNjApO1xuICBcbiAgZnVuY3Rpb24gZ2V0UmVsYXRpdmVMb2NhdGlvbigpIHtcbiAgICByZXR1cm4gW21vdXNlLnggLyBjYW52YXMud2lkdGgsIG1vdXNlLnkgLyBjYW52YXMuaGVpZ2h0XVxuICB9XG5cbiBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgXG4gICAgZnVuY3Rpb24gKGUpIHtcbiAgICAgIG1vdXNlLnggPSBlLmNsaWVudFh8fGUudG91Y2hlc1swXS5jbGllbnRYO1xuICAgICAgbW91c2UueSA9IGUuY2xpZW50WXx8ZS50b3VjaGVzWzBdLmNsaWVudFk7XG4gICAgICBcbiAgICAgIC8vIFRPRE8gVEhJUyBJUyBCUk9LRU5cbiAgICAgIC8vIGxldCBjbGllbnRVc2VyID0gY2xpZW50RnJldGJvYXJkU2Vzc2lvbi5nZXRVc2VyKHNvY2tldC5pZCk7XG4gICAgICBcbiAgICAgIC8vIGlmIChjbGllbnRVc2VyKSB7XG4gICAgICAvLyAgIGNsaWVudFVzZXIucG9zaXRpb25bMF0gPSBtb3VzZS54O1xuICAgICAgLy8gICBjbGllbnRVc2VyLnBvc2l0aW9uWzFdID0gbW91c2UueTtcbiAgICAgIC8vIH1cbiAgICAgIFxuICAgIH1cbiAgLCBmYWxzZSk7XG5cbiBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgXG4gICAgZnVuY3Rpb24gKGUpIHtcbiAgICAgIGNsaWNrT25IVE1MKG1vdXNlLngsIG1vdXNlLnkpO1xuICAgIH1cbiAgLCBmYWxzZSk7XG4gIFxuICBcbiAgc29ja2V0Lm9uKCdmcmV0Ym9hcmRfc2Vzc2lvbl91cGRhdGUnLCBwcm9jZXNzVXBkYXRlKTtcblxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgb25SZXNpemUsIGZhbHNlKTtcbiAgb25SZXNpemUoKTtcblxuICBmdW5jdGlvbiBkcmF3Q3Vyc29yKHgsIHksIGNvbG9yKXtcbiAgICBjdXJzb3JDb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgIGN1cnNvckNvbnRleHQuYXJjKHgsIHksIDUsIDAsIDIgKiBNYXRoLlBJKTtcbiAgICBjdXJzb3JDb250ZXh0LnN0cm9rZSgpOyBcbiAgICBjdXJzb3JDb250ZXh0LmZpbGxTdHlsZSA9IGNvbG9yO1xuICAgIGN1cnNvckNvbnRleHQuZmlsbCgpO1xuICAgIGN1cnNvckNvbnRleHQuY2xvc2VQYXRoKCk7XG4gIH1cbiAgXG4gIFxuICBmdW5jdGlvbiBjbGlja09uSFRNTCh4LCB5KSB7XG5cbiAgICBsZXQgY2xpY2tlZEVsZW1lbnQgPSBkb2N1bWVudC5lbGVtZW50c0Zyb21Qb2ludCh4LCB5KVtDT05TVEFOVFMuTEFZRVJTX0FCT1ZFX0hUTUxdO1xuICAgIGNsaWNrZWRFbGVtZW50LmNsaWNrKCk7XG5cbiAgfVxuXG4gIFxuICBmdW5jdGlvbiBwcm9jZXNzVXBkYXRlKHNlcnZlck1lc3NhZ2UpIHtcbiAgICAvLyBkYXRhIGlzIGEgRnJldGJvYXJkU2Vzc2lvbiBcbiAgICAvLyBcbiAgICBmb3IgKGNvbnN0IHVzZXIgb2Ygc2VydmVyTWVzc2FnZS5jb25uZWN0ZWRVc2Vycykge1xuICAgICAgbGV0IGN1cnJlbnRVc2VyID0gY2xpZW50RnJldGJvYXJkU2Vzc2lvbi5nZXRVc2VyKHVzZXIuaWQpO1xuICAgICAgXG5cbiAgICAgIGlmICghY3VycmVudFVzZXIpIHtcbiAgICAgICAgY2xpZW50RnJldGJvYXJkU2Vzc2lvbi5hZGRVc2VyKG5ldyBVc2VyKHVzZXIuaWQpKTtcbiAgICAgICAgY3VycmVudFVzZXIgPSBjbGllbnRGcmV0Ym9hcmRTZXNzaW9uLmdldFVzZXIodXNlci5pZCk7XG4gICAgICB9IFxuXG4gICAgICBjdXJyZW50VXNlci5wb3NpdGlvblswXSA9IHVzZXIucG9zaXRpb25bMF07IC8vIFdlIGNhbiB1cGRhdGUgdGhlaXIgcG9zaXRpb24gdHdpY2UgdGhhdCdzIGZpbmVcbiAgICAgIGN1cnJlbnRVc2VyLnBvc2l0aW9uWzFdID0gdXNlci5wb3NpdGlvblsxXTsgLy8gV2UgY2FuIHVwZGF0ZSB0aGVpciBwb3NpdGlvbiB0d2ljZSB0aGF0J3MgZmluZVxuICAgICAgXG5cbiAgICAgIC8vIEJ1dCBkb24ndCBjbGljayB0d2ljZS5cbiAgICAgIGlmICh1c2VyLmlkICE9IHNvY2tldC5pZCkge1xuXG4gICAgICAgIGlmICh1c2VyLm1vdXNlUHJlc3NlZCAmJiAhIHVzZXIubW91c2VIZWxkKSB7XG4gICAgICAgICAgIGNsaWNrT25IVE1MKHgsIHkpOyBcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGRyYXcoKSB7XG4gICAgLy8gQ2xlYXIgdGhlIHNjcmVlblxuICAgIGN1cnNvckNvbnRleHQuY2xlYXJSZWN0KDAsIDAsIGN1cnNvckNhbnZhcy53aWR0aCwgY3Vyc29yQ2FudmFzLmhlaWdodCk7XG4gICAgZm9yIChjb25zdCB1c2VyIG9mIGNsaWVudEZyZXRib2FyZFNlc3Npb24uY29ubmVjdGVkVXNlcnMpIHtcbiAgICAgIC8vIERyYXcgdGhlaXIgY3Vyc29yXG4gICAgICBsZXQgeCA9IHVzZXIucG9zaXRpb25bMF0gKiBjdXJzb3JDYW52YXMud2lkdGg7XG4gICAgICBsZXQgeSA9IHVzZXIucG9zaXRpb25bMV0gKiBjdXJzb3JDYW52YXMuaGVpZ2h0O1xuXG4gICAgICBpZiAodXNlci5pZCA9PSBzb2NrZXQuaWQpIHtcbiAgICAgICAgZHJhd0N1cnNvcih4LCB5LCBcInJlZFwiKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRyYXdDdXJzb3IoeCwgeSwgXCJncmV5XCIpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIG1ha2UgdGhlIGNhbnZhcyBmaWxsIGl0cyBwYXJlbnRcbiAgZnVuY3Rpb24gb25SZXNpemUoKSB7XG4gICAgY2FudmFzLndpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgY2FudmFzLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgICBjdXJzb3JDYW52YXMud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICBjdXJzb3JDYW52YXMuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuICB9XG5cbn0pKCk7XG4iXX0=
