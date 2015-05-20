var query = "http://dbpedia.org/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org&query=PREFIX+geo%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2003%2F01%2Fgeo%2Fwgs84_pos%23%3E%0D%0ASELECT+%3Fsubject+%3Flabel+%3Flat+%3Flong+WHERE+%7B%0D%0A%3Fsubject+geo%3Alat+%3Flat.%0D%0A%3Fsubject+geo%3Along+%3Flong.%0D%0A%3Fsubject+rdfs%3Alabel+%3Flabel.%0D%0AFILTER%28%0D%0Axsd%3Adouble%28%3Flat%29+-+xsd%3Adouble%28%2241.88558555827491%22%5E%5Exsd%3Afloat%29+%3C%3D+0.5+%26%26%0D%0Axsd%3Adouble%28%2241.88558555827491%22%5E%5Exsd%3Afloat%29+-+xsd%3Adouble%28%3Flat%29+%3C%3D+0.5+%26%26%0D%0Axsd%3Adouble%28%3Flong%29+-+xsd%3Adouble%28%22-87.65197277069092%22%5E%5Exsd%3Afloat%29+%3C%3D+0.5+%26%26%0D%0Axsd%3Adouble%28%22-87.65197277069092%22%5E%5Exsd%3Afloat%29+-+xsd%3Adouble%28%3Flong%29+%3C%3D+0.5+%26%26%0D%0Alang%28%3Flabel%29+%3D+%22en%22%0D%0A%29.%0D%0A%7D+LIMIT+20&format=application%2Fsparql-results%2Bjson&timeout=30000&debug=on";


$(document).ready(function() {
	$("#testButton").click(function() {
		$.get(query, function(data) {
			console.log(data);
		});
	});
});

function postUser(screen_name, name, location, picture_url, description) {
	var fields = {};

	fields.screen_name = screen_name;
	fields.name = name;
	fields.location = location;
	fields.picture_url = picture_url;
	fields.description = description;

	$.post("postUser.html", JSON.stringify(fields), function(data) {

	});
}