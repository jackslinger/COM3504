/**
 * Created by fabio on 18/02/15.
 * Edited to implement a twitter search by Jack Slinger and Max Riley on 10/03/2015
 */
var protocol = require('http');
var static = require('node-static');
var util = require('util');
var url = require('url');
//var querystring = require('querystring');
var async = require('async');
var mysql = require('mysql');

var request = require('request');
var headers = {
'User-Agent': 'Super Agent/0.0.1',
'Content-Type': 'application/x-www-form-urlencoded'
}

var connection = mysql.createConnection({
    host: 'stusql.dcs.shef.ac.uk',
    user: 'aca12jms',
    password: '5a4e12e9',
    database: 'aca12jms'
});

var Twit = require('twit');
var client = new Twit({
  consumer_key: 'brCFJCNdat0ezG9eJrtB1PGys',
  consumer_secret: '8MzyCfeMWcb520gdhmQZtiJEgLivES0zXF6GsWILdwRyEPdQmI',
  access_token: '2986068370-yU6tg7gl5FqEmUk6qOx4wpNXp6lXEjmlrNtsLFD',
  access_token_secret: 'M0BrggqoLeRO0eITuoK8M00ar1cjA18mF0cEMleuJJDj8'
});

connection.connect();

process.on( 'SIGINT', function() {
  console.log( "\nGracefully shutting down from SIGINT (Ctrl-C)" );
  process.exit();
});

process.on("exit", function() {
    console.log("Closing mysql connection");
    connection.end();
});

var file = new (static.Server)();
var portNo = 3000;
var app = protocol.createServer(function (req, res) {
    var pathname = url.parse(req.url).pathname;
    if ((req.method == 'POST') && (pathname == '/search.html')) {
        var body = '';
        req.on('data', function (data) {
            body += data;
            // if body >  1e6 === 1 * Math.pow(10, 6) ~~~ 1MB
            // flood attack or faulty client
            // (code 413: req entity too large), kill req
            if (body.length > 1e6) {
                res.writeHead(413,
                    {'Content-Type': 'text/plain'}).end();
                req.connection.destroy();
            }
        });
        req.on('end', function () {
            //console.log(body);

            var formData = JSON.parse(body);
            
            var query = formData.query;

            if (formData.since != "") {
                query = query + " since:" + formData.since;
            }

            // if (formData.source != "") {
            //     query = query + " source:" + formData.source;
            // }

            if (formData.from != "") {
                query = query + " from:" + formData.from;
            }

            query = query + " -filter:retweets";
            console.log(query);

            var params = { q: query, lang: 'en', count: 100 };

            if (formData.lat != "" & formData.long != "") {
                var geocode = formData.lat + "," + formData.long + ",5mi";
                params.geocode = geocode;
            }

            var tweetsJSON = '';

            client.get('search/tweets', params,
            function(err, data, response) {       
                //Store user to database
                var tweets = data.statuses;

                for (var index in tweets) {
                    var user = tweets[index].user;
                    storeUserData(user);
                }

                tweetsJSON = JSON.stringify(data);
                res.end(tweetsJSON);
            });
            

            res.writeHead(200, {"Content-Type": "text/plain"});
        });
    } else if ((req.method == 'POST') && (pathname == '/postKeywords.html')) {
        var body = '';
        req.on('data', function (data) {
            body += data;
            // if body >  1e6 === 1 * Math.pow(10, 6) ~~~ 1MB
            // flood attack or faulty client
            // (code 413: req entity too large), kill req
            if (body.length > 1e6) {
                res.writeHead(413,
                    {'Content-Type': 'text/plain'}).end();
                req.connection.destroy();
            }
        });
        req.on('end', function () {
            var formData = JSON.parse(body);

            var query = "from:" + formData.screenname;

            query = query + " since:" + formData.since;

            console.log(query);

            var tweetsJSON = '';

            client.get('search/tweets', { q: query, lang: 'en', lat: formData.lat, long: formData.long, count: 100 },
            function(err, data, response) {          
                tweetsJSON = JSON.stringify(data);
                res.end(tweetsJSON);
            });

            res.writeHead(200, {"Content-Type": "text/plain"});
        });
    } else if ((req.method == 'POST') && (pathname == '/checkUser.html')) {
        var body = '';
        req.on('data', function (data) {
            body += data;
            // if body >  1e6 === 1 * Math.pow(10, 6) ~~~ 1MB
            // flood attack or faulty client
            // (code 413: req entity too large), kill req
            if (body.length > 1e6) {
                res.writeHead(413,
                    {'Content-Type': 'text/plain'}).end();
                req.connection.destroy();
            }
        });
        req.on('end', function () {
            console.log(body);


            client.get('users/show', { screen_name: body },
            function(err, data, response) {
                if (err != null) {
                    console.log(err);
                    res.writeHead(400);
                    res.end();
                } else {
                    tweetsJSON = JSON.stringify(data);
                    res.writeHead(200, {"Content-Type": "text/plain"});
                    res.end(tweetsJSON);
                }         
            });
        });
    } else if ((req.method == 'POST') && (pathname == '/findRetweets.html')) {
        var body = '';
        req.on('data', function (data) {
            body += data;
            // if body >  1e6 === 1 * Math.pow(10, 6) ~~~ 1MB
            // flood attack or faulty client
            // (code 413: req entity too large), kill req
            if (body.length > 1e6) {
                res.writeHead(413,
                    {'Content-Type': 'text/plain'}).end();
                req.connection.destroy();
            }
        });
        req.on('end', function () {
            //console.log(body);

            var id = JSON.parse(body).id;
            var address = 'statuses/retweets/' + id;


            client.get(address, { id: id, count: 10 },
            function(err, data, response) {
                if (err != null) {
                    console.log(err);
                }

                //Store the retweetee to the database
                if (data.length > 1) {
                    storeUserData(data[0].retweeted_status.user);
                }

                for (var i in data) {
                    var tweet = data[i];
                    var user = tweet.user;

                    //First store the retweeter to the database
                    var userData = {};
                    userData.screen_name = user.screen_name;
                    userData.name = user.name;
                    userData.location = user.location;
                    userData.picture_url = user.profile_image_url;
                    userData.description = user.description;
                    storeUserData(userData);
                    
                }

                for (var i in data) {
                    var tweet = data[i];
                    var user = tweet.user;

                    //Then store a link between the retweetee and the retweeter
                    var retweetData = {};
                    retweetData.retweetee = tweet.retweeted_status.user.screen_name;
                    retweetData.retweeter = user.screen_name;

                    storeRetweetData(retweetData);
                }

                res.end(JSON.stringify(data));
            });

            res.writeHead(200, {"Content-Type": "text/plain"});

            // client.get('users/show', { screen_name: body },
            // function(err, data, response) {
            //     if (err != null) {
            //         console.log(err);
            //         res.writeHead(400);
            //         res.end();
            //     } else {
            //         tweetsJSON = JSON.stringify(data);
            //         res.writeHead(200, {"Content-Type": "text/plain"});
            //         res.end(tweetsJSON);
            //     }         
            // });
        });
    } else if ((req.method == 'POST') && (pathname == '/findLocations.html')) {
        var body = '';
        req.on('data', function (data) {
            body += data;
            // if body >  1e6 === 1 * Math.pow(10, 6) ~~~ 1MB
            // flood attack or faulty client
            // (code 413: req entity too large), kill req
            if (body.length > 1e6) {
                res.writeHead(413,
                    {'Content-Type': 'text/plain'}).end();
                req.connection.destroy();
            }
        });
        req.on('end', function () { 
            // SEARCH

            var formData = JSON.parse(body);
            
            var query = "  from:" + formData.screenname + " source:foursquare since:" + formData.since + " -filter:retweets";

            console.log(query);

            var tweetsJSON = '';

            client.get('search/tweets', { q: query, lang: 'en', count: 10 },
            function(err, data, response) {          
                tweetsJSON = JSON.stringify(data);

                var checkinRequests = new Array();

                for (var index in data.statuses) {

                    // Cycles through all urls within a tweet and checks if they are a valid swarm checkin url
                    for (var index2 in data.statuses[index].entities.urls) {
                        var swarmUrl=data.statuses[index].entities.urls[index2].display_url;

                        var testUrl = (swarmUrl.substring(0,15));

                        if (testUrl == "swarmapp.com/c/") {
                            var swarmCode = swarmUrl.substring(15, 26);

                            checkinRequests.push(getCheckin(swarmCode));
                        }
                    }
                }

                async.parallel(checkinRequests, function(err, results) {
                    var venueRequests = new Array();

                    for (var i in results) {
                        var venueID = results[i].response.checkin.venue.id;
                        venueRequests.push(getFullVenue(venueID));
                    }

                    async.parallel(venueRequests, function(err, results) {
                        //Loop through the venues that have been returned and save them to the database
                        for (var index in results) {
                            var venue = results[index].response.venue;
                            var stored = {};

                            var address = "";
                            for (var i in venue.location.formattedAddress) {
                                address = address + venue.location.formattedAddress[i];
                            }

                            stored.id = venue.id;
                            stored.name = venue.name;

                            if (venue.bestPhoto != null) {
                                stored.picture_url = venue.bestPhoto.prefix + "width150" + venue.bestPhoto.suffix;
                            }

                            stored.category = venue.categories[0].name;
                            stored.url = venue.shortUrl;
                            stored.description = venue.description;
                            stored.address = address;

                            storeVenueData(stored);

                            //Store the user
                            var userData = {};
                            var user = data.statuses[0].user;

                            userData.screen_name = user.screen_name;
                            userData.name = user.name;
                            userData.location = user.location;
                            userData.picture_url = user.profile_image_url;
                            userData.description = user.description;

                            storeUserData(userData);


                            //Store the data visit data as well
                            var visitData = {};

                            visitData.user_id = formData.screenname;
                            visitData.venue_id = venue.id;

                            storeVisitData(visitData);
                        }

                        console.log(formData.screenname);

                        res.end(JSON.stringify(results));
                    });
                    
                });
            });

            res.writeHead(200, {"Content-Type": "text/plain"});
        });
    } else if ((req.method == 'POST') && (pathname == '/findVisitors.html')) {
        var body = '';
        req.on('data', function (data) {
            body += data;
            // if body >  1e6 === 1 * Math.pow(10, 6) ~~~ 1MB
            // flood attack or faulty client
            // (code 413: req entity too large), kill req
            if (body.length > 1e6) {
                res.writeHead(413,
                    {'Content-Type': 'text/plain'}).end();
                req.connection.destroy();
            }
        });
        req.on('end', function () {
            
            // SEARCH
            var formData = JSON.parse(body);
            
            var query = formData.location + " source:foursquare since:" + formData.since + " -filter:retweets";
            var geocode = formData.lat + "," + formData.lon + ",20mi"
            var params = { q: query, lang: 'en', count: 10 };

            if (formData.lat != "" && formData.lon != "" && formData.location == "") {
                params = { q: query, geocode: geocode, lang: 'en', count: 10 };
            }

            client.get('search/tweets', params,
            function(err, data, response) {          

                var tweets = data.statuses;
                
                var users = {};
                var requests = new Array();

                //Loop through screen names of the tweets removing duplicates
                //For each unique screen name send a request to get user infomation
                for (var index in tweets) {
                    var screenname = tweets[index].user.screen_name;

                    if (!(screenname in users)) {
                        //console.log(screenname);
                        users[screenname] = true;
                        requests.push(getUser(screenname));
                    }
                }

                async.parallel(requests, function(err, results) {

                    //Loop through the users that have been returned and save them to the database
                    for (var index in results) {
                        var user = results[index];
                        var stored = {};

                        stored.screen_name = user.screen_name;
                        stored.name = user.name;
                        stored.location = user.location;
                        stored.picture_url = user.profile_image_url;
                        stored.description = user.description;

                        storeUserData(stored);
                    }

                    res.end(JSON.stringify(results));
                });

            });

            res.writeHead(200, {"Content-Type": "text/plain"});
        });
    } else if ((req.method == 'POST') && (pathname == '/getTimeline.html')) {
        var body = '';
        req.on('data', function (data) {
            body += data;
            // if body >  1e6 === 1 * Math.pow(10, 6) ~~~ 1MB
            // flood attack or faulty client
            // (code 413: req entity too large), kill req
            if (body.length > 1e6) {
                res.writeHead(413,
                    {'Content-Type': 'text/plain'}).end();
                req.connection.destroy();
            }
        });
        req.on('end', function () {
            console.log(body);

            var screenname = JSON.parse(body).screenname;

            client.get('statuses/user_timeline', { screen_name: screenname, count: 100 },
            function(err, data, response) {
                res.end(JSON.stringify(data));      
            });

            res.writeHead(200, {"Content-Type": "text/plain"});
        });
    } else if((req.method == 'POST') && (pathname == '/postUser.html')) {
        var body = '';
        req.on('data', function (data) {
            body += data;
            // if body >  1e6 === 1 * Math.pow(10, 6) ~~~ 1MB
            // flood attack or faulty client
            // (code 413: req entity too large), kill req
            if (body.length > 1e6) {
                res.writeHead(413,
                    {'Content-Type': 'text/plain'}).end();
                req.connection.destroy();
            }
        });
        req.on('end', function () {
            jsonData = JSON.parse(body);

            storeUserData(jsonData);

            res.writeHead(200, {"Content-Type": "text/plain"});
            res.end();
        });
    } else if((req.method == 'POST') && (pathname == '/queryUser.html')) {
        var body = '';
        req.on('data', function (data) {
            body += data;
            // if body >  1e6 === 1 * Math.pow(10, 6) ~~~ 1MB
            // flood attack or faulty client
            // (code 413: req entity too large), kill req
            if (body.length > 1e6) {
                res.writeHead(413,
                    {'Content-Type': 'text/plain'}).end();
                req.connection.destroy();
            }
        });
        req.on('end', function () {
            jsonData = JSON.parse(body);

            //console.log(jsonData);
            //queryUser(jsonData.name);

            var data = {};

            var query = "SELECT * FROM user ";
            query = query + "LEFT JOIN visit ON visit.user_id = user.screen_name "
            //query = query + "LEFT JOIN venue ON visit.venue_id = venue.id "
            query = query + "WHERE screen_name = '" + jsonData.name + "' OR user.name = '" + jsonData.name + "'";

            connection.query(query, function(err, rows, fields) {
                if (!err) {
                    
                    if (rows.length > 0) {
                        var user = {};
                        for (j in fields) {
                            var field = fields[j].name;
                            user[field] = rows[0][field];
                        }
                        data["user"] = user;
                    }

                    // var visits = {};
                    // for (i in rows) {
                    //     visits[i] = rows[i]["venue_id"];
                    // }


                    //console.log(JSON.stringify(users));

                    var venueQuery = "SELECT * FROM visit LEFT JOIN venue ON venue.id = visit.venue_id WHERE visit.user_id = '" + data.user.screen_name + "'";

                    connection.query(venueQuery, function(err, rows, fields) {
                        if (!err) {
                            var venues = {};
                            for (var i in rows) {
                                var venue = {};
                                for (var j in fields) {
                                    var field = fields[j].name;
                                    venue[field] = rows[i][field];
                                    //console.log(rows[i][field]);
                                }
                                //console.log("");
                                venues[i] = venue;
                            }
                            data["venues"] = venues;

                            var retweetQuery = "SELECT * FROM retweet LEFT JOIN user ON user.screen_name = retweet.retweeter WHERE retweet.retweetee = '" + data.user.screen_name + "'";

                            connection.query(retweetQuery, function(err, rows, fields) {
                                if (!err) {
                                    retweeters = {};
                                    for (var i in rows) {
                                        retweeter = {};
                                        for (var j in fields) {
                                            var field = fields[j].name;
                                            retweeter[field] = rows[i][field];
                                            //console.log(rows[i][field]);
                                        }
                                        //console.log("");
                                        retweeters[i] = retweeter;
                                    }
                                    data["retweeters"] = retweeters;
                                    res.end(JSON.stringify(data));
                                } else {
                                    console.log(err);
                                }
                            });
                        } else {
                            console.log(err);
                        }
                    });
                } else {
                    console.log(err);   
                }
            });

            res.writeHead(200, {"Content-Type": "text/plain"});
            //res.end();
        });
    } else if((req.method == 'POST') && (pathname == '/queryVenue.html')) {
        var body = '';
        req.on('data', function (data) {
            body += data;
            // if body >  1e6 === 1 * Math.pow(10, 6) ~~~ 1MB
            // flood attack or faulty client
            // (code 413: req entity too large), kill req
            if (body.length > 1e6) {
                res.writeHead(413,
                    {'Content-Type': 'text/plain'}).end();
                req.connection.destroy();
            }
        });
        req.on('end', function () {
            jsonData = JSON.parse(body);

            var data = {};

            var venueQuery = "SELECT * FROM venue WHERE name = '" + jsonData.name + "'";

            connection.query(venueQuery, function(err, rows, fields) {
                if (!err) {
                    var venue = {};
                    if (rows.length > 0) {
                        for (var j in fields) {
                            var field = fields[j].name;
                            venue[field] = rows[0][field];
                        }
                    }
                    data["venue"] = venue;

                    var visitersQuery = "SELECT * FROM visit LEFT JOIN user ON user.screen_name = visit.user_id WHERE visit.venue_id = '" + data.venue.id + "'";

                    connection.query(visitersQuery, function(err, rows, fields) {
                        if (!err) {
                            var users = {}
                            for (var i in rows) {
                                var user = {};
                                for (var j in fields) {
                                    var field = fields[j].name;
                                    user[field] = rows[i][field];
                                }
                                users[i] = user;
                            }
                            data["users"] = users;
                            res.end(JSON.stringify(data));
                        } else {
                            console.log(err);
                        }
                    });
                } else {
                    console.log(err);
                }
            });

            res.writeHead(200, {"Content-Type": "text/plain"});
        });
    } else if((req.method == 'POST') && (pathname == '/findInterest.html')) {
        var body = '';
        req.on('data', function (data) {
            body += data;
            // if body >  1e6 === 1 * Math.pow(10, 6) ~~~ 1MB
            // flood attack or faulty client
            // (code 413: req entity too large), kill req
            if (body.length > 1e6) {
                res.writeHead(413,
                    {'Content-Type': 'text/plain'}).end();
                req.connection.destroy();
            }
        });
        req.on('end', function () {
            jsonData = JSON.parse(body);

            var venueid = jsonData.id;
            
            console.log("Find points of interest");

            //Set the options for the foursquare call
            var options = {
                url: 'https://api.foursquare.com/v2/venues/' + venueid,
                method: 'GET',
                headers: headers,
                qs: {'VENUE_ID' : venueid, 'oauth_token' : 'ONYO0JUQTC1NBSE3IXRZ1A1NKSKQHJGFW1IB4JRDTBTH5ODY',
                'v' :'20140806', m: 'swarm'}
            }

            //make the foursquare call to get the checkin object
            request(options, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var venue = JSON.parse(body).response.venue;
                    
                    console.log("Got the checkin");
                    console.log(venue.name);
                    
                    //Get the latitude and longitude from the checkin
                    var lat = venue.location.lat;
                    var lon = venue.location.lng;

                    //Create the dbpedia sparqle query using the latidute and longidute
                    var path = "/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org&query=PREFIX+geo%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2003%2F01%2Fgeo%2Fwgs84_pos%23%3E%0D%0ASELECT+%3Fsubject+%3Flabel+%3Flat+%3Flong+WHERE+%7B%0D%0A%3Fsubject+geo%3Alat+%3Flat.%0D%0A%3Fsubject+geo%3Along+%3Flong.%0D%0A%3Fsubject+rdfs%3Alabel+%3Flabel.%0D%0AFILTER%28%0D%0Axsd%3Adouble%28%3Flat%29+-+xsd%3Adouble%28%22";
                    path = path + lat;
                    path = path + "%22%5E%5Exsd%3Afloat%29+%3C%3D+0.5+%26%26%0D%0Axsd%3Adouble%28%22";
                    path = path + lat;
                    path = path + "%22%5E%5Exsd%3Afloat%29+-+xsd%3Adouble%28%3Flat%29+%3C%3D+0.5+%26%26%0D%0Axsd%3Adouble%28%3Flong%29+-+xsd%3Adouble%28%22";
                    path = path + lon;
                    path = path + "%22%5E%5Exsd%3Afloat%29+%3C%3D+0.5+%26%26%0D%0Axsd%3Adouble%28%22";
                    path = path + lon;
                    path = path + "%22%5E%5Exsd%3Afloat%29+-+xsd%3Adouble%28%3Flong%29+%3C%3D+0.5+%26%26%0D%0Alang%28%3Flabel%29+%3D+%22en%22%0D%0A%29.%0D%0A%7D+LIMIT+20&format=application%2Fsparql-results%2Bjson&timeout=30000&debug=on";
                    
                    //Set the options for the call to dbpedia
                    var options = {
                      host: 'www.dbpedia.org',
                      path: path
                    };

                    //Make a http get request to the address and give a callback function
                    var dbp_req = protocol.get(options, function(dbp_res) {
                        // Buffer the body entirely for processing as a whole.
                        var bodyChunks = [];
                        dbp_res.on('data', function(chunk) {
                        // You can process streamed parts here...
                        bodyChunks.push(chunk);
                    }).on('end', function() {
                        var body = Buffer.concat(bodyChunks);

                        //Parse the json data recived
                        var data = JSON.parse(body);
                        var bindings = data.results.bindings;

                        var results = {};

                        //Loop through the data adding it to results
                        //Dbpedia will sometimes include results with different lat and long but the same link. These should be culled down to just one entry
                        for (var index in bindings) {
                            var binding = bindings[index];

                            var result = {};
                            result.label = binding.label.value;
                            result.lat = binding.lat.value;
                            result.lon = binding.long.value;
                            result.link = binding.subject.value;

                            results[index] = result;
                        }

                        //Send the results
                        res.end(JSON.stringify(results));
                        })
                    });

                    dbp_req.on('error', function(e) {
                        //Log a console message if an error occurs
                        console.log('ERROR: ' + e.message);
                    });
                } else {
                    console.log('error: '+error + ' status: '+response.statusCode);
                }
            });

            res.writeHead(200, {"Content-Type": "text/plain"});
        });
    } else {
        file.serve(req, res, function (err, result) {
            if (err != null) {
                console.error('Error serving %s - %s', req.url, err.message);
                if (err.status === 404 || err.status === 500) {
                    file.serveFile(util.format('/%d.html', err.status), err.status, {}, req, res);
                } else {
                    res.writeHead(err.status, err.headers);
                    res.end();
                }
            } else {
                res.writeHead(200, {"Content-Type": "text/plain", 'Access-Control-Allow-Origin': '*'});
                res.end();
            }
        });
    }
}).listen(portNo);



function getCheckin(swarmCode) {
    return function(callback) {
        setTimeout(function() {
            var options = {
                url: 'https://api.foursquare.com/v2/checkins/resolve',
                method: 'GET',
                headers: headers,
                qs: {'shortId' : swarmCode, 'oauth_token' : 'ONYO0JUQTC1NBSE3IXRZ1A1NKSKQHJGFW1IB4JRDTBTH5ODY',
                'v' :'20140806', m: 'swarm'}
            }

            request(options,
                function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        // Print out the response body
                        var raw = JSON.parse(body);

                        temp = raw.response.checkin.venue.name;
                        //console.log(temp);
                        callback(null, raw);
                    }
                    else console.log('error: '+error + ' status: '+response.statusCode);
            });
        }, 200);
    }
}

function getFullVenue(venueid) {
    return function(callback) {
        setTimeout(function() {
            var options = {
                url: 'https://api.foursquare.com/v2/venues/' + venueid,
                method: 'GET',
                headers: headers,
                qs: {'VENUE_ID' : venueid, 'oauth_token' : 'ONYO0JUQTC1NBSE3IXRZ1A1NKSKQHJGFW1IB4JRDTBTH5ODY',
                'v' :'20140806', m: 'swarm'}
            }

            request(options,
                function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        // Print out the response body
                        var raw = JSON.parse(body);

                        //temp = raw.response.checkin.venue.name;
                        //console.log(temp);
                        callback(null, raw);
                    }
                    else console.log('error: '+error + ' status: '+response.statusCode);
            });
        }, 200);
    }
}

function getUser(screenname) {
    return function(callback) {
        setTimeout(function() {
            client.get('users/show', { screen_name: screenname },
            function(err, data, response) {
                callback(null, data);        
            });
        }, 200);
    }
}

function getStoreDataQuery(table, fields, values) {
    var query = "";
    var queryFields  = "(";
    var queryValues = "VALUES(";
    var queryUpdate = "";

    //Check that fields and values are arrays of the same size
    var length = fields.length;
    if (length != values.length) {
        return "";
    }

    for (var i = 0; i < length; i++) {
        var cleanValue = values[i].replace(/["']/g, "");

        queryFields = queryFields + fields[i];
        queryValues = queryValues + "'" + cleanValue + "'";
        queryUpdate = queryUpdate + fields[i] + "=VALUES(" + fields[i] + ")";
        if (i < length - 1) {
            queryFields = queryFields + ",";
            queryValues = queryValues + ",";
            queryUpdate = queryUpdate + ",";
        }
    }

    queryFields = queryFields + ")";
    queryValues = queryValues + ")";

    query = "INSERT INTO " + table + " " + queryFields + " " + queryValues + " ON DUPLICATE KEY UPDATE " + queryUpdate;
    return query;
}

function storeUserData(twitterUser) {
    var fields = new Array();
    var values = new Array();

    if (twitterUser.screen_name == null) {
        console.log("Invalid screen_name");
    } else {
        fields.push("screen_name");
        values.push(twitterUser.screen_name);

        if (twitterUser.name != null) {
            fields.push("name");
            values.push(twitterUser.name);
        }
        if (twitterUser.location != null) {
            fields.push("location");
            values.push(twitterUser.location);
        }
        if (twitterUser.picture_url != null) {
            fields.push("picture_url");
            values.push(twitterUser.picture_url);
        }
        if (twitterUser.description != null) {
            fields.push("description");
            values.push(twitterUser.description);
        }

        var query = getStoreDataQuery("user", fields, values);

        connection.query(query, function(err, rows, fields) {
            if (!err) {
                //console.log("Data added");
            } else {
                console.log(err);   
            }
        });
    }
}

function storeVenueData(venueData) {
    var fields = new Array();
    var values = new Array();

    if (venueData.id == null) {
        console.log("Invalid venue");
    } else {
        fields.push("id");
        values.push(venueData.id);

        if (venueData.name != null) {
            fields.push("name");
            values.push(venueData.name);
        }
        if (venueData.picture_url != null) {
            fields.push("picture_url");
            values.push(venueData.picture_url);
        }
        if (venueData.category != null) {
            fields.push("category");
            values.push(venueData.category);
        }
        if (venueData.address != null) {
            fields.push("address");
            values.push(venueData.address);
        }
        if (venueData.url != null) {
            fields.push("url");
            values.push(venueData.url);
        }
        if (venueData.description != null) {
            fields.push("description");
            values.push(venueData.description);
        }

        var query = getStoreDataQuery("venue", fields, values);

        connection.query(query, function(err, rows, fields) {
            if (!err) {
                //console.log("Data added");
            } else {
                console.log(err);   
            }
        });
    }
}

function storeVisitData(visitData) {
    var fields = new Array();
    var values = new Array();

    if (visitData.user_id == null || visitData.venue_id == null) {
        console.log("Invalid input");
    } else {

        if (visitData.user_id != null) {
            fields.push("user_id");
            values.push(visitData.user_id);
        }
        if (visitData.venue_id != null) {
            fields.push("venue_id");
            values.push(visitData.venue_id);
        }

        var query = getStoreDataQuery("visit", fields, values);

        connection.query(query, function(err, rows, fields) {
            if (!err) {
                //console.log("Data added");
            } else {
                console.log(err);   
            }
        });
    }
}

function storeRetweetData(retweetData) {
    var fields = new Array();
    var values = new Array();

    if (retweetData.retweetee == null || retweetData.retweeter == null) {
        console.log("Invalid input");
    } else {

        if (retweetData.retweetee != null) {
            fields.push("retweetee");
            values.push(retweetData.retweetee);
        }
        if (retweetData.retweeter != null) {
            fields.push("retweeter");
            values.push(retweetData.retweeter);
        }

        var query = getStoreDataQuery("retweet", fields, values);

        connection.query(query, function(err, rows, fields) {
            if (!err) {
                //console.log("Data added");
            } else {
                console.log(err);   
            }
        });
    }
}

//function queryUser(name) {

//}

function queryUserVisit(screen_name) {
    var query = "SELECT user_id, name FROM visit ";
    // query = query + "LEFT JOIN visit ON visit.user_id = user.screen_name ";
    query = query + "LEFT JOIN venue ON visit.venue_id = venue.id ";
    query = query + "WHERE user_id = '" + screen_name + "'";

    connection.query(query, function(err, rows, fields) {
        if (!err) {
            var users = {};
            for (i in rows) {
                var user = {}
                for (j in fields) {
                    var field = fields[j].name;
                    user[field] = rows[i][field];
                    console.log(rows[i][field]);
                }
                users[i] = user;
                console.log("");
            }
            //console.log(JSON.stringify(users));
        } else {
            console.log(err);   
        }
    });
}