$(document).ready(function() {
	$("#sendButton").click(sendData);
});

function sendData() {
	var name = $("#nameInput").val();

	//Validate input
	if (name == "") {
		alert("Please enter the name or screen name of a twitter user!");
		$("#nameInput").focus();
		return false;
	}

	$("#userTableBody tr").remove();
	$("#venueTableBody tr").remove();
	$("#retweeterTableBody tr").remove();

	$.post('/queryUser.html', JSON.stringify({name: name}), function(data) {
        var data = JSON.parse(data);
        var user = data.user;
        
        //If user is empty then there is no user with that name in the database
        if ($.isEmptyObject(user)) {
        	alert("No user with that name in database.");
        	return false;
        }

        var venues = data.venues;
        var retweeters = data.retweeters;

                
        var tableBody = document.getElementById("userTableBody");
        var row = tableBody.insertRow(0);
        var image = "<img src='" + user.picture_url + "'>";
        row.insertCell(0).innerHTML = image;
        row.insertCell(1).innerHTML = user.name;
        row.insertCell(2).innerHTML = user.screen_name;
        row.insertCell(3).innerHTML = user.location;
        row.insertCell(4).innerHTML = user.description;


        for (var index in venues) {
        	var venue = venues[index];

        	var tableBody = document.getElementById("venueTableBody");
	        var row = tableBody.insertRow(0);
	        row.insertCell(0).innerHTML = venue.name;
	        row.insertCell(1).innerHTML = venue.category;
	        row.insertCell(2).innerHTML = venue.address;
	        row.insertCell(3).innerHTML = venue.description;
	        var link = "<a href='" + venue.url + "'>" + venue.url + "</a>";
	        row.insertCell(4).innerHTML = link;
	        var image = "<img src='" + venue.picture_url + "'>";
	        row.insertCell(5).innerHTML = image;
        }

        for (var index in retweeters) {
        	var retweeter = retweeters[index];

        	var tableBody = document.getElementById("retweeterTableBody");
	        var row = tableBody.insertRow(0);
	        var image = "<img src='" + retweeter.picture_url + "'>";
	        row.insertCell(0).innerHTML = image;
	        row.insertCell(1).innerHTML = retweeter.name;
	        row.insertCell(2).innerHTML = retweeter.screen_name;
	        row.insertCell(3).innerHTML = retweeter.location;
	        row.insertCell(4).innerHTML = retweeter.description;
        }


    });
}