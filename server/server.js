var express = require('express');
var FP = require("./query.js");

var app = express();

app.use(express.static('../'));

app.get('/allEvents', function (request, response) {
    FP.launchSparqlQuery(request, response, FP.allEvents);
});

app.get('/eventProperties/:uri', function (request, response) {
    FP.launchSparqlQuery(request, response, FP.singleEventProperties(request.param("uri")));
});

app.get('/eventLatLong/:uri', function (request, response) {
    FP.launchSparqlQuery(request, response, FP.eventLatLong(request.param("uri")));
});

app.get('/closerPOIs', function (request, response) {
    FP.launchSparqlQuery(request, response, FP.closerPOIs(request.param("uri"), request.param("lowLat"), request.param("highLat"), request.param("lowLong"), request.param("highLong")));
});

var server = app.listen(3000, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Server listening at http://%s:%s', host, port);
});
