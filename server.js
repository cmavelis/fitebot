// server.js
// where your node app starts

// init discord bot and http express
const Discord = require("discord.js");
const cupid = new Discord.Client();
const http = require("http");
const express = require("express");
const app = express();

// init sqlite db
var fs = require("fs");
var dbFile = "./.data/sqlite.db";
var exists = fs.existsSync(dbFile);
var sqlite = require("better-sqlite3");
var db = new sqlite(dbFile);

// if ./.data/sqlite.db does not exist, create it, otherwise print records to console
if (!exists) {
  db.exec("CREATE TABLE Players (player TEXT, elo1 INT, elo2 INT)");
  console.log("New table players created!");

  db.exec(
    "CREATE TABLE Matches (mapName TEXT, mapCode TEXT, owner TEXT, gameMode TEXT, gameType TEXT, playerCount INT, team1Players TEXT, team2Players TEXT, team3Players TEXT, team4Players TEXT, gameStatus TEXT)"
  );
  console.log("New table matches createds!");
} else {
  console.log('Database "Cupid" ready to go!');
}

var prefix = "$";

// 'client.on('message')' commands are triggered when the
// specified message is read in a text channel that the bot is in.

cupid.on("message", async message => {
  // If it's not the prefix, ignore it
  if (message.content.indexOf(prefix) !== 0) return;
  // Figure out the command and the arguement
  const args = message.content
    .slice(1)
    .trim()
    .split(/ +/g);
  const command = args.shift().toLowerCase();

  if (command === "ping") {
    const m = await message.channel.send("Ping?");
    m.edit(
      `Pong! Latency is ${m.createdTimestamp -
        message.createdTimestamp}ms. API Latency is ${Math.round(cupid.ping)}ms`
    );
  }
  
  if (command === "flipCoin" || command === "fc" || command === "coin") {
    const m = (Math.floor(Math.random() * 2) == 0) ? 'heads' : 'tails'
    message.channel.send("```" + message.author.username + " flipped a coin and got " + m + "```");
  }

  if (command === "term" || command === "terms") {
    message.channel.send(
      "Here are the common terms: https://youtu.be/OLnnjEEjDlE"
    );
  }

  if (command === "create") {
    const mapName = args[0];
    const mapCode = args[1];
    const gameMode = args[2] ? args[2] : "ranked";
    const playerCount = args[3] ? parseInt(args[3]) : 2;
    const gameType = args[4] ? args[4] : "sync";
    const player = message.author.id;

    if (!mapName || !mapCode) {
      message.channel.send(
        "You must provide a mapName and a mapCode. For more details, see " +
          prefix +
          "help create"
      );
      return;
    }

    if (mapCode.length != 6) {
      message.channel.send(
        "You must provide a map code that is 6 characters. For more details, see " +
          prefix +
          "help create"
      );
      return;
    }

    if (playerCount < 2 || playerCount > 4) {
      message.channel.send(
        "You must provide a player count between 2 to 4. For more details, see " +
          prefix +
          "help create"
      );
      return;
    }

    if (gameMode !== "ranked" && gameMode !== "unranked") {
      message.channel.send(
        "You must provide a valid game mode. For more details, see " +
          prefix +
          "help create"
      );
      return;
    }

    if (gameType !== "sync" && gameType !== "async") {
      message.channel.send(
        "You must provide a valid game type. For more details, see " +
          prefix +
          "help create"
      );
      return;
    }

    // Check if the person creating the game is in our database, if not, create the player
    let ownerExistSql = db.prepare('SELECT * FROM Players WHERE player = ?');

    const playerRow = ownerExistSql.get(player)
    if (!playerRow) {
      let newOwnerSql = db.prepare('INSERT INTO Players(player, elo1, elo2) VALUES(?, 1000, 1000)');
      newOwnerSql.run(player);
      console.log("Created new player " + player);
    } else {
      console.log(
        "Player Exists " +
          playerRow.player +
          ", 1vs1 elo: " +
          playerRow.elo1 +
          ", 2vs2 elo: " +
          playerRow.elo2
      );
    }

    // Check if the game exists
    var isGameExist = true;
    let gameExistSql = db.prepare('SELECT * FROM Matches WHERE mapCode = ?');
    const gameRow = gameExistSql.get(mapCode);
    if (gameRow) {
      message.channel.send(
        "Game already created. To close a game, use " +
          prefix +
          "end <gameCode>. For more details, see help end"
      );
    } else {
      // Create the Game
      let createGameSql = db.prepare('INSERT INTO Matches(mapName, mapCode, owner, gameMode, gameType, playerCount, team1Players, team2Players, team3Players, team4Players, gameStatus) VALUES(?, ?, ?, ?, ?, ?, ?, "[]", "[]", "[]", "CREATING")');
      var team1Players = [player];
      createGameSql.run(mapName, mapCode, player, gameMode, gameType, playerCount, JSON.stringify(team1Players));
      console.log("Created new match " + mapCode);

      message.channel.send(
        "Your Game is created successfully, please wait for others to join your game."
      );
    }
  }
  
  if (command === "games") {
    const mapName = args[0] && args[0] !== "any" ? args[0] : "%";
    const gameType = args[1] && args[1] !== "any" ? args[1] : "%";
    const gameMode = args[2] && args[2] !== "any" ? args[2] : "%";
    const playerCount = args[3] && args[3] !== "any" ? parseInt(args[3]) : "%";
    
    
    if ((isNaN(playerCount) && (playerCount < 2 || playerCount > 4)) && playerCount !== "%") {
      message.channel.send(
        "You must provide a player count between 2 to 4. For more details, see " +
          prefix +
          "help games"
      );
      return;
    }

    if (gameMode !== "ranked" && gameMode !== "unranked" && gameMode !== "%") {
      message.channel.send(
        "You must provide a valid game mode. For more details, see " +
          prefix +
          "help games"
      );
      return;
    }

    if (gameType !== "sync" && gameType !== "async" && gameType !== "%") {
      message.channel.send(
        "You must provide a valid game type. For more details, see " +
          prefix +
          "help games"
      );
      return;
    }
    
    let getGamesSql = db.prepare('SELECT * FROM Matches WHERE mapName like ? AND gameType like ? AND gameMode like ? AND playerCount like ? AND gameStatus = "CREATING"');
    let getPlayerSql = db.prepare('SELECT * FROM Players WHERE player = ?');
    
    var gameRows = getGamesSql.all(mapName, gameType, gameMode, playerCount);
    
    gameRows.forEach((row) => {
      
      var availGame = "```css\n" + row.mapName + " - " + row.mapCode + " - " + row.gameMode + " - " + row.gameType + " - players: " + row.playerCount;

      var team1 = JSON.parse(row.team1Players);
      if (team1.length > 0) {
        availGame += "\nTeam 1:"
      }
      team1.forEach(function (player, index) {
        var playerRow = getPlayerSql.get(player);
        availGame += "\n" + cupid.users.find(playerObject => playerObject.id == playerRow.player).tag;

        if (row.playerCount === 4) {
          availGame += ": " + playerRow.elo2;
        } else if (row.playerCount === 2) {
          availGame += ": " + playerRow.elo1;
        }
      });

      var team2 = JSON.parse(row.team2Players);
      if (team2.length > 0) {
        availGame += "\nTeam 2:"
      }
      team2.forEach(function (player, index) {
        var playerRow = getPlayerSql.get(player);
        availGame += "\n" + cupid.users.find(playerObject => playerObject.id == playerRow.player).tag;

        if (row.playerCount === 4) {
          availGame += ": " + playerRow.elo2;
        } else if (row.playerCount === 2) {
          availGame += ": " + playerRow.elo1;
        }
      });
      
       var team3 = JSON.parse(row.team3Players);
      if (team3.length > 0) {
        availGame += "\nTeam 3:"
      }
      team3.forEach(function (player, index) {
        var playerRow = getPlayerSql.get(player);
        availGame += "\n" + cupid.users.find(playerObject => playerObject.id == playerRow.player).tag;

        if (row.playerCount === 4) {
          availGame += ": " + playerRow.elo2;
        } else if (row.playerCount === 2) {
          availGame += ": " + playerRow.elo1;
        }
      });
      
      var team4 = JSON.parse(row.team4Players);
      if (team4.length > 0) {
        availGame += "\nTeam 4:"
      }
      team4.forEach(function (player, index) {
        var playerRow = getPlayerSql.get(player);
        availGame += "\n" + cupid.users.find(playerObject => playerObject.id == playerRow.player).tag;

        if (row.playerCount === 4) {
          availGame += ": " + playerRow.elo2;
        } else if (row.playerCount === 2) {
          availGame += ": " + playerRow.elo1;
        }
      });
      
      availGame += "```";
      message.channel.send(availGame);
    });
  }
  
  if (command === "join") {
    const mapCode = args[0];
    const team = args[1] ? parseInt(args[1]) : 2;
    
    if (!mapCode || mapCode.length != 6) {
      message.channel.send(
        "You must provide a valid game code. For more details, see " +
          prefix +
          "help join"
      );
      return;
    }
    if (team < 1 || team > 4) {
      message.channel.send(
        "You must provide a valid team. For more details, see " +
          prefix +
          "help join"
      );
      return;
    }
    
    // Check if the person creating the game is in our database, if not, create the player
    let ownerExistSql = db.prepare('SELECT * FROM Players WHERE player = ?');
    const player = message.author.id
    const playerRow = ownerExistSql.get(player)
    if (!playerRow) {
      let newOwnerSql = db.prepare('INSERT INTO Players(player, elo1, elo2) VALUES(?, 1000, 1000)');
      newOwnerSql.run(player);
      console.log("Created new player " + player);
    } else {
      console.log(
        "Player Exists " +
          playerRow.player +
          ", 1vs1 elo: " +
          playerRow.elo1 +
          ", 2vs2 elo: " +
          playerRow.elo2
      );
    }
    
    let getMatchSql = db.prepare('SELECT * FROM Matches WHERE mapCode = ?');
    let updateMatchSql = db.prepare('UPDATE Matches SET team1Players = ?, team2Players = ?, team3Players = ?, team4Players = ?, gameStatus = ? WHERE mapCode = ?');
    
    var targetMatch = getMatchSql.get(mapCode);
    
    if (targetMatch) {
      var team1 = JSON.parse(targetMatch.team1Players);
      var team2 = JSON.parse(targetMatch.team2Players);
      var team3 = JSON.parse(targetMatch.team3Players);
      var team4 = JSON.parse(targetMatch.team4Players);
      
      if (team1.includes(message.author.id) || team2.includes(message.author.id) || team3.includes(message.author.id) || team4.includes(message.author.id)) {
        message.channel.send("<@" + message.author.id + "> you are already in this game!")
        return;
      }
      
      message.channel.send("```" + message.author.username + " has joined the game " + mapCode + "```");
      
      
      if (team === 1) {
        team1.push(message.author.id);
      } else if (team === 2) {
        team2.push(message.author.id);
      } else if (team === 3) {
        team3.push(message.author.id);
      } else if (team === 4) {
        team4.push(message.author.id);
      }
      
      var totalPlayers = team1.length + team2.length + team3.length + team4.length;
      var gameStatus = targetMatch.gameStatus;
      if (totalPlayers == targetMatch.playerCount) {
        gameStatus = "STARTED";
        var startMessage = "";
        team1.forEach(function (playerId, index) {
          let player = cupid.users.find(playerObject => playerObject.id == playerId);
          startMessage += "<@" + player.id + ">"
        });
        team2.forEach(function (playerId, index) {
          let player = cupid.users.find(playerObject => playerObject.id == playerId);
          startMessage += "<@" + player.id + ">"
        });
        team3.forEach(function (playerId, index) {
          let player = cupid.users.find(playerObject => playerObject.id == playerId);
          startMessage += "<@" + player.id + ">"
        });
        team4.forEach(function (playerId, index) {
          let player = cupid.users.find(playerObject => playerObject.id == playerId);
          startMessage += "<@" + player.id + ">"
        });
        startMessage += " your game is ready on the map **" + targetMatch.mapName + "** with the match code: **" + targetMatch.mapCode + "**";
        message.channel.send(startMessage);
      }
      
      updateMatchSql.run(JSON.stringify(team1), JSON.stringify(team2), JSON.stringify(team3), JSON.stringify(team4), gameStatus, mapCode);
      
    }
  }
  
  
});

cupid.login(process.env.TOKEN);

// Ping ourself once every 5 minut to keep alive
app.get("/", (request, response) => {
  console.log(Date.now() + " Ping Received");
  response.sendStatus(200);
});

app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);
