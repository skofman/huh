var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
var jsonParser = require('body-parser').json();
var fs = require('fs');

app.use(cookieParser());
app.use(express.static(__dirname + '/public'));

var users;
//function to read users file
(function readUsers() {
  fs.readFile('./users.json', function(err, data) {
    if (err) throw err;
    users = JSON.parse(data.toString());
  });
})();
//User constructor
function User(pwd) {
  this.firstname = "";
  this.lastname = "";
  this.pwd = pwd;
  this.bankroll = 500;
  this.session = "";
}
//check logged in user route
app.get('/check', function(req, res) {
  for (key in users) {
    if (users[key].session == req.cookies.session) {
      var payload = {
        name: key,
        balance: users[key].bankroll
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
      fs.writeFile('./users.json', JSON.stringify(users), function(err) {
        if (err) throw err;
      })
      res.cookie("session", users[req.body.username].session);
      var payload = {
        name: req.body.username,
        balance: users[req.body.username].bankroll
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
  fs.writeFile('./users.json', JSON.stringify(users), function(err) {
    if (err) throw err;
  })
  var payload = {
    name: req.body.username,
    pwd: req.body.pwd
  };
  res.status(200).send(payload);
});
//logout route
app.get('/logout', function(req, res) {
  res.clearCookie('session');
  fs.writeFile('./users.json', JSON.stringify(users), function(err) {
    if (err) throw err;
  })
  res.send();
});
//checking for existing user name
app.get('/checkuser/:name', function(req, res) {
  console.log();
  if (!users.hasOwnProperty(req.params.name)) {
    res.sendStatus(200);
  }
  else {
    res.send(406);
  }
});
//Server listener
app.listen(8080, function() {
  console.log('Listening on port 8080');
});
