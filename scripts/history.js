var url = "http://pentos.polito.it:8890/sparql?default-graph-uri=http://explorer.nexacenter.org/history";

var query = "SELECT ?a ?b ?c WHERE {?a ?b ?c .}"

var queryUrl = url+"&query="+ encodeURIComponent(query) +"&format=json";

sparqlGet(queryUrl);

var tableRef = document.getElementById('mainTable');

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
                var newCell2 = newRow.insertCell(2);
                var newText0 = resArray[i]['http://www.w3.org/1999/02/22-rdf-syntax-ns#subject'] + "<br>" + resArray[i]['http://www.w3.org/1999/02/22-rdf-syntax-ns#predicate'] + "<br><b>" + resArray[i].oldObject + "</b>";
                var newText1 = "Proposed by: " + resArray[i]['dc:Author'] + " at: " + new Date(resArray[i]['dc:time']*1000) + "<br>Analyzed by: " + resArray[i]['hasAdmin'] + " at: " + new Date(resArray[i]['checkTime']*1000) + "<br>Status:<i> " + resArray[i]['status'] + "</i>";
                var newText2 = '<button type="button" class="btn btn-default" onclick="alert()"><span class="glyphicon glyphicon glyphicon-arrow-left" aria-hidden="true"></span></button>';
                newCell0.innerHTML = newText0;
                newCell1.innerHTML = newText1;
                newCell2.innerHTML = newText2;
            }
        }
    });
}
