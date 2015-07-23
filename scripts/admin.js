var urlFeed = "http://pentos.polito.it:8890/sparql?default-graph-uri=http://explorer.nexacenter.org/feed";
var urlHistory = "http://pentos.polito.it:8890/sparql?default-graph-uri=http://explorer.nexacenter.org/history";
var urlMaster = "http://pentos.polito.it:8890/sparql?default-graph-uri=http://explorer.nexacenter.org/master";

var query = "SELECT ?a ?b ?c WHERE {?a ?b ?c .}"
var resArray = new Array();

var queryUrl = urlFeed + "&query=" + encodeURIComponent(query) + "&format=json";

sparqlGet(queryUrl);

function sparqlGet(theUrl) {
    $.ajax({
        dataType: "jsonp",
        url: queryUrl,
        success: function(_data) {
            var results = _data.results.bindings;
            for (var i in results) {
                if (resArray[results[i].a.value] === undefined) {
                    resArray[results[i].a.value] = {};
                }
                resArray[results[i].a.value][results[i].b.value] = results[i].c.value;
            }
            for (var i in resArray) {
                //console.log(resArray[i]);
                if (resArray[i]['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'] !== "commit") {
                    var getSubjectLabel = "SELECT ?a WHERE {<" + resArray[i]['http://www.w3.org/1999/02/22-rdf-syntax-ns#subject'] + "> <http://www.w3.org/2000/01/rdf-schema#label> ?a .}"
                    getLabel(urlMaster + "&query=" + encodeURIComponent(getSubjectLabel) + "&format=json", function(subject) {
                        var tableRef = document.getElementById('mainTable');
                        var newRow = tableRef.insertRow(tableRef.rows.length);
                        var newCell0 = newRow.insertCell(0);
                        var newCell1 = newRow.insertCell(1);
                        var newCell2 = newRow.insertCell(2);
                        var newText0 = subject + "<br>" + resArray[i]['http://www.w3.org/1999/02/22-rdf-syntax-ns#predicate'] + "<br><b>" + resArray[i].oldObject + "</b>";
                        var newText1 = subject + "<br>" + resArray[i]['http://www.w3.org/1999/02/22-rdf-syntax-ns#predicate'] + "<br><b><span style='color:red;'>" + resArray[i]['http://www.w3.org/1999/02/22-rdf-syntax-ns#object'] + "</span></b><br><small><i>Modified by: " + resArray[i]['dc:Author'] + " at: " + new Date(resArray[i]['dc:time'] * 1000) + "</i></small>";
                        var newText2 = '<button type="button" class="btn btn-default" onclick="acceptedTriple(\'' + i + '\')"><span class="glyphicon glyphicon glyphicon-ok" aria-hidden="true"></span></button><br><button type="button" class="btn btn-default" onclick="refusedTriple(\'' + i + '\')"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>';

                        newCell0.innerHTML = newText0;
                        newCell1.innerHTML = newText1;
                        newCell2.innerHTML = newText2;
                    });
                }
            }
        }
    });
}

function acceptedTriple(mod) {
    var data = resArray[mod];
    var n = Math.floor(Date.now() / 1000);
    var time = mod.replace(/\/\d$/, "").replace("http://explorer.nexacenter.org/id/mod", "");
    var addToHistory = ["", "INSERT INTO <http://explorer.nexacenter.org/history>", "{ <" + mod + "> ?p ?o .", "  <" + mod + "> <hasAdmin> <Nexaa> .", "  <" + mod + "> <checkTime> <" + n + "> .", "  <" + mod + "> <status> <approved> . }", "where { <" + mod + "> ?p ?o . }", "INSERT INTO <http://explorer.nexacenter.org/history>", "{ <http://explorer.nexacenter.org/id/mod" + time + "> ?p ?o .}", "where { <http://explorer.nexacenter.org/id/mod" + time + "> ?p ?o .}"].join(" ");
    var deleteFeed = ' DELETE WHERE { ?s ?p ?o . ?s <dc:time> "' + time + '"}';
    var statusApproved = " DELETE DATA FROM <http://explorer.nexacenter.org/history> { <" + mod + "> <status> <pending> } INSERT DATA INTO <http://explorer.nexacenter.org/history> { <" + mod + "> <status> <approved> }";

    var updateMaster = " DELETE DATA FROM <http://explorer.nexacenter.org/master> { <" + data['http://www.w3.org/1999/02/22-rdf-syntax-ns#subject'] + "> <" + data['http://www.w3.org/1999/02/22-rdf-syntax-ns#predicate'] + "> \"" + data['oldObject'] + "\" } INSERT DATA INTO <http://explorer.nexacenter.org/master> { <" + data['http://www.w3.org/1999/02/22-rdf-syntax-ns#subject'] + "> <" + data['http://www.w3.org/1999/02/22-rdf-syntax-ns#predicate'] + "> \"" + data['http://www.w3.org/1999/02/22-rdf-syntax-ns#object'] + "\" }";

    alert("Merged!");
    runUpdate(urlFeed + "&query=" + encodeURIComponent(addToHistory + deleteFeed + updateMaster) + "&format=json");
}

function refusedTriple(mod) {
    var n = Math.floor(Date.now() / 1000);
    var time = mod.replace(/\/\d$/, "").replace("http://explorer.nexacenter.org/id/mod", "");
    var addToHistory = ["", "INSERT INTO <http://explorer.nexacenter.org/history>", "{ <" + mod + "> ?p ?o .", "  <" + mod + "> <hasAdmin> <Nexaa> .", "  <" + mod + "> <checkTime> <" + n + "> .", "  <" + mod + "> <status> <rejected> . }", "where { <" + mod + "> ?p ?o . }", "INSERT INTO <http://explorer.nexacenter.org/history>", "{ <http://explorer.nexacenter.org/id/mod" + time + "> ?p ?o .}", "where { <http://explorer.nexacenter.org/id/mod" + time + "> ?p ?o .}"].join(" ");
    var deleteFeed = ' DELETE WHERE { ?s ?p ?o . ?s <dc:time> "' + time + '"}';
    var statusRejected = " DELETE DATA FROM <http://explorer.nexacenter.org/history> { <" + mod + "> <status> <pending> } INSERT DATA INTO <http://explorer.nexacenter.org/history> { <" + mod + "> <status> <rejected> }";

    alert("Deleted!");
    runUpdate(urlFeed + "&query=" + encodeURIComponent(addToHistory + deleteFeed + statusRejected) + "&format=json");
}

function runUpdate(theUrl) {
    $.ajax({
        dataType: "jsonp",
        url: theUrl,
        success: function(_data) {
            $("#mainTable").html("");
            resArray = new Array();
            sparqlGet(queryUrl);
        }
    });
}

function getLabel(theUrl, callback) {
    $.ajax({
        dataType: "jsonp",
        url: theUrl,
        success: function(_data) {
            callback(_data.results.bindings[0].a.value);
        }
    });
}
