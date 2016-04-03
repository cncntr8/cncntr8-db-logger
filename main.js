var ServerManager = require('../cncntr8-server/osc-servermanager.js'),
  _ = require('underscore'),
  math = require('mathjs'),
  db = require('monk')('localhost/cncntr8'),
  metrics = db.get('metrics'),
  sessions = db.get('sessions'),
  argv = require('yargs').argv,
  inquirer = require('inquirer'),
  config = require('../cncntr8-server/config.json'),
  users = config.users,
  meanWindow = config.meanWindow || 1,
  sessionId = sessions.id(),
  dataQueue = _.mapObject(_.object(_.pluck(users, 'username'), []), function() {
    return {
      concentration: [],
      mellowness: []
    };
  });

inquirer.prompt([{
  name: 'sessionname',
  message: 'Provide a name for this session.'
}], function(result) {
  var startTime = Date.now();
  sessions.insert({
    startTime: startTime,
    name: result.sessionname
  }).success(function(session) {
    var manager = new ServerManager({
      users: users,
      onCreate: function(count) {
        console.log('OSC servers created for ' + count + ' user(s)!');
      }
    });

    manager.on('data', function(packet) {
      var doc = packet;
      doc.session = session._id;
      doc.timestamp = Date.now() - startTime;
      metrics.insert(doc).success(function(metric) {
        //console.log(metric);

        /*dataQueue[doc.user.username][doc.type].push(doc.value);

        if (dataQueue[doc.user.username][doc.type].length >= meanWindow * 10) {
          var meanDoc = doc;
          meanDoc.value = math.mean(dataQueue[doc.user.username][doc.type]);
          meanDoc.type = doc.type + '-mean';

          metrics.insert(meanDoc).success(function(metric) {
            //console.log(metric);
          }).error(function(err) {
            throw err;
          });

          dataQueue[doc.user.username][doc.type] = [];
        }*/
      }).error(function(err) {
        throw err;
      });
    });

  }).error(function(err) {
    throw err;
  });
});
