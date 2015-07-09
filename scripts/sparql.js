var SPARQL = {};

//console.log("Launch SPARQL queries!");

SPARQL.eventsOutputJson = new Array();
SPARQL.singleEventOutputJson = new Array();


SPARQL.FUSEPOOL_ENDPOINT = "http://data.fusepool.info:8181/sparql/select?query=";
SPARQL.DBPEDIA_ENDPOINT = "http://dbpedia.org/sparql?default-graph-uri=http://dbpedia.org&query=";

SPARQL.SAMPLE_QUERY = "SELECT * WHERE { " +
                      "?subject ?property ?object " +
                      "} " +
                      " LIMIT 10";

SPARQL.ALL_EVENTS_QUERY = "PREFIX%20rdfs%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23%3E%0APREFIX%20schema%3A%20%3Chttp%3A%2F%2Fschema.org%2F%3E%0APREFIX%20xsd%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F2001%2FXMLSchema%23%3E%0APREFIX%20dbo%3A%20%3Chttp%3A%2F%2Fit.dbpedia.org%2Fontology%3E%0APREFIX%20skos%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F2004%2F02%2Fskos%2Fcore%23%3E%0A%0ASELECT%20%3Fsubject%20%3Fheadline%20%3Ftitle%20%3FdateStart%20%3FdateEnd%0AFROM%20%3Chttp%3A%2F%2Fdata.fusepool.info%3A8181%2Fldp%2Fwr-ldpc%2FTrentino-Events-1%2Feventi-xml-xml-transformed%3E%0AWHERE%20%7B%0A%20%20%3Fsubject%20a%20schema%3AEvent%20%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20schema%3Adescription%20%3Ftitle%20%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20rdfs%3Alabel%20%3Fheadline%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20schema%3AstartDate%20%3FdateStart%20%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20schema%3AendDate%20%3FdateEnd%20.%0A%20%20FILTER(%20lang(%3Ftitle)%3D%22it%22%20)%0A%20%20FILTER%20(%20%3FdateStart%20%3E%3D%20%222015-01-01%22%5E%5Exsd%3Adate%20)%0A%7D"

SPARQL.createQuery = function (endpoint, query) {
	console.log("Create query: " + endpoint + query + "&output=json");
  var q = endpoint + query + "&output=json";
  return q;
}

SPARQL.launchEventsQuery = function (query) {
  //console.log("Launch events query");
        timeAlertInfo("timeline, please wait some seconds");
	$.ajax({
  		url: query,
      type: "GET", 
  		success: function (data) {                                        
    		var bindings = data.results.bindings;
        for (var i in bindings){
          SPARQL.eventsOutputJson.push(SPARQL.generateObjectForEvents(bindings, i));
        }
  		},
      error: function (error) {
        //console.log(error);
      },
      complete: function (result) {
        createTimeline(SPARQL.eventsOutputJson);
      }
	});
}

SPARQL.generateObjectForEvents = function (bindings, i) {
  var element = {};
      element["subject"] = bindings[i]["subject"]["value"];
      element["dateStart"] = bindings[i]["dateStart"]["value"];
      element["dateEnd"] = bindings[i]["dateEnd"]["value"];
      element["headline"] = bindings[i]["headline"]["value"];
      element["text"] = bindings[i]["title"]["value"];
  return element;
}

SPARQL.launchEventsQuery(SPARQL.createQuery(SPARQL.FUSEPOOL_ENDPOINT, SPARQL.ALL_EVENTS_QUERY));

