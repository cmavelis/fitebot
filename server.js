// server.js
// where your node app starts

// init discord bot and http express
const Discord = require('discord.js');
const cupid = new Discord.Client();
const http = require('http');
const express = require('express');
const app = express();


// init sqlite db
var fs = require("fs");
var dbFile = "./.data/sqlite.db";
var exists = fs.existsSync(dbFile);
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(dbFile);

// if ./.data/sqlite.db does not exist, create it, otherwise print records to console
db.serialize(function() {
  if (!exists) {
    db.run("CREATE TABLE Players (player TEXT, elo1 INT, elo2 INT)");
    console.log("New table players created!");

    db.run("CREATE TABLE Matches (mapName TEXT, mapCode TEXT, owner TEXT, gameMode TEXT, gameType TEXT, playerCount INT, team1Players TEXT, team2Players TEXT, team3Players TEXT, team4Players TEXT, gameStatus TEXT)");
    console.log("New table matches createds!");
  } else {
    console.log('Database "Cupid" ready to go!');
    db.each("SELECT * from Players", function(err, row) {
      if (row) {
        console.log("record:", row);
      }
    });
  }
});

var prefix = "$";

// 'client.on('message')' commands are triggered when the
// specified message is read in a text channel that the bot is in.

cupid.on('message', async message => {
  
  // If it's not the prefix, ignore it
  if(message.content.indexOf(prefix) !== 0) return;
  // Figure out the command and the arguement
  const args = message.content.slice(1).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  
  if (command === 'ping') {
    const m = await message.channel.send("Ping?");
    m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(cupid.ping)}ms`);
  }
  
  if (command === 'term') {
    message.channel.send("Here are the common terms: https://youtu.be/OLnnjEEjDlE");
  }
  
  if (command === 'create') {
    const mapName = args[0];
    const mapCode = args[1];
    const gameMode = args[2] ? args[2] : "ranked";
    const playerCount = args[3] ? parseInt(args[3]) : 2;
    const gameType = args[4] ? args[4] : "sync";
    const player = message.author.tag;
    
    if (!mapName || !mapCode) {
      message.channel.send("You must provide a mapName and a mapCode. For more details, see " + prefix + "help create");
      return;
    }
    
    if (mapCode.length != 6 ) {
      message.channel.send("You must provide a map code that is 6 characters. For more details, see " + prefix + "help create");
      return;
    } 
    
    if (playerCount < 2 || playerCount > 4 ) {
      message.channel.send("You must provide a player count between 2 to 4. For more details, see " + prefix + "help create");
      return;
    }
    
    if (gameMode !== "ranked" && gameMode !== "unranked" ) {
      message.channel.send("You must provide a valid game mode. For more details, see " + prefix + "help create");
      return;
    } 
    
    if (gameType !== "sync" && gameMode !== "async" ) {
      message.channel.send("You must provide a valid game type. For more details, see " + prefix + "help create");
      return;
    }
    
    
    // Check if the person creating the game is in our database, if not, create the player
    let ownerExistSql = "SELECT * FROM Players WHERE player = ?";
    
    db.get(ownerExistSql, [player], (err, row) => {
      if (err) {
        return console.error(err.message);
      }
      if (!row) {
        let newOwnerSql = "INSERT INTO Players(player, elo1, elo2) VALUES(?, 1000, 1000)";
        db.run(newOwnerSql, [player], function(err) {
          if (err) {
            return console.error(err.message);
          }
          console.log("Created new player " + player);
        });
      } else {
          console.log("Player Exists " + row.player + ", 1vs1 elo: " + row.elo1 + ", 2vs2 elo: " + row.elo2);
      }
    });
    
    // Check if the game exists
    let gameExistSql = "SELECT * FROM Matches WHERE mapCode = ?";
    db.get(ownerExistSql, [mapCode], (err, row) => {
      if (err) {
        return console.error(err.message);
      }
      if (row) {
        message.channel.send("Game already created. To close a game, use " + prefix + "end <gameCode>. For more details, see help end");
        return;
      }
    });
    
    // Create the Game
    let createGameSql = `INSERT INTO Matches(mapName, mapCode, owner, gameMode, gameType, playerCount, team1Players, team2Players, team3Players, team4Players, gameStatus) VALUES(?, ?, ?, ?, ?, ?, ?, "", "", "", CREATING)`;
    var team1Players = [player];
    db.run(createGameSql, [mapName, mapCode, player, gameMode, gameType, playerCount, team1Players], function(err) {
      if (err) {
        return console.error(err.message);
      }
      console.log("Created new match " + mapCode)
      
      
      message.channel.send("Your Game is created successfully,  " + prefix + "end <gameCode>. For more details, see help end");
    });
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