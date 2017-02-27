var express = require('express');
var Twitter = require('twitter');
var dotenv = require('dotenv');

dotenv.load();

var port = process.env.PORT || 8080;
var app = express();

var queryString = "alienating, hatemyjob, distance relationship";

var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

client.stream('statuses/filter', {track: queryString}, function(stream){
  stream.on('data', function(tweet) {
    var mText = tweet.text.replace(/RT/g, "").replace(/[{}<>().?!,;\-#]/g, "").replace(/@\S+/g, "").replace(/http(s?):\/\/\S+/g, "").replace(/\s+/g, " ").trim();
    console.log(mText);
  });

  stream.on('error', function(error) {
    console.log(error);
  });
});

//app.get('/AFT', function() {});
app.listen(port);
