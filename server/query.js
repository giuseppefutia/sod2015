var http = require('http');

var host = "sandbox.fusepool.info";

var prefixes = "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> " +
        "PREFIX schema: <http://schema.org/> " +
        "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> " +
        "PREFIX dbo: <http://it.dbpedia.org/ontology> " +
        "PREFIX skos: <http://www.w3.org/2004/02/skos/core#> " +
        "PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> " +
        "PREFIX dct: <http://purl.org/dc/terms/> " +
        "PREFIX foaf: <http://xmlns.com/foaf/0.1/>";

exports.allEvents = function() {
    return encodeURIComponent(prefixes +
        "CONSTRUCT {?subject rdfs:label ?headline . " +
        "?subject schema:startDate ?dateStart . " +
        "?subject schema:endDate ?dateEnd . " +
        "} " +
        "FROM <http://sandbox.fusepool.info:8181/ldp/wr-ldpc/Trentino-Events-1/eventi-xml-xml-transformed> " +
        "WHERE { " +
        "?subject a schema:Event ; " +
        "schema:description ?title ; " +
        "rdfs:label ?headline;" +
        "schema:startDate ?dateStart ; " +
        "schema:endDate ?dateEnd . " +
        "FILTER( lang(?title)='it' ) " +
        "}");
}

exports.singleEventProperties = function(eventURI) {
    return encodeURIComponent(prefixes +
        "CONSTRUCT {<" + eventURI + "> ?eventProperty ?eventValue ." +
        "?location ?locationProperty ?locationValue . " + 
        "?organizer ?organizerProperty ?organizerValue . " +
        "?address ?addressProperty ?addressValue. } " +
        "FROM <http://sandbox.fusepool.info:8181/ldp/wr-ldpc/Trentino-Events-1/eventi-xml-xml-transformed> " +
        "WHERE { <" + eventURI + "> ?eventProperty ?eventValue ; " +
        "schema:location ?location ; " +
        "schema:organizer ?organizer . " +
        "?location ?locationProperty ?locationValue . " +
        "?location schema:address ?address . " +
        "?address ?addressProperty ?addressValue . " +
        "?organizer ?organizerProperty ?organizerValue . " +
        " } LIMIT 200");
}

exports.eventLatLong = function(eventURI) {
    return encodeURIComponent(prefixes +
        "CONSTRUCT {<" + eventURI + "> geo:lat ?lat . " +
        "<" + eventURI + "> geo:long ?long . } " +
        "FROM <http://sandbox.fusepool.info:8181/ldp/wr-ldpc/Trentino-Events-1/eventi-xml-xml-transformed> " +
        "WHERE { <" + eventURI + "> schema:location ?location . " +
        "?location geo:lat ?lat ; " +
        "geo:long ?long ." +
        " } ");
}   

exports.closerPOIs = function(eventURI, lowLat, highLat, lowLong, highLong) { //For testing (46.05, 46.07, 11.12, 11.14)  
    return encodeURIComponent(prefixes +
        "CONSTRUCT { ?subject ?property ?object . " +
        "<" + eventURI + "> <contains> ?subject . }" +
        "FROM <http://sandbox.fusepool.info:8181/ldp/trentino-point-of-interest-ttl> " +
        "WHERE { " +
        "?subject ?property ?object ; " +
        "geo:lat ?lat ; " +
        "geo:long ?long ; " +
        "foaf:homepage ?homepage ; " +
        "schema:category ?category . " +
        "FILTER (?lat >= '" + lowLat + "'^^xsd:double && ?lat <= '" + highLat + "'^^xsd:double && ?long >= '" + lowLong + "'^^xsd:double && ?long <= '" + highLong + "'^^xsd:double) " +
            "{ " + 
                "SELECT DISTINCT ?homepage { " +
                "?subject foaf:homepage ?homepage . " +
                "} " +
            "LIMIT 20 " + 
            "} " +
        "} LIMIT 2000");
}

exports.launchSparqlQuery = function (request, response, query) {

    var result = "";

    console.info(decodeURIComponent(query));

    var options = {
        host: host,
        path: "/sparql/select?query=" + (typeof(query) === "function" ? query() : query), /// XXX
        port: "8181",
        method: "GET",
        headers: {
            accept: "text/turtle"
        } 
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
