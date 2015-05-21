$(document).ready(function() {
	$("#sendButton").click(function() {
        sendData();
    });
});

function sendData() {
    //Clear any existing data
    clearData();

	//Get data from form
	var screenName = $('#screenNameInput').val();
    var days = parseInt($('#daysInput').val());

    //Validate and process the input
    var since = findDate(days);
    var query = {screenname: screenName, since: since};

	$.post("findLocations.html", JSON.stringify(query), function(data) {
		//console.log(data);

		var venues = JSON.parse(data);

        loadMap(venues);

		for (var index in venues) {
            var venue = venues[index].response.venue;
                
            var tableBody = document.getElementById("venueTableBody");
            var row = tableBody.insertRow(0);
            var type = document.createAttribute("typeof");
            type.value = "venue";
            row.setAttributeNode(type);

            var cell_name = row.insertCell(0);
            cell_name.innerHTML = venue.name;
            var property_name = document.createAttribute("property");
            property_name.value = "venue_name";
            cell_name.setAttributeNode(property_name);
            
            var cell_category = row.insertCell(1);
            cell_category.innerHTML = venue.categories[0].name;
            var property_category = document.createAttribute("property");
            property_category.value = "venue_category";
            cell_category.setAttributeNode(property_category);

            if (venue.location.formattedAddress != null) {
                var address = "";
                for (var part in venue.location.formattedAddress) {
                    address = address + venue.location.formattedAddress[part];
                }

                var cell_address = row.insertCell(2);
                cell_address.innerHTML = address;
                var property_address = document.createAttribute("property");
                property_address.value = "venue_address";
                cell_address.setAttributeNode(property_address);
            } else {
                row.insertCell(2).innerHTML = "No address available";
            }

            var cell_description = row.insertCell(3);
            cell_description.innerHTML = venue.description;
            var property_description = document.createAttribute("property");
            property_description.value = "venue_description";
            cell_description.setAttributeNode(property_description);
            

            var link = "<a href='" + venue.shortUrl + "'>" + venue.shortUrl + "</a>";
            var cell_link = row.insertCell(4);
            cell_link.innerHTML = link;
            var property_link = document.createAttribute("property");
            property_link.value = "venue_url";
            cell_link.setAttributeNode(property_link);

            if (venue.bestPhoto != null) {
                var pic = "<img src=\"" + venue.bestPhoto.prefix + "width150" + venue.bestPhoto.suffix + "\">";
                var cell_picture = row.insertCell(5);
                cell_picture.innerHTML = pic;
                var property_picture = document.createAttribute("property");
                property_picture.value = "venue_picture_url";
                cell_picture.setAttributeNode(property_picture);
            } else {
                row.insertCell(5).innerHTML = "No picture available";
            }

            var interestLink = "<a href ='/pointsInterest.html?id=" + venue.id + "' target='_blank'>Show points of Interest</a>";
            row.insertCell(6).innerHTML = interestLink;
        }

        
	});
}

function clearData() {
    $("#venueTableBody tr").remove();

    wordCount = {};
    searchRequests = [];
    userRequests = [];
    validUsers = [];
}

function findDate(days) {
    var d = new Date();
    d.setDate(d.getDate() - days);

    var year = d.getFullYear();
    var month = d.getMonth() + 1;
    var day = d.getDate();

    var dateString = year + "-" + month + "-" + day;
    return dateString;
}

function loadMap(venues) {
  
    var map = new google.maps.Map(document.getElementById("map-canvas"));
    var markers = new Array();
    var contentStrings = new Array();
    var boundary = new google.maps.LatLngBounds();


    for (var index in venues) {
        var venueLocation = venues[index].response.venue.location;
        var venueLatLng = new google.maps.LatLng(venueLocation.lat, venueLocation.lng);

        boundary.extend(venueLatLng);

        markers[index] = new google.maps.Marker({
            position: venueLatLng,
            map: map
        });

        contentStrings[index] = venues[index].response.venue.name;
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