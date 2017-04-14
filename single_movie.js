/*

TODO :
 - Add people of TWG who've seen it?
 - Add Director etc...

*/

var suq = require('suq');

var url = "https://letterboxd.com/film/the-city-of-lost-children/";

suq(url, function (err, json, body) {

    if (!err) {
        //console.log('scraped json is:', JSON.stringify(json, null, 2));
        //console.log('html body is', body);

        var title = json.opengraph['og:title'];
        var desc = json.meta.description;
        var cover = json.opengraph['og:image'];

        var movieschema = json.microdata.filter(function (el) {
	    	return (el.type.includes("http://schema.org/Movie"));
		});

		var cover = movieschema[0].props.image;

        var ratings = json.tags.links.filter(function (el) {
	    	return (el.text.includes("★"));
		});

		var re = new RegExp(/^([\d,]+)\s([^\s]+)/);
		//([^\s]+) ratings/


		for (i=0;i<ratings.length;i++) {

		console.log(ratings[i].text + "\n");

		var breakdown = re.exec(ratings[i].text);
		ratings[i].stars = breakdown[1];
		ratings[i].rating = breakdown[2];
		
		}



		for (i=0;i<ratings.length;i++) {

		console.log(ratings[i].rating + " : " + ratings[i].stars + "\n");

		}


        console.log("------\n" + title + "\n" + desc + "\n")
    }

});