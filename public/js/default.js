var socket = io.connect('http://localhost:8080');
var username = "";

$('#show-login').click(function() {
  $('#login-form').removeClass('hide');
  $('#signup-form').addClass('hide');
});

$('#show-signup').click(function() {
  $('#login-form').addClass('hide');
  $('#signup-form').removeClass('hide');
});
//login event listener
$('#login').submit(function(event) {
  event.preventDefault();
  var payload = JSON.stringify({
    username: $('#login-user').val(),
    pwd: $('#login-pwd').val()
  })

  var xhr = new XMLHttpRequest();

  xhr.open('POST', '/login');
  xhr.setRequestHeader('Content-type', 'application/json');
  xhr.send(payload);

  xhr.onload = function() {
    if (xhr.status === 200) {
      $('#login-form').addClass('hide');
      $('#show-login').addClass('hide');
      $('#show-signup').addClass('hide');
      $('#logout').removeClass('hide');
      $('#user-status').removeClass('hide');
      var data = JSON.parse(xhr.response);
      $('#user-status p').text('Welcome, ' + data.name + '! Balance: ' + data.balance);
      $('#dash-user h5').text(data.name + ' ');
      username = data.name;
      $('#dash-balance h5').text(data.balance + ' ');
      $('#dash-first h5').text(data.first + ' ');
      $('#dash-last h5').text(data.last + ' ');
      $('#dash-loc h5').text(data.loc + ' ');
      $('#main').removeClass('hide');
      //create active table
      for (key in data.tables) {
        var col = document.createElement('div');
        var card = document.createElement('div');
        var nameContent = document.createElement('div');
        var name = document.createElement('div');
        var gameContent = document.createElement('div');
        var game = document.createElement('div');
        var infoContent = document.createElement('div');
        var playerName = document.createElement('div');
        var gameInfo = document.createElement('div');
        var gameNote = document.createElement('div');
        var blindContent = document.createElement('div');
        var amount = document.createElement('div');
        var inputBox = document.createElement('div');
        var label = document.createElement('p');
        var input = document.createElement('input');
        var btnContent = document.createElement('div');
        var btn = document.createElement('button');

        $(col).addClass('four wide column').appendTo('#game-grid');
        $(card).addClass('ui card').appendTo(col);
        $(nameContent).addClass('content').appendTo(card);
        var idName = key + '-name';
        $(name).addClass('center aligned header').attr('id', idName).text(key).appendTo(nameContent);
        $(gameContent).addClass('content').appendTo(card);
        $(game).addClass('center aligned description').text("No Limit Texas Hold'em").appendTo(gameContent);
        $(infoContent).addClass('content').appendTo(card);
        $(playerName).addClass('description').text('Player: ' + data.tables[key].first.player).appendTo(infoContent);
        $(gameInfo).addClass('description').text('Blinds: ' + Number(data.tables[key].bb) / 2 + ' / ' + data.tables[key].bb).appendTo(infoContent);
        $(gameNote).addClass('description').text('Minimum: ' + Number(data.tables[key].bb) * 40 + ' / Maximum: ' + Number(data.tables[key].bb) * 150).appendTo(infoContent);
        $(blindContent).addClass('content').appendTo(card);
        $(amount).addClass('center aligned description').appendTo(blindContent);
        $(label).text('Enter your buy-in amount').appendTo(amount);
        $(inputBox).addClass('ui fluid input').appendTo(amount);
        var idValue = key + '-val';
        $(input).attr({type: 'number', 'data-bb': data.tables[key].bb, id: idValue}).appendTo(inputBox);
        $(btnContent).addClass('extra content').appendTo(card);
        switch(data.tables[key].status) {
          case 'waiting':
            var text = 'Join table';
            $(btn).addClass('ui fluid button').text(text).attr('id',key).appendTo(btnContent);
            break;
        }
      }
    }
    else {
      $('#login-message p').text(xhr.responseText);
      $('#login-message').removeClass('hide');
    }
  }
  document.getElementById('login').reset();
});
//check if user was logged in
(function() {
  var xhr = new XMLHttpRequest();

  xhr.open('GET', '/check');
  xhr.send();

  xhr.onload = function() {
    if (xhr.status === 200) {
      $('#login-form').addClass('hide');
      $('#show-login').addClass('hide');
      $('#show-signup').addClass('hide');
      $('#logout').removeClass('hide');
      $('#user-status').removeClass('hide');
      var data = JSON.parse(xhr.response);
      $('#user-status p').text('Welcome, ' + data.name + '! Balance: ' + data.balance);
      $('#dash-user h5').text(data.name + ' ');
      username = data.name;
      $('#dash-balance h5').text(data.balance + ' ');
      $('#dash-first h5').text(data.first + ' ');
      $('#dash-last h5').text(data.last + ' ');
      $('#dash-loc h5').text(data.loc + ' ');
      $('#main').removeClass('hide');
      //create active tables
      for (key in data.tables) {
        if (data.tables[key].first.player != $('#dash-user').text().trim()) {
          var col = document.createElement('div');
          var card = document.createElement('div');
          var nameContent = document.createElement('div');
          var name = document.createElement('div');
          var gameContent = document.createElement('div');
          var game = document.createElement('div');
          var infoContent = document.createElement('div');
          var playerName = document.createElement('div');
          var gameInfo = document.createElement('div');
          var gameNote = document.createElement('div');
          var blindContent = document.createElement('div');
          var amount = document.createElement('div');
          var inputBox = document.createElement('div');
          var label = document.createElement('p');
          var input = document.createElement('input');
          var btnContent = document.createElement('div');
          var btn = document.createElement('button');

          $(col).addClass('four wide column').appendTo('#game-grid');
          $(card).addClass('ui card').appendTo(col);
          $(nameContent).addClass('content').appendTo(card);
          var idName = key + '-name';
          $(name).addClass('center aligned header').attr('id', idName).text(key).appendTo(nameContent);
          $(gameContent).addClass('content').appendTo(card);
          $(game).addClass('center aligned description').text("No Limit Texas Hold'em").appendTo(gameContent);
          $(infoContent).addClass('content').appendTo(card);
          $(playerName).addClass('description').text('Player: ' + data.tables[key].first.player).appendTo(infoContent);
          $(gameInfo).addClass('description').text('Blinds: ' + Number(data.tables[key].bb) / 2 + ' / ' + data.tables[key].bb).appendTo(infoContent);
          $(gameNote).addClass('description').text('Minimum: ' + Number(data.tables[key].bb) * 40 + ' / Maximum: ' + Number(data.tables[key].bb) * 150).appendTo(infoContent);
          $(blindContent).addClass('content').appendTo(card);
          $(amount).addClass('center aligned description').appendTo(blindContent);
          $(label).text('Enter your buy-in amount').appendTo(amount);
          $(inputBox).addClass('ui fluid input').appendTo(amount);
          var idValue = key + '-val';
          $(input).attr({type: 'number', 'data-bb': data.tables[key].bb, id: idValue}).appendTo(inputBox);
          $(btnContent).addClass('extra content').appendTo(card);
          switch(data.tables[key].status) {
            case 'waiting':
              var text = 'Join table';
              $(btn).addClass('ui fluid button').text(text).attr('id',key).appendTo(btnContent);
              break;
          }
        }
        else {
          $('#table-name').text(key);
          var info = 'Blinds: ' + Number(data.tables[key].bb) / 2 + ' / ' + data.tables[key].bb + ' -  Stack: ' + data.tables[key].first.stack;
          $('#table-info').text(info);
          $('#create-card').addClass('hide');
          $('#remove-card').removeClass('hide');
        }
      }
    }
  }
})();
//sign up event listener
$('#signup').submit(function(event) {
  event.preventDefault();
  var payload = JSON.stringify({
    username: $('#new-user').val(),
    pwd: $('#new-pwd').val()
  })

  var xhr = new XMLHttpRequest();

  xhr.open('POST', '/signup');
  xhr.setRequestHeader('Content-type', 'application/json');
  xhr.send(payload);

  xhr.onload = function() {
    if (xhr.status === 200) {
      var data = JSON.parse(xhr.response);
      $('#signup-form').addClass('hide');
      $('#login-user').val(data.name);
      $('#login-pwd').val(data.pwd);
      $('#login').submit();
    }
  }
  document.getElementById('signup').reset();
});
//sign up link from login page
$('#signup-link').click(function() {
  $('#login-form').addClass('hide');
  $('#signup-form').removeClass('hide');
});
//logout event listener
$('#logout').click(function() {
  var xhr = new XMLHttpRequest();

  xhr.open('GET', '/logout');
  xhr.send();

  xhr.onload = function() {
    $('#show-login').removeClass('hide');
    $('#show-signup').removeClass('hide');
    $('#logout').addClass('hide');
    $('#user-status').addClass('hide');
    $('#main').addClass('hide');
    $('#remove').click();
  }
});
//event listener for choosing a username
$('#new-user').keyup(function() {
  if ($('#new-user').val().length >= 3) {
    var xhr = new XMLHttpRequest();
    var str = '/checkuser/' + $('#new-user').val();

    xhr.open('GET', str);
    xhr.send();

    xhr.onload = function() {
      if (xhr.status === 200) {
        $('#user-input').removeClass('remove').addClass('check').css('color','green');
        $('#signup-message p:first').addClass('hide');
      }
      else {
        $('#user-input').removeClass('check').addClass('remove').css('color','red');
        $('#signup-message p:first').removeClass('hide').text('Username already exists');
      }
    }
  }
  else {
    $('#user-input').removeClass('check').addClass('remove').css('color','red');
    $('#signup-message p:first').removeClass('hide').text('Your username must be at least 3 characters');
  }
});
//event listener for setting a password
$('#new-pwd').keyup(function() {
  if ($('#new-pwd').val().length >= 3) {
    $('#pwd-input').removeClass('remove').addClass('check').css('color','green');
    $('#signup-message p:last').addClass('hide');
  }
  else {
    $('#pwd-input').removeClass('check').addClass('remove').css('color','red');
    $('#signup-message p:last').removeClass('hide');
  }
});
//event listener for updating user info
$('#info').click(function(event) {
  switch(event.target.id) {
    case 'edit-first':
      $('#dash-first h5').addClass('hide');
      $('#edit-first').addClass('hide');
      $('#dash-first div').removeClass('hide');
      $('#dash-first button').removeClass('hide');
      break;
    case 'edit-last':
      $('#dash-last h5').addClass('hide');
      $('#edit-last').addClass('hide');
      $('#dash-last div').removeClass('hide');
      $('#dash-last button').removeClass('hide');
      break;
    case 'edit-loc':
      $('#dash-loc h5').addClass('hide');
      $('#edit-loc').addClass('hide');
      $('#dash-loc div').removeClass('hide');
      $('#dash-loc button').removeClass('hide');
      break;
    case 'close-first':
      $('#dash-first h5').removeClass('hide');
      $('#edit-first').removeClass('hide');
      $('#dash-first div').addClass('hide');
      $('#dash-first button').addClass('hide');
      break;
    case 'close-last':
      $('#dash-last h5').removeClass('hide');
      $('#edit-last').removeClass('hide');
      $('#dash-last div').addClass('hide');
      $('#dash-last button').addClass('hide');
      break;
    case 'close-loc':
      $('#dash-loc h5').removeClass('hide');
      $('#edit-loc').removeClass('hide');
      $('#dash-loc div').addClass('hide');
      $('#dash-loc button').addClass('hide');
      break;
  }
});
//Event listeners for updating user info
$('#input-first').keypress(function(event) {
  if (event.charCode === 13) {
    var path = '/update/' + username;
    var payload = JSON.stringify({
      firstname: $('#input-first').val()
    });

    var xhr = new XMLHttpRequest();

    xhr.open('POST', path);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.send(payload);

    xhr.onload = function() {
      if (xhr.status === 200) {
        $('#dash-first h5').text($('#input-first').val() + " ");
        $('#input-first').val('');
        $('#dash-first h5').removeClass('hide');
        $('#edit-first').removeClass('hide');
        $('#dash-first div').addClass('hide');
        $('#dash-first button').addClass('hide');
      }
    }
  }
});

$('#input-last').keypress(function(event) {
  if (event.charCode === 13) {
    var path = '/update/' + username;
    var payload = JSON.stringify({
      lastname: $('#input-last').val()
    });

    var xhr = new XMLHttpRequest();

    xhr.open('POST', path);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.send(payload);

    xhr.onload = function() {
      if (xhr.status === 200) {
        $('#dash-last h5').text($('#input-last').val() + " ");
        $('#input-last').val('');
        $('#dash-last h5').removeClass('hide');
        $('#edit-last').removeClass('hide');
        $('#dash-last div').addClass('hide');
        $('#dash-last button').addClass('hide');
      }
    }
  }
});

$('#input-loc').keypress(function(event) {
  if (event.charCode === 13) {
    var path = '/update/' + $('#dash-user h5').text().trim();
    var payload = JSON.stringify({
      location: $('#input-loc').val()
    });

    var xhr = new XMLHttpRequest();

    xhr.open('POST', path);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.send(payload);

    xhr.onload = function() {
      if (xhr.status === 200) {
        $('#dash-loc h5').text($('#input-loc').val() + " ");
        $('#input-loc').val('');
        $('#dash-loc h5').removeClass('hide');
        $('#edit-loc').removeClass('hide');
        $('#dash-loc div').addClass('hide');
        $('#dash-loc button').addClass('hide');
      }
    }
  }
});
//Event for balance reset
$('#reset-bal').click(function() {
  if (confirm('Are you sure?')) {
    var path = '/update/' + username;
    var payload = JSON.stringify({
      bankroll: 500
    });

    var xhr = new XMLHttpRequest();

    xhr.open('POST', path);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.send(payload);

    xhr.onload = function() {
      if (xhr.status === 200) {
        var message = $('#user-status p').text();
        var oldBalance = $('#dash-balance h5').text().trim();
        var updateMsg = message.replace(oldBalance, '500');
        $('#user-status p').text(updateMsg);
        $('#dash-balance h5').text('500 ');
      }
    }
  }
});
//Event for menu selection
$('#player-menu').click(function(event) {
  $('#player-menu .active').removeClass('active');
  event.target.classList.add('active');
  switch(event.target.textContent) {
    case 'Home':
      $('#info').removeClass('hide');
      $('#new-table').addClass('hide');
      $('#join-table').addClass('hide');
      $('#active-game').addClass('hide');
      break;
    case 'Your table':
      $('#info').addClass('hide');
      $('#new-table').removeClass('hide');
      $('#join-table').addClass('hide');
      $('#active-game').addClass('hide');
      break;
    case 'Join table':
      $('#info').addClass('hide');
      $('#new-table').addClass('hide');
      $('#join-table').removeClass('hide');
      $('#active-game').addClass('hide');
      break;
    case 'Active game':
      $('#active-game').removeClass('hide');
      $('#new-table').addClass('hide');
      $('#join-table').addClass('hide');
      $('#info').addClass('hide');
      break;
    case 'Past sessions':
      break;
  }
});
//Event of blinds selection
$("input[name='blinds']").change(function(event) {
  $('#start-buyin').attr('data-bb', event.target.getAttribute('data-bb')).val(Number(event.target.getAttribute('data-bb') * 40));
});
//Events for plus / minus buttons
$('#start-plus').click(function() {
  var bb = Number($('#start-buyin').attr('data-bb'));
  var value = Number($('#start-buyin').val().trim()) + Number(bb);
  if (value > bb * 150) {
    $('#start-buyin').val(bb * 150);
  }
  else {
    $('#start-buyin').val(value);
  }
});

$('#start-minus').click(function() {
  var bb = Number($('#start-buyin').attr('data-bb'));
  var value = Number($('#start-buyin').val().trim()) - bb;
  if (value < bb * 40) {
    $('#start-buyin').val(bb * 40);
  }
  else {
    $('#start-buyin').val(value);
  }
});
//Event for table creation
$('#create').click(function() {
  var bb = Number($('#start-buyin').attr('data-bb'));
  var buyin = Number($('#start-buyin').val());
  var balance = Number($('#dash-balance').text().trim());
  if (buyin > bb * 150) {
    alert("You can't buy in for more than " + bb * 150);
    $('#start-buyin').val(bb * 150);
    return;
  }

  if (buyin > balance) {
    alert("You don't have the available balance");
    $('#start-buyin').val(balance);
    return;
  }

  var data = {
    player: username,
    bb: $('#start-buyin').attr('data-bb'),
    buyin: $('#start-buyin').val()
  };
  socket.emit('create table', data);
});
//Receiving created table from the server
socket.on('my table', function(data) {
  switch(data.status) {
    case 'create':
      $('#table-name').text(data.name);
      var info = 'Blinds: ' + Number(data.bb) / 2 + ' / ' + data.bb + '.  Stack: ' + data.stack + '.';
      $('#table-info').text(info);
      $('#create-card').addClass('hide');
      $('#remove-card').removeClass('hide');
      break;
    case 'remove':
      $('#remove-card').addClass('hide');
      $('#create-card').removeClass('hide');
      break;
  }
});
//Event for table removal
$('#remove').click(function() {
  var data = {
    table: $('#table-name').text()
  }
  socket.emit('remove table', data);
});
//Populating existing tables
socket.on('post tables', function(data) {
  $('#game-grid div').remove();
  for (key in data) {
    if (data[key].first.player != $('#dash-user').text().trim()) {
      var col = document.createElement('div');
      var card = document.createElement('div');
      var nameContent = document.createElement('div');
      var name = document.createElement('div');
      var gameContent = document.createElement('div');
      var game = document.createElement('div');
      var infoContent = document.createElement('div');
      var playerName = document.createElement('div');
      var gameInfo = document.createElement('div');
      var gameNote = document.createElement('div');
      var blindContent = document.createElement('div');
      var amount = document.createElement('div');
      var inputBox = document.createElement('div');
      var label = document.createElement('p');
      var input = document.createElement('input');
      var btnContent = document.createElement('div');
      var btn = document.createElement('button');

      $(col).addClass('four wide column').appendTo('#game-grid');
      $(card).addClass('ui card').appendTo(col);
      $(nameContent).addClass('content').appendTo(card);
      var idName = key + '-name';
      $(name).addClass('center aligned header').attr('id', idName).text(key).appendTo(nameContent);
      $(gameContent).addClass('content').appendTo(card);
      $(game).addClass('center aligned description').text("No Limit Texas Hold'em").appendTo(gameContent);
      $(infoContent).addClass('content').appendTo(card);
      $(playerName).addClass('description').text('Player: ' + data[key].first.player).appendTo(infoContent);
      $(gameInfo).addClass('description').text('Blinds: ' + Number(data[key].bb) / 2 + ' / ' + data[key].bb).appendTo(infoContent);
      $(gameNote).addClass('description').text('Minimum: ' + Number(data[key].bb) * 40 + ' / Maximum: ' + Number(data[key].bb) * 150).appendTo(infoContent);
      $(blindContent).addClass('content').appendTo(card);
      $(amount).addClass('center aligned description').appendTo(blindContent);
      $(label).text('Enter your buy-in amount').appendTo(amount);
      $(inputBox).addClass('ui fluid input').appendTo(amount);
      var idValue = key + '-val';
      $(input).attr({type: 'number', 'data-bb': data[key].bb, id: idValue}).appendTo(inputBox);
      $(btnContent).addClass('extra content').appendTo(card);
      switch(data[key].status) {
        case 'waiting':
          var text = 'Join table';
          $(btn).addClass('ui fluid button').text(text).attr('id',key).appendTo(btnContent);
          break;
      }
    }
  }
});
//Event joining table
$('#game-grid').click(function(event) {
  var nameSelector = '#' + event.target.id + '-name';
  if (event.target.id === $(nameSelector).text() && event.target.id != "") {
    var valueSelector = '#' + event.target.id + '-val';
    var bb = Number($(valueSelector).attr('data-bb'));
    if ($(valueSelector).val() < 40 * bb) {
      alert('Minimum buy-in is ' + 40 * bb);
      return;
    }
    else if ($(valueSelector).val() > 150 * bb) {
      alert('Maximum buy-in is ' + 150 * bb);
      return;
    }
    else if ($(valueSelector).val() > Number($('#dash-balance').text().trim())) {
      alert("You don't have sufficient funds");
      return;
    }
    var payload = {
      table: event.target.id,
      player: $('#dash-user').text().trim(),
      buyin: $(valueSelector).val()
    }
    socket.emit('join table', payload)
  }
});
//Starting game socket emitter
var promise = new Promise(function(resolve, reject) {
  var xhr = new XMLHttpRequest();

  xhr.open('GET', '/username');
  xhr.send();

  xhr.onload = function() {
    resolve(xhr.responseText);
  }
});
promise.then(function(value) {
  username = value;
  socket.on(username, function(data) {
    if (data.status === 'ready') {
      $('#player p:first').text(username);
      $('#player p:last').text(data.stack);
      $('#opponent p:first').text(data.opp.name);
      $('#opponent p:last').text(data.opp.stack);
      if (!data.dealer) {
        $('#dealer').css('left','700px');
        $('#up').text('Post SB').removeClass('hide');
      }
      else {
        $('#up').text('Post BB').removeClass('hide');
      }
    }
  });
});
