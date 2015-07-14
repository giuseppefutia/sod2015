var http = require('http');

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
        //"FROM <http://data.fusepool.info:8181/ldp/wr-ldpc/Trentino-Events-1/eventi-xml-xml-transformed> " +
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
        "<" + eventURI + "> <contains> ?skosValue . " +
        "?skosValue skos:related ?skosValue . " +
        "?skosValue skos:related ?skosValue . " +
        "?location ?locationProperty ?locationValue . " + 
        "?organizer ?organizerProperty ?organizerValue . " +
        "?address ?addressProperty ?addressValue. } " +
        "FROM <http://data.fusepool.info:8181/ldp/wr-ldpc/Trentino-Events-1/eventi-xml-xml-transformed> " +
        "WHERE { <" + eventURI + "> ?eventProperty ?eventValue ; " +
        "skos:related ?skosValue ;" +
        "schema:location ?location ; " +
        "schema:organizer ?organizer . " +
        "?location ?locationProperty ?locationValue . " +
        "?location schema:address ?address . " +
        "?address ?addressProperty ?addressValue . " +
        "?organizer ?organizerProperty ?organizerValue . " +
        " } LIMIT 300");
}

exports.eventLatLong = function(eventURI) {
    return encodeURIComponent(prefixes +
        "CONSTRUCT {<" + eventURI + "> geo:lat ?lat . " +
        "<" + eventURI + "> geo:long ?long . } " +
        "FROM <http://data.fusepool.info:8181/ldp/wr-ldpc/Trentino-Events-1/eventi-xml-xml-transformed> " +
        "WHERE { <" + eventURI + "> schema:location ?location . " +
        "?location geo:lat ?lat ; " +
        "geo:long ?long ." +
        " } ");
}   

exports.closerPOIs = function(eventURI, lowLat, highLat, lowLong, highLong) { //For testing (46.05, 46.07, 11.12, 11.14)  
    return encodeURIComponent(prefixes +
        "CONSTRUCT { ?subject ?property ?object . " +
        "<" + eventURI + "> <contains> ?subject . }" +
        "FROM <http://data.fusepool.info:8181/ldp/trentino-point-of-interest-ttl> " +
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
            "LIMIT 15 " + 
            "} " +
        "}");
}

exports.modify = function (subject, predicate, object, author, timestamp, oldObject) {
    return encodeURIComponent(prefixes +
        "INSERT INTO <http://explorer.nexacenter.org/feed> " +
        "{ <http://explorer.nexacenter.org/id/mod" + timestamp + "> rdf:type rdf:Statement. " +
        "<http://explorer.nexacenter.org/id/mod" + timestamp + "> rdf:subject <" + subject + ">. " +
        "<http://explorer.nexacenter.org/id/mod" + timestamp + "> rdf:predicate <" + predicate + ">. " +
        "<http://explorer.nexacenter.org/id/mod" + timestamp + "> rdf:object '" + object + "'. " +
        "<http://explorer.nexacenter.org/id/mod" + timestamp + "> <dc:Author> '" + author + "' . " +
        "<http://explorer.nexacenter.org/id/mod" + timestamp + "> <dc:time> '" + timestamp + "' . " +
        "<http://explorer.nexacenter.org/id/mod" + timestamp + "> <oldObject> '" + oldObject + "' . " +
        "}");
}

exports.test = function() {
    return encodeURIComponent(prefixes + 
        "CONSTRUCT+{%3Fsubject+%3Fproperty+%3Fobject+.}%0D%0AWHERE+{%3Fsubject+%3Fproperty+%3Fobject+.}+LIMIT+100");
}

exports.launchSparqlQuery = function (hostName, path, port, request, response, query) {

    var result = "";

    console.info(decodeURIComponent(query));

    var options = {
        host: hostName,
        path: path + (typeof(query) === "function" ? query() : query), /// XXX
        port: port,
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