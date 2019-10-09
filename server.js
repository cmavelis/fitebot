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

    db.run("CREATE TABLE Matches (mapName TEXT, mapCode TEXT, gameMode TEXT, gameType TEXT, playerCount INT, team1Players TEXT, team2Players TEXT, team3Players TEXT, team4Players TEXT ,gameStatus TEXT)");
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
    const playerCount = args[3] ? args[3] : 2;
    const gameType = args[4] ? args[4] : "sync";
    const player = message.author;
    
    if (!mapName || !mapCode) {
      message.channel.send("You must provide a mapName and a mapCode. For more details, see " + prefix + "help create");
    }
    
    if (playerCount)
    
    
    console.log(gameMode)
    
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