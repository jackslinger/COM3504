$(document).ready(function() {
	$("#sendButton").click(sendData);
});

function sendData() {
	var name = $("#nameInput").val();

	console.log(name);

	$("#userTableBody tr").remove();
	$("#venueTableBody tr").remove();

	$.post('/queryVenue.html', JSON.stringify({name: name}), function(data) {
		var data = JSON.parse(data);
		var venue = data.venue;
		var users = data.users;

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

        for (var index in users) {
        	var user = users[index];

        	var tableBody = document.getElementById("userTableBody");
	        var row = tableBody.insertRow(0);
	        var image = "<img src='" + user.picture_url + "'>";
	        row.insertCell(0).innerHTML = image;
	        row.insertCell(1).innerHTML = user.name;
	        row.insertCell(2).innerHTML = user.screen_name;
	        row.insertCell(3).innerHTML = user.location;
	        row.insertCell(4).innerHTML = user.description;
        }
    });
}