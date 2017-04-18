var express = require('express');
var app = express();
var request = require('request');
var bodyParser = require('body-parser');
var suq = require('suq');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('port', (process.env.PORT || 9001));


app.get('/', function(req, res){

	// #################### HANDLE DEFAULT WEB GET REQUEST ######################

	res.send("I am Letterbot. Find me in Slack!");
});

app.post('/slack/post', function(req, res){

	// #################### HANDLE SLACK SLASH REQUESTS ######################

	var frequest = req.body.text; // Requested Film Title
	var responseURL = req.body.response_url; // Slack callback URL

	if (frequest == ''){
		// Respond to Empty Request
		res.send("Letterbot needs you to ask about a movie!"); 
	}
	else {

		// #################### SEARCH THE LETTERBOXD MOVIES LIST ######################
		// TODO : ADD YEAR AS ADDITIONAL QUALIFIER - see edge case : 2001
		// TODO : Escape frequest? See "Ferris Bueller's Day Off"

		var searchurl = "https://letterboxd.com/search/films/" + frequest + "/";

		suq(searchurl, function (err, json, body) {
	    	if (!err) {

		        var films = json.tags.links.filter(function (el) {
			    	return (el.href.includes("/film/") && el.title); // Restrict results to URLs matching a film match
				});

				if (films.length == 0) {
					// Handle error / zero results (turns out empty valid films links does that)
					res.send( { response_type: "ephemeral", 
								text: "Letterbot can't find results for " + frequest + "\n" + "Please try another search"
							  }
						);
				}

				else if (films[0].text.toLowerCase() == frequest.toLowerCase() && films[1].text.toLowerCase() != frequest.toLowerCase()) {
					// PERFECT SINGLE MATCH FOUND (see "Frida" for test case)
					return returnSingle(frequest, res, films[0].href);

				}

				else {
					// MORE THAN ONE RESULT FOUND. PRESENT BUTTONS FOR OPTIONS
					res.send( { response_type: "in_channel" } );
					return chooseResult(frequest, res, films, responseURL);
				}
		    }
		    else {
		    	// SEARCH SCRAPE FAILED
		    	res.send("Something went wrong. Sorry, please try again!");
		    }

		});

    } // End of non-empty request loop
});

app.post('/slack/choice', function(req, res){

	// #################### HANDLE BUTTON CLICK RESPONSES ######################

	//res.status(200).end(); // Avoid timeout with 200 status code

	// TODO : UPDATE THE BUTTON LIST TO SHOW THAT ONE WAS SELECTED!!

    var actionJSONPayload = JSON.parse(req.body.payload);

    returnSingle('monkeytennis', res, actionJSONPayload.actions[0].value); // .value here is the URL to the chosen movie

});

function chooseResult(frequest, res, films, responseURL) {

	// #################### PRESENT BUTTON OPTIONS FOR MULTI-RESULT ######################
	// TODO : Add "None of the above" option to the buttons
	// TOOD : What happens with only 2 films? Probably an error

    res.status(200).end();

	var message = {
	    "text": "Which movie were you thinking of?",
	    "replace_original": false,
	    "response_type": "ephemeral",
	    "attachments": [
	        {
	            "text": "Choose a movie",
	            "fallback": "What Does Fallback Do?",
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
            // Erm? Fail hard?
        }
    })

}


function returnSingle(frequest, res, link) {

	// #################### RETURN CARD FOR A DEFINITIVE MOVIE CHOICE ######################
	// TODO : Add the TWG folks' scores

	var movie_url = "https://letterboxd.com" + link;

	suq(movie_url, function (err, json, body) {

    	if (!err) {

	        var movie_details = {};

	        movie_details.url = movie_url;
	        movie_details.title = json.opengraph['og:title'];
	        movie_details.desc = json.meta['twitter:description'];
	        movie_details.screen = json.opengraph['og:image'];

	        var movieschema = json.microdata.filter(function (el) {
		    	return (el.type.includes("http://schema.org/Movie"));
			});

			movie_details.cover = movieschema[0].props.image;

	        var ratings = json.tags.links.filter(function (el) {
		    	return (el.text.includes("★"));
			});

			// TODO : Turn the following into a nice request for dynamic graph image to display in card
			// var re = new RegExp(/^([\d,]+)\s([^\s]+)/);
			// for (i=0;i<ratings.length;i++) {
			// 	var breakdown = re.exec(ratings[i].text);
			// 	ratings[i].stars = breakdown[1];
			// 	ratings[i].rating = breakdown[2];
			// }
			// for (i=0;i<ratings.length;i++) {
			// console.log(ratings[i].rating + " : " + ratings[i].stars + "\n");
			// }

			return_to_slack(movie_details, res);
	    }
	});

	function return_to_slack(movie_details, res){

		// #################### POST FORMATTED CARD/ATTACHMENT TO SLACK CHANNEL ######################

	    var return_body = {
	        "response_type": "in_channel",
	        "replace_original": false,
	        "attachments": [
	          {
	          	"color": "#ff0000",
	          	"title": movie_details.title,
	          	"title_link": movie_details.url,
	          	"author_name": "The Director Here",
            	"author_link": movie_details.url,
            	"author_icon": movie_details.cover,
	            "text": movie_details.desc,
	            "thumb_url": "https://chart.googleapis.com/chart?cht=bvs&chs=152x70&chd=t:15,24,19,101,170,545,741,1127,415,410&chco=4D89F9&chds=0,1200&chxt=x&chxl=0:||1||2||3||4||5&chbh=15,0,0"
	          },
	          {
	          	"image_url": movie_details.cover,
				"thumb_url": movie_details.cover
	          }
	        ]
	    };
	    res.send(return_body); 
	}
}

// MAKE NODE LISTEN ON ENV OR DEFAULT PORT
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});