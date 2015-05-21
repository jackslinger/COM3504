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
        var venues = JSON.parse(data).venues;
        var dbpedia = JSON.parse(data).dbpedia;

		populateVenue(venue);
        loadMap(venues, dbpedia);
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

function loadMap(venues, dbpedia) {
  
    var map = new google.maps.Map(document.getElementById("map-canvas"));
    var markers = new Array();
    var contentStrings = new Array();
    var boundary = new google.maps.LatLngBounds();


    for (var index in venues) {
        var venueLocation = venues[index].location;
        var venueLatLng = new google.maps.LatLng(venueLocation.lat, venueLocation.lng);

        boundary.extend(venueLatLng);

        markers.push(new google.maps.Marker({
            position: venueLatLng,
            map: map
        }));

        contentStrings.push(venues[index].name);
    }

    for (var index in dbpedia) {
        var location = dbpedia[index];
        var latlng = new google.maps.LatLng(location.lat, location.lon);

        boundary.extend(latlng);

        markers.push(new google.maps.Marker({
            position: latlng,
            map: map
        }));

        contentStrings.push(location.link);
    }

    infowindow = new google.maps.InfoWindow({ content: "holding..." });

    for (var index in markers) {
        var marker = markers[index];

        google.maps.event.addListener(marker, 'click',
            (function(marker, index) {
                return function() {
                    infowindow.setContent(contentStrings[index]);
                    infowindow.open(map, marker);
                }
            })(marker, index))
    } 

    map.fitBounds(boundary);
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
