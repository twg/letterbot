var suq = require('suq');

var frequest = 'Chocolat';
var searchurl = "https://letterboxd.com/search/films/" + frequest + "/";

      // Run Search 
suq(url, function (err, json, body) {

    if (!err) {
        //console.log('scraped json is:', JSON.stringify(json, null, 2));

  

   

        // If single result with Perfect Title Match == Single

        // If single result with Year + Partial Title Match == Single

        // If >1 Perfect Title Match or 0 Perfect Title Match == Show 3

        var films = json.tags.links.filter(function (el) {
	    	return (el.href.includes("/film/") && el.title);
		});

		// Handle error / zero results (turns out empty valid films links does that)

		if (films.length == 0) {
			console.log("NO RESULTS for " + frequest);
		}

		else if (films[0].text == frequest && films[1].text != frequest) {

			// TODO : DO LOWERCASE OF REQUEST + MATCH

			console.log("SINGLE PERFECT MATCH for " + frequest + "\n" + "Film 0: " + films[0].text + "\n" + "Film 1: " + films[1].text)
		}

		else {

			console.log("SOME OTHER CASE for " + frequest);
		}

        //console.log(films);

		// var re = new RegExp(/^([\d,]+)\s([^\s]+)/);
		// //([^\s]+) ratings/


		// for (i=0;i<ratings.length;i++) {

		// console.log(ratings[i].text + "\n");

		// var breakdown = re.exec(ratings[i].text);
		// ratings[i].stars = breakdown[1];
		// ratings[i].rating = breakdown[2];
		
		// }



		// for (i=0;i<ratings.length;i++) {

		// console.log(ratings[i].rating + " : " + ratings[i].stars + "\n");

		// }


  //       console.log("------\n" + title + "\n" + desc + "\n")
    }

    else {

    	console.log("SOME SORT OF ELEGANT ERROR HANDLING BACK TO THE SLACKBOT");
    }

});