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
                if (resArray[i]['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'] !== "commit") {
                  var newRow = tableRef.insertRow(tableRef.rows.length);
                  if (resArray[i]['status'] === "approved") {
                      newRow.className = "success";
                  } else if (resArray[i]['status'] === "rejected") {
                      newRow.className = "danger";
                  } else if (resArray[i]['status'] === "pending") {
                      newRow.className = "warning";
                  }
                  var newCell0 = newRow.insertCell(0);
                  var newCell1 = newRow.insertCell(1);
                  var newCell2 = newRow.insertCell(2);
                  var newText0 = resArray[i]['http://www.w3.org/1999/02/22-rdf-syntax-ns#subject'] + "<br>" + resArray[i]['http://www.w3.org/1999/02/22-rdf-syntax-ns#predicate'] + "<br><b>" + resArray[i].oldObject + "</b> <span class='glyphicon glyphicon-arrow-right' aria-hidden='true'></span> <b>" + resArray[i]['http://www.w3.org/1999/02/22-rdf-syntax-ns#object'] + "</b>";
                  var newText1 = "Proposed by: " + resArray[i]['dc:Author'] + " at: " + new Date(resArray[i]['dc:time']*1000) + "<br>Analyzed by: " + resArray[i]['hasAdmin'] + " at: " + new Date(resArray[i]['checkTime']*1000) + "<br>Status:<i> " + resArray[i]['status'] + "</i>";
                  var newText2 = '<button type="button" class="btn btn-default" onclick="rollbackTriple(\''+i+'\', \''+ resArray[i]['status']+'\')"><span class="glyphicon glyphicon glyphicon-arrow-left" aria-hidden="true"></span></button>';
                  newCell0.innerHTML = newText0;
                  newCell1.innerHTML = newText1;
                  if (resArray[i]['status'] !== "pending") {
                      newCell2.innerHTML = newText2;
                  }
                }
            }
        }
    });
}

function rollbackTriple(mod, status) {
    var n = Math.floor(Date.now() / 1000);
    var time = mod.replace(/\/\d$/,"").replace("http://explorer.nexacenter.org/id/mod","");

    var addToFeed = [""
        ,"INSERT INTO <http://explorer.nexacenter.org/feed>"
        ,"{ <"+mod+"> ?p ?o .}"
        ,"where { <"+mod+"> ?p ?o . }"
        ,"INSERT INTO <http://explorer.nexacenter.org/feed>"
        ,"{ <http://explorer.nexacenter.org/id/mod"+time+"> ?p ?o .}"
        ,"where { <http://explorer.nexacenter.org/id/mod"+time+"> ?p ?o .}"
        ].join(" ");

    if (status === "rejected") {
        var fromRejToPending = "DELETE DATA FROM <http://explorer.nexacenter.org/history> { <"+mod+"> <status> <rejected> } INSERT DATA INTO <http://explorer.nexacenter.org/history> { <"+mod+"> <status> <pending> }";
        runUpdate(url+"&query="+ encodeURIComponent(fromRejToPending+addToFeed) +"&format=json");
    } else if (status === "approved") {
        var fromAppToPending = "DELETE DATA FROM <http://explorer.nexacenter.org/history> { <"+mod+"> <status> <approved> } INSERT DATA INTO <http://explorer.nexacenter.org/history> { <"+mod+"> <status> <pending> }";

        runUpdate(url+"&query="+ encodeURIComponent(fromAppToPending+addToFeed) +"&format=json");
    } else {
        alert("Status undefined, impossibile to rollback");
    }
}

function runUpdate(theUrl) {
    $.ajax({
        dataType: "jsonp",  
        url: theUrl,
        success: function( _data ) {
            $("#mainTable").html("");
            sparqlGet(queryUrl);
        }
    });
}
