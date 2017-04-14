var express = require('express');
var app = express();
var request = require('request');
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('port', (process.env.PORT || 9001));


app.get('/', function(req, res){
  res.send("I am Letterbot. I am sad if you don't ask me about a specific movie");
});

app.post('/slack/post', function(req, res){
//   //take a message from Slack slash command
  var query = req.body.text;
      var body = {
        response_type: "in_channel",
        "attachments": [
          {
            "text": "Movie: Charlie and the Chocolate Factory : " + query +  "\n"
                  + "Year: 1971\n"
                  + "Rating : 4.7/5",
            "image_url": "http://placekitten.com.s3.amazonaws.com/homepage-samples/96/139.jpg",
          }
        ]
      };
      res.send(body);  

});

//tells Node which port to listen on
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});