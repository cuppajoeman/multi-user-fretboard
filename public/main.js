'use strict';

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
  }
  
  var mouse = {
    x: 0,
    y: 0,
  }

  var current = {
    color: 'black'
  };

  var drawing = false;

  canvas.addEventListener('mousedown', onMouseDown, false);
  canvas.addEventListener('mouseup', onMouseUp, false);
  canvas.addEventListener('mouseout', onMouseUp, false);
  canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);
  
  //Touch support for mobile devices
  canvas.addEventListener('touchstart', onMouseDown, false);
  canvas.addEventListener('touchend', onMouseUp, false);
  canvas.addEventListener('touchcancel', onMouseUp, false);
  canvas.addEventListener('touchmove', throttle(onMouseMove, 10), false);

  for (var i = 0; i < colors.length; i++){
    colors[i].addEventListener('click', onColorUpdate, false);
  }

  socket.on('drawing', onDrawingEvent);
  socket.on('cursor', onCursorEvent);
  socket.on('click', onClickEvent);

  window.addEventListener('resize', onResize, false);
  onResize();


  function drawLine(x0, y0, x1, y1, color, emit){
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.stroke();
    context.closePath();

    if (!emit) { return; }
    var w = canvas.width;
    var h = canvas.height;

    socket.emit('drawing', {
      x0: x0 / w,
      y0: y0 / h,
      x1: x1 / w,
      y1: y1 / h,
      color: color
    });
  }

  function drawCursor(x, y, color, emit){
    
    cursorContext.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
    cursorContext.beginPath();
    cursorContext.arc(x, y, 5, 0, 2 * Math.PI);
    cursorContext.stroke(); 
    cursorContext.fillStyle = color;
    cursorContext.fill();
    cursorContext.closePath();

    if (!emit) { return; }
    var w = canvas.width;
    var h = canvas.height;

    socket.emit('cursor', {
      x: x / w,
      y: y / h,
    });
  }
  
  
  function clickOnHTML(x, y) {

    let clickedElement = document.elementsFromPoint(x, y)[CONSTANTS.LAYERS_ABOVE_HTML];
    
    clickedElement.click();

  }

  function  onMouseDown(e){
    drawing = true;

    let newX = e.clientX||e.touches[0].clientX;
    let newY = e.clientY||e.touches[0].clientY;

    mouse.x = newX;
    mouse.y = newY;
    
    clickOnHTML(newX, newY);
    
    var w = canvas.width;
    var h = canvas.height;

    socket.emit('click', {
      x: newX / w,
      y: newY / h,
    });
    
  }

  function onMouseUp(e){
    drawing = false;

    let newX = e.clientX||e.touches[0].clientX;
    let newY = e.clientY||e.touches[0].clientY;

    drawCursor(newX, newY, CONSTANTS.CURSOR_COLOR, true);

    if (drawing) {
      drawLine(mouse.x, mouse.y, newX, newY, CONSTANTS.PEN_COLOR, true);
    }
  }

  function onMouseMove(e){
    let newX = e.clientX||e.touches[0].clientX;
    let newY = e.clientY||e.touches[0].clientY;

    drawCursor(newX, newY, CONSTANTS.CURSOR_COLOR, true);

    if (drawing) {
      drawLine(mouse.x, mouse.y, newX, newY, CONSTANTS.PEN_COLOR, true);
    }
    
    mouse.x = newX;
    mouse.y = newY;
  }

  function onColorUpdate(e){
    current.color = e.target.className.split(' ')[1];
  }

  // limit the number of events per second
  function throttle(callback, delay) {
    var previousCall = new Date().getTime();
    return function() {
      var time = new Date().getTime();

      if ((time - previousCall) >= delay) {
        previousCall = time;
        callback.apply(null, arguments);
      }
    };
  }

  function onDrawingEvent(data){
    var w = canvas.width;
    var h = canvas.height;
    // drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
  }

  function onCursorEvent(data){
    var w = canvas.width;
    var h = canvas.height;
    drawCursor(data.x * w, data.y * h, CONSTANTS.OTHER_CURSOR_COLOR);
  }

  function onClickEvent(data){
    var w = canvas.width;
    var h = canvas.height;
    
    clickOnHTML(data.x * w, data.y * h);

  }

  // make the canvas fill its parent
  function onResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    cursorCanvas.width = window.innerWidth;
    cursorCanvas.height = window.innerHeight;
  }

})();
