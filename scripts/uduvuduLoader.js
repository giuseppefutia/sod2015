var distanceKm = 20; //hardcoded the distance for calculating near POI
var earthCirc = 40075 //in Km

var calculateLimitCoords = function (lat, long) {
    var POIcoords = new Object;

    POIcoords.lowLat = Math.abs((0.009 * distanceKm) - lat);
    POIcoords.highLat = (0.009 * distanceKm) + Math.abs(lat);
    POIcoords.highLong = Math.abs(((360/(Math.cos(lat) * earthCirc)) * distanceKm) - long);
    POIcoords.lowLong = ((360/(Math.cos(lat) * earthCirc)) * distanceKm) + Math.abs(long);

    return POIcoords;
};

// something about what is going on
var alertInfo = function (source) {
    document.getElementById('alerts').innerHTML =  ''
        + '<div class="alert alert-info">'
        + '  <button type="button" class="close" data-dismiss="alert">&times;</button>'
        + '  <strong>Loading</strong> '+source
        + '</div>';
};

var alertDanger = function (error) {
    document.getElementById('alerts').innerHTML =  ''
        + '<div class="alert alert-danger">'
        + '  <button type="button" class="close" data-dismiss="alert">&times;</button>'
        + '  <strong>Error:</strong> '+ error +'.'
        + '</div>';
};

// instantiate rdf-ext object
var store = new rdf.LdpStore();
var source = 'http://localhost:3000/allEvents'; 

alertInfo(source);

// prepare visualizer templates for uduvudu
$("#templates").load("/uduvudu/templates.html");

// load triples
store.graph(source, function (graph, error) {
    if (error == null) {
        console.debug("successfully loaded "+graph.toArray().length+" triples");
        // resource (entry for template search) is same as source in this example
        uduvudu.process(graph, {'resource': "urn:event:uuid:fc52e206-e041-4ca9-a897-6525f9b84e51"} , function (out) {
            // write the result of the processing in the main div
            $('#footer').html(out);
        });
    } else {
        alertDanger(error);
    };
});

var eventStore = new rdf.LdpStore();
var eventResource = "urn:event:uuid:4f93f7d5-0f31-485b-b133-b1ddf189b90c" // It is only an example
var eventLocation = "urn:location:uuid:4f93f7d5-0f31-485b-b133-b1ddf189b90c"
var eventSource = 'http://localhost:3000/eventProperties/' + eventResource;  // "dumps/event.ttl" 

alertInfo(eventSource);

eventStore.graph(eventSource, function (graph, error) {
    if (error == null) {
        console.debug("successfully loaded "+graph.toArray().length+" triples");
        // resource (entry for template search) is same as source in this example
        uduvudu.process(graph, {'resource': eventResource} , function (out) {
            // write the result of the processing in the main div
            $('#main').html(out);
            });
    } else {
        alertDanger(error);
    };
});

var latLongStore = new rdf.LdpStore();
var latLongSource = 'http://localhost:3000/eventLatLong/' + eventResource;
latLongStore.graph(latLongSource, function (graph, error) {
    if(error == null) {
        console.debug("successfully loaded "+graph.toArray().length+" triples");
        var lat = graph.toArray()[0]["object"]["nominalValue"];
        var long = graph.toArray()[1]["object"]["nominalValue"];
        var proximity = calculateLimitCoords(lat, long);
        var poiSource = "http://localhost:3000/closerPOIs?uri=" + eventResource + 
                                                        "&lowLat=" + proximity.lowLat +
                                                        "&highLat=" + proximity.highLat +
                                                        "&lowLong=" + proximity.lowLong + 
                                                        "&highLong=" + proximity.highLong; 
        launchPOIsQuery(poiSource);

    } else {
        alertDanger(error);
    }
});

var launchPOIsQuery = function(poiSource){
    console.info("launchPOIsQuery");
    var poiStore = new rdf.LdpStore();

    poiStore.graph(poiSource, function (graph, error) {
        if (error == null) {
            console.debug("successfully loaded "+graph.toArray().length+" triples");
            console.info(graph.toArray())
            // resource (entry for template search) is same as source in this example
            uduvudu.process(graph, {'resource': eventResource} , function (out) {
            // write the result of the processing in the main div
            $('#poi').html(out);
            });
        } else {
            alertDanger(error);
        };
    });
}






/* autoclose alerts */
$(document).ready(function () {
    window.setTimeout(function() {
        $(".alert-info").fadeTo(1500, 0).slideUp(500, function(){
            $(this).remove(); 
        });
    }, 5000);
});
