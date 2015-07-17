var express = require('express');
var FP = require("./query.js");

var app = express();

// Here you manage parameters depending on the server

//Fusepool parameter
var fusepoolHost = "data.fusepool.info";
var fusepoolPath = "/sparql/select?query=";
var fusepoolPort = "8181";

//Odino parameter
var odinoHost = "pentos.polito.it";
var odinoPath = "/sparql?default-graph-uri=http://explorer.nexacenter.org/master&query=";
var odinoPathFeed = "/sparql?default-graph-uri=http://explorer.nexacenter.org/feed&query=";
var odinoPort = "8890";

app.use(express.static('../'));

app.get('/allEvents', function (request, response) {
	 response.header("Access-Control-Allow-Origin", "*");
    //FP.launchSparqlQuery(request, response, FP.allEvents);
});

app.get('/eventProperties/:uri', function (request, response) {
    FP.launchSparqlQuery(fusepoolHost,
    					fusepoolPath,
    					fusepoolPort,
    					request,
    					response, 
    					FP.singleEventProperties(request.param("uri")));
});

app.get('/eventLatLong/:uri', function (request, response) {
    FP.launchSparqlQuery(fusepoolHost,
    					fusepoolPath,
    					fusepoolPort,
    					request,
     					response,
     					FP.eventLatLong(request.param("uri")));
});

app.get('/closerPOIs', function (request, response) {
    FP.launchSparqlQuery(odinoHost,
    					odinoPath,
    					odinoPort,
    					request,
    			 		response,
    			 		FP.closerPOIs(request.param("uri"), request.param("lowLat"), request.param("highLat"), request.param("lowLong"), request.param("highLong")));
});

app.get('/update', function (request, response) {
    var query = FP.createModifyQuery(request.query["updater"]);
    FP.launchSparqlQuery(odinoHost,
                        odinoPathFeed,
                        odinoPort,
                        request,
                        response,
                        FP.modify(query));
});

app.get('/test', function (request, response) {
    FP.launchSparqlQuery(odinoHost,
    					odinoPath,
    					odinoPort,
    					request, 
    					response,
    					FP.test);
});

var server = app.listen(3000, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Server listening at http://%s:%s', host, port);
});
