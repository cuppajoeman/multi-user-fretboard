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

},{"./classes/client_message.js":1,"./classes/fretboard_session.js":2,"./classes/user.js":3,"./constants":5}],5:[function(require,module,exports){
module.exports = Object.freeze({
    PEN_COLOR: 'black',
    CURSOR_COLOR: 'red',
    OTHER_CURSOR_COLOR: 'grey',
    LAYERS_ABOVE_HTML: 2,
    CLIENT_SEND_FREQUENCY: 60, // hz
    SERVER_SEND_FREQUENCY: 60, // hz
    CLIENT_DRAW_FREQUENCY: 60, // hz
});
},{}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsYXNzZXMvY2xpZW50X21lc3NhZ2UuanMiLCJjbGFzc2VzL2ZyZXRib2FyZF9zZXNzaW9uLmpzIiwiY2xhc3Nlcy91c2VyLmpzIiwiY2xpZW50LmpzIiwiY29uc3RhbnRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNsYXNzIENsaWVudE1lc3NhZ2Uge1xuICAgIGNvbnN0cnVjdG9yKHBvc2l0aW9uLCBtb3VzZVByZXNzZWQpIHtcbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgICAgICB0aGlzLm1vdXNlUHJlc3NlZCA9IG1vdXNlUHJlc3NlZDtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ2xpZW50TWVzc2FnZTtcbiIsImNsYXNzIEZyZXRib2FyZFNlc3Npb24ge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgIHRoaXMuY29ubmVjdGVkVXNlcnMgPSBbXTtcbiAgICAgIHRoaXMudGltZUNyZWF0ZWQgPSBuZXcgRGF0ZSgpOyBcbiAgfVxuICBcbiAgZ2V0VXNlcihpZCkge1xuICAgIHJldHVybiB0aGlzLmNvbm5lY3RlZFVzZXJzLmZpbmQodSA9PiB1LmlkID09PSBpZCk7XG4gIH1cbiAgXG4gIGFkZFVzZXIodXNlcikge1xuICAgICAgdGhpcy5jb25uZWN0ZWRVc2Vycy5wdXNoKHVzZXIpO1xuICB9XG4gICAgXG4gIHJlbW92ZVVzZXIodXNlcikge1xuICAgIGNvbnN0IGluZGV4ID0gdGhpcy5jb25uZWN0ZWRVc2Vycy5pbmRleE9mKHVzZXIpO1xuICAgICAgXG4gICAgaWYgKGluZGV4ID4gLTEpIHsgLy8gb25seSBzcGxpY2UgYXJyYXkgd2hlbiBpdGVtIGlzIGZvdW5kXG4gICAgICB0aGlzLmNvbm5lY3RlZFVzZXJzLnNwbGljZShpbmRleCwgMSk7IC8vIDJuZCBwYXJhbWV0ZXIgbWVhbnMgcmVtb3ZlIG9uZSBpdGVtIG9ubHlcbiAgICB9XG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZyZXRib2FyZFNlc3Npb247IiwiY2xhc3MgVXNlciB7XG4gICAgY29uc3RydWN0b3IoaWQpIHtcbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IFswLCAwXTtcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xuICAgICAgICB0aGlzLm1vdXNlUHJlc3NlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLm1vdXNlSGVsZCA9IGZhbHNlO1xuICAgIH1cbiAgICBcbiAgICBzZXRQb3NpdGlvbihuZXdQb3NpdGlvbikge1xuICAgICAgICB0aGlzLnBvc2l0aW9uID0gbmV3UG9zaXRpb247XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFVzZXI7IiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBDbGllbnRNZXNzYWdlID0gcmVxdWlyZSggXCIuL2NsYXNzZXMvY2xpZW50X21lc3NhZ2UuanNcIik7XG5jb25zdCBGcmV0Ym9hcmRTZXNzaW9uID0gcmVxdWlyZSgnLi9jbGFzc2VzL2ZyZXRib2FyZF9zZXNzaW9uLmpzJyk7XG5jb25zdCBVc2VyID0gcmVxdWlyZSgnLi9jbGFzc2VzL3VzZXIuanMnKTtcbmNvbnN0IGNvbnN0YW50cyA9IHJlcXVpcmUoJy4vY29uc3RhbnRzJyk7XG5cbi8vIENyZWF0ZSBjbGllbnQgcGxheWVyIGFuZCB0aGVuIGRyYXcgdGhhdCBzZXBhcmF0ZWx5IGJ5IHN0b3JpbmcgYSB2ZXJzaW9uIG9mIHRoZSBzZXJ2ZXJNZXNzYWdlIGFuZCB1cGRhdGVzIHRoYXQgcGxheWVyIGluIHRoZXJlLlxuLy9zZXBhcmF0ZSBkcmF3IGxvb3AgdXNpbmcgdGltZW91dC4gIFxuXG4oZnVuY3Rpb24oKSB7XG5cbiAgdmFyIHNvY2tldCA9IGlvKCk7XG5cbiAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkcmF3Jyk7XG4gIHZhciBjdXJzb3JDYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY3Vyc29yJyk7XG4gIHZhciBjb2xvcnMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdjb2xvcicpO1xuICBcblxuICB2YXIgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICB2YXIgY3Vyc29yQ29udGV4dCA9IGN1cnNvckNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICBcbiAgdmFyIGNsaWVudEZyZXRib2FyZFNlc3Npb24gPSBuZXcgRnJldGJvYXJkU2Vzc2lvbigpO1xuXG4gIHZhciBtb3VzZSA9IHtcbiAgICB4OiAwLFxuICAgIHk6IDAsXG4gIH1cblxuICB2YXIgY3VycmVudCA9IHtcbiAgICBjb2xvcjogJ2JsYWNrJ1xuICB9O1xuXG4gIHZhciBkcmF3aW5nID0gZmFsc2U7XG5cbiAgdmFyIG1vdXNlUHJlc3NlZCA9IDA7XG5cbiAgZG9jdW1lbnQuYm9keS5vbm1vdXNlZG93biA9IGZ1bmN0aW9uKCkgeyBcbiAgICArK21vdXNlUHJlc3NlZDtcbiAgfVxuICBkb2N1bWVudC5ib2R5Lm9ubW91c2V1cCA9IGZ1bmN0aW9uKCkge1xuICAgIC0tbW91c2VQcmVzc2VkO1xuICB9XG4gIFxuICBcbiAgc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgIHNvY2tldC5lbWl0KCdjbGllbnRfbWVzc2FnZScsXG4gICAgICBuZXcgQ2xpZW50TWVzc2FnZShnZXRSZWxhdGl2ZUxvY2F0aW9uKCksIG1vdXNlUHJlc3NlZClcbiAgICApO1xuICB9LCAxMDAwL2NvbnN0YW50cy5DTElFTlRfU0VORF9GUkVRVUVOQ1kpO1xuXG4gIHNldEludGVydmFsKGRyYXcsIDEwMDAvY29uc3RhbnRzLkNMSUVOVF9EUkFXX0ZSRVFVRU5DWSk7XG4gIFxuICBmdW5jdGlvbiBnZXRSZWxhdGl2ZUxvY2F0aW9uKCkge1xuICAgIHJldHVybiBbbW91c2UueCAvIGNhbnZhcy53aWR0aCwgbW91c2UueSAvIGNhbnZhcy5oZWlnaHRdXG4gIH1cblxuIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBcbiAgICBmdW5jdGlvbiAoZSkge1xuICAgICAgbW91c2UueCA9IGUuY2xpZW50WHx8ZS50b3VjaGVzWzBdLmNsaWVudFg7XG4gICAgICBtb3VzZS55ID0gZS5jbGllbnRZfHxlLnRvdWNoZXNbMF0uY2xpZW50WTtcbiAgICAgIFxuICAgICAgLy8gVE9ETyBUSElTIElTIEJST0tFTlxuICAgICAgLy8gbGV0IGNsaWVudFVzZXIgPSBjbGllbnRGcmV0Ym9hcmRTZXNzaW9uLmdldFVzZXIoc29ja2V0LmlkKTtcbiAgICAgIFxuICAgICAgLy8gaWYgKGNsaWVudFVzZXIpIHtcbiAgICAgIC8vICAgY2xpZW50VXNlci5wb3NpdGlvblswXSA9IG1vdXNlLng7XG4gICAgICAvLyAgIGNsaWVudFVzZXIucG9zaXRpb25bMV0gPSBtb3VzZS55O1xuICAgICAgLy8gfVxuICAgICAgXG4gICAgfVxuICAsIGZhbHNlKTtcblxuIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBcbiAgICBmdW5jdGlvbiAoZSkge1xuICAgICAgY2xpY2tPbkhUTUwobW91c2UueCwgbW91c2UueSk7XG4gICAgfVxuICAsIGZhbHNlKTtcbiAgXG4gIFxuICBzb2NrZXQub24oJ2ZyZXRib2FyZF9zZXNzaW9uX3VwZGF0ZScsIHByb2Nlc3NVcGRhdGUpO1xuXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBvblJlc2l6ZSwgZmFsc2UpO1xuICBvblJlc2l6ZSgpO1xuXG4gIGZ1bmN0aW9uIGRyYXdDdXJzb3IoeCwgeSwgY29sb3Ipe1xuICAgIGN1cnNvckNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgY3Vyc29yQ29udGV4dC5hcmMoeCwgeSwgNSwgMCwgMiAqIE1hdGguUEkpO1xuICAgIGN1cnNvckNvbnRleHQuc3Ryb2tlKCk7IFxuICAgIGN1cnNvckNvbnRleHQuZmlsbFN0eWxlID0gY29sb3I7XG4gICAgY3Vyc29yQ29udGV4dC5maWxsKCk7XG4gICAgY3Vyc29yQ29udGV4dC5jbG9zZVBhdGgoKTtcbiAgfVxuICBcbiAgXG4gIGZ1bmN0aW9uIGNsaWNrT25IVE1MKHgsIHkpIHtcblxuICAgIGxldCBjbGlja2VkRWxlbWVudCA9IGRvY3VtZW50LmVsZW1lbnRzRnJvbVBvaW50KHgsIHkpW2NvbnN0YW50cy5MQVlFUlNfQUJPVkVfSFRNTF07XG4gICAgY2xpY2tlZEVsZW1lbnQuY2xpY2soKTtcblxuICB9XG5cbiAgXG4gIGZ1bmN0aW9uIHByb2Nlc3NVcGRhdGUoc2VydmVyTWVzc2FnZSkge1xuICAgIC8vIGRhdGEgaXMgYSBGcmV0Ym9hcmRTZXNzaW9uIFxuICAgIC8vIFxuICAgIGZvciAoY29uc3QgdXNlciBvZiBzZXJ2ZXJNZXNzYWdlLmNvbm5lY3RlZFVzZXJzKSB7XG4gICAgICBsZXQgY3VycmVudFVzZXIgPSBjbGllbnRGcmV0Ym9hcmRTZXNzaW9uLmdldFVzZXIodXNlci5pZCk7XG4gICAgICBcblxuICAgICAgaWYgKCFjdXJyZW50VXNlcikge1xuICAgICAgICBjbGllbnRGcmV0Ym9hcmRTZXNzaW9uLmFkZFVzZXIobmV3IFVzZXIodXNlci5pZCkpO1xuICAgICAgICBjdXJyZW50VXNlciA9IGNsaWVudEZyZXRib2FyZFNlc3Npb24uZ2V0VXNlcih1c2VyLmlkKTtcbiAgICAgIH0gXG5cbiAgICAgIGN1cnJlbnRVc2VyLnBvc2l0aW9uWzBdID0gdXNlci5wb3NpdGlvblswXTsgLy8gV2UgY2FuIHVwZGF0ZSB0aGVpciBwb3NpdGlvbiB0d2ljZSB0aGF0J3MgZmluZVxuICAgICAgY3VycmVudFVzZXIucG9zaXRpb25bMV0gPSB1c2VyLnBvc2l0aW9uWzFdOyAvLyBXZSBjYW4gdXBkYXRlIHRoZWlyIHBvc2l0aW9uIHR3aWNlIHRoYXQncyBmaW5lXG4gICAgICBcblxuICAgICAgLy8gQnV0IGRvbid0IGNsaWNrIHR3aWNlLlxuICAgICAgaWYgKHVzZXIuaWQgIT0gc29ja2V0LmlkKSB7XG5cbiAgICAgICAgbGV0IHggPSB1c2VyLnBvc2l0aW9uWzBdICogY3Vyc29yQ2FudmFzLndpZHRoO1xuICAgICAgICBsZXQgeSA9IHVzZXIucG9zaXRpb25bMV0gKiBjdXJzb3JDYW52YXMuaGVpZ2h0O1xuICAgICAgICBcbiAgICAgICAgaWYgKHVzZXIubW91c2VQcmVzc2VkICYmICEgdXNlci5tb3VzZUhlbGQpIHtcbiAgICAgICAgICAgY2xpY2tPbkhUTUwoeCwgeSk7IFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZHJhdygpIHtcbiAgICAvLyBDbGVhciB0aGUgc2NyZWVuXG4gICAgY3Vyc29yQ29udGV4dC5jbGVhclJlY3QoMCwgMCwgY3Vyc29yQ2FudmFzLndpZHRoLCBjdXJzb3JDYW52YXMuaGVpZ2h0KTtcbiAgICBmb3IgKGNvbnN0IHVzZXIgb2YgY2xpZW50RnJldGJvYXJkU2Vzc2lvbi5jb25uZWN0ZWRVc2Vycykge1xuICAgICAgLy8gRHJhdyB0aGVpciBjdXJzb3JcbiAgICAgIGxldCB4ID0gdXNlci5wb3NpdGlvblswXSAqIGN1cnNvckNhbnZhcy53aWR0aDtcbiAgICAgIGxldCB5ID0gdXNlci5wb3NpdGlvblsxXSAqIGN1cnNvckNhbnZhcy5oZWlnaHQ7XG5cbiAgICAgIGlmICh1c2VyLmlkID09IHNvY2tldC5pZCkge1xuICAgICAgICBkcmF3Q3Vyc29yKHgsIHksIFwicmVkXCIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZHJhd0N1cnNvcih4LCB5LCBcImdyZXlcIik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gbWFrZSB0aGUgY2FudmFzIGZpbGwgaXRzIHBhcmVudFxuICBmdW5jdGlvbiBvblJlc2l6ZSgpIHtcbiAgICBjYW52YXMud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICBjYW52YXMuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuICAgIGN1cnNvckNhbnZhcy53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuICAgIGN1cnNvckNhbnZhcy5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gIH1cblxufSkoKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmZyZWV6ZSh7XG4gICAgUEVOX0NPTE9SOiAnYmxhY2snLFxuICAgIENVUlNPUl9DT0xPUjogJ3JlZCcsXG4gICAgT1RIRVJfQ1VSU09SX0NPTE9SOiAnZ3JleScsXG4gICAgTEFZRVJTX0FCT1ZFX0hUTUw6IDIsXG4gICAgQ0xJRU5UX1NFTkRfRlJFUVVFTkNZOiA2MCwgLy8gaHpcbiAgICBTRVJWRVJfU0VORF9GUkVRVUVOQ1k6IDYwLCAvLyBoelxuICAgIENMSUVOVF9EUkFXX0ZSRVFVRU5DWTogNjAsIC8vIGh6XG59KTsiXX0=
