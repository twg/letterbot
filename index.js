var express = require('express');
var app = express();
var request = require('request');
var bodyParser = require('body-parser');
var suq = require('suq');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('port', (process.env.PORT || 9001));


app.get('/', function(req, res){
  res.send("I am Letterbot. I am sad if you don't ask me about a specific movie");
});

app.post('/slack/post', function(req, res){
  //take a message from Slack slash command
  var query = req.body.text;

  // Handle Empty Request
  if (query == ''){
  	res.send("Letterbot needs you to ask about a movie!"); 
  }
  else {

		// #############################################################################
		// #################### SEARCH THE LETTERBOXD MOVIES LIST ######################
		// #############################################################################

		// TODO : DO LOWERCASE OF REQUEST + MATCH

  		var frequest = query;
		var searchurl = "https://letterboxd.com/search/films/" + frequest + "/";

		suq(searchurl, function (err, json, body) {
	    	if (!err) {

		        var films = json.tags.links.filter(function (el) {
			    	return (el.href.includes("/film/") && el.title);
				});

				// Handle error / zero results (turns out empty valid films links does that)

				if (films.length == 0) {
					// NO RESULTS FOUND
					res.send("NO RESULTS for " + frequest);
				}

				else if (films[0].text == frequest && films[1].text != frequest) {
					// SINGLE MATCH FOUND
					//res.send("SINGLE PERFECT MATCH for " + frequest + "\n" + "Film 0: " + films[0].text + "\n" + "Film 1: " + films[1].text)
					return returnSingle(frequest);

				}

				else {
					// MORE THAN ONE RESULT (&& ???)
					res.send("SOME OTHER CASE for " + frequest);
				}
		    }
		    else {
		    	// SEARCH SCRAPE FAILED
		    	res.send("SOME SORT OF ELEGANT ERROR HANDLING BACK TO THE SLACKBOT");
		    }

		});

 

    } // End of non-empty request loop
});


function returnSingle(frequest) {

	    var body = {
	        response_type: "in_channel",
	        "attachments": [
	          {
	            "text": "Movie: Charlie and the Chocolate Factory : .." + frequest +  "..\n"
	                  + "Year: 1971\n"
	                  + "Rating : 4.7/5",
	            "image_url": "http://placekitten.com.s3.amazonaws.com/homepage-samples/96/139.jpg",
	          }
	        ]
	    };
	    // UNCOMMENT THIS WHEN DOING THE ACTUAL RETURN
	    res.send(body); 

}

// Tells Node which port to listen on
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});