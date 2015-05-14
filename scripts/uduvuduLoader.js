// instantiate rdf-ext object
var store = new rdf.LdpStore();
var source = 'http://localhost:3000/allEvents'; 

// something about what is going on
document.getElementById('alerts').innerHTML =  ''
    + '<div class="alert alert-info">'
    + '  <button type="button" class="close" data-dismiss="alert">&times;</button>'
    + '  <strong>Loading</strong> '+source+' is being loaded ...'
    + '</div>';

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
        document.getElementById('alerts').innerHTML =  ''
            + '<div class="alert alert-danger">'
            + '  <button type="button" class="close" data-dismiss="alert">&times;</button>'
            + '  <strong>Error:</strong> '+ error +'.'
            + '</div>';
    };
});


var eventStore = new rdf.LdpStore();
var eventResource = "urn:event:uuid:4f93f7d5-0f31-485b-b133-b1ddf189b90c" // It is only an example
var eventLocation = "urn:location:uuid:4f93f7d5-0f31-485b-b133-b1ddf189b90c"
var eventSource = 'http://localhost:3000/eventProperties/' + eventResource;  // "dumps/event.ttl" 

document.getElementById('alerts').innerHTML =  ''
    + '<div class="alert alert-info">'
    + '  <button type="button" class="close" data-dismiss="alert">&times;</button>'
    + '  <strong>Loading</strong> '+eventSource+' is being loaded ...'
    + '</div>';

 eventStore.graph(eventSource, function (graph, error) {
    if (error == null) {
        console.debug("successfully loaded "+graph.toArray().length+" triples");
        // resource (entry for template search) is same as source in this example
        uduvudu.process(graph, {'resource': eventResource} , function (out) {
            // write the result of the processing in the main div
            $('#main').html(out);
            });
    } else {
        document.getElementById('alerts').innerHTML =  ''
        + '<div class="alert alert-danger">'
        + '  <button type="button" class="close" data-dismiss="alert">&times;</button>'
        + '  <strong>Error:</strong> '+ error +'.'
        + '</div>';
    };
}); 