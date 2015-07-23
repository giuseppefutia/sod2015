var http = require('http');

var prefixes = "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \n" +
        "PREFIX schema: <http://schema.org/> \n" +
        "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> \n" +
        "PREFIX dbo: <http://it.dbpedia.org/ontology> \n" +
        "PREFIX skos: <http://www.w3.org/2004/02/skos/core#> \n" +
        "PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> \n" +
        "PREFIX dct: <http://purl.org/dc/terms/> \n" +
        "PREFIX foaf: <http://xmlns.com/foaf/0.1/> \n";

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

exports.createModifyQuery = function (updater) {

    var subject = updater["subject"];
    var author = updater["author"];
    var time = updater["time"];
    var predicates = updater["predicates"];

    var query = "<http://explorer.nexacenter.org/id/mod" + time + "> rdf:type <commit>. \n"
    query += "<http://explorer.nexacenter.org/id/mod" + time + "> <dc:time> '" + time + "' . \n";
    query += "<http://explorer.nexacenter.org/id/mod" + time + "> <dc:Author> '" + author + "' . \n";

    var counter = 0
    for (var predicate in predicates) {
        var object = predicates[predicate]["object"];
        var oldObject = predicates[predicate]["oldObject"];

        var reification = "";
        var reificationEntity = "<http://explorer.nexacenter.org/id/mod" + time + "/" + counter + ">"

        reification += "<http://explorer.nexacenter.org/id/mod" + time + "> <hasMod> " + reificationEntity +" . \n";
        reification += reificationEntity + " rdf:type rdf:Statement . \n";
        reification += reificationEntity + " rdf:subject <" + subject + "> . \n";
        reification += reificationEntity + " rdf:predicate <" + predicate + "> . \n";
        reification += reificationEntity + " rdf:object '" + object + "' . \n";
        reification += reificationEntity + " <dc:Author> '" + author + "' . \n";
        reification += reificationEntity + " <dc:time> '" + time + "' . \n";
        reification += reificationEntity + " <oldObject> '" + oldObject + "' . \n";
        
        query+=reification;
        counter ++;
    }
    return query;
}

exports.modify = function (query) {
    return encodeURIComponent(prefixes +
        "INSERT INTO <http://explorer.nexacenter.org/feed> " +
        "{" + query + "}");
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