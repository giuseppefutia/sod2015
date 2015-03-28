# LOD events eXplorer

This project has been developed during the LOD hackathon organized in Bologna (March 28, 2015) #SOD2015. Authors: @alemela and @giuseppefutia.

## Description

[TODO]

## Linked Data from Fusepool P3 platform

In order to create our D3.js visualization, we have used the SPARQL endpoint exposed by the Fusepool platform. In particular we have defined 2 different queries. 

With the first query, we have retrieved all events from the Trentino dataset, including the start date and the end date. Therefore, we have binded these data on a timeline.

	PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
	PREFIX schema: <http://schema.org/>
	PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
	PREFIX dbo: <http://it.dbpedia.org/ontology>
	PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

	SELECT ?subject ?headline ?title ?dateStart ?dateEnd
	FROM <http://sandbox.fusepool.info:8181/ldp/wr-ldpc/Trentino-Events-1/eventi-xml-xml-transformed>
	WHERE {
	  ?subject a schema:Event ;
	             schema:description ?title ;
	             rdfs:label ?headline;
	             schema:startDate ?dateStart ;
	             schema:endDate ?dateEnd .
	  FILTER( lang(?title)="it" )
	}

With the second query, we have retrieved all the entities related to all the events for creating the graph visualization.

	PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> 
	PREFIX schema: <http://schema.org/>
	PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
	PREFIX dbo: <http://it.dbpedia.org/ontology>
	PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

	SELECT distinct ?subject ?subjectLabel ?property ?objectLabel
	FROM <http://sandbox.fusepool.info:8181/ldp/wr-ldpc/Trentino-Events-1/eventi-xml-xml-transformed>
	WHERE {
  		?subject ?property ?object .
  		?subject a schema:Event ;
             schema:description ?title ;
             rdfs:label ?subjectLabel .
  		?object rdfs:label ?objectLabel .
  	FILTER( lang(?title)="it" )
	}
