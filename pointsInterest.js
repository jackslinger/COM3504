$(document).ready(function() {
	var queryString = {};
	findParams(queryString);
	
	if (queryString.id != null) {
		var id = queryString.id;
		console.log(id);
	} else {
		console.log("No ID Provided");
	}
});

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
