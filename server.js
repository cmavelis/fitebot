// server.js
// where your node app starts

// init discord bot and http express
const Discord = require('discord.js');
const cupid = new Discord.Client();
const http = require('http');
const express = require('express');


// init sqlite db
var fs = require("fs");
var dbFile = "./.data/sqlite.db";
var exists = fs.existsSync(dbFile);
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(dbFile);

// if ./.data/sqlite.db does not exist, create it, otherwise print records to console
db.serialize(function() {
  if (!exists) {
    db.run("CREATE TABLE Players (players TEXT)");
    console.log("New table players created!");

    db.run("CREATE TABLE Matches (matches TEXT)");
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


// 'client.on('message')' commands are triggered when the
// specified message is read in a text channel that the bot is in.

cupid.on('message', message => {
  if (message.content === 'ping') {
    message.reply('pong');
  }
});


cupid.login(process.env.TOKEN);