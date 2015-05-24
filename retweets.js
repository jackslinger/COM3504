$(document).ready(function() {
	var queryString = {};
	findParams(queryString);
	
	if (queryString.id != null) {
		var id = queryString.id;
		findRetweets(id);
	} else {
		console.log("No ID Provided");
	}
});

function findRetweets(id) {
	$.post('/findRetweets.html', JSON.stringify({id: id}), function(data) {
        var tweets = JSON.parse(data);
        if (tweets.length > 0) {
        	populateTable(tweets);
        } else {
        	console.log("Invalid Tweet ID");
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
	if (tweets.length > 0) {
		var user = tweets[0].retweeted_status.user;
	
		var userTableBody = document.getElementById("userTableBody");
	    var userRow = userTableBody.insertRow(0);
	    var image = "<img src='" + user.picture_url + "'>";
	    userRow.insertCell(0).innerHTML = image;
	    userRow.insertCell(1).innerHTML = user.name;
	    userRow.insertCell(2).innerHTML = user.screen_name;
	    userRow.insertCell(3).innerHTML = user.location;
	    userRow.insertCell(4).innerHTML = user.description;

	}

	for (var index in tweets) {
        var tweet = tweets[index];
            
        var tableBody = document.getElementById("retweetTableBody");
        var row = tableBody.insertRow(0);
        row.insertCell(0).innerHTML = tweet.created_at;
        row.insertCell(1).innerHTML = tweet.user.screen_name;
        row.insertCell(2).innerHTML = tweet.text;
        row.insertCell(3).innerHTML = tweet.id_str;
    }
}
