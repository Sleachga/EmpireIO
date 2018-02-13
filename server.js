var DEBUG = true;

var express = require('express');
var app = express();
var serv = require('http').Server(app);

// Tells the server where the html file is
app.get('/',function(req, res) {
    res.sendFile(__dirname + '/client/index.html');
});

// Tells server where to find needed files
app.use('/client',express.static(__dirname + '/client'));

serv.listen(process.env.PORT || 2000);
if (DEBUG) console.log("Server started.");

var serverReady = false;

// Default initialization function for all objects
var Entity = function()
{
    return {
        id: "",
        type: 0
    };
};

// Object containing all units on the server
var unitList = [];
var unitCounter = 0;

// Constructor for unit
var unit = function(x, y, id, type)
{
    var self = Entity();

    self.id = id;
    self.type = type;
    self.x = x;
    self.y = y;

    unitList[id] = self;
    if (DEBUG) console.log("Unit " + unitList[id].id
      + " created at " + x + ", " + y
      + " of type " + type);
};

// Object containing the map grid (0-25)
var mapGrid = new Array(10000);

// Default for Map Cells
var mapCell = function(id, type)
{
  var self = Entity();
  self.id = id;
  self.type = type;
  mapGrid[id] = self;
  if (DEBUG) console.log("Map cell " + mapGrid[id].id + " is value " + mapGrid[id].type);
};

// Called as soon as the server starts
var serverStart = function()
{
  var i;

  if (DEBUG) console.log("Rendering Map...");
      for (i = 0; i < mapGrid.length; i++)
          var cell = mapCell(i, randomizeMap());

  serverReady = true;

  // TEST OUT UNITS
  if (DEBUG)
    for (unitCounter = 0; unitCounter < 10; unitCounter++)
      var testUnits = unit(unitCounter * 100, unitCounter * 100, unitCounter, "normal");

  for (i = 0; i < unitList.length; i++)
  {
      unitList[i].selected = false;
      console.log("Unit list " + i + " is selected: " + unitList[i].selected);
  }
};

// Randomizes the map
var randomizeMap = function()
{
  var retVal;

  // Pick a random number 0-99
  var randNum = Math.floor(100 * Math.random());
  if (DEBUG) console.log("Pre Processed Retval: " + randNum);

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

    if (DEBUG) console.log("Post Processed Retval: " + retVal);
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
    socket.emit('unitInit', unitList);

    // Sets the user ID to a random number
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;


    socket.on('createUnit', function(data)
    {
        var u = unit(data.x, data.y, unitCounter++, "normal");
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
    for(var i in SOCKET_LIST)
    {
        var socket = SOCKET_LIST[i];
        socket.emit('update', unitList);
    }
}, 40);
