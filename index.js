const express = require('express');
const cors = require('cors');
const Twitter = require('twitter');
const dotenv = require('dotenv');

const { QUERIES } = require('./queries');

dotenv.load();

const port = process.env.PORT || 8080;
const app = express();

const corsOptions = {
  origin: [ process.env.CORS_ORIGIN, process.env.CORS_ORIGIN_TEST ],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

const LANG = 'en';
const QUERY_STRING = QUERIES[LANG].join(',');

const QUEUE_SIZE = 64;
let insertIndex = 0;
let popIndex = 0;
const mQueue = [
  'Unhappily submitting to the Machine destroys your soul not all at once but over time'
];

const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

// https://dev.twitter.com/streaming/overview/request-parameters
client.stream('statuses/filter', {track: QUERY_STRING, language: LANG}, function(stream){
  stream.on('data', function(tweet) {
    var mText = tweet.text.replace(/RT /g, '');
    mText = mText.replace(/["{}<>().!,;|\-]/g, '');
    mText = mText.replace(/[#@]\S+/g, '');
    mText = mText.replace(/http(s?):\/\/\S+/g, '');
    mText = mText.replace(/b\/c/g, 'because');
    mText = mText.replace(/([a-zA-Z]+)\/([a-zA-Z]+)/g, '$1 $2');
    mText = mText.replace(/\S+…/g, '');
    mText = mText.replace(/\s+/g, ' ');
    mText = mText.trim();

    if(mText.length > 0) {
      console.log(mText);
      if(mQueue.length < QUEUE_SIZE) {
        mQueue.push(mText);
      } else {
        mQueue[insertIndex] = mText;
        insertIndex = (insertIndex + 1)%mQueue.length;
      }
    }
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
  let queueString = '';
  for(let i=0; i<mQueue.length; i++) {
    queueString += mQueue[i] + ',<br>';
  }
  res.send(queueString);
});

app.listen(port);
