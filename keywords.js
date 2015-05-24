var wordCount = {};
var validUsers = [];
var searchRequests = [];
var userRequests = [];

var numOfKeywords = "";
var since = "";

$(document).ready(function() {
	$("#sendButton").click(validateInput);

	//stopwords from http://xpo6.com/list-of-english-stop-words/
	stopwords = new Set(["a", "about", "above", "above", "across", "after", "afterwards", "again", "against", "all", "almost", "alone", "along", "already", "also",
				"although","always","am","among", "amongst", "amoungst", "amount",  "an", "and", "another", "any","anyhow","anyone","anything","anyway",
				"anywhere", "are", "around", "as",  "at", "back","be","became", "because","become","becomes", "becoming", "been", "before", "beforehand",
				"behind", "being", "below", "beside", "besides", "between", "beyond", "bill", "both", "bottom","but", "by", "call", "can", "cannot", "cant",
				"co", "con", "could", "couldnt", "cry", "d", "de", "describe", "detail", "do", "done", "down", "due", "during", "each", "eg", "eight", "either",
				"eleven","else", "elsewhere", "empty", "enough", "etc", "even", "ever", "every", "everyone", "everything", "everywhere", "except", "few",
				"fifteen", "fify", "fill", "find", "fire", "first", "five", "for", "former", "formerly", "forty", "found", "four", "from", "front", "full",
				"further", "get", "give", "go", "had", "has", "hasnt", "have", "he", "hence", "her", "here", "hereafter", "hereby", "herein", "hereupon", "hers",
				"herself", "him", "himself", "his", "how", "however", "hundred", "i", "ie", "if", "in", "inc", "indeed", "interest", "into", "is", "it", "its",
				"itself", "keep", "last", "latter", "latterly", "least", "less", "ltd", "made", "many", "may", "me", "meanwhile", "might", "mill", "mine",
				"more", "moreover", "most", "mostly", "move", "much", "must", "my", "myself", "name", "namely", "neither", "never", "nevertheless", "next",
				"nine", "no", "nobody", "none", "noone", "nor", "not", "nothing", "now", "nowhere", "of", "off", "often", "on", "once", "one", "only", "onto",
				"or", "other", "others", "otherwise", "our", "ours", "ourselves", "out", "over", "own","part", "per", "perhaps", "please", "put", "rather", "re",
				"s", "same", "see", "seem", "seemed", "seeming", "seems", "serious", "several", "she", "should", "show", "side", "since", "sincere", "six", "sixty",
				"so", "some", "somehow", "someone", "something", "sometime", "sometimes", "somewhere", "still", "such", "system", "t", "take", "ten", "than", "that",
				"the", "their", "them", "themselves", "then", "thence", "there", "thereafter", "thereby", "therefore", "therein", "thereupon", "these", "they",
				"thickv", "thin", "third", "this", "those", "though", "three", "through", "throughout", "thru", "thus", "to", "together", "too", "top", "toward",
				"towards", "twelve", "twenty", "two", "un", "under", "until", "up", "upon", "us", "very", "via", "was", "we", "well", "were", "what", "whatever",
				"when", "whence", "whenever", "where", "whereafter", "whereas", "whereby", "wherein", "whereupon", "wherever", "whether", "which", "while",
				"whither", "who", "whoever", "whole", "whom", "whose", "why", "will", "with", "within", "without", "would", "yet", "you", "your", "yours",
				"yourself", "yourselves", "the"]
	);
});

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

function validateInput() {
    clearData();
    console.log("Validating input");

    //Initiilize the total wordcount for use later
    wordCount["total"] = {};

    //Get values from the form
    var keywordsInput = $('#keywordsInput').val();
    numOfKeywords = parseInt(keywordsInput);
    var screenNames = $('#screenNamesInput').val();
    var daysInput = $('#daysInput').val();
    var days = parseInt(daysInput);
    
    //Validate the input
    if (screenNames == "") {
        alert("Please provide twitter screen names seperated by a single space!");
        $("#screenNamesInput").focus();
        return false;
    }
    if (keywordsInput == "") {
        alert("Please provide a number of keywords!");
        $("#keywordsInput").focus();
        return false;
    }
    if (daysInput == "") {
        alert("Please provide a number of Days!");
        $("#daysInput").focus();
        return false;
    }

    //Process the input ready to send
    since = findDate(days);
    names = screenNames.split(" ");

    for (var i in names) {
        var screenname = names[i];
        userRequests.push(checkUser(screenname));
    }

    $.when.apply($, userRequests).then(sendData);
}

function sendData() {
    for (var i in validUsers) {
        searchRequests.push(getSearchRequest(validUsers[i], numOfKeywords, since));
    }

    //Wait untill all of the requests for tweets have returned before processing
    $.when.apply($, searchRequests).then(function() {
        //console.log(wordCount);

        var keywords = [];

        for (var i = 0; i < numOfKeywords; i++) {
            keywords[i] = {key: "", value: 0};
        }

        var index = 0;
        var set = false;
        for (var word in wordCount["total"]) {
            var validWord = true;

            for (var i in wordCount) {
                if (getCount(wordCount[i], word) == 0) {
                    validWord = false;
                }
            }

            if (validWord) {
                set = false;
                index = 0;
                while (!set && index < keywords.length) {
                    if (wordCount["total"][word] > keywords[index].value) {
                        keywords[index].value = wordCount["total"][word];
                        keywords[index].key = word;
                        set = true;
                    }
                    index++;
                }
            }
        }

        for (var i = 0; i < keywords.length; i++) {
            if (keywords[i].key != "") {
                var tableBody = $("#keywordTableBody");
                var row = "<tr>";
                row = row + "<td>" + keywords[i].key + "</td>";

                for (var j in validUsers) {
                    row = row + "<td>" + getCount(wordCount[validUsers[j]], keywords[i].key) + "</td>";
                }            
                
                row = row + "<td>" + keywords[i].value + "</td>";   
                row = row + "</tr>";

                tableBody.append(row);
            }
        }

        //console.log(keywords);
    });

    var tableHead = $("#keywordTableHead");
    var row = "<tr>";
    row = row + "<th>Keyword</th>";
    for (var i in validUsers) {
        row = row + "<th>" + validUsers[i] + "</th>";
    }
    row = row + "<th>Total</th>";
    row = row + "</tr>";

    tableHead.append(row);
}

function getSearchRequest(screen_name, numOfKeywords, since) {
	return $.post("/postKeywords.html", JSON.stringify({screenname: screen_name, keywords: numOfKeywords, since: since}), function(data){

        var struct  = JSON.parse(data);
        var tweets = struct.statuses;

        wordCount[screen_name] = {};

        for (var index in tweets) {
            var tweet = tweets[index];
            
            var hashRegex = new RegExp('#([^\\s]*)', 'g');
            var atRegex = new RegExp('@([^\\s]*)', 'g');
            var linkRegex = new RegExp('http://([^\\s]*)', 'g');
            var securelinkRegex = new RegExp('https://([^\\s]*)', 'g');
            var retweetRegex = new RegExp('RT ', 'g');
            var punctuationRegex = new RegExp("[\(\),\"{}.!:\?-]", 'g');

            var edited = tweet.text.replace(hashRegex, '');
            edited = edited.replace(atRegex, '');
            edited = edited.replace(linkRegex, '');
            edited = edited.replace(securelinkRegex, '');
            edited = edited.replace(retweetRegex, '');
            edited = edited.replace(punctuationRegex, '');
            edited = edited.toLowerCase();

            var array = edited.match(/\b\w+\b/g);

            for (var word in array) {
            	if (!stopwords.has(array[word])) {
            		incrementCount(wordCount["total"], array[word]);
                    incrementCount(wordCount[screen_name], array[word]);
            	}
            }

        }
	});
}

function clearData() {
	$("#keywordTable tr").remove();

    wordCount = {};
    searchRequests = [];
    userRequests = [];
    validUsers = [];
}

function incrementCount(dictonary, word) {
	if (dictonary[word] != null) {
		dictonary[word] += 1;
	} else {
		dictonary[word] = 1;
	}
}

function getCount(dictonary, word) {
    if (dictonary[word] != null) {
        return dictonary[word];
    } else {
        return 0;
    }
}

function checkUser(screen_name) {
    return $.ajax({
        url: "/checkUser.html",
        data: screen_name,
        method: "POST",
        success: function(data) {
            //alert("Success.");
            //deferred.push(sendData(screen_name));
            validUsers.push(screen_name);
        },
        error: function(xhr, statusText, err) {
            alert(screen_name + " is not a valid twitter screen name!");
        }
    });
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