// Object containing the map grid (0-25)
var mapGrid = {};

// Default for Map Cells
var mapCell = function(id, type)
{
  var self = Entity();
  self.id = id;
  self.type = type;
  mapGrid[id] = self;
  console.log("Map cell " + mapGrid[id].id + " is value " + mapGrid[id].type);
}

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
   * 2 - 5% chance - stone tile
   * 3 - 10% chance - wood tile
   * 4 - 5% chance - gold tile
   */
  if (randNum < 70)
  {
    retVal = 0;
  }
  else if (randNum >= 70 && randNum < 80)
  {
    retVal = 1;
  }
  else if (randNum >= 80 && randNum < 90)
  {
    retVal = 3;
  }
  else if (randNum >= 90 && randNum < 95)
  {
    retVal = 2;
  }
  else {
    retVal = 4;
  }

  console.log("Post Processed Retval: " + retVal);
  return retVal;
}
