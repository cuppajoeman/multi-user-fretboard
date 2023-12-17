
# Multi User Interactive Fretboard

A virtual interactive fretboard with sound and support for multiple users.

A great way to learn the fretboard when you don't have a guitar nearby. The guitar by default uses fourths tuning, see https://theanchorsystem.net for more information

# Development 

This repository contains both the client side code along with the server side code for this project.

The server (located at server.js in the root dir) consists of two things, firstly it consists of an express server to serve html files to you when you visit the site, the server is also running socket.io and is waiting for certain events to hit the server, when the do, they are emitted to all other clients using the client-server model.

The server side code is quite simple in this regard, and the client does most of the work for rendering and making sounds happen. The client's code is all in the public directory (which is served by express), it renders an image of the fretboard on a canvas, and places a clear canvas on top of that canvas, with this set up it allows us to move a cursor on the top "glass" canvas to simulate movement, then when another user clicks, we figure out the position of the click and simulate it on the canvas beneath of it to make stuff actually happen. This is what allows multiple users to utilize the underlying application at the same time.

You'll notice that in the main index.html file we are using the bundle.js file, this is because I used browserify https://browserify.org/ to generate a bundle file because I had to do that to get the require statements in client.js to work correctly, this is probably not best practices but it worked at the time. PR's that fix this are welcome.



