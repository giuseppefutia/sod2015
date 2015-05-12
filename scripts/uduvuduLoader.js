// instantiate rdf-ext object
var store = new rdf.LdpStore();
var source = 'dumps/events.ttl'; 

// something about what is going on
document.getElementById('main').innerHTML =  ''
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
            $('#main').html(out);
        });
    } else {
        document.getElementById('main').innerHTML =  ''
            + '<div class="alert alert-danger">'
            + '  <button type="button" class="close" data-dismiss="alert">&times;</button>'
            + '  <strong>Error:</strong> '+ error +'.'
            + '</div>';
    };
});
