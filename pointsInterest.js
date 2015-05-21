$(document).ready(function() {
	var queryString = {};
	findParams(queryString);
	
	if (queryString.id != null) {
		var id = queryString.id;
		console.log(id);
		findPointsInterest(id);
	} else {
		console.log("No ID Provided");
	}
});

function findPointsInterest(id) {
	console.log("sending request");
	$.post('/findInterest.html', JSON.stringify({id: id}), function(data) {
		var venue = JSON.parse(data).venue;
		populateVenue(venue);
	});
}

function populateVenue(venue) {       
        var tableBody = document.getElementById("venueTableBody");
        var row = tableBody.insertRow(0);
        
        row.insertCell(0).innerHTML = venue.name;

        if (venue.categories.length > 0) {
        	row.insertCell(1).innerHTML = venue.categories[0].name;
        } else {
        	row.insertCell(1).innerHTML = "No category available";
        }
        
        if (venue.location.formattedAddress != null) {
            var address = "";
            for (var part in venue.location.formattedAddress) {
                address = address + venue.location.formattedAddress[part];
            }
            row.insertCell(2).innerHTML = address;
        } else {
            row.insertCell(2).innerHTML = "No address available";
        }

        row.insertCell(3).innerHTML = venue.description;

        var link = "<a href='" + venue.shortUrl + "'>" + venue.shortUrl + "</a>";
        row.insertCell(4).innerHTML = link;

        if (venue.bestPhoto != null) {
            var pic = "<img src=\"" + venue.bestPhoto.prefix + "width150" + venue.bestPhoto.suffix + "\">";
            row.insertCell(5).innerHTML = pic;
        } else {
            row.insertCell(5).innerHTML = "No picture available";
        }
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
