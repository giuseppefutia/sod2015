var http = require('http');
var express = require('express');
var util = require('util');

// Define an object for manage data from Fusepool Platform.

var FP = {};
FP.query = {};
FP.host = "sandbox.fusepool.info";
FP.query.allEvents = encodeURIComponent("PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> " +
          "PREFIX schema: <http://schema.org/> " +
          "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> " +
          "PREFIX dbo: <http://it.dbpedia.org/ontology> " +
          "PREFIX skos: <http://www.w3.org/2004/02/skos/core#> " +
          "SELECT ?subject ?headline ?title ?dateStart ?dateEnd " +
          "FROM <http://sandbox.fusepool.info:8181/ldp/wr-ldpc/Trentino-Events-1/eventi-xml-xml-transformed> " +
          "WHERE { " +
              "?subject a schema:Event ; " +
                  "schema:description ?title ; " +
                  "rdfs:label ?headline;" +
                  "schema:startDate ?dateStart ; " +
                  "schema:endDate ?dateEnd . " +
              "FILTER( lang(?title)='it' ) " +
          "}");

FP.query.eventsProperties = "none";

var app = express();

app.use(express.static('../'));

app.get('/allEvents', function (request, response) {	
	
	var result = "";

	var options = {
        host: FP.host,
        path: "/sparql/select?query=" + FP.query.allEvents + "&output=json",
        port: '8181',
        method: 'GET',
    };

    var req = http.request(options, function(res) {
  		console.log('STATUS: ' + res.statusCode);
  		console.log('HEADERS: ' + JSON.stringify(res.headers));
  		res.setEncoding('utf8');
  		res.on('data', function (chunk) {
    		result +=  chunk;
  		});

  		res.on('end', function () {
  			response.send(result);
  		});
	});

	req.on('error', function (e) {
  	    console.log('problem with request: ' + e.message);
    });
    
    req.end();

});

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Server listening at http://%s:%s', host, port);
});
