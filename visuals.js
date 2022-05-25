var playersAtStart = prompt("Enter the number of players", 4);
//var playersAtStart = 4;
const timer = ms => new Promise(res => setTimeout(res, ms));

function reDrawMap() {
  let table = '<table cellpadding="0" cellspacing="0">';
  table += "<tr>";
  // top
  for (w = 0; w < gameMap.map.length; w++) {
    if (w != gameMap.map.length - 1) {
      table += "<td class='r1_background'>";
    } else {
      table += "<td class='h1_background'>";
    }

    if (gameMap.map[w][1].length < 1) {
      table += "<div class='r'></div>";
    } else {
      table += "<div class='r'>";
      gameMap.map[w][1].forEach(player => {
        table += "<img src='/sprites/";
        table += player;
        table += ".png'>";
      });
      table += "</div>";
    }

    table += "</td>";
  }
  table += "</tr>";
  table += "<tr>";
  // middle
  for (w = 0; w < gameMap.map.length; w++) {
    if (w != gameMap.map.length - 1) {
      table += "<td class='r0_background'>";
    } else {
      table += "<td class='h0_background'>";
    }

    if (gameMap.map[w][0].length < 1) {
      table += "<div class='r'></div>";
    } else {
      table += "<div class='r'>";
      gameMap.map[w][0].forEach(player => {
        table += "<img src='/sprites/";
        table += player;
        table += ".png'>";
      });
      table += "</div>";
    }

    table += "</td>";
  }
  table += "</tr>";
  table += "<tr>";
  // bottom
  for (w = 0; w < gameMap.map.length; w++) {
    if (w != gameMap.map.length - 1) {
      table += "<td class='bottom_background'></td>";
    } else {
      table += "<td class='h_bottom_background'>";
    }
  }
  table += "</tr>";
  table += "</table>";
  document.getElementById("map").innerHTML = table;

  let player_pic = "";
  player_pic += "<img src='/sprites/";
  player_pic += gameMap.players_turn;
  player_pic += "_f_true_s_false.png'>";

  document.getElementById("players_turn").innerHTML = player_pic;

  if (gameMap.round === 1) {
    nextGame();
  }
}

function nextGame() {
  let turns_table = "<table class='menu_table'>";
  turns_table += "<tr>";
  gameMap.players_left.forEach(player => {
    if (player["dead"] === false) {
      turns_table += "<td>";
      turns_table += "<img src='/sprites/";
      turns_table += player["name"];
      turns_table += "_f_true_s_false.png'>";
      turns_table += "$" + gameMap.players_left[player["name"]]["cash"];
      turns_table += "</td>";
    }
  });
  turns_table += "</tr>";
  for (let i = 0; i < 3; i++) {
    turns_table += "<tr>";
    gameMap.players_left.forEach(player => {
      if (player["dead"] === false) {
        turns_table += "<td id='" + player["name"] + "__" + i + "'>";
        i > 0
          ? (turns_table +=
              '<div class="notIE"><span class="fancyArrow"></span><select name ="' +
              player["name"] +
              "_" +
              i +
              '" id="' +
              player["name"] +
              "_" +
              i +
              '" disabled></div>')
          : (turns_table +=
              '<div class="notIE"><span class="fancyArrow"></span><select name ="' +
              player["name"] +
              "_" +
              i +
              '" id="' +
              player["name"] +
              "_" +
              i +
              '"></div>');
        turns_table +='<option value="" disabled selected>Select action</option>';
        turns_table += '<option value="0">Fire</option>';
        turns_table += '<option value="1">Move</option>';
        turns_table += '<option value="2">Turn around</option>';
        turns_table += '<option value="3">Climb</option>';
        turns_table += "</select>";
        turns_table += "</td>";
      }
    });
    turns_table += "</tr>";
  }
  turns_table += "<tr>";
  gameMap.players_left.forEach(player => {
    if (player["dead"] === false) {
      turns_table += '<td><button class="btn b-3" id="';
      turns_table += player["name"];
      turns_table +=
        '"onclick="hideMoves(' + player["name"] + ')">READY</button></td>';
    }
  });
  turns_table += "</tr>";
  turns_table += "</table>";
  document.getElementById("actions_select").innerHTML = turns_table;

  // enable selects one by one
  for (let i = 0; i < 3; i++) {
    gameMap.players_left.forEach(player => {
      if (player["dead"] === false) {
        if (i > 0) {
          document
            .getElementById(player["name"] + "_" + (i - 1))
            .addEventListener(
              "change",
              function(event) {
                if (event.target.value != "") {
                  document.getElementById(
                    player["name"] + "_" + i
                  ).disabled = false;
                } else {
                  document.getElementById(
                    player["name"] + "_" + i
                  ).disabled = true;
                }
              },
              false
            );
        }
      }
    });
  }
}

function hideMoves(pl) {
  var move_set = new Set();
  for (i = 0; i < 3; i++) {
    move_set.add(document.getElementById(pl + "_" + i).value);
  }
  if (move_set.size === 3) {
    for (i = 0; i < 3; i++) {
      let hide_td = document.getElementById(pl + "__" + i);
      hide_td.style.visibility === "hidden"
        ? (hide_td.style.visibility = "visible")
        : (hide_td.style.visibility = "hidden");
    }
  } else {
    alert("Select distinct actions");
  }
}

async function game() {
  var moves_arr = {};
  moves_arr.length = 0;
  var count = 0;

  gameMap.players_left.forEach(player => {
    if (player["dead"] === false) {
      moves_arr[player["name"]] = [];
      for (i = 0; i < 3; i++) {
        if (document.getElementById(player["name"] + "_" + i).value != "") {
          moves_arr[player["name"]].push(
            parseInt(document.getElementById(player["name"] + "_" + i).value)
          );
          count += 1;
        }
      }
    }
  });

  if (count != gameMap.alive_players.length * 3) {
    alert("All players moves should be selected");
    moves_arr.length = 0;
  } else {
    document.getElementById("action_show").innerHTML = "";
    document.getElementById("actions_select").style.display = "none";
    document.getElementById("start_btn").style.visibility = "hidden";
    var cnt = 0;

    while (true) {
      if (cnt > 0 && gameMap.round === 1) break;
      if (gameMap.winner != "") break;

      actions(moves_arr);

      cnt += 1;
      await timer(3000);
    }
  }
}

function actions(moves_arr_in) {
  if (
    moves_arr_in[gameMap.players_turn][
      gameMap.players_at_round_start[gameMap.players_turn]
    ] === 0
  ) {
    document.getElementById("action_show").innerHTML +=
      "<img class='action_player' src='/sprites/" +
      gameMap.players_turn +
      "_f_true_s_false.png'>";
    document.getElementById("action_show").innerHTML +=
      "<img class='action_img' src='/sprites/fire.png'>";
    gameMap.fire();
  } else if (
    moves_arr_in[gameMap.players_turn][
      gameMap.players_at_round_start[gameMap.players_turn]
    ] === 1
  ) {
    document.getElementById("action_show").innerHTML +=
      "<img class='action_player' src='/sprites/" +
      gameMap.players_turn +
      "_f_true_s_false.png'>";
    document.getElementById("action_show").innerHTML +=
      "<img class='action_img' src='/sprites/move.png'>";
    gameMap.move();
  } else if (
    moves_arr_in[gameMap.players_turn][
      gameMap.players_at_round_start[gameMap.players_turn]
    ] === 2
  ) {
    document.getElementById("action_show").innerHTML +=
      "<img class='action_player' src='/sprites/" +
      gameMap.players_turn +
      "_f_true_s_false.png'>";
    document.getElementById("action_show").innerHTML +=
      "<img class='action_img' src='/sprites/turn_around.png'>";
    gameMap.turnAround();
  } else if (
    moves_arr_in[gameMap.players_turn][
      gameMap.players_at_round_start[gameMap.players_turn]
    ] === 3
  ) {
    document.getElementById("action_show").innerHTML +=
      "<img class='action_player' src='/sprites/" +
      gameMap.players_turn +
      "_f_true_s_false.png'>";
    document.getElementById("action_show").innerHTML +=
      "<img class='action_img' src='/sprites/climb.png'>";
    gameMap.climb();
  }
}

function rules() {
  document.getElementById("rules").style.display === "none"
    ? (document.getElementById("rules").style.display = "block")
    : (document.getElementById("rules").style.display = "none");
}

function crt() {
  document.getElementById("body").classList.toggle("crt");
  for (let i = 0; i < 3; i++) {
    gameMap.players_left.forEach(player => {
      if (player["dead"] === false) {
        let sel_id = player["name"] + "_" + i;
        document.getElementById(sel_id).classList.toggle("crt");
      }
    });
  }
}

function ng() {
    document.location.reload();
}