var ServerManager = require('../cncntr8-server/osc-servermanager.js'),
  db = require('monk')('localhost/cncntr8').get('metrics'),
  config = require('../cncntr8-server/config.json'),
  users = config.users,
  startTime = Date.now();

var manager = new ServerManager({
  users: users,
  onCreate: function(count) {
    console.log('OSC servers created for ' + count + ' user(s)!');
  }
});

manager.on('data', function(packet) {
  var doc = packet;
  doc.session = startTime;  // sessions are identified by the timestamp at which they started
  doc.timestamp = Date.now() - startTime;
  db.insert(doc, function(err, doc) {
    if (err) throw err;
    console.log(doc)
  })
});