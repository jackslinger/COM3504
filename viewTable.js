$(document).ready(function() {
	$("#populateButton").click(populateTable);
	$("#sendButton").click(sendUser);

	loadData();
});

function populateTable() {
	clearTable()
	loadData()
}

$.fn.serializeObject = function () {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function () {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

function loadData() {
	$.get("/selectUser.html", function(data) {
		var rows = data.rows;
		var fields = data.fields;

		for (index in fields) {
			$("#tableHead").append('<th>' + fields[index].name + '</th>');	
		}

		for (i in rows) {
			var tr = "<tr>"

			for (j in fields) {
				var fieldName = fields[j].name
				tr = tr + "<td>" + rows[i][fieldName] + "</td>";
			}

			tr = tr + "</tr>"

			$("#tableBody").append(tr);
		}
	});
}

function clearTable() {
	$("#tableHead th").remove();
	$("#tableBody tr").remove();
}

function sendUser() {
	$.post("/postUser.html", JSON.stringify($('form').serializeObject()), function(data){
		console.log("data sent");
		console.log(data);
	});
}