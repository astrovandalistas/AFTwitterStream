var express = require('express');
var cors = require('cors');
var Twitter = require('twitter');
var dotenv = require('dotenv');

dotenv.load();

var port = process.env.PORT || 8080;
var app = express();

var corsOptions = {
  origin: process.env.CORS_ORIGIN,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// https://dev.twitter.com/streaming/overview/request-parameters
var queries = [
  "alienating",
  "hate my job",
  "distance relationship",
  "capitalism jobs",
  "art money",
  "making plans",
  "#makingplans"
];

var queryString = queries.join(", ");

var insertIndex = 0;
var popIndex = 0;
var QUEUE_SIZE = 64;
var mQueue = [
  "Unhappily submitting to the Machine destroys your soul not all at once but over time",
  "Once the realization is accepted that even between the closest human beings infinite distances continue",
  "We are made aware of our need to assimilate with something far beyond ourselves by our insatiable longing",
  "I hate my life and my job and my president and my country, but at least star wars 8 is just 10 months away"
];

var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

client.stream('statuses/filter', {track: queryString, language: "en"}, function(stream){
  stream.on('data', function(tweet) {
    var mText = tweet.text.replace(/RT /g, "").replace(/["{}<>().…?!,;|\-]/g, "").replace(/[#@]\S+/g, "").replace(/http(s?):\/\/\S+/g, "").replace(/([a-zA-Z]+)\/([a-zA-Z]+)/g, "$1 $2").replace(/in a long distance relationship/ig, "distant").replace(/a long distance relationship/ig, "distance").replace(/\s+/g, " ").trim();

    if(mQueue.length < QUEUE_SIZE) {
      mQueue.push(mText);
    } else {
      mQueue[insertIndex] = mText;
      insertIndex = (insertIndex + 1)%mQueue.length;
    }
    console.log(mText);
  });

  stream.on('error', function(error) {
    console.log(error);
  });
});

app.get('/AFT', function(req, res) {
  res.send(mQueue[popIndex]);
  popIndex = (popIndex + 1)%mQueue.length;
});

app.get('/AFTALL', function(req, res) {
  var queueString = "";
  for(var i=0; i<mQueue.length; i++) {
    queueString += mQueue[i]+",<br>";
  }
  res.send(queueString);
});

app.listen(port);
