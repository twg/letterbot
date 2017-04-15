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
  var responseURL = req.body.response_url;
  console.log("QUERY FROM SLACK : " + query);

  // Handle Empty Request
  if (query == ''){
  	res.send("Letterbot needs you to ask about a movie!"); 
  }
  else {

		// #############################################################################
		// #################### SEARCH THE LETTERBOXD MOVIES LIST ######################
		// #############################################################################

		// TODO : DO LOWERCASE OF REQUEST + MATCH
		// TODO : ADD YEAR AS ADDITIONAL QUALIFIER - see edge case : 2001

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
					return returnSingle(frequest, res, films[0].href);

				}

				else {
					// MORE THAN ONE RESULT (&& ???)
					//res.send("SOME OTHER CASE for " + frequest);
					return chooseResult(frequest, res, films, responseURL);
				}
		    }
		    else {
		    	// SEARCH SCRAPE FAILED
		    	res.send("SOME SORT OF ELEGANT ERROR HANDLING BACK TO THE SLACKBOT");
		    }

		});

 

    } // End of non-empty request loop
});

app.post('/slack/choice', function(req, res){
  //take a message from Slack slash command
  // var query = req.body.text;
  // var responseURL = req.body.response_url;
  // console.log("QUERY FROM SLACK : " + query);

    res.status(200).end() // best practice to respond with 200 status
    var actionJSONPayload = JSON.parse(req.body.payload) // parse URL-encoded payload JSON string
    var message = {
        "text": actionJSONPayload.user.name+" clicked: "+actionJSONPayload.actions[0].name,
        "replace_original": false
    }
    sendButtonResponse(actionJSONPayload.response_url, message)

});

function chooseResult(frequest, res, films, responseURL) {

		//res.send("SOME OTHER CASE for " + frequest);
	    res.status(200).end() // best practice to respond with empty 200 status code

		var message = {
		    "text": "Which movie were you thinking of?",
		    "attachments": [
		        {
		            "text": "Choose a movie",
		            "fallback": "Y U NO MOVIE?",
		            "callback_id": "i_dont_know_how_to_use_this",
		            "color": "#3AA3E3",
		            "attachment_type": "default",
		            "actions": [
		                {
		                    "name": "movie",
		                    "text": films[0].title,
		                    "type": "button",
		                    "value": films[0].href
		                },
		                {
		                    "name": "movie",
		                    "text": films[1].title,
		                    "type": "button",
		                    "value": films[1].href
		                },
		                {
		                    "name": "movie",
		                    "text": films[2].title,
		                    "type": "button",
		                    "value": films[2].href
		                }
		            ]
		        }
		    ]
		}

		sendButtonResponse(responseURL, message);

}

function sendButtonResponse(responseURL, JSONmessage) {

    var postOptions = {
        uri: responseURL,
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        json: JSONmessage
    }

    request(postOptions, (error, response, body) => {
        if (error){
            // handle errors as you see fit
        }
    })

}


function returnSingle(frequest, res, link) {

		var movie_url = "https://letterboxd.com" + link;

		suq(movie_url, function (err, json, body) {

	    	if (!err) {
		        //console.log('scraped json is:', JSON.stringify(json, null, 2));
		        //console.log('html body is', body);

		        var movie_details = {};


		        movie_details.url = movie_url;
		        movie_details.title = json.opengraph['og:title'];
		        movie_details.desc = json.meta.description;
		        movie_details.screen = json.opengraph['og:image'];

		        var movieschema = json.microdata.filter(function (el) {
			    	return (el.type.includes("http://schema.org/Movie"));
				});

				movie_details.cover = movieschema[0].props.image;

		        var ratings = json.tags.links.filter(function (el) {
			    	return (el.text.includes("★"));
				});

				var re = new RegExp(/^([\d,]+)\s([^\s]+)/);
				//([^\s]+) ratings/


				// for (i=0;i<ratings.length;i++) {

				// console.log(ratings[i].text + "\n");

				// var breakdown = re.exec(ratings[i].text);
				// ratings[i].stars = breakdown[1];
				// ratings[i].rating = breakdown[2];
				
				// }



				// for (i=0;i<ratings.length;i++) {

				// console.log(ratings[i].rating + " : " + ratings[i].stars + "\n");

				// }

				// TODO : Ratings, Year

				return_to_slack(movie_details, res);


		    }

		});

		function return_to_slack(movie_details, res){

		    var return_body = {
		        response_type: "in_channel",
		        "attachments": [
		          {
		            "text": "Movie: " + movie_details.title +  "\n"
		                  + "Link: " + movie_details.url + "\n"
		                  + "Description: " + movie_details.desc + "\n"
		                  + "Rating : TODO",
		            "image_url": movie_details.cover,
		          }
		        ]
		    };
		    res.send(return_body); 

		}


}

// Tells Node which port to listen on
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});