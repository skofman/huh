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
var deck = ['2C','3C','4C','5C','6C','7C','8C','9C','TC','JC','QC','KC','AC',
            '2S','3S','4S','5S','6S','7S','8S','9S','TS','JS','QS','KS','AS',
            '2D','3D','4D','5D','6D','7D','8D','9D','TD','JD','QD','KD','AD',
            '2H','3H','4H','5H','6H','7H','8H','9H','TH','JH','QH','KH','AH'];
var tableNames = ['jungle','forest','sea','ocean','mountain'];
//function to read users file
(function() {
  fs.readFile('./users.json', 'utf8', function(err, data) {
    if (err) throw err;
    users = JSON.parse(data);
  });
  fs.readFile('./tables.json', 'utf8', function(err, data) {
    tables = JSON.parse(data);
  });
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
    player: player,
    action: "",
    amount: "",
    dealer: true,
    hand: []
  },
  this.second = {
    action: "",
    amount: "",
    dealer: false,
    hand: []
  },
  this.bb = bb;
  this.stage = "";
  this.pot = 0;
  this.deck = [true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true];
};

Table.prototype.deal = function() {
  switch(this.stage) {
    case 'pre':
      var card = Math.floor(Math.random() * 52);
      for (var i = 0; i < 2; i++) {
        while (!this.deck[card]) {
          card = Math.floor(Math.random() * 52);
        }
        if (this.first.dealer) {
          this.second.hand.push(deck[card]);
          this.deck[card] = false;
          while(!this.deck[card]) {
            card = Math.floor(Math.random() * 52);
          }
          this.first.hand.push(deck[card]);
          this.deck[card] = false;
        }
        else {
          this.first.hand.push(deck[card]);
          this.deck[card] = false;
          while(!this.deck[card]) {
            card = Math.floor(Math.random() * 52);
          }
          this.second.hand.push(deck[card]);
          this.deck[card] = false;
        }
      }
      break;
  }
};
//check logged in user route
app.get('/check', function(req, res) {
  for (key in users) {
    if (users[key].session == req.cookies.session) {
      var payload = {
        name: key,
        balance: users[key].bankroll,
        first: users[key].firstname,
        last: users[key].lastname,
        loc: users[key].location,
        tables: tables
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
        loc: users[req.body.username].location,
        tables: tables
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
    //updateFile('tables');
    socket.emit('my table', {status: 'remove'});
    io.emit('post tables', tables);
  });
  socket.on('join table', function(data) {
    tables[data.table].second.player = data.player;
    tables[data.table].second.stack = data.buyin;
    tables[data.table].status = 'ready';
    tables[data.table].stage = 'setup';
    var first = {
      action: 'setup',
      table: data.table,
      stage: tables[data.table].stage,
      status: tables[data.table].status,
      dealer: tables[data.table].first.dealer,
      bb: tables[data.table].bb,
      stack: tables[data.table].first.stack,
      opp: {
        name: tables[data.table].second.player,
        stack: tables[data.table].second.stack
      }
    }
    var second = {
      action: 'setup',
      table: data.table,
      stage: tables[data.table].stage,
      status: tables[data.table].status,
      dealer: tables[data.table].second.dealer,
      bb: tables[data.table].bb,
      stack: tables[data.table].second.stack,
      opp: {
        name: tables[data.table].first.player,
        stack: tables[data.table].first.stack
      }
    }
    io.emit(tables[data.table].first.player, first);
    io.emit(tables[data.table].second.player, second);
  });
  //Main play socket
  socket.on('play', function(data) {
    console.log(data);
    switch(data.stage) {
      case 'setup':
        var update = {
          stage: 'setup'
        };
        tables[data.table].pot += data.amount;
        if (tables[data.table].first.player === data.player) {
          tables[data.table].first.stack -= data.amount;
          update.action = 'update';
          update.amount = data.amount;
          io.emit(tables[data.table].second.player, update);
        }
        else {
          tables[data.table].second.stack -= data.amount;
          update.action = 'update';
          update.amount = data.amount;
          io.emit(tables[data.table].first.player, update);
        }
        if (tables[data.table].pot === tables[data.table].bb * 3 / 2) {
          tables[data.table].stage = 'pre';
          tables[data.table].deal();
          var first = {
            table: data.tables,
            action: 'deal',
            stage: 'pre',
            hand: tables[data.table].first.hand,
            dealer: tables[data.table].first.dealer
          }
          var second = {
            table: data.tables,
            action: 'deal',
            stage: 'pre',
            hand: tables[data.table].second.hand,
            dealer: tables[data.table].second.dealer
          }
          io.emit(tables[data.table].first.player, first);
          io.emit(tables[data.table].second.player, second);
        }
        break;
    }
  });
})
//Route of getting the active user
app.get('/username', function(req, res) {
  for (name in users) {
    if (users[name].session == req.cookies.session) {
      res.send(name);
    }
  }
});
//Server listener
server.listen(8080, function() {
  console.log('Listening on port 8080');
});
