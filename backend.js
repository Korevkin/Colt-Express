class Map {
  constructor(
    _players_at_start,
    _round,
    _players_turn_at_round_start,
    _players_turn
  ) {
    this.players_at_start = _players_at_start;
    this.round = _round;
    this.players_turn_at_round_start = _players_turn_at_round_start;
    this.players_turn = _players_turn;
    this.players_left = [];
    this.alive_players = [];
    this.players_at_round_start = {};
    this.map = [];
    this.wagons_at_start = 0;
    this.winner = "";
    this.player_map_name = "";
    this.map_arr = [];
    this.climb_sprite = "<img style='height:50px;' src='/sprites/climb.png'>";
  }
  drawMap() {
    this.map = [];
    for (let i = 0; i < this.players_left.length + 2; i++) {
      let wagon = [];
      for (let y = 0; y < 2; y++) {
        let row = [];
        wagon.push(row);
      }
      this.map.push(wagon);
    }
  }
  placePlayers() {
    //clearing map
    this.map.forEach(wagon => {
      wagon.forEach(row => {
        row.length = 0;
      });
    });
    this.alive_players = [];
    this.alive_players.length = 0;
    this.players_left.forEach(player => {
      console.log(player);
      if (player["dead"] === false) {
        this.map[player["wagon"]][player["row"]][player["position"]] =
          player["name"] +
          "_f_" +
          player["forward"].toString() +
          "_s_" +
          player["shot"].toString();
        this.alive_players.push(player["name"]);
      }
    });
  }
  findNextUndeadPlayer() {
    var z = 0;
    // loop from current player to the last
    for (
      let i = this.players_turn;
      i < this.players_left.length &&
      this.players_turn != this.players_left.slice(-1)[0]["name"];
      i++
    ) {
      if (
        this.players_left[i]["dead"] != true &&
        //this.players_left[i]["shot"] != true &&
        this.players_left[i]["name"] > this.players_turn
      ) {
        this.players_turn = this.players_left[i]["name"];
        z = 1;
        break;
      }
    }
    // else loop from first player to current
    for (let i = 0; i < this.players_turn && z != 1; i++) {
      if (
        this.players_left[i]["dead"] != true
        //&& this.players_left[i]["shot"] != true
      ) {
        this.players_turn = this.players_left[i]["name"];
        break;
      }
    }
  }
  nextTurn() {
    //вызывается после каждого действия
    console.log(
      "Player moved: " + this.players_turn,
      " Turn passed: " + this.round
    );

    if (this.players_turn in this.players_at_round_start) {
      this.players_at_round_start[this.players_turn] += 1;
    }

    var set_of_turns = new Set(Object.values(this.players_at_round_start));

    if (
      (set_of_turns.size === 1 && set_of_turns.has(3)) ||
      this.alive_players.length === 0
    ) {
      this.round = 1;
      this.players_turn = this.players_turn_at_round_start;
      this.nextRound();
      document.getElementById("actions_select").style.display = "block";
    } else {
      this.round += 1;
      this.findNextUndeadPlayer();
    }

    //updating map
    reDrawMap();
  }
  nextRound() {
    document.getElementById("start_btn").style.visibility = "visible";
    //delete first wagon
    this.map.shift();
    //kill players in it & shift wagon positions of others
    this.players_left.forEach(player => {
      player.ifShot();
      if (player["wagon"] === 0) {
        player["dead"] = true;
        delete this.players_at_round_start[player["name"]];
      } else {
        player["wagon"] -= 1;
      }
    });
    //place players on map
    this.placePlayers();

    //closest to the tail gets the reward, roof beats bottom
    for (let i = 0; i < this.map.length; i++) {
      if (typeof this.map[i][1][0] !== "undefined") {
        var win = this.map[i][1][0].charAt(0);
        break;
      }
      if (typeof this.map[i][0][0] !== "undefined") {
        var win = this.map[i][0][0].charAt(0);
        break;
      }
    }

    this.players_left.forEach(player => {
      if (player["name"] === parseInt(win)) {
        player["cash"] = Math.floor(Math.random() * (300 - 100 + 1) + 100);
        player["wagons_won"] += 1;
      }
    });

    //every round first player shifts by one, if next is not dead
    this.findNextUndeadPlayer();
    this.players_turn_at_round_start = this.players_turn;

    //updating map
    reDrawMap();

    //if once wagon left - alive player with most wagons_won wins else player with max cash
    if (this.map.length === 1 && this.alive_players.length > 1) {
      var cash_arr = [];
      this.players_left.forEach(player => {
        if (player["dead"] === false) {
          cash_arr.push(player["cash"]);
        }
      });
      this.players_left.forEach(player => {
        if (player["cash"] === Math.max.apply(Math, cash_arr)) {
          this.getWinnerColor(player["name"]);
          alert("Player " + this.winner + " is victorious!");
        }
      });
    } else if (this.alive_players.length === 1) {
      this.getWinnerColor(this.alive_players[0]);
      alert("Player " + this.winner + " is victorious!");
    } else if (this.alive_players.length === 0) {
      this.winner = "No winner!";
      alert(this.winner);
    }
    this.players_at_round_start.length = 0;
    this.players_at_round_start = {};
    this.alive_players.forEach(el => {
      this.players_at_round_start[el] = 0;
    });
  }

  getWinnerColor(pl_num) {
    if (pl_num === 0) {
        this.winner = "Gray";
      } else if (pl_num === 1) {
        this.winner = "Green";
      } else if (pl_num === 2) {
        this.winner = "Red";
      } else if (pl_num === 3) {
        this.winner = "Yellow";
      } else if (pl_num === 4) {
        this.winner = "Blue";
      }
  }

  delPlayerFromMapArray(pl, pl_m_nm) {
    //deleting player from current map array of arrays
    var wagon_row_array = this.map[pl["wagon"]][pl["row"]];
    wagon_row_array.splice(wagon_row_array.indexOf(pl_m_nm), 1);
  }

  appendPlayerToMapArray(pl, pl_m_nm) {
    //appending player to new map array of arrays
    pl["forward"] === true
      ? this.map[pl["wagon"]][pl["row"]].unshift(pl_m_nm)
      : this.map[pl["wagon"]][pl["row"]].push(pl_m_nm);
  }

  refreshPositions() {
    //refreshing player positions from map array to player objects
    this.players_left.forEach(player => {
      var wagon_row_array = this.map[player["wagon"]][player["row"]];
      this.getPlayerMapName(player);
      player["position"] = wagon_row_array.indexOf(this.player_map_name);
    });
  }

  getPlayerMapName(pl) {
    this.player_map_name =
      pl["name"] +
      "_f_" +
      pl["forward"].toString() +
      "_s_" +
      pl["shot"].toString();
  }

  shotForward(cl_pl_w, cl_pl_p) {
    this.players_left.forEach(en => {
      this.getPlayerMapName(en);
      if (
        en["wagon"] === cl_pl_w &&
        en["position"] === cl_pl_p &&
        en["dead"] === false &&
        en["shot"] === false
      ) {
        if (en["first_wagon"] === true) {
          en["dead"] = true;
          delete this.players_at_round_start[en["name"]];
        } else {
          this.delPlayerFromMapArray(en, this.player_map_name);
          en["wagon"] += 1;
          en["shot"] = true;
          this.getPlayerMapName(en);
          this.map[en["wagon"]][en["row"]].unshift(this.player_map_name);
        }
      }
    });
  }

  shotBackward(cl_pl_w, cl_pl_p) {
    this.players_left.forEach(en => {
      this.getPlayerMapName(en);
      if (
        en["wagon"] === cl_pl_w &&
        en["position"] === cl_pl_p &&
        en["dead"] === false &&
        en["shot"] === false
      ) {
        if (en["last_wagon"] === true) {
          en["dead"] = true;
          delete this.players_at_round_start[en["name"]];
        } else {
          this.delPlayerFromMapArray(en, this.player_map_name);
          en["wagon"] -= 1;
          en["shot"] = true;
          this.getPlayerMapName(en);
          this.map[en["wagon"]][en["row"]].push(this.player_map_name);
        }
      }
    });
  }

  climb() {
    this.players_left.forEach(player => {
      if (player["dead"] === false) {
        player.ifOnLastWagon();
        player.ifOnFirstWagon();
        if (player["name"] === this.players_turn) {
          if (player["shot"] === false) {
            this.getPlayerMapName(player);
            this.delPlayerFromMapArray(player, this.player_map_name);
            player["row"] === 0 ? (player["row"] = 1) : (player["row"] = 0);
            this.appendPlayerToMapArray(player, this.player_map_name);
          } else {
            player.ifShot();
          }
        }
      }
    });
    this.refreshPositions();
    this.updateMap();
  }

  turnAround() {
    this.players_left.forEach(player => {
      if (player["dead"] === false) {
        player.ifOnLastWagon();
        player.ifOnFirstWagon();
        if (player["name"] === this.players_turn) {
          if (player["shot"] === false) {
            player["forward"] === true
              ? (player["forward"] = false)
              : (player["forward"] = true);
          } else {
            player.ifShot();
          }
        }
      }
    });
    this.updateMap();
  }

  move() {
    this.players_left.forEach(player => {
      if (player["dead"] === false) {
        player.ifOnLastWagon();
        player.ifOnFirstWagon();
        if (player["name"] === this.players_turn) {
          if (player["shot"] === false) {
            this.getPlayerMapName(player);
            if (player["forward"] === true && player["first_wagon"] === true) {
              player["dead"] = true;
              delete this.players_at_round_start[player["name"]];
            } else if (
              player["forward"] === false &&
              player["last_wagon"] === true
            ) {
              player["dead"] = true;
              delete this.players_at_round_start[player["name"]];
            } else {
              this.delPlayerFromMapArray(player, this.player_map_name);
              player["forward"] === true
                ? (player["wagon"] += 1)
                : (player["wagon"] -= 1);
              this.appendPlayerToMapArray(player, this.player_map_name);
            }
          } else {
            player.ifShot();
          }
        }
      }
    });
    this.refreshPositions();
    this.updateMap();
  }

  fire() {
    this.players_left.forEach(player => {
      if (player["dead"] === false) {
        player.ifOnLastWagon();
        player.ifOnFirstWagon();
        if (player["name"] === this.players_turn) {
          if (player["shot"] === false) {
            function getClosestPlayerFromTail(myArray, myValue, key) {
              //if (myArray.length > 1) {
              for (i = 0; i < myArray.length; i++) {
                if (myArray[i][key] < myValue) {
                  return myArray[i][key];
                }
              }
            }

            function getClosestPlayerFromHead(myArray, myValue, key) {
              // if (myArray.length > 1) {
              for (i = 0; i < myArray.length; i++) {
                if (myArray[i][key] > myValue) {
                  return myArray[i][key];
                }
              }
            }

            let arr = [0, 38, 136, 202, 261, 399];
            let val = 300;
            let number = arr.reverse().find(e => e >= val);

            var enemy_same_wagon_right = [];
            enemy_same_wagon_right.length = 0;
            var enemy_same_wagon_left = [];
            enemy_same_wagon_left.length = 0;
            var shootable_players = [];
            shootable_players.length = 0;
            //check if anybody in the same wagon
            this.players_left.forEach(i => {
              if (
                i["dead"] === false &&
                i["shot"] === false &&
                i["row"] === player["row"] &&
                i["name"] != player["name"]
              ) {
                if (
                  i["wagon"] === player["wagon"] &&
                  i["position"] > player["position"]
                ) {
                  enemy_same_wagon_right.push(i);
                }
                if (
                  i["wagon"] === player["wagon"] &&
                  i["position"] < player["position"]
                ) {
                  enemy_same_wagon_left.push(i);
                }
                if (i["wagon"] != player["wagon"]) {
                  shootable_players.push(i);
                }
              }
            });

            if (player["forward"] === true) {
              //if facing forward
              //if in the same wagon as player
              if (enemy_same_wagon_right.length > 0) {
                enemy_same_wagon_right.sort((a, b) =>
                  a.position > b.position ? 1 : -1
                );
                var closest_player_position = getClosestPlayerFromHead(
                  enemy_same_wagon_right,
                  player["position"],
                  "position"
                );
                this.shotForward(player["wagon"], closest_player_position);

                // if in other wagon
              } else if (shootable_players.length > 0) {
                var sorted_wagons_players_right = {};
                sorted_wagons_players_right = shootable_players;
                sorted_wagons_players_right.sort(
                  (a, b) => (a.wagon > b.wagon ? 1 : -1) //min to max
                );
                var closest_player_wagon = getClosestPlayerFromHead(
                  sorted_wagons_players_right,
                  player["wagon"],
                  "wagon"
                );
                if (typeof closest_player_wagon != "undefined") {
                  var wagon_players = [];
                  shootable_players.forEach(i => {
                    if (i["wagon"] === closest_player_wagon) {
                      wagon_players.push(i);
                    }
                  });
                  var closest_player_position = Math.min.apply(
                    Math,
                    wagon_players.map(function(o) {
                      return o.position;
                    })
                  );
                  this.shotForward(
                    closest_player_wagon,
                    closest_player_position
                  );
                }
              }
              // if facing backward
            } else {
              // if in the same wagon as player
              if (enemy_same_wagon_left.length > 0) {
                enemy_same_wagon_left.sort((a, b) =>
                  a.position > b.position ? -1 : 1
                );
                var closest_player_position = getClosestPlayerFromTail(
                  enemy_same_wagon_left,
                  player["position"],
                  "position"
                );
                this.shotBackward(player["wagon"], closest_player_position);
                // if in other wagon
              } else if (shootable_players.length > 0) {
                var sorted_wagons_players_left = {};
                sorted_wagons_players_left = shootable_players;
                sorted_wagons_players_left.sort((a, b) =>
                  a.wagon > b.wagon ? -1 : 1
                );

                var closest_player_wagon = getClosestPlayerFromTail(
                  sorted_wagons_players_left,
                  player["wagon"],
                  "wagon"
                );
                if (typeof closest_player_wagon != "undefined") {
                  var wagon_players = [];
                  shootable_players.forEach(i => {
                    if (i["wagon"] === closest_player_wagon) {
                      wagon_players.push(i);
                    }
                  });
                  var closest_player_position = Math.max.apply(
                    Math,
                    wagon_players.map(function(o) {
                      return o.position;
                    })
                  );
                  this.shotBackward(
                    closest_player_wagon,
                    closest_player_position
                  );
                }
              }
            }
          } else {
            player.ifShot();
          }
        }
      }
    });
    this.refreshPositions();
    this.updateMap();
  }

  updateMap() {
    //placing players
    this.placePlayers();
    reDrawMap();
    this.nextTurn();
  }
}

class Player {
  constructor(
    _name, //int
    _wagon, //int
    //_row, //int
    //_position, //int
    //_dead, //bool
    //_shot, //bool
    //_cash, //int
    _forward //bool
    //_last_wagon, //bool
    //_first_wagon //bool
  ) {
    this.name = _name;
    this.wagon = _wagon;
    this.row = 0;
    this.position = 0;
    this.dead = false;
    this.shot = false;
    this.cash = 0;
    this.wagons_won = 0;
    this.forward = _forward;
    this.last_wagon = false;
    this.first_wagon = false;
  }

  ifShot() {
    if (this.shot === true) {
      gameMap.getPlayerMapName(this);
      gameMap.delPlayerFromMapArray(this, gameMap.player_map_name);
      this.shot = false;
      gameMap.getPlayerMapName(this);
      gameMap.appendPlayerToMapArray(this, gameMap.player_map_name);
    }
  }
  ifOnLastWagon() {
    this.last_wagon = this.wagon === 0 ? true : false;
  }
  ifOnFirstWagon() {
    this.first_wagon = this.wagon === gameMap.map.length - 1 ? true : false;
  }
}

function CreatePlayer(name, wagon, forward) {
  this.create = function(name, wagon, forward) {
    return new Player(name, wagon, forward);
  };
}

var createPlayer = new CreatePlayer();
var gameMap = new Map(playersAtStart, 1, 0, 0);

for (i = 0; i < playersAtStart; i++) {
  gameMap.players_left.push(
    createPlayer.create(i, i + 1, i < Math.round(playersAtStart / 2))
  );
}

gameMap.drawMap();
gameMap.placePlayers();

gameMap.alive_players.forEach(el => {
  gameMap.players_at_round_start[el] = 0;
});

reDrawMap();
