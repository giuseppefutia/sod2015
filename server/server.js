var http = require('http');
var express = require('express');
var util = require('util');

var FP = {};
FP.query = {};
FP.host = "sandbox.fusepool.info";
FP.query.allEvents = encodeURIComponent("PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> " +
    "PREFIX schema: <http://schema.org/> " +
    "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> " +
    "PREFIX dbo: <http://it.dbpedia.org/ontology> " +
    "PREFIX skos: <http://www.w3.org/2004/02/skos/core#> " +
    "CONSTRUCT {?subject rdfs:label ?headline} " +
    "FROM <http://sandbox.fusepool.info:8181/ldp/wr-ldpc/Trentino-Events-1/eventi-xml-xml-transformed> " +
    "WHERE { " +
    "?subject a schema:Event ; " +
    "schema:description ?title ; " +
    "rdfs:label ?headline;" +
    "schema:startDate ?dateStart ; " +
    "schema:endDate ?dateEnd . " +
    "FILTER( lang(?title)='it' ) " +
    "}");

FP.query.singleEventProperties = function (eventURI) {
    return encodeURIComponent("PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> " +
        "PREFIX schema: <http://schema.org/> " +
        "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> " +
        "PREFIX dbo: <http://it.dbpedia.org/ontology> " +
        "PREFIX skos: <http://www.w3.org/2004/02/skos/core#> " +
        "CONSTRUCT {<" + eventURI + "> ?property ?hasValue } " +
        "WHERE { <" + eventURI + "> ?property ?hasValue } ");
}

FP.query.closerPOI = function (lowLat, highLat, lowLong, highLong) { //For testing (46.05, 46.07, 11.12, 11.14)  
    return encodeURIComponent("PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> " +
        "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> " +
        "PREFIX schema: <http://schema.org/> " +
        "PREFIX dct: <http://purl.org/dc/terms/> " +
        "CONSTRUCT { ?subject ?property ?object .} " +
        "FROM <http://sandbox.fusepool.info:8181/ldp/trentino-point-of-interest-ttl> " +
        "WHERE { " +
        "?subject ?property ?object ; " +
        "geo:lat ?lat ; " +
        "geo:long ?long . " +
        "FILTER (?lat >= '" + lowLat + "'^^xsd:double && ?lat <= '" + highLat + "'^^xsd:double && ?long >= '" + lowLong + "'^^xsd:double && ?long <= '" + highLong + "'^^xsd:double) " +
        "}");
}

FP.launchSparqlQuery = function (request, response, query) {
    var result = "";

    var options = {
        host: FP.host,
        path: "/sparql/select?query=" + query + "&output=json",
        port: "8181",
        method: "GET",
    };

    var req = http.request(options, function(res) {
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            result += chunk;
        });

        res.on('end', function() {
            response.send(result);
        });
    });

    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });

    req.end();
}

var app = express();

app.use(express.static('../'));

app.get('/allEvents', function (request, response) {
    FP.launchSparqlQuery(request, response, FP.query.allEvents);
});

app.get('/eventProperties/:uri', function (request, response) {
    FP.launchSparqlQuery(request, response, FP.query.singleEventProperties(request.param("uri")));
});

app.get('/closerPOI', function (request, response) {
    FP.launchSparqlQuery(request, response, FP.query.closerPOI(request.param("lowLat"), request.param("highLat"), request.param("lowLong"), request.param("highLong")));

    console.info(FP.query.closerPOI(request.param("lowLat"), request.param("highLat"), request.param("lowLong"), request.param("highLong")));
});

var server = app.listen(3000, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Server listening at http://%s:%s', host, port);
});