var url = "http://pentos.polito.it:8890/sparql?default-graph-uri=http://explorer.nexacenter.org/feed";

var query = "SELECT ?a ?b ?c WHERE {?a ?b ?c .}"

var queryUrl = url+"&query="+ encodeURIComponent(query) +"&format=json";

sparqlGet(queryUrl);

var tableRef = document.getElementById('mainTable').getElementsByTagName('tbody')[0];

function sparqlGet(theUrl) {
    $.ajax({
        dataType: "jsonp",  
        url: queryUrl,
        success: function( _data ) {
            var results = _data.results.bindings;
            var resArray = new Array();
            for ( var i in results ) {
                if (resArray[results[i].a.value] === undefined) {
                    resArray[results[i].a.value] = {};
                }
                resArray[results[i].a.value][results[i].b.value] = results[i].c.value;
            }
            for ( var i in resArray ) {
                //console.log(resArray[i]);
                var newRow = tableRef.insertRow(tableRef.rows.length);
                var newCell0 = newRow.insertCell(0);
                var newCell1 = newRow.insertCell(1);
                var newText0 = resArray[i]['http://www.w3.org/1999/02/22-rdf-syntax-ns#subject'] + "<br>" + resArray[i]['http://www.w3.org/1999/02/22-rdf-syntax-ns#predicate'] + "<br><b>" + resArray[i].oldObject + "</b>";
                var newText1 = resArray[i]['http://www.w3.org/1999/02/22-rdf-syntax-ns#subject'] + "<br>" + resArray[i]['http://www.w3.org/1999/02/22-rdf-syntax-ns#predicate'] + "<br><b><span style='color:red;'>" + resArray[i]['http://www.w3.org/1999/02/22-rdf-syntax-ns#object'] + "</span></b><br><small><i>Modified by: " + resArray[i]['dc:Author'] +  " at: " + resArray[i]['dc:time'] + "</i></small>";
                newCell0.innerHTML = newText0;
                newCell1.innerHTML = newText1;
            }
        }
    });
}


