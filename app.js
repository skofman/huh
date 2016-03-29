var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
var jsonParser = require('body-parser').json();
var fs = require('fs');
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(cookieParser());
app.use(express.static(__dirname + '/public'));

var users;
var tables;
var tableNames = ['jungle','forest','sea','ocean','mountain'];
//function to read users file
(function() {
  fs.readFile('./users.json', 'utf8', function(err, data) {
    if (err) throw err;
    users = JSON.parse(data);
  });
  fs.readFile('./tables.json', 'utf8', function(err, data) {
    tables = JSON.parse(data);
  })
})();
//function to write input to file
function updateFile(str) {
  var file = './' + str + '.json';
  switch(str) {
    case 'users':
      fs.writeFile(file, JSON.stringify(users), function(err) {
        if (err) throw err;
      });
      break;
    case 'tables':
      fs.writeFile(file, JSON.stringify(tables), function(err) {
        if (err) throw err;
      });
      break;
  }
}
//User constructor
function User(pwd) {
  this.firstname = "";
  this.lastname = "";
  this.pwd = pwd;
  this.bankroll = 500;
  this.session = "";
  this.location = "";
}
//Table constructor
function Table(player, bb) {
  this.status = 'waiting',
  this.first = {
    player: player
  },
  this.second = "",
  this.bb = bb,
  this.stage = ""
}
//check logged in user route
app.get('/check', function(req, res) {
  for (key in users) {
    if (users[key].session == req.cookies.session) {
      var payload = {
        name: key,
        balance: users[key].bankroll,
        first: users[key].firstname,
        last: users[key].lastname,
        loc: users[key].location
      }
    }
  }
  if (payload) {
    res.status(200).send(payload);
  }
  else {
    res.status(404).send();
  }
});
//login route
app.post('/login', jsonParser, function(req, res) {
  if (users.hasOwnProperty(req.body.username)) {
    if (users[req.body.username].pwd === req.body.pwd) {
      users[req.body.username].session = Math.floor(Math.random() * 1000000);
      updateFile('users');
      res.cookie("session", users[req.body.username].session);
      var payload = {
        name: req.body.username,
        balance: users[req.body.username].bankroll,
        first: users[req.body.username].firstname,
        last: users[req.body.username].lastname,
        loc: users[req.body.username].location
      };
      res.status(200).json(payload);
    }
    else {
      res.status(401).send('Wrong password');
    }
  }
  else {
    res.status(401).send('User does not exist');
  }
})
//signup route
app.post('/signup', jsonParser, function(req, res) {
  users[req.body.username] = new User(req.body.pwd);
  updateFile('users');
  var payload = {
    name: req.body.username,
    pwd: req.body.pwd
  };
  res.status(200).send(payload);
});
//logout route
app.get('/logout', function(req, res) {
  res.clearCookie('session');
  updateFile('users');
  res.send();
});
//Update information route
app.post('/update/:name', jsonParser, function(req, res) {
  if (users[req.params.name].session == req.cookies.session) {
    for (key in req.body) {
      users[req.params.name][key] = req.body[key];
    }
    updateFile('users');
    res.sendStatus(200);
  }
  else {
    res.sendStatus(403);
  }
});
//checking for existing user name
app.get('/checkuser/:name', function(req, res) {
  if (!users.hasOwnProperty(req.params.name)) {
    res.sendStatus(200);
  }
  else {
    res.send(406);
  }
});
//Socket on connection
io.on('connection', function(socket) {
  socket.on('create table', function(data) {
    var name = tableNames[Math.floor(Math.random() * tableNames.length)];
    while(tables.hasOwnProperty(name)) {
      console.log('in');
      name = tableNames[Math.floor(Math.random() * tableNames.length)];
    }
    tables[name] = new Table(data.player, data.bb);
    tables[name].first.stack = data.buyin;
    //updateFile('tables');
    var update = {
      name: name,
      bb: data.bb,
      stack: data.buyin,
      status: 'create'
    }
    socket.emit('my table', update);
    io.emit('post tables', tables);
  });
  socket.on('remove table', function(data) {
    delete tables[data.table];
    socket.emit('my table', {status: 'remove'});
  });
})
//Server listener
server.listen(8080, function() {
  console.log('Listening on port 8080');
});
