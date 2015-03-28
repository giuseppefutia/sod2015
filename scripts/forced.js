function createPallette(links) {

    var nodes = {};

    // Compute only the JSON lines that we want
    var wanted_links = [];
    var i = 0;
    links.forEach(function(link) {
        if (link.subject === "urn:event:uuid:9e700f41-413b-46a2-b7f1-f5f7a03cecfb") { 
            wanted_links[i] = new Object;
            wanted_links[i] = link;
            i++;
        }
    });

    // Compute the distinct nodes from the links.
    wanted_links.forEach(function(link) {
        link.source = nodes[link.source] || (nodes[link.source] = {
            name: link.source
        });
        link.target = nodes[link.target] || (nodes[link.target] = {
            name: link.target
        });
    });
 
    var w = 700,
        h = 300;
$.getScript("http://d3js.org/d3.v3.min.js", function() {
    var force = d3.layout.force()
        .nodes(d3.values(nodes))
        .links(wanted_links)
        .size([w, h])
        .linkDistance(120)
        .charge(-300)
        .on("tick", tick)
        .start();

    var svg = d3.select("#forced").append("svg:svg")
        .attr("width", w)
        .attr("height", h);

    var predicates = [];

    wanted_links.forEach(function(link) {
        predicates.push(link.type);
    });

    // Per-type markers, as they don't inherit styles.
    svg.append("svg:defs").selectAll("marker")
        .data(predicates)
        .enter().append("svg:marker")
        .attr("id", String)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 15)
        .attr("refY", -1.5)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5");

    var path = svg.append("svg:g").selectAll("path")
        .data(force.links())
        .enter().append("svg:path")
        .attr("id", function(d) {
            return d.source.index + "_" + d.target.index;
        })
        .attr("class", function(d) {
            return "link " + d.type;
        })
        .attr("marker-end", function(d) {
            return "url(#" + d.type + ")";
        });

    var circle = svg.append("svg:g").selectAll("circle")
        .data(force.nodes())
        .enter().append("svg:circle")
        .attr("r", 6)
        .call(force.drag);

    var text = svg.append("svg:g").selectAll("g")
        .data(force.nodes())
        .enter().append("svg:g");

    // A copy of the text with a thick white stroke for legibility.
    text.append("svg:text")
        .attr("x", 8)
        .attr("y", ".31em")
        .attr("class", "shadow")
        .text(function(d) {
            return d.name;
        });

    text.append("svg:text")
        .attr("x", 8)
        .attr("y", ".31em")
        .text(function(d) {
            return d.name;
        });

    var path_label = svg.append("svg:g").selectAll(".path_label")
        .data(force.links())
        .enter().append("svg:text")
        .attr("class", "path_label")
        .append("svg:textPath")
        .attr("startOffset", "50%")
        .attr("text-anchor", "middle")
        .attr("xlink:href", function(d) {
            return "#" + d.source.index + "_" + d.target.index;
        })
        .style("fill", "#000")
        .style("font-family", "Arial")
        .text(function(d) {
            return d.type;
        });

    // Use elliptical arc path segments to doubly-encode directionality.
    function tick() {
        path.attr("d", function(d) {
            var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y,
                dr = Math.sqrt(dx * dx + dy * dy);
            return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
        });

        circle.attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });

        text.attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
    }

});
}
