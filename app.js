var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
var jsonParser = require('body-parser').json();
var fs = require('fs');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var _ = require('lodash');

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
  this.balance = 500;
  this.session = "";
  this.location = "";
  this.sessions = [];
  this.avatar = 'images/avatars/none.png';
  this.deck = 'images/decks/1.jpg';
}
//Table constructor
function Table(player, bb) {
  this.status = 'waiting';
  this.stage = '';
  this.first = {
    player: player,
    dealer: true,
    hand: [],
    strength: {
      value: 0,
      type: [],
      kicker: []
    }
  },
  this.second = {
    dealer: false,
    hand: [],
    strength: {
      value: 0,
      type: [],
      kicker: []
    }
  },
  this.bb = bb;
  this.pot = 0;
  this.deck = [true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true];
  this.community = [];
  this.hand = 1;
};
//Prototype method for dealing cards
Table.prototype.deal = function() {
  var card = Math.floor(Math.random() * 52);
  switch(this.stage) {
    case 'pre':
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
    case 'flop':
      for (var i = 0; i < 4; i++) {
        while (!this.deck[card]) {
          card = Math.floor(Math.random() * 52);
        }
        if (i != 0) {
          this.community.push(deck[card]);
        }
        this.deck[card] = false;
      }
      break;
    case 'turn':
    case 'river':
      while (!this.deck[card]) {
        card = Math.floor(Math.random() * 52);
      }
      this.deck[card] = false;
      card = Math.floor(Math.random() * 52);
      while (!this.deck[card]) {
        card = Math.floor(Math.random() * 52);
      }
      this.community.push(deck[card]);
      this.deck[card] = false;
      break;
  }
};
//Prototype method for starting a new hand
Table.prototype.newHand = function() {
  this.stage = "";
  for (var i = 0; i < this.deck.length; i++) {
    this.deck[i] = true;
  }
  this.first.hand = [];
  this.second.hand = [];
  this.first.strength.value = 0;
  this.second.strength.value = 0;
  this.first.strength.type = [];
  this.second.strength.type = [];
  this.first.strength.kicker = [];
  this.second.strength.kicker = [];
  this.community = [];
}
//Prototype method for determining the winner
Table.prototype.evaluateHand = function(player) {
  var hand = player.hand.concat(this.community);
  var values = [];
  var suits = [];
  var cards = ['A','K','Q','J','T','9','8','7','6','5','4','3','2'];
  var suitArr = ['D','H','S','C'];

  for (var i = 0; i < hand.length; i++) {
    values.push(hand[i].charAt(0));
    suits.push(hand[i].charAt(1));
  }
  //Checking for Royal Flush
  var aces = _.filter(hand, function(value) {
    return value.charAt(0) === 'A';
  });
  for (var i = 0; i < aces.length; i++) {
    var suit = aces[i].charAt(1);
    if (_.includes(hand, 'K' + suit) && _.includes(hand, 'Q' + suit) && _.includes(hand, 'J' + suit) && _.includes(hand, 'T' + suit)) {
      player.strength.value = 9;
      return;
    }
  }
  //Checking for Straight flush
  for (var i = 1; i < cards.length - 3; i++) {
    var card = _.filter(hand, function(value) {
      return value.charAt(0) === cards[i];
    });
    for (var j = 0; j < card.length; j++) {
      if (cards[i] === '5') {
        var lastcard = 'A';
      }
      else {
        var lastcard = cards[i + 4];
      }
      var suit = card[j].charAt(1);
      if (_.includes(hand, cards[i + 1] + suit) && _.includes(hand, cards[i + 2] + suit) && _.includes(hand, cards[i + 3] + suit) && _.includes(hand, lastcard + suit)) {
        player.strength.value = 8;
        player.strength.type.push(cards[i]);
        return;
      }
    }
  }
  //Checking for 4 of a kind
  for (var i = 0; i < values.length; i++) {
    var quads = _.filter(values, function(value) {
      return values[i] === value;
    })
    if (quads.length === 4) {
      player.strength.value = 7;
      player.strength.type.push(quads[0]);
      var kicker = _.filter(values, function(value) {
        return Number(value != quads[0]);
      });
      for (var j = 0; j < cards.length; j++) {
        if (_.includes(kicker, cards[j])) {
          player.strength.kicker.push(cards[j]);
          return;
        }
      }
    }
  }
  //Checking for Full House
  for (var i = 0; i < cards.length; i++) {
    var top = _.filter(values, function(value) {
      return cards[i] === value;
    })
    if (top.length === 3) {
      var newValues = _.filter(values, function(value) {
        return value != cards[i];
      })
      for (var j = 0; j < cards.length; j++) {
        var bottom = _.filter(newValues, function(value) {
          return value === cards[j];
        })
        if (bottom.length >= 2) {
          player.strength.value = 6;
          player.strength.type.push(top[0]);
          player.strength.type.push(bottom[0]);
          return;
        }
      }
    }
  }
  //Checking for a Flush
  for (var i = 0; i < suitArr.length; i++) {
    var flush = _.filter(suits, function(value) {
      return value === suitArr[i];
    })
    if (flush.length >= 5) {
      player.strength.value = 5;
      var order = _.filter(hand, function(value) {
        return value.charAt(1) === flush[0];
      })
      for (var j = 0; j < cards.length; j++) {
        if (_.includes(order, cards[j] + flush[0])) {
          player.strength.type.push(cards[j]);
          if (player.strength.type.length === 5) {
            return;
          }
        }
      }
    }
  }
  //Checking for Straight
  for (var i = 0; i < cards.length - 3; i++) {
    if (cards[i] === '5') {
      var lastcard = 'A';
    } else {
      var lastcard = cards[i + 4];
    }
    if (_.includes(values, cards[i]) && _.includes(values, cards[i + 1]) && _.includes(values, cards[i + 2]) && _.includes(values, cards[i + 3]) && _.includes(values, lastcard)) {
      player.strength.value = 4;
      player.strength.type.push(cards[i]);
      return;
    }
  }
  //Checking for 3 of a kind
  for (var i = 0; i < cards.length; i++) {
    var trips = _.filter(values, function(value) {
      return value === cards[i];
    })
    if (trips.length === 3) {
      player.strength.value = 3;
      player.strength.type.push(trips[0]);
      var kicker = _.filter(values, function(value) {
        return value != trips[0];
      })
      for (var j = 0; j < cards.length; j++) {
        if (_.includes(kicker, cards[j])) {
          player.strength.kicker.push(cards[j]);
          if (player.strength.kicker.length === 2) {
            return;
          }
        }
      }
    }
  }
  //Checking for 2 pairs or pair
  for (var i = 0; i < cards.length; i++) {
    var top = _.filter(values, function(value) {
      return value === cards[i];
    })
    if (top.length === 2) {
      for (var j = i + 1; j < cards.length; j++) {
        var bottom = _.filter(values, function(value) {
          return value === cards[j];
        })
        if (bottom.length === 2) {
          player.strength.value = 2;
          player.strength.type.push(top[0]);
          player.strength.type.push(bottom[0]);
          var kicker = _.filter(values, function(value) {
            return value != top[0] && value != bottom[0];
          })
          for (var k = 0; k < cards.length; k++) {
            if (_.includes(kicker, cards[k])) {
              player.strength.kicker.push(cards[k]);
              return;
            }
          }
        }
      }
      player.strength.value = 1;
      player.strength.type.push(top[0]);
      var kicker = _.filter(values, function(value) {
        return value != top[0];
      })
      for (var j = 0; j < cards.length; j++) {
        if (_.includes(kicker, cards[j])) {
          player.strength.kicker.push(cards[j]);
          if (player.strength.kicker.length === 3) {
            return;
          }
        }
      }
    }
  }
  //High card
  player.strength.value = 0;
  for (var i = 0; i < cards.length; i++) {
    if (_.includes(values, cards[i])) {
      player.strength.type.push(cards[i]);
      if (player.strength.type.length === 5) {
        return;
      }
    }
  }
}
//check logged in user route
app.get('/check', function(req, res) {
  for (key in users) {
    if (users[key].session == req.cookies.session) {
      var payload = {
        username: key,
        avatar: users[key].avatar,
        balance: users[key].balance,
        firstname: users[key].firstname,
        lastname: users[key].lastname,
        location: users[key].location,
        deck: users[key].deck,
        table: {
          status: 'not found'
        }
      }
      for (item in tables) {
        if (tables[item].first.player == key || tables[item].second.player == key) {
          payload.table.status = tables[item].status;
          payload.table.name = item;
          payload.table.bb = tables[item].bb;
          payload.table.stack = tables[item].first.stack;
        }
      }
      io.emit('post tables', tables);
    }
  }
  io.emit('post tables', tables);
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
      res.sendStatus(200);
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
  users[req.body.username].session = Math.floor(Math.random() * 1000000);
  updateFile('users');
  res.cookie("session", users[req.body.username].session);
  res.sendStatus(200);
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
    res.sendStatus(406);
  }
});
//Socket on connection
io.on('connection', function(socket) {
  socket.on('create table', function(data) {
    var name = tableNames[Math.floor(Math.random() * tableNames.length)];
    while(tables.hasOwnProperty(name)) {
      name = tableNames[Math.floor(Math.random() * tableNames.length)];
    }
    tables[name] = new Table(data.player, data.bb);
    tables[name].first.startStack = data.buyin;
    tables[name].first.stack = data.buyin;
    updateFile('tables');
    users[data.player].bankroll -= data.buyin;
    updateFile('users');
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
    var user = tables[data.table].first.player;
    users[user].balance += Number(tables[data.table].first.stack);
    updateFile('users');
    delete tables[data.table];
    updateFile('tables');
    socket.emit('my table', {status: 'remove'});
    io.emit('post tables', tables);
  });
  socket.on('join table', function(data) {
    var table = tables[data.table];
    users[data.player].balance -= data.buyin;
    table.start = Date.now();
    table.second.player = data.player;
    table.second.stack = data.buyin;
    table.second.startStack = data.buyin;
    table.status = 'ready';
    var first = {
      action: 'setup',
      username: table.first.player,
      table: data.table,
      dealer: table.first.dealer,
      bb: table.bb,
      stack: table.first.stack,
      opp: {
        name: table.second.player,
        stack: table.second.stack,
        avatar: users[table.second.player].avatar
      },
      hand: table.hand,
      deck: users[table.first.player].deck
    }
    var second = {
      action: 'setup',
      username: table.second.player,
      table: data.table,
      dealer: table.second.dealer,
      bb: table.bb,
      stack: table.second.stack,
      opp: {
        name: table.first.player,
        stack: table.first.stack,
        avatar: users[table.first.player].avatar,
      },
      hand: table.hand,
      deck: users[table.second.player].deck
    }
    updateFile('tables');
    io.emit('post tables', tables);
    io.emit(table.first.player, first);
    io.emit(table.second.player, second);
    var post = {
      message: 'Dealer: Welcome to the table!'
    }
    io.emit(data.table, post);
  });
  //Main play socket
  socket.on('play', function(data) {
    console.log(data);
    var table = tables[data.table];
    if (table.first.player == data.player) {
      table.first.bet = data.bet;
    }
    else {
      table.second.bet = data.bet;
    }
    switch(data.action) {
      case 'post blind':
        var bb = Number(table.bb);
        table.pot = data.pot;
        var update = {
          action: 'update opp',
          pot: data.pot,
          stack: data.stack,
          bet: data.amount
        }
        if (data.player == table.first.player) {
          table.first.stack = data.stack;
          io.emit(table.second.player, update);
        }
        else {
          table.second.stack = data.stack;
          io.emit(table.first.player, update);
        }
        if (data.pot === bb * (3 / 2)) {
          var post = {
            message: 'Dealer: Players posted binds. Dealing hand!'
          }
          io.emit(data.table, post);
          table.stage = 'pre';
          table.deal();
          var first = {
            action: 'deal',
            dealer: table.first.dealer,
            hand: table.first.hand,
            bb: Number(table.bb)
          }
          var second = {
            action: 'deal',
            dealer: table.second.dealer,
            hand: table.second.hand,
            bb: Number(table.bb)
          }
          io.emit(table.first.player, first);
          io.emit(table.second.player, second);
        }
        break;
      case 'fold':
        if (table.first.player == data.player) {
          var post = {
            message: 'Dealer: ' + table.first.player + ' folded. ' + table.second.player + ' wins ' + table.pot + '.'
          }
          io.emit(data.table, post);
          table.second.stack += table.pot;
          table.pot = 0;
          var update = {
            action: 'opp fold',
            stack: table.second.stack,
            pot: table.pot
          }
          io.emit(table.second.player, update);
        }
        else {
          var post = {
            message: 'Dealer: ' + table.second.player + ' folded. ' + table.first.player + ' wins ' + table.pot + '.'
          }
          io.emit(data.table, post);
          table.first.stack += table.pot;
          table.pot = 0;
          var update = {
            action: 'opp fold',
            stack: table.first.stack,
            pot: table.pot
          }
          io.emit(table.first.player, update);
        }
        table.pot = 0;
        table.first.dealer = !table.first.dealer;
        table.second.dealer = !table.second.dealer;
        table.hand++;
        var first = {
          action: 'new hand',
          hand: [users[table.first.player].deck.slice(-5,-4),users[table.first.player].deck.slice(-5,-4)],
          stack: table.first.stack,
          oppstack: table.second.stack,
          dealer: table.first.dealer,
          number: table.hand,
          bb: Number(table.bb)
        }
        var second = {
          action: 'new hand',
          hand: [users[table.second.player].deck.slice(-5,-4),users[table.second.player].deck.slice(-5,-4)],
          stack: table.second.stack,
          oppstack: table.first.stack,
          dealer: table.second.dealer,
          number: table.hand,
          bb: Number(table.bb)
        }
        io.emit(table.first.player, first);
        io.emit(table.second.player, second);
        table.newHand();
        break;
      case 'open call':
        table.pot = data.pot;
        var update = {
          action: 'call pre',
          pot: data.pot,
          stack: data.stack,
          bb: Number(table.bb)
        }
        if (data.player == table.first.player) {
          var post = {
            message: 'Dealer: ' + table.first.player + ' called ' + (update.bb / 2) + '.'
          }
          io.emit(data.table, post);
          table.first.stack = data.stack;
          io.emit(table.second.player, update);
        }
        else {
          var post = {
            message: 'Dealer: ' + table.second.player + ' called ' + (update.bb / 2) + '.'
          }
          io.emit(data.table, post);
          table.second.stack = data.stack;
          io.emit(table.first.player, update);
        }
        break;
      case 'raise':
        table.pot = data.pot;
        var update = {
          action: 'raised',
          pot: data.pot,
          stack: data.stack,
          raise: data.raise,
          bb: Number(table.bb)
        }
        if (data.player == table.first.player) {
          var post = {
            message: 'Dealer: ' + table.first.player + ' raised to ' + data.raise + '.'
          }
          io.emit(data.table, post);
          table.first.stack = data.stack;
          io.emit(table.second.player, update);
        }
        else {
          var post = {
            message: 'Dealer: ' + table.second.player + ' raised to ' + data.raise + '.'
          }
          io.emit(data.table, post);
          table.second.stack = data.stack;
          io.emit(table.first.player, update);
        }
        break;
      case 'call':
        table.pot = data.pot;
        var update = {
          action: 'update opp',
          pot: data.pot,
          stack: data.stack,
          bet: data.amount
        }
        if (data.player == table.first.player) {
          var post = {
            message: 'Dealer: ' + table.first.player + ' called ' + data.call + '.'
          }
          io.emit(data.table, post);
          table.first.stack = data.stack;
          io.emit(table.second.player, update);
        }
        else {
          var post = {
            message: 'Dealer: ' + table.second.player + ' called ' + data.call + '.'
          }
          io.emit(data.table, post);
          table.second.stack = data.stack;
          io.emit(table.first.player, update);
        }
        moveStage(table);
        break;
      case 'closing check':
        if (data.player == table.first.player) {
          var post = {
            message: 'Dealer: ' + table.first.player + ' checks.'
          }
          io.emit(data.table, post);
        }
        else {
          var post = {
            message: 'Dealer: ' + table.second.player + ' checks.'
          }
          io.emit(data.table, post);
        }
        moveStage(table);
        break;
      case 'bet':
        table.pot = data.pot;
        var update = {
          action: 'open bet',
          pot: data.pot,
          bet: data.amount,
          stack: data.stack,
          bb: Number(table.bb)
        }
        if (data.player === table.first.player) {
          var post = {
            message: 'Dealer: ' + table.first.player + ' bets ' + data.amount + '.'
          }
          io.emit(data.table, post);
          table.first.stack = data.stack;
          io.emit(table.second.player, update);
        }
        else {
          var post = {
            message: 'Dealer: ' + table.second.player + ' bets ' + data.amount + '.'
          }
          io.emit(data.table, post);
          table.second.stack = data.stack;
          io.emit(table.first.player, update);
        }
        break;
      case 'check':
        var update = {
          action: 'checked',
          bb: table.bb
        }
        if (data.player == table.first.player) {
          var post = {
            message: 'Dealer: ' + table.first.player + ' checks.'
          }
          io.emit(data.table, post);
          io.emit(table.second.player, update);
        }
        else {
          var post = {
            message: 'Dealer: ' + table.second.player + ' checks.'
          }
          io.emit(data.table, post);
          io.emit(table.first.player, update);
        }
        break;
      case 'leave':
        console.log(tables);
        var first = {
          action: 'player left'
        }
        var second = {
          action: 'player left'
        }
        if (data.player == table.first.player) {
          table.second.stack += table.pot;
          second.opponent = data.player;
          first.opponent = false;
        }
        else {
          table.first.stack += table.pot;
          first.opponent = data.player;
          second.opponent = false;
        }
        users[table.first.player].bankroll += table.first.stack;
        first.balance = users[table.first.player].bankroll;
        users[table.second.player].bankroll += table.second.stack;
        second.balance = users[table.second.player].bankroll;
        io.emit(table.first.player, first);
        io.emit(table.second.player, second);
        users[table.first.player].sessions.push({
          opp: table.second.player,
          hands: table.hand,
          outcome: table.first.stack - table.first.startStack,
          start: table.start,
          end: Date.now()
        })
        users[table.second.player].sessions.push({
          opp: table.first.player,
          hands: table.hand,
          outcome: table.second.stack - table.second.startStack,
          start: table.start,
          end: Date.now()
        })
        delete tables[data.table];
        io.emit('my table', {status: 'remove'});
        io.emit('post tables', tables);
        updateFile('tables');
        updateFile('users');
        break;
    }
  });
  socket.on('chat', function(data) {
    var message = data.player + ': ' + data.message;
    tables[data.table].chat.push(message);
    var update = {
      message: message
    }
    io.emit(data.table, update);
  });

  function moveStage(table) {
    var tableNames = Object.keys(tables);
    for (var i = 0; i < tableNames.length; i++) {
      if (tables[tableNames[i]] === table) {
        var tableName = tableNames[i];
      }
    }
    switch(table.stage) {
      case 'pre':
        table.stage = 'flop';
        var post = {
          message: 'Dealer: Dealing flop!'
        }
        io.emit(tableName, post);
        var first = {
          action: 'deal flop'
        }
        var second = {
          action: 'deal flop'
        }
        break;
      case 'flop':
        table.stage = 'turn';
        var post = {
          message: 'Dealer: Dealing turn!'
        }
        io.emit(tableName, post);
        var first = {
          action: 'deal turn'
        }
        var second = {
          action: 'deal turn'
        }
        break;
      case 'turn':
        table.stage = 'river';
        var post = {
          message: 'Dealer: Dealing river!'
        }
        io.emit(tableName, post);
        var first = {
          action: 'deal river'
        }
        var second = {
          action: 'deal river'
        }
        break;
      case 'river':
        table.stage = 'showdown';
        table.evaluateHand(table.first);
        table.evaluateHand(table.second);
        var winner = determineWinner(table);
        if (winner === 'tie') {
          var post = {
            message: 'Dealer: Tie hand. Chop the pot!'
          }
          io.emit(tableName, post);
          table.first.stack += table.pot / 2;
          table.second.stack += table.pot / 2;
        }
        else {
          winner.stack += table.pot;
        }
        table.pot = 0;
        table.first.dealer = !table.first.dealer;
        table.second.dealer = !table.second.dealer;
        table.hand++;
        var first = {
          action: 'new hand',
          hand: table.second.hand,
          stack: table.first.stack,
          oppstack: table.second.stack,
          dealer: table.first.dealer,
          number: table.hand,
          bb: Number(table.bb)
        }
        var second = {
          action: 'new hand',
          hand: table.first.hand,
          stack: table.second.stack,
          oppstack: table.first.stack,
          dealer: table.second.dealer,
          number: table.hand,
          bb: Number(table.bb)
        }
        io.emit(table.first.player, first);
        io.emit(table.second.player, second);
        table.newHand();
        return;
    }
    table.deal();
    first.dealer = table.first.dealer;
    first.cards = table.community;
    first.bb = Number(table.bb);
    second.dealer = table.second.dealer;
    second.cards = table.community;
    second.bb = Number(table.bb);
    io.emit(table.first.player, first);
    io.emit(table.second.player, second);
  }

  function valueString(value) {
    switch(value.value) {
      case 9:
        return 'a Royal Flush.';
      case 8:
        return 'a Straight Flush. ' + value.type[0] + ' high.';
      case 7:
        return 'four of a kind ' + value.type[0] + '.';
      case 6:
        return 'a full house. ' + value.type[0] + ' over ' + value.type[1] + '.';
      case 5:
        return 'a flush. ' + value.type[0] + ' high.';
      case 4:
        return 'a straight. ' + value.type[0] + ' high.';
      case 3:
        return 'three of a kind ' + value.type[0] + '.';
      case 2:
        return 'two pair. ' + value.type[0] + ' and ' + value.type[1] + '.';
      case 1:
        return 'a pair of ' + value.type[0] + '.';
    }
  }

  function determineWinner(table) {
    var tableNames = Object.keys(tables);
    for (var i = 0; i < tableNames.length; i++) {
      if (tables[tableNames[i]] === table) {
        var tableName = tableNames[i];
      }
    }
    var post = {
      message: ""
    }
    if (table.first.strength.value > table.second.strength.value) {
      post.message = 'Dealer: ' + table.first.player + ' wins with ' + valueString(table.first.strength);
      io.emit(tableName, post);
      return table.first;
    }
    else if (table.first.strength.value < table.second.strength.value) {
      post.message = 'Dealer: ' + table.second.player + ' wins with ' + valueString(table.second.strength);
      io.emit(tableName, post);
      return table.second;
    }
    else {
      var values = {
        '2': 0,
        '3': 1,
        '4': 2,
        '5': 3,
        '6': 4,
        '7': 5,
        '8': 6,
        '9': 7,
        'T': 8,
        'J': 9,
        'Q': 10,
        'K': 11,
        'A': 12
      }
      switch(table.first.strength.value) {
        case 9:
          return 'tie';
          break;
        case 8:
          var type1 = values[table.first.strength.type[0]];
          var type2 = values[table.second.strength.type[0]];
          if (type1 > type2) {
            post.message = 'Dealer: ' + table.first.player + ' wins with ' + valueString(table.first.strength);
            io.emit(tableName, post);
            return table.first;
          }
          else if (type2 > type1) {
            post.message = 'Dealer: ' + table.second.player + ' wins with ' + valueString(table.second.strength);
            io.emit(tableName, post);
            return table.second;
          }
          else {
            return 'tie';
          }
          break;
        case 7:
          var type1 = values[table.first.strength.type[0]];
          var type2 = values[table.second.strength.type[0]];
          if (type1 > type2) {
            post.message = 'Dealer: ' + table.first.player + ' wins with ' + valueString(table.first.strength);
            io.emit(tableName, post);
            return table.first;
          }
          else if (type2 > type1) {
            post.message = 'Dealer: ' + table.second.player + ' wins with ' + valueString(table.second.strength);
            io.emit(tableName, post);
            return table.second;
          }
          else {
            var kick1 = values[table.first.strength.kicker[0]];
            var kick2 = values[table.second.strength.kicker[0]];
            if (kick1 > kick2) {
              post.message = 'Dealer: ' + table.first.player + ' wins with ' + valueString(table.first.strength) + ' and ' + table.first.strength.kicker[0] + 'kicker.';
              io.emit(tableName, post);
              return table.first;
            }
            else if (kick2 > kick1){
              post.message = 'Dealer: ' + table.second.player + ' wins with ' + valueString(table.second.strength) + ' and ' + table.second.strength.kicker[0] + ' kicker.';
              io.emit(tableName, post);
              return table.second;
            }
            else {
              return 'tie';
            }
          }
          break;
        case 6:
          for (var i = 0; i < 2; i++) {
            var type1 = values[table.first.strength.type[i]];
            var type2 = values[table.second.strength.type[i]];
            if (type1 > type2) {
              post.message = 'Dealer: ' + table.first.player + ' wins with ' + valueString(table.first.strength);
              io.emit(tableName, post);
              return table.first;
              break;
            }
            else if (type2 > type1) {
              post.message = 'Dealer: ' + table.second.player + ' wins with ' + valueString(table.second.strength);
              io.emit(tableName, post);
              return table.second;
              break;
            }
            if (i === 1) {
              return 'tie';
            }
          }
          break;
        case 5:
          for (var i = 0; i < 5; i++) {
            var type1 = values[table.first.strength.type[i]];
            var type2 = values[table.second.strength.type[i]];
            if (type1 > type2) {
              post.message = 'Dealer: ' + table.first.player + ' wins with ' + valueString(table.first.strength);
              io.emit(tableName, post);
              return table.first;
              break;
            }
            else if (type2 > type1) {
              post.message = 'Dealer: ' + table.second.player + ' wins with ' + valueString(table.second.strength);
              io.emit(tableName, post);
              return table.second;
              break;
            }
            if (i === 4) {
              return 'tie';
            }
          }
          break;
        case 4:
          var type1 = values[table.first.strength.type[0]];
          var type2 = values[table.second.strength.type[0]];
          if (type1 > type2) {
            post.message = 'Dealer: ' + table.first.player + ' wins with ' + valueString(table.first.strength);
            io.emit(tableName, post);
            return table.first;
          }
          else if (type2 > type1) {
            post.message = 'Dealer: ' + table.second.player + ' wins with ' + valueString(table.second.strength);
            io.emit(tableName, post);
            return table.second;
          }
          else {
            return 'tie';
          }
          break;
        case 3:
          var type1 = values[table.first.strength.type[0]];
          var type2 = values[table.second.strength.type[1]];
          if (type1 > type2) {
            post.message = 'Dealer: ' + table.first.player + ' wins with ' + valueString(table.first.strength);
            io.emit(tableName, post);
            return table.first;
          }
          else if (type2 > type1) {
            post.message = 'Dealer: ' + table.second.player + ' wins with ' + valueString(table.second.strength);
            io.emit(tableName, post);
            return table.second;
          }
          else {
            for (var i = 0; i < 2; i++) {
              var kick1 = values[table.first.strength.kicker[i]];
              var kick2 = values[table.second.strength.kicker[i]];
              if (kick1 > kick2) {
                post.message = 'Dealer: ' + table.first.player + ' wins with ' + valueString(table.first.strength) + ' and ' + table.first.strength.kicker[i] + ' kicker.';
                io.emit(tableName, post);
                return table.first;
                break;
              }
              else if (kick2 > kick1) {
                post.message = 'Dealer: ' + table.second.player + ' wins with ' + valueString(table.second.strength) + ' and ' + table.second.strength.kicker[i] + ' kicker.';
                io.emit(tableName, post);
                return table.second;
                break;
              }
              if (i === 1) {
                return 'tie';
              }
            }
          }
          break;
        case 2:
          for (var i = 0; i < 2; i++) {
            var type1 = values[table.first.strength.type[i]];
            var type2 = values[table.second.strength.type[i]];
            if (type1 > type2) {
              post.message = 'Dealer: ' + table.first.player + ' wins with ' + valueString(table.first.strength);
              io.emit(tableName, post);
              return table.first;
              break;
            }
            else if (type2 > type1) {
              post.message = 'Dealer: ' + table.second.player + ' wins with ' + valueString(table.second.strength);
              io.emit(tableName, post);
              return table.second;
              break;
            }
            if (i === 1) {
              var kick1 = values[table.first.strength.kicker[0]];
              var kick2 = values[table.second.strength.kicker[0]];
              if (kick1 > kick2) {
                post.message = 'Dealer: ' + table.first.player + ' wins with ' + valueString(table.first.strength) + ' and ' + table.first.strength.kicker[0] + ' kicker.';
                io.emit(tableName, post);
                return table.first;
              }
              else if (kick2 > kick1) {
                post.message = 'Dealer: ' + table.second.player + ' wins with ' + valueString(table.second.strength) + ' and ' + table.second.strength.kicker[0] + ' kicker.';
                io.emit(tableName, post);
                return table.second;
              }
              else {
                return 'tie';
              }
            }
          }
          break;
        case 1:
          var type1 = values[table.first.strength.type[0]];
          var type2 = values[table.second.strength.type[0]];
          if (type1 > type2) {
            post.message = 'Dealer: ' + table.first.player + ' wins with ' + valueString(table.first.strength);
            io.emit(tableName, post);
            return table.first;
          }
          else if (type2 > type1) {
            post.message = 'Dealer: ' + table.second.player + ' wins with ' + valueString(table.second.strength);
            io.emit(tableName, post);
            return table.second;
          }
          else {
            for (var i = 0; i < 3; i++) {
              var kick1 = values[table.first.strength.kicker[i]];
              var kick2 = values[table.second.strength.kicker[i]];
              if (kick1 > kick2) {
                post.message = 'Dealer: ' + table.first.player + ' wins with ' + valueString(table.first.strength) + ' and ' + table.first.strength.kicker[i] + ' kicker.';
                io.emit(tableName, post);
                return table.first;
                break;
              }
              else if (kick2 > kick1) {
                post.message = 'Dealer: ' + table.second.player + ' wins with ' + valueString(table.second.strength) + ' and ' + table.second.strength.kicker[i] + ' kicker.';
                io.emit(tableName, post);
                return table.second;
              }
              if (i === 2) {
                return 'tie';
              }
            }
          }
          break;
        case 0:
          for (var i = 0; i < 5; i++) {
            var type1 = values[table.first.strength.type[i]];
            var type2 = values[table.second.strength.type[i]];
            if (type1 > type2) {
              post.message = 'Dealer: ' + table.first.player + ' wins with ' + table.first.strength.type[i] + ' high.';
              io.emit(tableName, post);
              return table.first;
              break;
            }
            else if (type2 > type1) {
              post.message = 'Dealer: ' + table.second.player + ' wins with ' + table.second.strength.type[i] + ' high.';
              io.emit(tableName, post);
              return table.second;
              break;
            }
            if (i === 4) {
              return 'tie';
            }
          }
          break;
      }
    }
  }

})
//Route of getting the active user
app.get('/username', function(req, res) {
  for (name in users) {
    if (users[name].session == req.cookies.session) {
      res.send(name);
    }
  }
});
//Route of getting past sessions
app.get('/sessions', function(req, res) {
  for (key in users) {
    if (users[key].session == req.cookies.session) {
      var payload = JSON.stringify(users[key].sessions);
      res.send(payload);
    }
  }
});
//Route to getting leaders
app.get('/leaders', function(req, res) {
  var update = {
    winners: [],
    losers: []
  }
  for (key in users) {
    var total = 0;
    for (var i = 0; i < users[key].sessions.length; i++) {
      total+= users[key].sessions[i].outcome;
    }
    if (total >= 0) {
      update.winners.push({'user': key, 'total': total})
    }
    else {
      update.losers.push({'user': key, 'total': total});
    }
  }
  update.winners = _.sortBy(update.winners, ['user','total']).reverse();
  update.losers = _.sortBy(update.losers, ['user', 'total']);
  res.send(JSON.stringify(update));
});
//Server listener
var port = process.env.PORT || 1337;
server.listen(port, function() {
  console.log('Listening on port ' + port);
});
