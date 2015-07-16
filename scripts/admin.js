var urlFeed = "http://pentos.polito.it:8890/sparql?default-graph-uri=http://explorer.nexacenter.org/feed";
var urlHistory = "http://pentos.polito.it:8890/sparql?default-graph-uri=http://explorer.nexacenter.org/feed";

var query = "SELECT ?a ?b ?c WHERE {?a ?b ?c .}"

var queryUrl = urlFeed+"&query="+ encodeURIComponent(query) +"&format=json";

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
                if (resArray[i]['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'] !== "commit") {
                  var newRow = tableRef.insertRow(tableRef.rows.length);
                  var newCell0 = newRow.insertCell(0);
                  var newCell1 = newRow.insertCell(1);
                  var newCell2 = newRow.insertCell(2);
                  var newText0 = resArray[i]['http://www.w3.org/1999/02/22-rdf-syntax-ns#subject'] + "<br>" + resArray[i]['http://www.w3.org/1999/02/22-rdf-syntax-ns#predicate'] + "<br><b>" + resArray[i].oldObject + "</b>";
                  var newText1 = resArray[i]['http://www.w3.org/1999/02/22-rdf-syntax-ns#subject'] + "<br>" + resArray[i]['http://www.w3.org/1999/02/22-rdf-syntax-ns#predicate'] + "<br><b><span style='color:red;'>" + resArray[i]['http://www.w3.org/1999/02/22-rdf-syntax-ns#object'] + "</span></b><br><small><i>Modified by: " + resArray[i]['dc:Author'] +  " at: " + new Date(resArray[i]['dc:time']*1000) + "</i></small>";
                  var newText2 = '<button type="button" class="btn btn-default" onclick="acceptedTriple()"><span class="glyphicon glyphicon glyphicon-ok" aria-hidden="true"></span></button><br><button type="button" class="btn btn-default" onclick="refusedTriple(\''+i+'\')"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>';

                  newCell0.innerHTML = newText0;
                  newCell1.innerHTML = newText1;
                  newCell2.innerHTML = newText2;
                }
            }
        }
    });
}

function acceptedTriple() {
    alert("ok");
}

function refusedTriple(mod) {
    var n = Math.floor(Date.now() / 1000);
    var time = mod.replace(/\/\d$/,"").replace("http://explorer.nexacenter.org/id/mod","");
    var addToHistory = [""
        ,"INSERT INTO <http://explorer.nexacenter.org/history>"
        ,"{ <"+mod+"> ?p ?o ."
        ,"  <"+mod+"> <hasAdmin> <Nexaa> ."
        ,"  <"+mod+"> <checkTime> <"+n+"> ."
        ,"  <"+mod+"> <status> <rejected> . }"
        ,"where { <"+mod+"> ?p ?o . }"
        ,"INSERT INTO <http://explorer.nexacenter.org/history>"
        ,"{ <http://explorer.nexacenter.org/id/mod"+time+"> ?p ?o .}"
        ,"where { <http://explorer.nexacenter.org/id/mod"+time+"> ?p ?o .}"
    ].join(" ");

    historyThenDelete(urlFeed+"&query="+ encodeURIComponent(addToHistory) +"&format=json");

function historyThenDelete(theUrl) {
    $.ajax({
        dataType: "jsonp",  
        url: theUrl,
        success: function( _data ) {
            var deleteFeed = 'DELETE WHERE { ?s ?p ?o . ?s <dc:time> "'+time+'"}';
            deleteFromFeed(urlFeed+"&query="+ encodeURIComponent(deleteFeed) +"&format=json");
        }
    });
}

}

function deleteFromFeed(theUrl) {
    $.ajax({
        dataType: "jsonp",  
        url: theUrl,
        success: function( _data ) {
            alert("Deleted!");
            $("#mainTable").html("");
            sparqlGet(queryUrl);
        }
    });
}


