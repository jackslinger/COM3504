/**
 * Created by Jack Slinger and Max Riley on 10/03/2015.
 */

$(document).ready(function() {
    $("#sendButton").click(sendData);
    $("#loading").hide();
});

function sendData() {
    //Get the values from the form
    var query = $("#keywordsInput").val();
    var from = $("#fromInput").val();
    var lat = $("#latInput").val();
    var lon = $("#lonInput").val();
    var daysInput = $("#daysInput").val();
    var days = parseInt(daysInput);

    //Validate the data
    if (daysInput == "") {
        alert("Please provide a number of Days!");
        $("#daysInput").focus();
        return false;
    }
    if (query == "") {
        alert("Please enter a Query!");
        $("#keywordsInput").focus();
        return false;
    }

    //Process the data ready to be sent to the server
    var since = findDate(days);
    var params = {query: query, from: from, lat: lat, lon: lon, since: since}
    console.log(query);
    console.log(since);

    //Show the loading text
    $("#loading").show();

    //Send a POST request to the server and display the results
    $.post("/search.html", JSON.stringify(params), function(data) {
        var tweets = JSON.parse(data).statuses;
        populateTable(tweets);
    });
}

function clearData() {
    var tableBody = document.getElementById("tweetTableBody");
    tableBody.innerHTML = "";
}

function populateTable(tweets) {
    clearData();

    if (tweets.length == 0) {
        alert("No tweets found.");
    }

    for (var index in tweets) {
        var tweet = tweets[index];
            
        var tableBody = document.getElementById("tweetTableBody");
        var row = tableBody.insertRow(0);
        row.insertCell(0).innerHTML = tweet.created_at;
        row.insertCell(1).innerHTML = tweet.user.screen_name;
        row.insertCell(2).innerHTML = tweet.text;
        row.insertCell(3).innerHTML = tweet.id_str;

        var retweetCount = tweet.retweet_count;
        var link = "No retweets avalible"

        if (retweetCount > 0) {
            link = "<a href='retweets.html?id=" + tweet.id_str + "' target='_blank'>retweets</a>";
        }
        
        row.insertCell(4).innerHTML = link;
    }

    //Hide the loading text again
    $("#loading").hide();
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