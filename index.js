var express = require('express');
var app = express();
//var url = require('url');
var request = require('request');

var format = ".json";
//var apikey = process.env.WU_ACCESS  //WU API key; will be set in Heroku

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//use port is set in the environment variable, or 9001 if it isn’t set.
app.set('port', (process.env.PORT || 9001));

//for testing that the app is running
app.get('/', function(req, res){
  res.send('Running!!');
});

//app.post is triggered when a POST request is sent to the URL ‘/post’
app.post('/slack/post', function(req, res){
//   //take a message from Slack slash command
  var query = req.body.text;
      var body = {
        response_type: "in_channel",
        "attachments": [
          {
            "text": "Location: Fish\n"
                  + "Temperature: Chips\n"
                  + "Condition: Sausage",
            "image_url": "http://placekitten.com.s3.amazonaws.com/homepage-samples/96/139.jpg",
          }
        ]
      };
      res.send(body);  

});

//   // var parsed_url = url.format({
//   //   pathname: 'http://api.wunderground.com/api/' + apikey + '/conditions/q/' + req.body.text + format,
//   // });

//   // console.log(parsed_url);

//   request(parsed_url, function (error, response, body) {
//     if (!error && response.statusCode == 200) {
//       var data = JSON.parse(body);
//       var temperature = data.current_observation.temperature_string;
//       var weatherCondition = data.current_observation.weather
//       var icon_url = data.current_observation.icon_url
//       var location = data.current_observation.display_location.full

//       var body = {
//         response_type: "in_channel",
//         "attachments": [
//           {
//             "text": "Location: " + location + "\n"
//                   + "Temperature: " + temperature + "\n"
//                   + "Condition: " + weatherCondition,
//             "image_url": icon_url,
//           }
//         ]
//       };
//       res.send(body);
//     }
//   });
// });

//tells Node which port to listen on
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});