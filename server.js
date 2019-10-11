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
    "CREATE TABLE Matches (mapName TEXT, mapCode TEXT, owner TEXT, gameMode TEXT, gameType TEXT, playerCount TEXT, team1Players TEXT, team2Players TEXT, team3Players TEXT, team4Players TEXT, gameStatus TEXT)"
  );
  console.log("New table matches created!");
  
  db.exec(
    "CREATE TABLE Maps (mapName TEXT, mapCode TEXT, owner TEXT, playerCount TEXT, rating INT, ratingCount INT, officialRating TEXT)"
  );
  console.log("New table Maps created!");
} else {
  console.log('Database "Cupid" ready to go!');
}

var prefix = "$";
var oneRole = "LFM";
var twoRole = "LFM 2v2";

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
  
  if (command === "help") {
    if (args.length == 0) {
      const embed = {
        "description": "Hello there! This bot is used to faciliate matchmaking process and track player elo. Please see below for the available commands.\n\nI am currently under development. If you have encountered any errors, please ping @Ophelia#1413",
        "color": 7647991,
        "footer": {
          "text": "Type $help <command> for more info on a command."
        },
        "author": {
          "name": "Cupid Help Manual",
          "icon_url": "https://cdn.discordapp.com/avatars/631316790101803028/d81b4a5ef1cfe2c2c1991636dce2cc48.png"
        },
        "fields": [
          {
            "name": "`$help`",
            "value": "Shows this help message"
          },
          {
            "name": "`$ping`",
            "value": "replys pong and the bot latency"
          },
          {
            "name": "`$coin`",
            "value": "Flips a coin. Could be heads or tails"
          },
          {
            "name": "`$terms`",
            "value": "Link to a common wargroove terms video"
          },
          {
            "name": "`$elo`",
            "value": "Shows a player's current 1vs1 and 2vs2 elo"
          },
          {
            "name": "`$create`",
            "value": "Creates a new game"
          },
          {
            "name": "`$games`",
            "value": "Lists all games that are looking for more players"
          },
          {
            "name": "`$ongoing`",
            "value": "Lists all games that have been filled and is currently in session"
          },
          {
            "name": "`$join`",
            "value": "Joins a game"
          },
          {
            "name": "`$swap`",
            "value": "Swaps to a different team in a selected match"
          },
          {
            "name": "`$leave`",
            "value": "Leave a selected match"
          },
          {
            "name": "`$match`",
            "value": "Displays the details of a particular match"
          },
          {
            "name": "`$conclude`",
            "value": "Ends a match and updates player elo if it's a ranked 1vs1 game or ranked 2vs2 game based on the match result"
          }
        ]
      };
      message.channel.send({ embed });
      return;
    }
    
    if (args[0] === "help") {
      const embed = {
        "color": 7647991,
        "author": {
          "name": "Cupid Help Manual",
          "icon_url": "https://cdn.discordapp.com/avatars/631316790101803028/d81b4a5ef1cfe2c2c1991636dce2cc48.png"
        },
        "fields": [
          {
            "name": "Syntax",
            "value": "$help [command]"
          },
          {
            "name": "Description",
            "value": "Displays manual on how to use the bot"
          },
          {
            "name": "Arguments",
            "value": "__**command**__(optional): If an command is provided, it will provide instructions on how to use that command"
          }
        ]
      };
      message.channel.send({ embed });
    } else if (args[0] === "ping") {
      const embed = {
        "color": 7647991,
        "author": {
          "name": "Cupid Help Manual",
          "icon_url": "https://cdn.discordapp.com/avatars/631316790101803028/d81b4a5ef1cfe2c2c1991636dce2cc48.png"
        },
        "fields": [
          {
            "name": "Syntax",
            "value": "$ping"
          },
          {
            "name": "Description",
            "value": "Replys \"Pong\" and the latency to reply"
          },
          {
            "name": "Arguments",
            "value": "None"
          }
        ]
      };
      message.channel.send({ embed });
    } else if (args[0] === "coin") {
      const embed = {
        "color": 7647991,
        "author": {
          "name": "Cupid Help Manual",
          "icon_url": "https://cdn.discordapp.com/avatars/631316790101803028/d81b4a5ef1cfe2c2c1991636dce2cc48.png"
        },
        "fields": [
          {
            "name": "Syntax",
            "value": "$coin"
          },
          {
            "name": "Description",
            "value": "Tosses a coin, the result will either be heads or tails"
          },
          {
            "name": "Arguments",
            "value": "None"
          }
        ]
      };
      message.channel.send({ embed });
    } else if (args[0] === "terms") {
      const embed = {
        "color": 7647991,
        "author": {
          "name": "Cupid Help Manual",
          "icon_url": "https://cdn.discordapp.com/avatars/631316790101803028/d81b4a5ef1cfe2c2c1991636dce2cc48.png"
        },
        "fields": [
          {
            "name": "Syntax",
            "value": "$terms"
          },
          {
            "name": "Description",
            "value": "Replies with the Competitive Wargroove Terms videos"
          },
          {
            "name": "Arguments",
            "value": "None"
          }
        ]
      };
      message.channel.send({ embed });
    } else if (args[0] === "elo") {
      const embed = {
        "color": 7647991,
        "author": {
          "name": "Cupid Help Manual",
          "icon_url": "https://cdn.discordapp.com/avatars/631316790101803028/d81b4a5ef1cfe2c2c1991636dce2cc48.png"
        },
        "fields": [
          {
            "name": "Syntax",
            "value": "$elo [player]"
          },
          {
            "name": "Description",
            "value": "Replies with your current 1vs1 elo and your 2vs2 elo"
          },
          {
            "name": "Arguments",
            "value": "__**player**__(optional): If a player is provided, then it will reply with the elo of that player"
          }
        ]
      };
      message.channel.send({ embed });
    } else if (args[0] === "create") {
      const embed = {
        "color": 7647991,
        "author": {
          "name": "Cupid Help Manual",
          "icon_url": "https://cdn.discordapp.com/avatars/631316790101803028/d81b4a5ef1cfe2c2c1991636dce2cc48.png"
        },
        "fields": [
          {
            "name": "Syntax",
            "value": "$create [map name] [match code] [game mode] [player count] [game type]"
          },
          {
            "name": "Description",
            "value": "Creates a new game in the database and ping @LFM if it's a synchronous game"
          },
          {
            "name": "Arguments",
            "value": "__**map name**__(required): Name of the map\n__**match code**__(required): The lobby code\n**game mode**(optional): ranked or unranked. Ranked mode will affect your elo after the game is over. Unranked will not. Defaults to Ranked mode\n__**player count**__(optional): Number of players that needs to join the game before the game will start. Can be 2, 3, or 4. Defaults to 2\n__**game type**__(optional): async or sync. Defaults to sync"
          }
        ]
      };
      message.channel.send({ embed });
    } else if (args[0] === "games") {
      const embed = {
        "color": 7647991,
        "author": {
          "name": "Cupid Help Manual",
          "icon_url": "https://cdn.discordapp.com/avatars/631316790101803028/d81b4a5ef1cfe2c2c1991636dce2cc48.png"
        },
        "fields": [
          {
            "name": "Syntax",
            "value": "$games [map name] [game type] [game mode] [player count] "
          },
          {
            "name": "Description",
            "value": "Searches for all available game that is looking for more players based on the options"
          },
          {
            "name": "Arguments",
            "value": "__**map name**__(optional): Name of the map. Defaults to any\n__**game type**__(optional): async or sync. Defaults to any\n__**game mode**__(optional): ranked or unranked. Defaults to any\n__**player count**__(optional): Number of players on the map. Can be 2, 3, or 4. Defaults to any"
          }
        ]
      };
      message.channel.send({ embed });
    } else if (args[0] === "ongoing") {
      const embed = {
        "color": 7647991,
        "author": {
          "name": "Cupid Help Manual",
          "icon_url": "https://cdn.discordapp.com/avatars/631316790101803028/d81b4a5ef1cfe2c2c1991636dce2cc48.png"
        },
        "fields": [
          {
            "name": "Syntax",
            "value": "$ongoing [map name] [game type] [game mode] [player count] "
          },
          {
            "name": "Description",
            "value": "Searches for all game that is currently filled and is being played"
          },
          {
            "name": "Arguments",
            "value": "__**map name**__(optional): Name of the map. Defaults to any\n__**game type**__(optional): async or sync. Defaults to any\n__**game mode**__(optional): ranked or unranked. Defaults to any\n__**player count**__(optional): Number of players on the map. Can be 2, 3, or 4. Defaults to any"
          }
        ]
      };
      message.channel.send({ embed });
    } else if (args[0] === "join") {
      const embed = {
        "color": 7647991,
        "author": {
          "name": "Cupid Help Manual",
          "icon_url": "https://cdn.discordapp.com/avatars/631316790101803028/d81b4a5ef1cfe2c2c1991636dce2cc48.png"
        },
        "fields": [
          {
            "name": "Syntax",
            "value": "$join [match code] [team] "
          },
          {
            "name": "Description",
            "value": "Joins an open game that is currently looking for more players"
          },
          {
            "name": "Arguments",
            "value": "__**match code**__(required): The lobby code of the game you want to join\n__**team**__(optional): The team you want to be on. Can be 1, 2, 3, or 4. Defaults to 2"
          }
        ]
      };
      message.channel.send({ embed });
    } else if (args[0] === "swap") {
      const embed = {
        "color": 7647991,
        "author": {
          "name": "Cupid Help Manual",
          "icon_url": "https://cdn.discordapp.com/avatars/631316790101803028/d81b4a5ef1cfe2c2c1991636dce2cc48.png"
        },
        "fields": [
          {
            "name": "Syntax",
            "value": "$swap [match code] [team] "
          },
          {
            "name": "Description",
            "value": "Swaps to a different team in a match you are in"
          },
          {
            "name": "Arguments",
            "value": "__**match code**__(required): The lobby code of the game you want to swap the team on\n__**team**__(optional): The team you want to be on. Can be 1, 2, 3, or 4. Defaults to 2"
          }
        ]
      };
      message.channel.send({ embed });
    } else if (args[0] === "leave") {
      const embed = {
        "color": 7647991,
        "author": {
          "name": "Cupid Help Manual",
          "icon_url": "https://cdn.discordapp.com/avatars/631316790101803028/d81b4a5ef1cfe2c2c1991636dce2cc48.png"
        },
        "fields": [
          {
            "name": "Syntax",
            "value": "$leave [match code]"
          },
          {
            "name": "Description",
            "value": "Leave a match. If you are the last person in the match before you leave, the match will be deleted after you leave"
          },
          {
            "name": "Arguments",
            "value": "__**match code**__(required): The lobby code of the game you want to leave from"
          }
        ]
      };
      message.channel.send({ embed });
    } else if (args[0] === "match") {
      const embed = {
        "color": 7647991,
        "author": {
          "name": "Cupid Help Manual",
          "icon_url": "https://cdn.discordapp.com/avatars/631316790101803028/d81b4a5ef1cfe2c2c1991636dce2cc48.png"
        },
        "fields": [
          {
            "name": "Syntax",
            "value": "$match [match code]"
          },
          {
            "name": "Description",
            "value": "Shows you the details of a particular match"
          },
          {
            "name": "Arguments",
            "value": "__**match code**__(required): The lobby code of the game you want more details on"
          }
        ]
      };
      message.channel.send({ embed });
    } else if (args[0] === "conclude") {
      const embed = {
        "color": 7647991,
        "author": {
          "name": "Cupid Help Manual",
          "icon_url": "https://cdn.discordapp.com/avatars/631316790101803028/d81b4a5ef1cfe2c2c1991636dce2cc48.png"
        },
        "fields": [
          {
            "name": "Syntax",
            "value": "$conclude [match code] [result] [team]"
          },
          {
            "name": "Description",
            "value": "Ends a match and updates the player elo if it's a valid ranked match"
          },
          {
            "name": "Arguments",
            "value": "__**match code**__(required): The lobby code of the game you want to end\n__**result**__(required): draw, abandon, or win. Abandon will not update the elo, draw and win will update player's elo accordingly\n__**team**__(required only if result is win): The team that won the game."
          }
        ]
      };
      message.channel.send({ embed });
    } else {
      message.channel.send("Invalid command recevied, please use " + prefix + "help to see available commands");
    }
    
    
  }

  if (command === "ping") {
    const m = await message.channel.send("Ping?");
    m.edit(
      `Pong! Latency is ${m.createdTimestamp -
        message.createdTimestamp}ms. API Latency is ${Math.round(cupid.ping)}ms`
    );
  }
  
  if (command === "setting") {
    if (!message.member.hasPermission('ADMINISTRATOR')) {
      message.channel.send("This is an admin only command");
      return;
    }
    
    const subSetting = args[0];
    if (!subSetting) {
      message.channel.send(
        "You must provide a setting name. For more details, see " +
          prefix +
          "help setting"
      );
      return;
    }
    
    if (subSetting === "prefix") {
      const newPrefix = args[1];
      if (!newPrefix) {
        message.channel.send(
          "You must provide a valid prefix. For more details, see " +
            prefix +
            "help setting prefix"
        );
        return;
      }
      
      prefix = newPrefix;
      message.channel.send(
        "Prefix for the bot commands have been changed to " + prefix
      );
      return;
      
    }
    
    if (subSetting === "1v1Role") {
      const newRole = args[1];
      if (!newRole) {
        message.channel.send(
          "You must provide a valid role. For more details, see " +
            prefix +
            "help setting 1v1Role"
        );
        return;
      }
      oneRole = newRole;
      message.channel.send(
        "1vs1 role have been set to " + oneRole
      );
    }
    
    if (subSetting === "2v2Role") {
      const newRole = args[1];
      if (!newRole) {
        message.channel.send(
          "You must provide a valid role. For more details, see " +
            prefix +
            "help setting 2v2Role"
        );
        return;
      }
      twoRole = newRole;
      message.channel.send(
        "2vs2 role have been set to " + twoRole
      );
    }
    
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
  
  if (command === "elo") {
    
    var player;
    
    if (args[0]) {
      var playerObj = cupid.users.find(playerObject => playerObject.tag == args[0]);
      if (playerObj) {
        player = playerObj.id;
      } else {
        message.channel.send(
          "player " + args[0] + " does not exist. Please check your spelling and try again"
        );
        return;
      }
    } else {
      player = message.author.id;
    }
    
    let getPlayerSql = db.prepare('SELECT * FROM Players WHERE player = ?');
    
    const playerRow = getPlayerSql.get(player)
    if (!playerRow) {
      let newOwnerSql = db.prepare('INSERT INTO Players(player, elo1, elo2) VALUES(?, 1000, 1000)');
      newOwnerSql.run(player);
      console.log("Created new player " + player);
      if (!args[0]) {
        message.channel.send(
          "<@" + player + "> Your 1vs1 ELO is 1000 and your 2vs2 ELO is 1000"
        );
      } else {
        message.channel.send(
          "<@" + message.author.id + "> " + args[0] + "'s 1vs1 ELO is 1000 and your 2vs2 ELO is 1000"
        );
      }
    } else {
      console.log(
        "Player Exists " +
          playerRow.player +
          ", 1vs1 elo: " +
          playerRow.elo1 +
          ", 2vs2 elo: " +
          playerRow.elo2
      );
      if (!args[0]) {
        message.channel.send(
          "<@" + player + "> Your 1vs1 ELO is " + Math.round(playerRow.elo1) + " and your 2vs2 ELO is " + Math.round(playerRow.elo2)
        );
      } else {
        message.channel.send(
          
          "<@" + message.author.id + "> "+ args[0] + "'s 1vs1 ELO is " + Math.round(playerRow.elo1) + " and your 2vs2 ELO is " + Math.round(playerRow.elo2)
        );
      }
    }
    
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
    let gameExistSql = db.prepare('SELECT * FROM Matches WHERE mapCode LIKE ?');
    const gameRow = gameExistSql.get(mapCode);
    if (gameRow) {
      message.channel.send(
        "Game already created. To leave a game, use " +
          prefix +
          "leave <gameCode>. For more details, see " + prefix + "help leave"
      );
    } else {
      // Create the Game
      let createGameSql = db.prepare('INSERT INTO Matches(mapName, mapCode, owner, gameMode, gameType, playerCount, team1Players, team2Players, team3Players, team4Players, gameStatus) VALUES(?, ?, ?, ?, ?, ?, ?, "[]", "[]", "[]", "CREATING")');
      var team1Players = [player];
      createGameSql.run(mapName, mapCode, player, gameMode, gameType, playerCount, JSON.stringify(team1Players));
      console.log("Created new match " + mapCode);
      
      var mentionRole;
      if (playerCount == 2 && gameType === "sync") {
        mentionRole = oneRole;
      } else if (playerCount == 4 && gameType === "sync") {
        mentionRole = twoRole;
      }
      
      var createMessage = "Your Game is created successfully, please wait for others to join your game.";
      if (mentionRole) {
        let actualRole = message.guild.roles.find(role => role.name === mentionRole);
        if (actualRole) {
          createMessage += "<@&" + actualRole.id + ">";
        }
      } 
      
      message.channel.send(createMessage);
    }
  }
  
  if (command === "match") {
    const mapCode = args[0];
    
    if (!mapCode || mapCode.length != 6) {
      message.channel.send(
        "You must provide a valid game code. For more details, see " +
          prefix +
          "help match"
      );
      return;
    }
    
    let getMatchSql = db.prepare('SELECT * FROM Matches WHERE mapCode LIKE ?');
    let getPlayerSql = db.prepare('SELECT * FROM Players WHERE player = ?');
    
    var targetMatch = getMatchSql.get(mapCode);
    
    if (targetMatch) {
      var team1 = JSON.parse(targetMatch.team1Players);
      var team2 = JSON.parse(targetMatch.team2Players);
      var team3 = JSON.parse(targetMatch.team3Players);
      var team4 = JSON.parse(targetMatch.team4Players);
      
      var gameStatus = targetMatch.gameStatus;
      
      var availGame = "```css\n" + targetMatch.mapName + " - " + targetMatch.mapCode + " - " + targetMatch.gameMode + " - " + targetMatch.gameType + " - players: " + Math.round(targetMatch.playerCount);

      var team1 = JSON.parse(targetMatch.team1Players);
      if (team1.length > 0) {
        availGame += "\nTeam 1:"
      }
      team1.forEach(function (player, index) {
        var playerRow = getPlayerSql.get(player);
        availGame += "\n" + cupid.users.find(playerObject => playerObject.id == playerRow.player).tag;

        if (parseInt(targetMatch.playerCount) === 4) {
          availGame += ": " + Math.round(playerRow.elo2);
        } else if (parseInt(targetMatch.playerCount) === 2) {
          availGame += ": " + Math.round(playerRow.elo1);
        }
      });

      var team2 = JSON.parse(targetMatch.team2Players);
      if (team2.length > 0) {
        availGame += "\nTeam 2:"
      }
      team2.forEach(function (player, index) {
        var playerRow = getPlayerSql.get(player);
        availGame += "\n" + cupid.users.find(playerObject => playerObject.id == playerRow.player).tag;

        if (parseInt(targetMatch.playerCount) === 4) {
          availGame += ": " + Math.round(playerRow.elo2);
        } else if (parseInt(targetMatch.playerCount) === 2) {
          availGame += ": " + Math.round(playerRow.elo1);
        }
      });
      
       var team3 = JSON.parse(targetMatch.team3Players);
      if (team3.length > 0) {
        availGame += "\nTeam 3:"
      }
      team3.forEach(function (player, index) {
        var playerRow = getPlayerSql.get(player);
        availGame += "\n" + cupid.users.find(playerObject => playerObject.id == playerRow.player).tag;

        if (parseInt(targetMatch.playerCount) === 4) {
          availGame += ": " + Math.round(playerRow.elo2);
        } else if (parseInt(targetMatch.playerCount) === 2) {
          availGame += ": " + Math.round(playerRow.elo1);
        }
      });
      
      var team4 = JSON.parse(targetMatch.team4Players);
      if (team4.length > 0) {
        availGame += "\nTeam 4:"
      }
      team4.forEach(function (player, index) {
        var playerRow = getPlayerSql.get(player);
        availGame += "\n" + cupid.users.find(playerObject => playerObject.id == playerRow.player).tag;

        if (parseInt(targetMatch.playerCount) === 4) {
          availGame += ": " + Math.round(playerRow.elo2);
        } else if (parseInt(targetMatch.playerCount) === 2) {
          availGame += ": " + Math.round(playerRow.elo1);
        }
      });
      availGame += "\nGame Status: " + gameStatus;
      availGame += "```";
      message.channel.send(availGame);
    } else {
      message.channel.send("<@" + message.author.id + "> the match code does not exist. Please try a different match. Use " + prefix + "join to join a game first")
    }
  }
  
  if (command === "ongoing") {
    const mapName = args[0] && args[0] !== "any" ? args[0] : "%";
    const gameType = args[1] && args[1] !== "any" ? args[1] : "%";
    const gameMode = args[2] && args[2] !== "any" ? args[2] : "%";
    const playerCount = args[3] && args[3] !== "any" ? parseInt(args[3]) : "%";
    
    if ((!isNaN(playerCount) && (playerCount < 2 || playerCount > 4)) || (isNaN(playerCount) && playerCount !== "%")) {
      message.channel.send(
        "You must provide a player count between 2 to 4. For more details, see " +
          prefix +
          "help ongoing"
      );
      return;
    }

    if (gameMode !== "ranked" && gameMode !== "unranked" && gameMode !== "%") {
      message.channel.send(
        "You must provide a valid game mode. For more details, see " +
          prefix +
          "help ongoing"
      );
      return;
    }

    if (gameType !== "sync" && gameType !== "async" && gameType !== "%") {
      message.channel.send(
        "You must provide a valid game type. For more details, see " +
          prefix +
          "help ongoing"
      );
      return;
    }
    
    let getGamesSql = db.prepare('SELECT * FROM Matches WHERE mapName like ? AND gameType like ? AND gameMode like ? AND playerCount like ? AND gameStatus = "STARTED"');
    let getPlayerSql = db.prepare('SELECT * FROM Players WHERE player = ?');
    
    var gameRows = getGamesSql.all(mapName, gameType, gameMode, playerCount);
    
    gameRows.forEach((row) => {
      
      var availGame = "```css\n" + row.mapName + " - " + row.mapCode + " - " + row.gameMode + " - " + row.gameType + " - players: " + Math.round(row.playerCount);

      var team1 = JSON.parse(row.team1Players);
      if (team1.length > 0) {
        availGame += "\nTeam 1:"
      }
      team1.forEach(function (player, index) {
        var playerRow = getPlayerSql.get(player);
        availGame += "\n" + cupid.users.find(playerObject => playerObject.id == playerRow.player).tag;

        if (parseInt(row.playerCount) === 4) {
          availGame += ": " + Math.round(playerRow.elo2);
        } else if (parseInt(row.playerCount) === 2) {
          availGame += ": " + Math.round(playerRow.elo1);
        }
      });

      var team2 = JSON.parse(row.team2Players);
      if (team2.length > 0) {
        availGame += "\nTeam 2:"
      }
      team2.forEach(function (player, index) {
        var playerRow = getPlayerSql.get(player);
        availGame += "\n" + cupid.users.find(playerObject => playerObject.id == playerRow.player).tag;

        if (parseInt(row.playerCount) === 4) {
          availGame += ": " + Math.round(playerRow.elo2);
        } else if (parseInt(row.playerCount) === 2) {
          availGame += ": " + Math.round(playerRow.elo1);
        }
      });
      
       var team3 = JSON.parse(row.team3Players);
      if (team3.length > 0) {
        availGame += "\nTeam 3:"
      }
      team3.forEach(function (player, index) {
        var playerRow = getPlayerSql.get(player);
        availGame += "\n" + cupid.users.find(playerObject => playerObject.id == playerRow.player).tag;

        if (parseInt(row.playerCount) === 4) {
          availGame += ": " + Math.round(playerRow.elo2);
        } else if (parseInt(row.playerCount) === 2) {
          availGame += ": " + Math.round(playerRow.elo1);
        }
      });
      
      var team4 = JSON.parse(row.team4Players);
      if (team4.length > 0) {
        availGame += "\nTeam 4:"
      }
      team4.forEach(function (player, index) {
        var playerRow = getPlayerSql.get(player);
        availGame += "\n" + cupid.users.find(playerObject => playerObject.id == playerRow.player).tag;

        if (parseInt(row.playerCount) === 4) {
          availGame += ": " + Math.round(playerRow.elo2);
        } else if (parseInt(row.playerCount) === 2) {
          availGame += ": " + Math.round(playerRow.elo1);
        }
      });
      
      availGame += "```";
      message.channel.send(availGame);
    });
  }
  
  if (command === "games") {
    const mapName = args[0] && args[0] !== "any" ? args[0] : "%";
    const gameType = args[1] && args[1] !== "any" ? args[1] : "%";
    const gameMode = args[2] && args[2] !== "any" ? args[2] : "%";
    const playerCount = args[3] && args[3] !== "any" ? parseInt(args[3]) : "%";
    
    if ((!isNaN(playerCount) && (playerCount < 2 || playerCount > 4)) || (isNaN(playerCount) && playerCount !== "%")) {
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
      
      var availGame = "```css\n" + row.mapName + " - " + row.mapCode + " - " + row.gameMode + " - " + row.gameType + " - players: " + Math.round(row.playerCount);

      var team1 = JSON.parse(row.team1Players);
      if (team1.length > 0) {
        availGame += "\nTeam 1:"
      }
      team1.forEach(function (player, index) {
        var playerRow = getPlayerSql.get(player);
        availGame += "\n" + cupid.users.find(playerObject => playerObject.id == playerRow.player).tag;

        if (parseInt(row.playerCount) === 4) {
          availGame += ": " + Math.round(playerRow.elo2);
        } else if (parseInt(row.playerCount) === 2) {
          availGame += ": " + Math.round(playerRow.elo1);
        }
      });

      var team2 = JSON.parse(row.team2Players);
      if (team2.length > 0) {
        availGame += "\nTeam 2:"
      }
      team2.forEach(function (player, index) {
        var playerRow = getPlayerSql.get(player);
        availGame += "\n" + cupid.users.find(playerObject => playerObject.id == playerRow.player).tag;

        if (parseInt(row.playerCount) === 4) {
          availGame += ": " + Math.round(playerRow.elo2);
        } else if (parseInt(row.playerCount) === 2) {
          availGame += ": " + Math.round(playerRow.elo1);
        }
      });
      
       var team3 = JSON.parse(row.team3Players);
      if (team3.length > 0) {
        availGame += "\nTeam 3:"
      }
      team3.forEach(function (player, index) {
        var playerRow = getPlayerSql.get(player);
        availGame += "\n" + cupid.users.find(playerObject => playerObject.id == playerRow.player).tag;

        if (parseInt(row.playerCount) === 4) {
          availGame += ": " + Math.round(playerRow.elo2);
        } else if (parseInt(row.playerCount) === 2) {
          availGame += ": " + Math.round(playerRow.elo1);
        }
      });
      
      var team4 = JSON.parse(row.team4Players);
      if (team4.length > 0) {
        availGame += "\nTeam 4:"
      }
      team4.forEach(function (player, index) {
        var playerRow = getPlayerSql.get(player);
        availGame += "\n" + cupid.users.find(playerObject => playerObject.id == playerRow.player).tag;

        if (parseInt(row.playerCount) === 4) {
          availGame += ": " + Math.round(playerRow.elo2);
        } else if (parseInt(row.playerCount) === 2) {
          availGame += ": " + Math.round(playerRow.elo1);
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
    
    let getMatchSql = db.prepare('SELECT * FROM Matches WHERE mapCode LIKE ?');
    let updateMatchSql = db.prepare('UPDATE Matches SET team1Players = ?, team2Players = ?, team3Players = ?, team4Players = ?, gameStatus = ? WHERE mapCode LIKE ?');
    
    var targetMatch = getMatchSql.get(mapCode);
    
    if (targetMatch) {
      var team1 = JSON.parse(targetMatch.team1Players);
      var team2 = JSON.parse(targetMatch.team2Players);
      var team3 = JSON.parse(targetMatch.team3Players);
      var team4 = JSON.parse(targetMatch.team4Players);
      
      if (team1.length + team2.length + team3.length + team4.length >= targetMatch.playerCount) {
        message.channel.send("<@" + message.author.id + "> you are attempting to join a full game! Please try a different game.")
        return;
      }
      
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
      
    } else {
      message.channel.send("<@" + message.author.id + "> the match code does not exist. Please try a different match. " + prefix + "join to join a game first")
    }
  }
  
  if (command === "swap" || command === "swapTeam") {
    const mapCode = args[0];
    const team = args[1] ? parseInt(args[1]) : 2;
    
    if (!mapCode || mapCode.length != 6) {
      message.channel.send(
        "You must provide a valid game code. For more details, see " +
          prefix +
          "help swap"
      );
      return;
    }
    if (team < 1 || team > 4) {
      message.channel.send(
        "You must provide a valid team bewteen 1 to 4. For more details, see " +
          prefix +
          "help swap"
      );
      return;
    }
    
    
    let getMatchSql = db.prepare('SELECT * FROM Matches WHERE mapCode LIKE ?');
    let updateMatchSql = db.prepare('UPDATE Matches SET team1Players = ?, team2Players = ?, team3Players = ?, team4Players = ? WHERE mapCode LIKE ?');
    
    var targetMatch = getMatchSql.get(mapCode);
    
    if (targetMatch) {
      var team1 = JSON.parse(targetMatch.team1Players);
      var team2 = JSON.parse(targetMatch.team2Players);
      var team3 = JSON.parse(targetMatch.team3Players);
      var team4 = JSON.parse(targetMatch.team4Players);
      
      if (!team1.includes(message.author.id) && !team2.includes(message.author.id) && !team3.includes(message.author.id) && !team4.includes(message.author.id)) {
        message.channel.send("<@" + message.author.id + "> you are not in this game! Please use " + prefix + "join to join a game first")
        return;
      }
      
      message.channel.send("```" + message.author.username + " has swapped to team " + team + " in the game " + mapCode + "```");
      
      const team1Index = team1.findIndex(x => x === message.author.id);
      if (team1Index >= 0) team1.splice(team1Index, 1);      
      const team2Index = team2.findIndex(x => x === message.author.id);
      if (team2Index >= 0) team2.splice(team2Index, 1);      
      const team3Index = team3.findIndex(x => x === message.author.id);
      if (team3Index >= 0) team3.splice(team3Index, 1);      
      const team4Index = team4.findIndex(x => x === message.author.id);
      if (team4Index >= 0) team4.splice(team4Index, 1);
      
      if (team === 1) {
        team1.push(message.author.id);
      } else if (team === 2) {
        team2.push(message.author.id);
      } else if (team === 3) {
        team3.push(message.author.id);
      } else if (team === 4) {
        team4.push(message.author.id);
      }
      
      updateMatchSql.run(JSON.stringify(team1), JSON.stringify(team2), JSON.stringify(team3), JSON.stringify(team4), mapCode);
      
    } else {
      message.channel.send("<@" + message.author.id + "> the match code does not exist. Please try a different match.")
    }
  } 
  
  if (command === "leave") {
    const mapCode = args[0];
    
    if (!mapCode || mapCode.length != 6) {
      message.channel.send(
        "You must provide a valid game code. For more details, see " +
          prefix +
          "help leave"
      );
      return;
    }
    
    let getMatchSql = db.prepare('SELECT * FROM Matches WHERE mapCode LIKE ?');
    
    var targetMatch = getMatchSql.get(mapCode);
    
    if (targetMatch) {
      if (targetMatch.gameStatus == "STARTED") {
        message.channel.send("<@" + message.author.id + "> the match is currently in session. Please use " + prefix + "conclude to end the game.");
        return;
      }
      
      var team1 = JSON.parse(targetMatch.team1Players);
      var team2 = JSON.parse(targetMatch.team2Players);
      var team3 = JSON.parse(targetMatch.team3Players);
      var team4 = JSON.parse(targetMatch.team4Players);
      
      if (!team1.includes(message.author.id) && !team2.includes(message.author.id) && !team3.includes(message.author.id) && !team4.includes(message.author.id)) {
        message.channel.send("<@" + message.author.id + "> you are not in this game!")
        return;
      }
      
      message.channel.send("```" + message.author.username + " has left the game " + mapCode + ".```");
      
      const team1Index = team1.findIndex(x => x === message.author.id);
      if (team1Index >= 0) team1.splice(team1Index, 1);      
      const team2Index = team2.findIndex(x => x === message.author.id);
      if (team2Index >= 0) team2.splice(team2Index, 1);      
      const team3Index = team3.findIndex(x => x === message.author.id);
      if (team3Index >= 0) team3.splice(team3Index, 1);      
      const team4Index = team4.findIndex(x => x === message.author.id);
      if (team4Index >= 0) team4.splice(team4Index, 1);
      
      if (team1.length == 0 && team2.length == 0 && team3.length == 0 && team4.length == 0) {
        message.channel.send("```All players have left the game " + mapCode + ". The game will be deleted```");
        let deleteMatchSql = db.prepare('DELETE FROM matches WHERE mapCode LIKE ?');
        deleteMatchSql.run(mapCode);
      } else {  
        let updateMatchSql = db.prepare('UPDATE Matches SET team1Players = ?, team2Players = ?, team3Players = ?, team4Players = ? WHERE mapCode LIKE ?');
        updateMatchSql.run(JSON.stringify(team1), JSON.stringify(team2), JSON.stringify(team3), JSON.stringify(team4), mapCode);
      }
      
    } else {
      message.channel.send("<@" + message.author.id + "> the match code does not exist. Please try a different match.");
    }
    
  }
  
  if (command === "conclude") {
    const mapCode = args[0];
    const result = args[1];
    const team = args[2];
    
    if (!mapCode || mapCode.length != 6) {
      message.channel.send(
        "You must provide a valid game code. For more details, see " +
          prefix +
          "help conclude"
      );
      return;
    }
    
    
    if (result !== "win" && result !== "draw" && result !== "abandon") {
      message.channel.send(
        "You must provide a valid result between \"win\" and \"draw\", see " +
          prefix +
          "help conclude"
      );
      return;
    }
    
    if (team !== "1" && team !== "2" && team !== "3" && team !== "4" && result === "win") {
      message.channel.send(
        "You must provide a valid team between 1 to 4. For more details, see " +
          prefix +
          "help conclude"
      );
      return;
    }
    
    let getMatchSql = db.prepare('SELECT * FROM Matches WHERE mapCode LIKE ?');
    let getPlayerSql = db.prepare('SELECT * FROM Players WHERE player = ?');
    let updatePlayerELO1Sql = db.prepare('UPDATE Players SET elo1 = ? WHERE player = ?');
    let updatePlayerELO2Sql = db.prepare('UPDATE Players SET elo2 = ? WHERE player = ?');
    
    var targetMatch = getMatchSql.get(mapCode);
    
    if (targetMatch) {
      let deleteMatchSql = db.prepare('DELETE FROM matches WHERE mapCode LIKE ?');
      deleteMatchSql.run(mapCode);
      
      if (targetMatch.gameMode === "unranked") {
        message.channel.send("concluded an unranked game " + mapCode);
        return;
      }
      
      if (result === "abandon") {
        message.channel.send(
          "The match " + mapCode + " was abandoned, no elo changes will be applied"
        );
        return;
      }
      
      var team1 = JSON.parse(targetMatch.team1Players);
      var team2 = JSON.parse(targetMatch.team2Players);
      var team3 = JSON.parse(targetMatch.team3Players);
      var team4 = JSON.parse(targetMatch.team4Players);
      
      if (!team1.includes(message.author.id) && !team2.includes(message.author.id) && !team2.includes(message.author.id) && !team2.includes(message.author.id) && !message.member.hasPermission('ADMINISTRATOR')) {
        message.channel.send(
          "<@" + message.author.id + "> The match can only be ended by the players or an admin. You don't have permission to end this match."
        );
        return;
      }
      
      if (team1.length + team2.length + team3.length + team4.length == 3) {
        message.channel.send(
          "The match " + mapCode + " was a 3 player map. No elo will be updated for this type of games."
        );
        return;
      }
      
      if (team1.length + team2.length + team3.length + team4.length == 4) {
        var winner;
        var loser;
        
        if (result === "win" && team === "1") {
          winner = team1;
          loser = team2.length > 0 ? team2 : team3.length > 0 ? team3 : team4;
        } else if (result === "win" && team === "2") {
          winner = team2;
          loser = team1.length > 0 ? team1 : team3.length > 0 ? team3 : team4;
        } else if (result === "win" && team === "3") {
          winner = team3;
          loser = team1.length > 0 ? team1 : team2.length > 0 ? team2 : team4;
        } else if (result === "win" && team === "4") {
          winner = team4;
          loser = team1.length > 0 ? team1 : team2.length > 0 ? team2 : team3;
        } else {
          winner = team1.length == 2 ? team1 : team2.length == 2 ? team2 : team3;
          loser = team4.length == 2 ? team4 : team3.length == 2 ? team3 : team2;
        }
        
        if (winner.length != 2 && winner.length != 2) {
          message.channel.send(
            "The match " + mapCode + " was a not a 2v2 game. No elo will be updated for this type of games."
          );
          return;
        }
        
        var winner1 = winner.pop();
        var winner2 = winner.pop();
        var loser1 = loser.pop();
        var loser2 = loser.pop();
        
        
        let player1Name = cupid.users.find(playerObject => playerObject.id == winner1).username;
        let player2Name = cupid.users.find(playerObject => playerObject.id == winner2).username;
        let player3Name = cupid.users.find(playerObject => playerObject.id == loser1).username;
        let player4Name = cupid.users.find(playerObject => playerObject.id == loser2).username;
        
        var w1Data = getPlayerSql.get(winner1);
        var w2Data = getPlayerSql.get(winner2);
        var l1Data = getPlayerSql.get(loser1);
        var l2Data = getPlayerSql.get(loser2);
        
        var team1Avg = (w1Data.elo2 + w2Data.elo2)/2;
        var team2Avg = (l1Data.elo2 + l2Data.elo2)/2
        
        var r1 = Math.pow(10, team1Avg / 400);
        var r2 = Math.pow(10, team2Avg / 400);
        
        var e1 = r1 / (r1 + r2);
        var e2 = r2 / (r1 + r2);
        
        var s1;
        var s2;
        if (result == "win") {
          s1 = 1;
          s2 = 0;
        } else {
          s1 = 0.5;
          s2 = 0.5;
        }
        var winnderDiff = 32 * (s1 - e1);
        var loserDiff = 32 * (s2 - e2);
        var newr1 = w1Data.elo1 + 32 * (s1 - e1);
        var newr2 = w2Data.elo1 + 32 * (s1 - e2);
        var newr3 = l1Data.elo1 + 32 * (s2 - e2);
        var newr4 = l2Data.elo1 + 32 * (s2 - e2);
        updatePlayerELO1Sql.run(newr1, winner1);
        updatePlayerELO1Sql.run(newr2, winner2);
        updatePlayerELO1Sql.run(newr3, loser1);
        updatePlayerELO1Sql.run(newr4, loser1);
        
        message.channel.send(
          "```The match " + mapCode + " is completed.\nELO changes:\n\n" +
          player1Name + ": " + Math.round(winnderDiff) + "\n" +
          player2Name + ": " + Math.round(winnderDiff) + "\n" +
          player3Name + ": " + Math.round(loserDiff) + "\n" +
          player4Name + ": " + Math.round(loserDiff) + "\n\n" +
          "Please use " + prefix + "elo to check your new elo```"
        );
        return;
        
      }
      
      if (team1.length + team2.length + team3.length + team4.length == 2 && team1.length <= 1 && team2.length <= 1 && team3.length <= 1 && team4.length <= 1) {
        var winner;
        var loser;
        if (result === "win" && team === "1") {
          winner = team1.pop();
          loser = team2.length > 0 ? team2.pop() : team3.length > 0 ? team3.pop() : team4.pop();
        } else if (result === "win" && team === "2") {
          winner = team2.pop();
          loser = team1.length > 0 ? team1.pop() : team3.length > 0 ? team3.pop() : team4.pop();
        } else if (result === "win" && team === "3") {
          winner = team3.pop();
          loser = team1.length > 0 ? team1.pop() : team2.length > 0 ? team2.pop() : team4.pop();
        } else if (result === "win" && team === "4") {
          winner = team4.pop();
          loser = team1.length > 0 ? team1.pop() : team2.length > 0 ? team2.pop() : team3.pop();
        } else {
          winner = team1.length == 1 ? team1.pop() : team2.length == 1 ? team2.pop() : team3.pop();
          loser = team4.length == 1 ? team4.pop() : team3.length == 1 ? team3.pop() : team2.pop();
        }
        
        var wData = getPlayerSql.get(winner);
        var lData = getPlayerSql.get(loser);
        
        let player1Name = cupid.users.find(playerObject => playerObject.id == winner).username;
        let player2Name = cupid.users.find(playerObject => playerObject.id == loser).username;
        
        var r1 = Math.pow(10, wData.elo1 / 400);
        var r2 = Math.pow(10, lData.elo1 / 400);
        
        var e1 = r1 / (r1 + r2);
        var e2 = r2 / (r1 + r2);
        
        var s1;
        var s2;
        if (result == "win") {
          s1 = 1;
          s2 = 0;
        } else {
          s1 = 0.5;
          s2 = 0.5;
        }
        
        var winnderDiff = 32 * (s1 - e1);
        var loserDiff = 32 * (s2 - e2);
        var newr1 = wData.elo1 + 32 * (s1 - e1);
        var newr2 = lData.elo1 + 32 * (s2 - e2);
        updatePlayerELO1Sql.run(newr1, winner);
        updatePlayerELO1Sql.run(newr2, loser);
        
        message.channel.send(
          "```The match " + mapCode + " is completed.\nELO changes:\n\n" +
          player1Name + ": " + Math.round(winnderDiff) + "\n" +
          player2Name + ": " + Math.round(loserDiff) + "\n\n" +
          "Please use " + prefix + "elo to check your new elo```"
        );
        return;
      }
      
      message.channel.send(
        "The match " + mapCode + " doesn't have a valid team set up. Game is concluded without elo changes."
      );
      
    } else {
      message.channel.send("<@" + message.author.id + "> the match code does not exist. Please try a different match.");
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
