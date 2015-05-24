$(document).ready(function() {
	$("#sendButton").click(sendData);
    $("#loading").hide();
});

function sendData() {
    //Clear any remaining data
    clearData();

    //Show the loading text
    $("#loading").show();

	//Get data from form
	var location = $("#locationInput").val();
	var lat = $("#latInput").val();
	var lon = $("#longInput").val();
	var days = parseInt($('#daysInput').val());

	//Validate and process the input
    var since = findDate(days);
    var query = {location: location, lat: lat, lon: lon, since: since, days: days};

    $.post("findVisitors.html", JSON.stringify(query), function(data) {
		console.log(data);

        var users = JSON.parse(data);

        if (users.length == 0) {
            alert("No visitors found.");
        }

        for (var index in users) {
            var user = users[index];
                
            var tableBody = document.getElementById("visitorsTableBody");
            var row = tableBody.insertRow(0);
            
            var image = "<img src='" + user.profile_image_url + "'>";
            row.insertCell(0).innerHTML = image;

            row.insertCell(1).innerHTML = user.name;
            row.insertCell(2).innerHTML = user.screen_name;
            row.insertCell(3).innerHTML = user.location;
            row.insertCell(4).innerHTML = user.description;

            var link = "<a href='timeline.html?screenname=" + user.screen_name + "'>Timeline</a>";
            row.insertCell(5).innerHTML = link;
        }

        //Hide the loading text again
        $("#loading").hide();
	});
}

function clearData() {
    $("#visitorsTableBody tr").remove();

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