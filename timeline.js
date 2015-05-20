$(document).ready(function() {
	var queryString = {};
	findParams(queryString);
	
	if (queryString.screenname != null) {
		var screenname = queryString.screenname;
		$("#Title").html(screenname);
		getTimeline(screenname);
	} else {
		console.log("No Screen Name Provided");
	}
});

function getTimeline(screenname) {
	$.post('/getTimeline.html', JSON.stringify({screenname: screenname}), function(data) {
        var tweets = JSON.parse(data);
        if (tweets.length > 0) {
        	populateTable(tweets);
        } else {
        	console.log("Invalid Twitter Screen Name");
        }
    });
}

function findParams(queryString) {
	if (window.location.search.split('?').length > 1) {
		var params = window.location.search.split('?')[1].split('&');

		for (var i = 0; i < params.length; i++) {
			var key = params[i].split('=')[0];
			var value = params[i].split('=')[1];
			queryString[key] = value;
		}
	}
}

function populateTable(tweets) {
	for (var index in tweets) {
		console.log(tweets[index]);
        var tweet = tweets[index];
            
        var tableBody = document.getElementById("tweetTableBody");
        var row = tableBody.insertRow(0);
        row.insertCell(0).innerHTML = tweet.created_at;
        row.insertCell(1).innerHTML = tweet.text;
        row.insertCell(2).innerHTML = tweet.id_str;
    }
}