var launchPOIsQuery = function(poiSource, eventResource){
    var poiStore = new rdf.LdpStore();

    alertInfo("points of interest...");
    poiStore.graph(poiSource, function (graph, error) {
        if (error == null) {
            //console.debug("successfully loaded "+graph.toArray().length+" triples");
            //console.info(graph.toArray())
            // resource (entry for template search) is same as source in this example
            uduvudu.process(graph, {'resource': eventResource} , function (out) {
                // write the result of the processing in the main div
                $('#poi').html(out);
                closeAlert(".uduvudualert");
            });
        } else {
            alertDanger(error);
        };
    });
}

var loadEvent = function (eventResource) {
    var eventStore = new rdf.LdpStore();
    var eventSource = 'http://localhost:3000/eventProperties/' + eventResource;
    $("#poi2").html("") //XXX Clean POI results when you load a new event

    alertInfo("event details...");
    eventStore.graph(eventSource, function (graph, error) {
        if (error == null) {
            //console.debug("successfully loaded "+graph.toArray().length+" triples");
            // resource (entry for template search) is same as source in this example
            uduvudu.process(graph, {'resource': eventResource} , function (out) {
                // write the result of the processing in the main div
                $('#main').html(out);
                closeAlert(".uduvudualert");
            });
        } else {
            alertDanger(error);
        };
    });

    var latLongStore = new rdf.LdpStore();
    var latLongSource = 'http://localhost:3000/eventLatLong/' + eventResource;
    latLongStore.graph(latLongSource, function (graph, error) {
        if (error == null) {
            //console.debug("successfully loaded "+graph.toArray().length+" triples");
            var lat = graph.toArray()[0]["object"]["nominalValue"];
            var long = graph.toArray()[1]["object"]["nominalValue"];
            var proximity = calculateLimitCoords(lat, long);
            var poiSource = "http://localhost:3000/closerPOIs?uri=" + eventResource + 
                                                        "&lowLat=" + proximity.lowLat +
                                                        "&highLat=" + proximity.highLat +
                                                        "&lowLong=" + proximity.lowLong + 
                                                        "&highLong=" + proximity.highLong; 
            launchPOIsQuery(poiSource, eventResource);

        } else {
            alertDanger(error);
        }
    });
}

// prepare visualizer templates for uduvudu
$("#templates").load("/uduvudu/templates.html");
