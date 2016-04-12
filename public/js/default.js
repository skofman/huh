var socket = io.connect();

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
  });

  var xhr = new XMLHttpRequest();

  xhr.open('POST', '/login');
  xhr.setRequestHeader('Content-type', 'application/json');
  xhr.send(payload);

  xhr.onload = function() {
    if (xhr.status === 200) {
      showState();
    }
    else {
      $('#login-message p').text(xhr.responseText);
      $('#login-message').removeClass('hide');
    }
  }
  document.getElementById('login').reset();
});
//check if user was logged in
function showState() {
  var xhr = new XMLHttpRequest();

  xhr.open('GET', '/check');
  xhr.send();

  xhr.onload = function() {
    if (xhr.status === 200) {
      //Login successfull
      var data = JSON.parse(xhr.response);
      //Leaving an existing table
      if (data.table.status === 'ready') {
        var payload = {
          table: data.table.name,
          player: data.username,
          action: 'leave'
        }
        $('#table').attr('data-table',"");
        socket.emit('play', payload);
        clearTable();
      }
      $('body').css('background-image', 'url()').css('background-color', '#797979');
      $('#play').addClass('hide');
      //Updating dashboard
      $('#dash-user h5').text(data.username + ' ');
      $('#dash-avatar img').attr('src', data.avatar);
      $('#dash-balance h5').text(data.balance + ' ');
      $('#dash-first h5').text(data.firstname + ' ');
      $('#dash-last h5').text(data.lastname + ' ');
      $('#dash-loc h5').text(data.location + ' ');
      //Updating deck
      $('#player-card1').attr('src', data.deck);
      $('#player-card2').attr('src', data.deck);
      $('#opp-card1').attr('src', data.deck);
      $('#opp-card2').attr('src', data.deck);
      $('#com-card1').attr('src', data.deck);
      $('#com-card2').attr('src', data.deck);
      $('#com-card3').attr('src', data.deck);
      $('#com-card4').attr('src', data.deck);
      $('#com-card5').attr('src', data.deck);
      //Updating table
      if (data.table.status === 'waiting') {
        $('#table-name').text(data.table.name);
        $('#table-info').text('Blinds: ' + (data.table.bb / 2) + ' / ' + data.table.bb + ' - Stack: ' + data.table.stack);
        $('#remove-card').removeClass('hide');
        $('#create-card').addClass('hide');
      }
      //Showing menu
      $('#user-status').removeClass('hide');
      $('#show-login').addClass('hide');
      $('#show-signup').addClass('hide');
      $('#logout').removeClass('hide');
      $('#user-status img').attr('src', data.avatar);
      $('#user-status p').text(' Welcome ' + data.username + '! Balance: ' + data.balance);
      $('#login-form').addClass('hide');
      $('#signup-form').addClass('hide');
      $('#main').removeClass('hide');
      socket.on(data.username, function(data) {
        switch(data.action) {
          case 'setup':
            $('#table').removeClass('hide');
            $('#table').attr('data-bb', data.bb);
            $('#table').attr('data-table', data.table);
            $('#table').attr('data-deck', data.deck);
            $('#player p:first').text(data.username);
            $('#player p:last').text(data.stack);
            $('#player img').attr('src', $('#dash-avatar img').attr('src'));
            $('#opponent p:first').text(data.opp.name);
            $('#opponent p:last').text(data.opp.stack);
            $('#opponent img').attr('src', data.opp.avatar);
            $('#table-session').text('Table: ' + data.table + ' - Blinds: ' + (Number(data.bb) / 2) + ' / ' + data.bb + " - No Limit Hold'em - Hand: " + data.hand);
            if (data.dealer) {
              $('#up').text('Post SB').removeClass('hide');
              $('#dealer').css('left', '180px');
              $('#player-menu .active').removeClass('active');
              $('#player-menu a:nth-child(4)').addClass('active');
              $('#remove-card').addClass('hide');
              $('#game-grid div').remove();
              $('#active-game').removeClass('hide');
              $('#new-table').addClass('hide');
              $('#join-table').addClass('hide');
              $('#info').addClass('hide');
              $('#sessions').addClass('hide');
              $('#create-card').addClass('hide');
            }
            else {
              $('#up').text('Post BB').removeClass('hide');
              $('#dealer').css('left', '700px');
            }
            socket.on(data.table, function(data) {
              var item = document.createElement('li');
              if (data.message.split(' ')[0] === 'Dealer:') {
                $(item).addClass('dealer-post');
              }
              $(item).addClass('post').text(data.message).appendTo('#messages');
              $('#chatArea').scrollTop($('#messages').height());
            });
            break;
          case 'update opp':
            $('#opponent p:last').text(data.stack);
            placeOppBet(data.bet);
            if (data.stack === 0) {
              var pstack = Number($('#player p:last').text());
              var pbet = Number($('#player-bet').text());
              pstack += (pbet - data.bet);
              $('#player p:last').text(pstack);
              $('#player-bet').text(data.bet);
            }
            break;
          case 'deal':
            if (data.dealer) {
              $('#opp-card1').removeClass('hide');
              $('#opp-card2').removeClass('hide');
              $('#player-card1').removeClass('hide');
              $('#player-card2').removeClass('hide');
              $('#opp-card1').animate({
                top: '200px',
                left: '730px'
              }, 'slow', function() {
                $('#player-card1').animate({
                  top: '200px',
                  left: '30px'
                }, 'slow', function() {
                  var card = '/images/cards/' + data.hand[0] + '.png';
                  $('#player-card1').attr('src', card);
                  $('#opp-card2').animate({
                    top: '200px',
                    left: '800px'
                  }, 'slow', function() {
                    $('#player-card2').animate({
                      top: '200px',
                      left: '100px'
                    }, 'slow', function() {
                      var card = '/images/cards/' + data.hand[1] + '.png';
                      $('#player-card2').attr('src', card);
                      $('#down').removeClass('hide');
                      $('#even').text('Call ' + (data.bb / 2)).removeClass('hide');
                      $('#up').text('Raise to ' + (data.bb * 2)).removeClass('hide');
                      $('#bet-selector').removeClass('hide');
                    })
                  })
                })
              })
            }
            else {
              $('#opp-card1').removeClass('hide');
              $('#opp-card2').removeClass('hide');
              $('#player-card1').removeClass('hide');
              $('#player-card2').removeClass('hide');
              $('#player-card1').animate({
                top: '200px',
                left: '30px'
              }, 'slow', function() {
                var card = '/images/cards/' + data.hand[0] + '.png';
                $('#player-card1').attr('src', card);
                $('#opp-card1').animate({
                  top: '200px',
                  left: '730px'
                }, 'slow', function() {
                  $('#player-card2').animate({
                    top: '200px',
                    left: '100px'
                  }, 'slow', function() {
                    var card = '/images/cards/' + data.hand[1] + '.png';
                    $('#player-card2').attr('src', card);
                    $('#opp-card2').animate({
                      top: '200px',
                      left: '800px'
                    }, 'slow')
                  })
                })
              })
            }
            break;
          case 'opp fold':
            $('#player p:last').text(data.stack);
            $('#player-bet').text('0').addClass('hide');
            $('#opp-bet').text('0').addClass('hide');
            $('#pchips').animate({
              left: '247px'
            }, 1000, function() {
              $('#pchips .chip').addClass('hide');
              $('#pchips').css('left', '0px');
            })
            $('#oppchips').animate({
              left: '-247px'
            }, 1000, function() {
              $('#oppchips .chip').addClass('hide');
              $('#oppchips').css('left', '0px');
              placePot(data.pot);
              $('#pot h5').text('0').addClass('hide');
              $('#potchips').animate({
                left: '-300px'
              }, 1000, function() {
                $('#potchips .chip').addClass('hide');
                $('#potchips').css('left', 0);
              })
            })
            var deck = $('#table').attr('data-deck');
            $('#com-card1').css({top: '20px', left: '405px'}).attr('src',deck).addClass('hide');
            $('#com-card2').css({top: '20px', left: '405px'}).attr('src',deck).addClass('hide');
            $('#com-card3').css({top: '20px', left: '405px'}).attr('src',deck).addClass('hide');
            $('#com-card4').css({top: '20px', left: '405px'}).attr('src',deck).addClass('hide');
            $('#com-card5').css({top: '20px', left: '405px'}).attr('src',deck).addClass('hide');
            $('#player-card1').css({top: '20px', left: '405px'}).attr('src',deck).addClass('hide');
            $('#player-card2').css({top: '20px', left: '405px'}).attr('src',deck).addClass('hide');
            $('#opp-card1').css({top: '20px', left: '405px'}).addClass('hide');
            $('#opp-card2').css({top: '20px', left: '405px'}).addClass('hide');
            var dealer = $('#dealer').css('left');
            if (dealer === '180px') {
              $('#dealer').animate({
                left: '700px'
              }, 'slow');
            }
            else {
              $('#dealer').animate({
                left: '180px'
              }, 'slow');
            }
            break;
          case 'call pre':
            $('#opponent p:last').text(data.stack);
            placeOppBet(data.bb);
            $('#down').removeClass('hide');
            $('#even').text('Check').removeClass('hide');
            $('#up').text('Raise to ' + (2 * data.bb)).removeClass('hide');
            $('#bet-selector').removeClass('hide');
            break;
          case 'raised':
            $('#opponent p:last').text(data.stack);
            placeOppBet(data.raise);
            $('#down').removeClass('hide');
            var raise = data.raise + data.bb;
            $('#up').text('Raise to ' + raise).removeClass('hide');
            $('#bet-selector').removeClass('hide');
            var call = data.raise - Number($('#player-bet').text());
            var max = Number($('#player p:last').text());
            if (call > max) {
              call = max;
              $('#up').addClass('hide');
              $('#bet-selector').addClass('hide');
              $('#bet-input').val('');
            }
            if (data.stack === 0) {
              $('#up').addClass('hide');
              $('#bet-selector').addClass('hide');
              $('#bet-input').val('');
            }
            $('#even').text('Call ' + call).removeClass('hide');
            break;
          case 'deal flop':
            $('#player-bet').text('0').addClass('hide');
            $('#opp-bet').text('0').addClass('hide');
            $('#even').attr('data-check','open');
            $('#pchips').animate({
              left: '247px'
            }, 1000, function() {
              $('#pchips .chip').addClass('hide');
              $('#pchips').css('left', '0px');
            });
            $('#oppchips').animate({
              left: '-247px'
            }, 1000, function() {
              $('#oppchips .chip').addClass('hide');
              $('#oppchips').css('left', '0px');
              placePot(data.pot);
              $('#com-card1').removeClass('hide');
              $('#com-card2').removeClass('hide');
              $('#com-card3').removeClass('hide');
              $('#com-card1').animate({
                top: '185px',
                left: '265px'
              }, 'slow', function() {
                $('#com-card2').animate({
                  top: '185px',
                  left: '335px'
                }, 'slow', function() {
                  $('#com-card3').animate({
                    top: '185px',
                    left: '405px'
                  }, 'slow', function() {
                    var card1 = 'images/cards/' + data.cards[0] + '.png';
                    $('#com-card1').attr('src', card1);
                    var card2 = 'images/cards/' + data.cards[1] + '.png';
                    $('#com-card2').attr('src', card2);
                    var card3 = 'images/cards/' + data.cards[2] + '.png';
                    $('#com-card3').attr('src', card3);
                    if (!data.dealer) {
                      $('#down').removeClass('hide');
                      $('#even').text('Check').removeClass('hide');
                      $('#up').text('Bet ' + data.bb).removeClass('hide');
                      $('#bet-selector').removeClass('hide');
                    }
                  })
                })
              });
            });
            break;
          case 'open bet':
            $('#opponent p:last').text(data.stack);
            placeOppBet(data.bet);
            $('#down').removeClass('hide');
            $('#up').text('Raise to ' + (data.bet + data.bb)).removeClass('hide');
            $('#bet-selector').removeClass('hide');
            var call = data.bet;
            var max = Number($('#player p:last').text());
            if (call > max) {
              call = max;
              $('#up').addClass('hide');
              $('#bet-selector').addClass('hide');
              $('#bet-input').val('');
            }
            if (data.stack === 0) {
              $('#up').addClass('hide');
              $('#bet-selector').addClass('hide');
              $('#bet-input').val('');
            }
            if (data.stack === 0) {
              $('#up').addClass('hide');
            }
            $('#even').text('Call ' + call).removeClass('hide');

            break;
          case 'checked':
            $('#down').removeClass('hide');
            $('#even').attr('data-check','close').text('Check').removeClass('hide');
            $('#up').text('Bet ' + data.bb).removeClass('hide');
            $('#bet-selector').removeClass('hide');
            break;
          case 'deal turn':
            $('#player-bet').text('0').addClass('hide');
            $('#opp-bet').text('0').addClass('hide');
            $('#even').attr('data-check','open');
            $('#pchips').animate({
              left: '247px'
            }, 1000, function() {
              $('#pchips .chip').addClass('hide');
              $('#pchips').css('left', '0px');
            });
            $('#oppchips').animate({
              left: '-247px'
            }, 1000, function() {
              $('#oppchips .chip').addClass('hide');
              $('#oppchips').css('left', '0px');
              placePot(data.pot);
              $('#com-card4').removeClass('hide');
              $('#com-card4').animate({
                top: '185px',
                left: '475px'
              }, 'slow', function() {
                var card = 'images/cards/' + data.cards[3] + '.png';
                $('#com-card4').attr('src', card);
                if (!data.dealer) {
                  $('#down').removeClass('hide');
                  $('#even').text('Check').removeClass('hide');
                  $('#up').text('Bet ' + data.bb).removeClass('hide');
                  $('#bet-selector').removeClass('hide');
                }
              })
            });
            break;
          case 'deal river':
            $('#player-bet').text('0').addClass('hide');
            $('#opp-bet').text('0').addClass('hide');
            $('#even').attr('data-check','open');
            $('#pchips').animate({
              left: '247px'
            }, 1000, function() {
              $('#pchips .chip').addClass('hide');
              $('#pchips').css('left', '0px');
            });
            $('#oppchips').animate({
              left: '-247px'
            }, 1000, function() {
              $('#oppchips .chip').addClass('hide');
              $('#oppchips').css('left', '0px');
              placePot(data.pot);
              $('#com-card5').removeClass('hide');
              $('#com-card5').animate({
                top: '185px',
                left: '545px'
              }, 'slow', function() {
                var card = 'images/cards/' + data.cards[4] + '.png';
                $('#com-card5').attr('src', card);
                if (!data.dealer) {
                  $('#down').removeClass('hide');
                  $('#even').text('Check').removeClass('hide');
                  $('#up').text('Bet ' + data.bb).removeClass('hide');
                  $('#bet-selector').removeClass('hide');
                }
              })
            })
            break;
          case 'new hand':
            if (data.winner) {
              if (data.stage === 'showdown') {
                $('#opp-card1').attr('src','images/cards/' + data.hand[0] + '.png');
                $('#opp-card2').attr('src','images/cards/' + data.hand[1] + '.png');
                $('#player-bet').text('0').addClass('hide');
                $('#opp-bet').text('0').addClass('hide');
                $('#even').attr('data-check','open');
                $('#pchips').animate({
                  left: '247px'
                }, 1000, function() {
                  $('#pchips .chip').addClass('hide');
                  $('#pchips').css('left', '0px');
                });
                $('#oppchips').animate({
                  left: '-247px'
                }, 1000, function() {
                  $('#oppchips .chip').addClass('hide');
                  $('#oppchips').css('left', '0px');
                  placePot(data.pot);
                  if (data.winner === $('#player p:first').text()) {
                    $('#pot h5').text('0').addClass('hide');
                    $('#potchips').animate({
                      left: '-300px'
                    }, 1000, function() {
                      $('#potchips .chip').addClass('hide');
                      $('#potchips').css('left', '0px');
                    })
                  }
                  else if (data.winner === 'tie') {
                    var pot = Number($('#pot h5').text());
                    $('#pot h5').text('0').addClass('hide');
                    $('#potchips .chip').addClass('hide');
                    $('#potchips').css('left', '0px');
                    $('#pchips').css('left', '247px');
                    $('#oppchips').css('left', '-247px');
                    placePlayerBet(pot / 2);
                    placeOppBet(pot / 2);
                    $('#player-bet').addClass('hide');
                    $('#opp-bet').addClass('hide');
                    $('#pchips').animate({
                      left: '0px'
                    }, 1000, function() {
                      $('#pchips .chip').addClass('hide');
                    });
                    $('#oppchips').animate({
                      left: '0px'
                    }, 1000, function() {
                      $('#oppchips .chip').addClass('hide');
                    });
                  }
                  else {
                    $('#pot h5').text('0').addClass('hide');
                    $('#potchips').animate({
                      left: '350px'
                    }, 1000, function() {
                      $('#potchips .chip').addClass('hide');
                      $('#potchips').css('left', '0px');
                    })
                  }
                })
              }
              else {
                $('#opp-card1').attr('src','images/cards/' + data.hand[0] + '.png');
                $('#opp-card2').attr('src','images/cards/' + data.hand[1] + '.png');
                if (data.winner === $('#player p:first').text()) {
                  $('#pot h5').text('0').addClass('hide');
                  $('#potchips').animate({
                    left: '-300px'
                  }, 1000, function() {
                    $('#potchips .chip').addClass('hide');
                    $('#potchips').css('left', '0px');
                  })
                }
                else if (data.winner === 'tie') {
                  var pot = Number($('#pot h5').text());
                  $('#pot h5').text('0').addClass('hide');
                  $('#potchips .chip').addClass('hide');
                  $('#potchips').css('left', '0px');
                  $('#pchips').css('left', '247px');
                  $('#oppchips').css('left', '-247px');
                  placePlayerBet(pot / 2);
                  placeOppBet(pot / 2);
                  $('#player-bet').addClass('hide');
                  $('#opp-bet').addClass('hide');
                  $('#pchips').animate({
                    left: '0px'
                  }, 1000, function() {
                    $('#pchips .chip').addClass('hide');
                  });
                  $('#oppchips').animate({
                    left: '0px'
                  }, 1000, function() {
                    $('#oppchips .chip').addClass('hide');
                  });
                }
                else {
                  $('#pot h5').text('0').addClass('hide');
                  $('#potchips').animate({
                    left: '350px'
                  }, 1000, function() {
                    $('#potchips .chip').addClass('hide');
                    $('#potchips').css('left', '0px');
                  })
                }
              }
            }
            $('#player p:last').text(data.stack);
            $('#opponent p:last').text(data.oppstack);
            $('#even').attr('data-check','close');
            $('#player-bet').text('0');
            $('#opp-bet').text('0');
            var stack = Number($('#player p:last').text());
            var bb = Number($('#table').attr('data-bb'));
            if (stack <= bb) {
              $('#rebuy').modal('show');
            }
            setTimeout(function() {
              deck = $('#table').attr('data-deck');
              $('#player-card1').css({top: '20px', left: '405px'}).attr('src',deck).addClass('hide');
              $('#player-card2').css({top: '20px', left: '400px'}).attr('src',deck).addClass('hide');
              $('#opp-card1').css({top: '20px', left: '405px'}).attr('src',deck).addClass('hide');
              $('#opp-card2').css({top: '20px', left: '405px'}).attr('src',deck).addClass('hide');
              $('#com-card1').css({top: '20px', left: '405px'}).attr('src',deck).addClass('hide');
              $('#com-card2').css({top: '20px', left: '405px'}).attr('src',deck).addClass('hide');
              $('#com-card3').css({top: '20px', left: '405px'}).attr('src',deck).addClass('hide');
              $('#com-card4').css({top: '20px', left: '405px'}).attr('src',deck).addClass('hide');
              $('#com-card5').css({top: '20px', left: '405px'}).attr('src',deck).addClass('hide');
              var message = $('#table-session').text().split(' ');
              message[message.length - 1] = Number(message[message.length - 1]) + 1;
              $('#table-session').text(message.join(' '));
              if (data.dealer) {
                $('#dealer').animate({
                  left: '180px'
                }, 'slow');
                if ($('#auto-blind input').attr('checked')) {
                  setTimeout(function() {
                    $('#up').text('Post SB').click();
                  }, 456);

                }
                else {
                  $('#up').text('Post SB').removeClass('hide');
                }
              }
              else {
                $('#dealer').animate({
                  left: '700px'
                }, 'slow');
                if ($('#auto-blind input').attr('checked')) {
                  setTimeout(function() {
                    $('#up').text('Post BB').click();
                  }, 666);
                }
                else {
                  $('#up').text('Post BB').removeClass('hide');
                }
              }
            },5000);
            break;
          case 'player left':
            if (data.opponent) {
              $('#alert h3').text(data.opponent + ' has left the table!');
              $('#alert').modal('show');
            }
            $('#dash-balance h5').text(data.balance + " ");
            $('#user-status p').text(' Welcome ' + $('#dash-user h5').text().trim() + '! Balance: ' + data.balance);
            $('#table').addClass('hide');
            clearTable();
            $('#table').attr('data-table', '');
            $('#create-card').removeClass('hide');
            break;
          case 'deal rest':
            $('#player-bet').text('0').addClass('hide');
            $('#opp-bet').text('0').addClass('hide');
            $('#even').attr('data-check','open');

            $('#pchips').animate({
              left: '247px'
            }, 1000, function() {
              $('#pchips .chip').addClass('hide');
              $('#pchips').css('left', '0px');
            });
            $('#oppchips').animate({
              left: '-247px'
            }, 1000, function() {
              $('#oppchips .chip').addClass('hide');
              $('#oppchips').css('left', '0px');
              placePot(data.pot);
              switch(data.stage) {
                case 'pre':
                  $('#com-card1').removeClass('hide');
                  $('#com-card2').removeClass('hide');
                  $('#com-card3').removeClass('hide');
                  $('#com-card4').removeClass('hide');
                  $('#com-card5').removeClass('hide');
                  $('#com-card1').animate({
                    top: '185px',
                    left: '265px'
                  }, 'slow', function() {
                    $('#com-card2').animate({
                      top: '185px',
                      left: '335px'
                    }, 'slow', function() {
                      $('#com-card3').animate({
                        top: '185px',
                        left: '405px'
                      }, 'slow', function() {
                        var card1 = 'images/cards/' + data.cards[0] + '.png';
                        $('#com-card1').attr('src', card1);
                        var card2 = 'images/cards/' + data.cards[1] + '.png';
                        $('#com-card2').attr('src', card2);
                        var card3 = 'images/cards/' + data.cards[2] + '.png';
                        $('#com-card3').attr('src', card3);
                        $('#com-card4').animate({
                          top: '185px',
                          left: '475px'
                        }, 'slow', function() {
                          var card4 = 'images/cards/' + data.cards[3] + '.png';
                          $('#com-card4').attr('src', card4);
                          $('#com-card5').animate({
                            top: '185px',
                            left: '545px'
                          }, 'slow', function() {
                            var card5 = 'images/cards/' + data.cards[4] + '.png';
                            $('#com-card5').attr('src', card5);
                          })
                        })
                      })
                    })
                  });
                  break;
                case 'flop':
                  $('#com-card4').removeClass('hide');
                  $('#com-card5').removeClass('hide');
                  $('#com-card4').animate({
                    top: '185px',
                    left: '475px'
                  }, 'slow', function() {
                    var card4 = 'images/cards/' + data.cards[3] + '.png';
                    $('#com-card4').attr('src', card4);
                    $('#com-card5').animate({
                      top: '185px',
                      left: '545px'
                    }, 'slow', function() {
                      var card5 = 'images/cards/' + data.cards[4] + '.png';
                      $('#com-card5').attr('src', card5);
                    })
                  });
                  break;
                case 'turn':
                  $('#com-card5').removeClass('hide');
                  $('#com-card5').animate({
                    top: '185px',
                    left: '545px'
                  }, 'slow', function() {
                    var card4 = 'images/cards/' + data.cards[3] + '.png';
                    $('#com-card4').attr('src', card4);
                    var card5 = 'images/cards/' + data.cards[4] + '.png';
                    $('#com-card5').attr('src', card5);
                  });
                  break;
              }
            });
            break;
        }
      });
    }
  }
};
showState();
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
      showState();
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
    $('body').css('background-image', "url('../images/background.jpg')");
    $('#play').removeClass('hide');
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
    var path = '/update/' + $('#dash-user h5').text().trim();
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
    var path = '/update/' + $('#dash-user h5').text().trim();
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
  var path = '/update/' + $('#dash-user h5').text().trim();
  var payload = JSON.stringify({
    balance: 500
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
      $('#sessions').addClass('hide');
      $('#sessions .segments').remove();
      break;
    case 'Your table':
      $('#info').addClass('hide');
      $('#new-table').removeClass('hide');
      $('#join-table').addClass('hide');
      $('#active-game').addClass('hide');
      $('#sessions').addClass('hide');
      $('#sessions .segments').remove();
      break;
    case 'Join table':
      $('#info').addClass('hide');
      $('#new-table').addClass('hide');
      $('#join-table').removeClass('hide');
      $('#active-game').addClass('hide');
      $('#sessions').addClass('hide');
      $('#sessions .segments').remove();
      break;
    case 'Active game':
      $('#active-game').removeClass('hide');
      $('#new-table').addClass('hide');
      $('#join-table').addClass('hide');
      $('#info').addClass('hide');
      $('#sessions').addClass('hide');
      $('#player-menu .active').css('background-color', "");
      $('#sessions .segments').remove();
      break;
    case 'Past sessions':
      $('#active-game').addClass('hide');
      $('#new-table').addClass('hide');
      $('#join-table').addClass('hide');
      $('#info').addClass('hide');
      $('#sessions').removeClass('hide')
      $('#sessions .segments').remove();
      showSessions();
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
  var balance = Number($('#dash-balance h5').text().trim());
  if (buyin > bb * 150) {
    $('#alert h3').text("You can't buy in for more than " + bb * 150);
    $('#alert').modal('show');
    $('#start-buyin').val(bb * 150);
    return;
  }

  if (buyin < bb * 40) {
    $('#alert h3').text("You can't buy in for less than " + bb * 40);
    $('#alert').modal('show');
    $('#start-buyin').val(bb * 40);
    return;
  }

  if (buyin > balance) {
    $('#alert h3').text("You don't have the available balance");
    $('#alert').modal('show');
    $('#start-buyin').val(balance);
    return;
  }

  var data = {
    player: $('#dash-user h5').text().trim(),
    bb: bb,
    buyin: buyin
  };

  $('#dash-balance h5').text(balance - buyin);
  $('#user-status p').text(' Welcome, ' + $('#dash-user h5').text().trim() + '! Balance: ' + (balance - buyin));
  socket.emit('create table', data);
});
//Receiving created table from the server
socket.on('my table', function(data) {
  switch(data.status) {
    case 'create':
      $('#table-name').text(data.name);
      var info = 'Blinds: ' + (data.bb / 2) + ' / ' + data.bb + ' -  Stack: ' + data.stack;
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
  var str = $('#table-info').text().split(' ');
  var stack = Number(str[str.length - 1]);
  var balance = Number($('#dash-balance h5').text().trim()) + stack;
  $('#dash-balance h5').text(balance + ' ');
  $('#user-status p').text(' Welcome, ' + $('#dash-user h5').text().trim() + '! Balance: ' + balance);
  socket.emit('remove table', data);
});
//Populating existing tables
socket.on('post tables', function(data) {
  $('#game-grid div').remove();
  for (key in data) {
    if (data[key].first.player != $('#dash-user').text().trim() && $('#table').attr('data-table') === "" && data[key].status === 'waiting') {
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

      $(col).addClass('column').appendTo('#game-grid');
      $(card).addClass('ui card').css('background-color', '#CECECE').appendTo(col);
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
      $(btn).addClass('ui fluid button').css({'background-color': '#494949', 'color': '#CACACA'}).text('Join table').attr('id',key).appendTo(btnContent);
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
      $('#alert h3').text('Minimum buy-in is ' + 40 * bb);
      $('#alert').modal('show');
      return;
    }
    else if ($(valueSelector).val() > 150 * bb) {
      $('#alert h3').text('Maximum buy-in is ' + 150 * bb);
      $('#alert').modal('show');
      return;
    }
    else if ($(valueSelector).val() > Number($('#dash-balance').text().trim())) {
      $('#alert h3').text("You don't have sufficient funds");
      $('#alert').modal('show');
      return;
    }
    var payload = {
      table: event.target.id,
      player: $('#dash-user').text().trim(),
      buyin: Number($(valueSelector).val())
    }
    $('#table').attr('data-table', event.target.id);
    var balance = Number($('#dash-balance h5').text().trim()) - payload.buyin;
    $('#dash-balance h5').text(balance + ' ');
    $('#user-status p').text(' Welcome, ' + $('#dash-user h5').text().trim() + '! Balance: ' + balance);
    socket.emit('join table', payload);
    $('#active-game').removeClass('hide');
    $('#new-table').addClass('hide');
    $('#join-table').addClass('hide');
    $('#info').addClass('hide');
    $('#sessions').addClass('hide');
    $('#create-card').addClass('hide');
    $('#game-grid div').remove();
    $('#player-menu a:nth-child(3)').removeClass('active');
    $('#player-menu a:nth-child(4)').addClass('active');
  }
});
//Event listeners for the action buttons
$('#up').click(function(event) {
  var array = event.target.textContent.split(' ');
  $('#up').addClass('hide');
  $('#bet-selector').addClass('hide');
  $('#bet-input').val('');
  switch(array[0]) {
    case 'Post':
      var bb = Number($('#table').attr('data-bb'));
      var payload = {
        table: $('#table').attr('data-table'),
        player: $('#dash-user h5').text().trim(),
        action: 'post blind'
      }
      if (array[1] === 'BB') {
        payload.amount = Number(bb);
      }
      else {
        payload.amount = Number(bb) / 2;
      }
      placePlayerBet(payload.amount);
      var pot = Number($('#opp-bet').text()) + payload.amount;
      payload.pot = pot;
      var stack = Number($('#player p:last').text()) - payload.amount;
      $('#player p:last').text(stack);
      payload.stack = stack;
      $('#player-bet').text(payload.amount);
      payload.bet = payload.amount;
      socket.emit('play', payload);
      break;
    case 'Raise':
      $('#down').addClass('hide');
      $('#even').addClass('hide');
      var raise = Number(array[2]);
      var bet = Number($('#player-bet').text());
      var stack = Number($('#player p:last').text()) - raise + bet;
      $('#player p:last').text(stack);
      placePlayerBet(raise);
      var pot = Number($('#pot h5').text()) + Number($('#player-bet').text()) + Number($('#opp-bet').text());
      var payload = {
        table: $('#table').attr('data-table'),
        player: $('#dash-user h5').text().trim(),
        action: 'raise',
        pot: pot,
        stack: stack,
        raise: raise
      }
      payload.bet = raise;
      socket.emit('play', payload);
      break;
    case 'Bet':
      $('#down').addClass('hide');
      $('#even').addClass('hide');
      var bet = Number(array[1]);
      var stack = Number($('#player p:last').text()) - bet;
      placePlayerBet(bet);
      var pot = Number($('#pot h5').text()) + Number($('#player-bet').text()) + Number($('#opp-bet').text());
      $('#player p:last').text(stack);
      var payload = {
        table: $('#table').attr('data-table'),
        action: 'bet',
        player: $('#dash-user h5').text().trim(),
        pot: pot,
        amount: bet,
        stack: stack
      }
      payload.bet = bet;
      socket.emit('play', payload);
      break;
  }
});

$('#even').click(function() {
  var array = event.target.textContent.split(' ');
  $('#up').addClass('hide');
  $('#bet-selector').addClass('hide');
  $('#bet-input').val('');
  $('#down').addClass('hide');
  $('#even').addClass('hide');
  if (array[0] === 'Call') {
    var bb = Number($('#table').attr('data-bb'));
    var bet = Number(array[1]);
    var totalBet = Number($('#player-bet').text()) + bet;
    var stack = Number($('#player p:last').text()) - bet;
    placePlayerBet(totalBet);
    $('#player p:last').text(stack);
    var pot = Number($('#pot h5').text()) + Number($('#opp-bet').text()) + Number($('#player-bet').text());
    var payload = {
      table: $('#table').attr('data-table'),
      player: $('#dash-user h5').text().trim(),
      stack: stack,
      pot: pot,
      amount: totalBet,
      call: bet,
      bet: totalBet,
    }
    if (stack === 0) {
      var oppbet = Number($('#opp-bet').text());
      var oppstack = Number($('#opponent p:last').text());
      oppstack += (oppbet - totalBet);
      pot -= (oppbet - totalBet);
      $('#opponent p:last').text(oppstack);
      payload.oppstack = oppstack;
      payload.pot = pot;
    }
    if (Number(array[1]) === bb / 2) {
      payload.action = 'open call';
      placePlayerBet(bb);
    }
    else {
      payload.action = 'call';
    }
  }
  else {
    var bb = Number($('#table').attr('data-bb'));
    var pot = Number($('#pot h5').text());
    var payload = {
      table: $('#table').attr('data-table'),
      player: $('#dash-user h5').text().trim(),
      bet: 0
    }
    if ($('#even').attr('data-check') === 'close') {
      payload.action = 'closing check';
    }
    else {
      payload.action = 'check';
    }
  }
  socket.emit('play', payload);
});

$('#down').click(function() {
  var payload = {
    table: $('#table').attr('data-table'),
    player: $('#dash-user h5').text().trim(),
    action: 'fold'
  }
  var oppStack = Number($('#opponent p:last').text());
  var pot = Number($('#pot h5').text()) + Number($('#player-bet').text()) + Number($('#opp-bet').text());
  $('#opponent p:last').text(oppStack + pot);
  $('#player-bet').text('0').addClass('hide');
  $('#opp-bet').text('0').addClass('hide');
  $('#pchips').animate({
    left: '247px'
  }, 1000, function() {
    $('#pchips .chip').addClass('hide');
    $('#pchips').css('left', '0px');
  });
  $('#oppchips').animate({
    left: '-247px'
  }, 1000, function() {
    $('#oppchips .chip').addClass('hide');
    $('#oppchips').css('left', '0px');
    placePot(pot);
    $('#pot h5').text('0').addClass('hide');
    $('#potchips').animate({
      left: '350px'
    }, 1000, function() {
      $('#potchips .chip').addClass('hide');
      $('#potchips').css('left', 0);
    })
  });
  $('#up').addClass('hide');
  $('#bet-selector').addClass('hide');
  $('#bet-input').val('');
  $('#even').addClass('hide');
  $('#down').addClass('hide');
  var deck = $('#table').attr('data-deck');
  $('#com-card1').css({top: '20px', left: '405px'}).attr('src',deck).addClass('hide');
  $('#com-card2').css({top: '20px', left: '405px'}).attr('src',deck).addClass('hide');
  $('#com-card3').css({top: '20px', left: '405px'}).attr('src',deck).addClass('hide');
  $('#com-card4').css({top: '20px', left: '405px'}).attr('src',deck).addClass('hide');
  $('#com-card5').css({top: '20px', left: '405px'}).attr('src',deck).addClass('hide');
  socket.emit('play', payload);
  $('#player-card1').css({top: '20', left: '405px'}).attr('src',deck).addClass('hide');
  $('#player-card2').css({top: '20px', left: '405px'}).attr('src',deck).addClass('hide');
  $('#opp-card1').css({top: '20px', left: '405px'}).addClass('hide');
  $('#opp-card2').css({top: '20px', left: '405px'}).addClass('hide');
  var dealer = $('#dealer').css('left');
  if (dealer === '180px') {
    $('#dealer').animate({
      left: '700px'
    }, 'slow');
  }
  else {
    $('#dealer').animate({
      left: '180px'
    }, 'slow');
  }
});
//Bet selectors
$('#bet-plus').click(function() {
  var array = $('#up').text().split(' ');
  var bet = 0;
  var max = 0;
  if (array[0] === 'Bet') {
    max = Number($('#player p:last').text());
    bet = Number(array[1]) + 1;
    if (bet > max) {
      bet = max;
    }
    $('#up').text('Bet ' + bet);
  }
  else {
    max = Number($('#player p:last').text()) + Number($('#player-bet').text());
    bet = Number(array[2]) + 1;
    if (bet > max) {
      bet = max;
    }
    $('#up').text('Raise to ' + bet);
  }

});

$('#bet-minus').click(function() {
  var array = $('#up').text().split(' ');
  var bet = 0;
  var min = 0;
  if (array[0] === 'Bet') {
    min = Number($('#table').attr('data-bb'));
    bet = array[1] - 1;
    if (bet < min) {
      bet = min;
    }
    $('#up').text('Bet ' + bet);
  }
  else {
    min = Number($('#opp-bet').text()) + Number($('#table').attr('data-bb'));
    bet = array[2] - 1;
    if (bet < min) {
      bet = min;
    }
    $('#up').text('Raise to ' + bet);
  }
});

$('#bet-allin').click(function() {
  var array = $('#up').text().split(' ');
  var bet = 0;
  if (array[0] === 'Bet') {
    bet = Number($('#player p:last').text());
    $('#up').text('Bet ' + bet);
  }
  else {
    bet = Number($('#player p:last').text()) + Number($('#player-bet').text());
    $('#up').text('Raise to ' + bet);
  }
});

$('#bet-input').keyup(function() {
  var array = $('#up').text().split(' ');
  var value = Number($('#bet-input').val());
  //Max amount
  var stack = Number($('#player p:last').text());
  var bet = Number($('#player-bet').text());
  var max = stack + bet;
  //Min amount
  var oppbet = Number($('#opp-bet').text());
  var bb = Number($('#table').attr('data-bb'));
  var min = oppbet + bb;

  array.pop();
  if (value >= min && value <= max) {
    array.push(value);
  }
  else if (value > max) {
    array.push(max);
  }
  else {
    array.push(min);
  }
  $('#up').text(array.join(' '));
});
//Chat message sending to tables
$('#chat-input').submit(function(event) {
  event.preventDefault();

  var message = $('#chat-field').val();
  var payload = {
    table: $('#table').attr('data-table'),
    player: $('#dash-user h5').text().trim(),
    message: message
  }
  socket.emit('chat', payload);
  document.getElementById('chat-input').reset();
});
//Leave table button click
$('#leave').click(function() {
  var payload = {
    table: $('#table').attr('data-table'),
    player: $('#dash-user h5').text().trim(),
    action: 'leave'
  }
  socket.emit('play', payload);
  clearTable();
})
//Function for clearing the table (default state)
function clearTable() {
  $('#player p:first').text('');
  $('#player p:last').text('');
  $('#opponent p:first').text('');
  $('#opponent p:last').text('');
  $('#player-bet').text('0');
  $('#opp-bet').text('0');
  $('#pot h5').text('0');
  var deck = $('#table').attr('data-deck');
  $('#player-card1').css({top: '20px', left: '405px'}).attr('src',deck).addClass('hide');
  $('#player-card2').css({top: '20px', left: '405px'}).attr('src',deck).addClass('hide');
  $('#opp-card1').css({top: '20px', left: '405px'}).attr('src',deck).addClass('hide');
  $('#opp-card2').css({top: '20px', left: '405px'}).attr('src',deck).addClass('hide');
  $('#com-card1').css({top: '20px', left: '405px'}).attr('src',deck).addClass('hide');
  $('#com-card2').css({top: '20px', left: '405px'}).attr('src',deck).addClass('hide');
  $('#com-card3').css({top: '20px', left: '405px'}).attr('src',deck).addClass('hide');
  $('#com-card4').css({top: '20px', left: '405px'}).attr('src',deck).addClass('hide');
  $('#com-card5').css({top: '20px', left: '405px'}).attr('src',deck).addClass('hide');
  $('#up').addClass('hide');
  $('#even').addClass('hide');
  $('#down').addClass('hide');
  $('#bet-selector').addClass('hide');
  $('#bet-input').val('');
  $('.post').remove();
}
//Auto blind checkbox event
$('#auto-blind input').change(function(event) {
  $('#auto-blind input').attr('checked',event.target.checked);
})
//Function getting past sessions
function showSessions() {
  var xhr = new XMLHttpRequest();

  xhr.open('GET', '/sessions');
  xhr.send();

  xhr.onload = function(value) {
    var array = JSON.parse(value.target.response);
    var segments = document.createElement('div');

    $(segments).addClass('ui segments').appendTo($('#sessions'));

    for (var i = 0; i < array.length; i++) {

      var segment = document.createElement('div');
      var grid = document.createElement('div');

      $(segment).addClass('ui segment session-tab').css('background-color', '#CECECE').appendTo(segments);
      $(grid).addClass('ui stackable five column grid').appendTo(segment);

      for (key in array[i]) {
        var col = document.createElement('div');
        var info = document.createElement('p');
        var bold = document.createElement('b');
        switch(key) {
          case 'outcome':
            if (array[i].outcome < 0) {
              $(info).text('Lost: ').css('color', 'red');
              $(bold).text(-array[i].outcome);
            }
            else {
              $(info).text('Won: ');
              $(bold).text(array[i].outcome);
            }
            break;
          case 'hands':
            $(info).text('Hands played: ');
            $(bold).text(array[i].hands);
            break;
          case 'opp':
            $(info).text('Opponent: ');
            $(bold).text(array[i].opp);
            break;
          case 'start':
            var time = new Date(array[i].start);
            $(info).text('Start: ' + time.toString().split(':').slice(0,2).join(':'));
            break;
          case 'end':
            var time = new Date(array[i].end);
            $(info).text('End: ' + time.toString().split(':').slice(0,2).join(':'));
            break;
        }
        $(info).appendTo(col);
        $(col).addClass('column').appendTo(grid);
        $(bold).appendTo(info);
      }
    }
  }
}
//Leaderboard modal
$('#leaderboard').click(function() {
  var xhr = new XMLHttpRequest();

  xhr.open('GET', '/leaders');
  xhr.send();

  xhr.onload = function() {
    var obj = JSON.parse(xhr.response);
    var winList = document.createElement('ol');
    var loseList = document.createElement('ol');
    var winValues = document.createElement('ul');
    var loseValues = document.createElement('ul');
    $(winList).appendTo($('#winners'));
    $(loseList).appendTo($('#losers'));
    $(winValues).css('list-style','none').appendTo($('#win-val'));
    $(loseValues).css('list-style','none').appendTo($('#lose-val'));
    for (var i = 0; i < obj.winners.length; i++) {
      var item = document.createElement('li');
      $(item).text(obj.winners[i].user + ':').appendTo(winList);
      var val = document.createElement('li');
      $(val).text(obj.winners[i].total).appendTo(winValues);
    }
    for (var j = 0; j < obj.losers.length; j++) {
      var item = document.createElement('li');
      $(item).text(obj.losers[j].user + ':').appendTo(loseList);
      var val = document.createElement('li');
      $(val).text('(' + (obj.losers[j].total) + ')').css('color','red').appendTo(loseValues);
    }
  }

  $('#leader-show').modal('show');
  $('#winners ol').remove();
  $('#losers ol').remove();
  $('#win-val ul').remove();
  $('#lose-val ul').remove();
})
//Choosing avatar listener
$('#edit-avatar').click(function() {
  $('#avatar-select').modal('show');
})
//Choosing avatar
$('#avatar-select').click(function(event) {
  if ($(event.target).attr('src')) {
    var avatar = $(event.target).attr('src');
    $('#dash-avatar img').attr('src', avatar);
    $('#user-status img').attr('src', avatar);
    $('#avatar-select').modal('hide');

    var path = '/update/' + $('#dash-user h5').text().trim();
    var payload = JSON.stringify({
      avatar: avatar
    });

    var xhr = new XMLHttpRequest();

    xhr.open('POST', path);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.send(payload);
  }
})
//Choosing deck listener
$('#change-deck').click(function(event) {
  $('#deck-select').modal('show');
})
//Choosing deck
$('#deck-select').click(function(event) {
  if ($(event.target).attr('src')) {
    var deck = $(event.target).attr('src');
    $('#table').attr('data-deck', deck);
    var path = '/update/' + $('#dash-user h5').text().trim();
    var payload = JSON.stringify({
      deck: deck
    });

    var xhr = new XMLHttpRequest();

    xhr.open('POST', path);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.send(payload);
    $('#deck-select').modal('hide');
  }
});
//Rebuy modal event listeners
$('#rebuy .approve').click(function(event) {
  var val = Number($('#rebuy input').val());
  var bb = Number($('#table').attr('data-bb'));
  var stack = Number($('#player p:last').text());
  var balance = Number($('#dash-balance h5').text().trim());
  if (val + stack < (40 * bb)) {
    $('#rebuy h5').text("Your rebuy below table minimum of " + (40 * bb));
    return false;
  }
  else if ((val + stack) > (150 * bb)) {
    $('#rebuy h5').text("Your rebuy above table maximum of " + (150 * bb));
    return false;
  }
  else if (balance < val) {
    $('#rebuy h5').text("You don't have sufficient balance!");
    return false;
  }
  var user = $('#dash-user h5').text().trim();
  $('#dash-balance h5').text(balance - val);
  $('#user-status').text('Welcome ' + user + '! Balance: ' + (balance - val));
  stack += val;
  var payload = {
    table: $('#table').attr('data-table'),
    player: user,
    action: 'rebuy',
    stack: stack,
    balance: balance
  }
  $('#rebuy h5').text('');
  $('#player p:last').text(stack);
  socket.emit('play', payload);
});

$('#rebuy .cancel').click(function() {
  $('#rebuy').modal('hide');
  $("#leave").click();
});
//Function to calculate the chip denomination
function calcChips(num) {
  var array = [];

  array.push(Math.floor(num / 500));
  num = num % 500;

  array.push(Math.floor(num / 100));
  num = num % 100;

  array.push(Math.floor(num / 25));
  num = num % 25;

  array.push(Math.floor(num / 5));
  num = num % 5;

  array.push(num);

  return array;
}
//Function to return player chips to original positions
function resetPlayerChips() {
  var player = ['180px','180px','180px','180px','180px','203px','203px','203px','203px','203px','192px','192px','192px','192px','192px','226px','226px','226px','226px','226px','215px','215px','215px','215px','215px'];
  var opp = ['675px','675px','675px','675px','675px','652px','652px','652px','652px','652px','663px','663px','663px','663px','663px','629px','629px','629px','629px','629px','640px','640px','640px','640px','640px'];

  for (var i = 0; i < player.length; i++) {
    var pselector = '#pchips .chip:nth-of-type(' + (i + 1) + ')';
    $(pselector).css('left', player[i]);
    var oppselector = '#oppchips .chip:nth-of-type(' + (i + 1) + ')';
    $(oppselector).css('left', opp[i])
  }
}
//Function for placing the pot
function placePot(num) {
  $('#potchips .chip').addClass('hide');
  var chips = calcChips(num);
  var count = 0;

  for (var i = 0; i < chips.length; i++) {
    for (var j = 0; j < chips[i]; j++) {
      count++;
      var selector = '#potchips .chip:nth-of-type(' + count + ')';
      var image = 'images/chips/' + i + '.svg';
      $(selector).attr('src', image).removeClass('hide');
    }
  }

  if (count <= 5) {
    for (var i = 0; i < count; i++) {
      var selector = '#potchips .chip:nth-of-type(' + (i + 1) + ')';
      $(selector).css('left', '417px').removeClass('hide');
    }
  }
  else if (count <= 15) {
    for (var i = 0; i < count; i++) {
      var selector = '#potchips .chip:nth-of-type(' + (i + 1) + ')';
      if (i < 5) {
        var place = '406px';
      }
      else if (i < 10) {
        var place = '429px';
      }
      else {
        var place = '418px';
      }
      $(selector).css('left', place).removeClass('hide');
    }
  }
  else {
    for (var i = 0; i < count; i++) {
      var selector = '#potchips .chip:nth-of-type(' + (i + 1) + ')';
      if (i < 5) {
        var place = '394px';
      }
      else if (i < 10) {
        var place = '417px';
      }
      else if (i < 15) {
        var place = '406px';
      }
      else if (i < 20) {
        var place = '440px';
      }
      else {
        var place = '429px';
      }
      $(selector).css('left', place).removeClass('hide');
    }
  }
  $('#pot h5').text(num).removeClass('hide');
  $('#pot').removeClass('hide');
  return;
}
//Function for placing opponent bet
function placeOppBet(num) {
  var chips = calcChips(num);
  var count = 0;

  for (var i = 0; i < chips.length; i++) {
    for (var j = 0; j < chips[i]; j++) {
      count++;
      var selector = '#oppchips .chip:nth-of-type(' + count + ')';
      var image = 'images/chips/' + i + '.svg';
      $(selector).attr('src', image).removeClass('hide');
    }
  }

  if (count > 15) {
    var position = 625 - 8 * (num.toString().length - 1);
    $('#opp-bet').text(num).css('left', position + 'px').removeClass('hide');
  }
  else if (count > 5) {
    var position = 648 - 8 * (num.toString().length - 1);
    $('#opp-bet').text(num).css('left', position + 'px').removeClass('hide');
  }
  else {
    var position = 671 - 8 * (num.toString().length - 1);
    $('#opp-bet').text(num).css('left', position + 'px').removeClass('hide');
  }
}
//Function for placing player bet
function placePlayerBet(num) {
  var chips = calcChips(num);
  var count = 0;
  for (var i = 0; i < chips.length; i++) {
    for (var j = 0; j < chips[i]; j++) {
      count++;
      var selector = '#pchips .chip:nth-of-type(' + count + ')';
      var image = 'images/chips/' + i + '.svg';
      $(selector).attr('src', image).removeClass('hide');
    }
  }

  if (count <= 5) {
    $('#player-bet').text(num).css('left', '219px').removeClass('hide');
  }
  else if (count <= 15) {
    $('#player-bet').text(num).css('left', '242px').removeClass('hide');
  }
  else {
    $('#player-bet').text(num).css('left', '265px').removeClass('hide');
  }
}
//Showing rules of the game
$('#howto').click(function() {
  $('#rules').modal('show');
})
//Bring up the login window
$('#play').click(function() {
  $('#show-login').click();
})
//Start or join game from home screen
$('.user-btn').click(function(event) {
  if (event.target.name === 'start') {
    $('#player-menu a:nth-of-type(1)').removeClass('active');
    $('#player-menu a:nth-of-type(2)').addClass('active');
    $('#info').addClass('hide');
    $('#new-table').removeClass('hide');
    $('#join-table').addClass('hide');
    $('#active-game').addClass('hide');
    $('#sessions').addClass('hide');
    $('#sessions .segments').remove();
  }
  else if (event.target.name === 'join') {
    $('#player-menu a:nth-of-type(1)').removeClass('active');
    $('#player-menu a:nth-of-type(3)').addClass('active');
    $('#info').addClass('hide');
    $('#new-table').addClass('hide');
    $('#join-table').removeClass('hide');
    $('#active-game').addClass('hide');
    $('#sessions').addClass('hide');
    $('#sessions .segments').remove();
  }
})
