var unitList = {};

exports.unit = function(x, y, id, type)
{
    var self = Entity();
    self.id = id;
    self.type = type;
    self.x = x;
    self.y = y;
    unitList[id] = self;
    console.log("Unit " + unitList[id]
      + " created at " + x + ", " + y
      + " of type " + type);
}
