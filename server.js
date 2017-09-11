/*
  TODO:

  1. When a unit moves to a point, check what
  cell the point is in and add it to that array

  2. Move the units to specific points on the
  tile that look good (maybe 5 spots?).

  3. If you exceed the number of spots it will just
  repeat spots visually and show the number of units
  in the middle of the cell (maybe 1 for regular & 1
  for combat)

  4. Draw each tile differently based on how many
  units are in the cell
*/

var DEBUG = true;

var express = require('express');
var app = express();
var serv = require('http').Server(app);

// Tells the server where the html file is
app.get('/',function(req, res)
{
    res.sendFile(__dirname + '/client/index.html');
});

// Tells server where to find needed files
app.use('/client',express.static(__dirname + '/client'));

serv.listen(2000);
console.log("Server started.");

// server.js
// const UNIT_JS = require('./unit.js');
// let unit = UNIT_JS.unit(25, 25, 100, 100);

var serverReady = false;

// Default initialization function for all objects
var Entity = function()
{
    var self =
    {
        id: "",
        type: 0,
    }
    return self;
};

// Object containing all units on the server
var unitList = [];

// Constructor for unit
var unit = function(x, y, id, type)
{
    var self =
    {
        id: "",
        type: 0,
    }

    self.id = id;
    self.type = type;
    self.x = x;
    self.y = y;
    unitList[id] = self;
    console.log("Unit " + unitList[id].id
      + " created at " + x + ", " + y
      + " of type " + type);
};

// Object containing the map grid (0-25)
var mapGrid = [];

// Default for Map Cells
var mapCell = function(id, type)
{
  var self = Entity();
  self.id = id;
  self.type = type;
  mapGrid[id] = self;
  console.log("Map cell " + mapGrid[id].id + " is value " + mapGrid[id].type);
};

// Called as soon as the server starts
var serverStart = function()
{
  console.log("Rendering Map...");
  for (var i = 0; i < 100; i++)
  {
    var cell = mapCell(i, randomizeMap());
  }

  serverReady = true;

  if (DEBUG)
  {
    for (var i = 0; i < 5; i++)
    {
      var testUnits = unit(i * 110, i * 120, i, "normal");
    }
  }
};

// Randomizes the map
var randomizeMap = function()
{
  var retVal;

  // Pick a random number 0-99
  var randNum = Math.floor(100 * Math.random());
  console.log("Pre Processed Retval: " + randNum);

  /* Sets retval based on randNum
   * 0 - 70% chance - normal tile
   * 1 - 10% chance - food tile
   * 2 - 10% chance - stone tile
   * 3 - 5% chance - wood tile
   * 4 - 5% chance - gold tile
   */
   if (randNum < 70)
     retVal = 0;
   else if (randNum >= 70 && randNum < 80)
     retVal = 1;
   else if (randNum >= 80 && randNum < 90)
     retVal = 2;
   else if (randNum >= 90 && randNum < 95)
     retVal = 3;
   else
     retVal = 4;

  console.log("Post Processed Retval: " + retVal);
  return retVal;
};

serverStart();

// Object containing the sockets
var SOCKET_LIST = {};
var io = require('socket.io')(serv,{});

// Fires when someone opens the page
io.sockets.on('connection', function(socket)
{
    // Send Init Pack (Map and objects on it)
    socket.emit('mapInit', mapGrid);

    // Sets the user ID to a random number
    socket.id = Math.random();
    socket.x = 0;
    socket.y = 0;
    socket.number = "" + Math.floor(10 * Math.random());
    SOCKET_LIST[socket.id] = socket;

    // Fires when 'mapRand' is recieved from the socket
    // Randomizes the map with serverStart()
    // Emits a 'mapInit' to the socket with the updated mapGrid
    socket.on('mapRand', function()
    {
        console.log("BUTTON PUSHED");
        serverStart();
        socket.emit('mapInit', mapGrid);
    });

    // Fires when someone leaves the page
    // Deletes the socket from SOCKET_LIST
    socket.on('disconnect',function()
    {
        delete SOCKET_LIST[socket.id];
    });
});

// Main loop function, runs 25 times a second
setInterval(function()
{
    var pack = unitList;

    for(var i in SOCKET_LIST)
    {
        var socket = SOCKET_LIST[i];
        socket.emit('update', pack);
    }

},40);
