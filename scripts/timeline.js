var cal = {};
var items = [];

function createTimeline(json) {
    var firstTime = 1;
    $.ajax({
        success: function(data) {
            /* Helper function to format and parse date from data */
            function getDate(d) {
                if (typeof d === "number") {
                    return new Date(d);
                } else if (Date.parse(d)) {
                    return new Date(d);
                } else { /* if no day we assume the first of the month */
                    return new Date("1 " + d);
                }
            }

            /* Populating items with json data */
            for (var i = 0; i < json.length; i++) {
                items[i] = new Object;
                items[i].subject = json[i].subject;
                items[i].dateStart = json[i].dateStart;
                items[i].dateEnd = json[i].dateEnd;
                items[i].date1 = getDate(items[i].dateStart);
                items[i].date2 = getDate(items[i].dateEnd);
                items[i].headline = json[i].headline;
            }

            /* Order items by start date */
            items.sort(function(a,b) { return a.dateStart.localeCompare(b.dateStart) } );

            /* Create object with events occurences for heatmap calendar */
            var first = items[0].date1;
            var last = items[json.length-1].date2;
            while(first < last) {
                var strDate = first.getFullYear() + '-' + ('0' + (first.getMonth()+1)).slice(-2) + '-' 
                          + ('0' + first.getDate()).slice(-2);
                cal[strDate] = 0; //init all day to zero
                var tempDate = first.setDate(first.getDate() + 1);
                first = new Date(tempDate);
            }

            for (var i = 0; i < json.length; i++) {
                if (items[i].date1 < items[i].date2) {
                    first = items[i].date1;
                    last = items[i].date2;

                    while(first < last){
                        strDate = first.getFullYear() + '-' + ('0' + (first.getMonth()+1)).slice(-2) + '-' 
                                  + ('0' + first.getDate()).slice(-2);
                        cal[strDate]++; //push event day
                        var newDate = first.setDate(first.getDate() + 1);
                        first = new Date(newDate);
                    }
                } else {
                    cal[items[i].dateStart]++; //push event day
                }
            }

            /* Load D3 */
            /* All of the D3/svg code is contained within the callback function */
            /* Loading D3 via a html script tag into ie6-8 will to cause a runtime error */
            $.getScript("http://d3js.org/d3.v3.min.js", function() {

/* CALENDAR */

var c_width = 1058,
    c_height = 121,
    cellSize = 17;

var day = d3.time.format("%w"),
    week = d3.time.format("%U"),
    percent = d3.format(".1%"),
    format = d3.time.format("%Y-%m-%d");

var color = d3.scale.quantize()
    .domain([0, 100]) //in one day from 0 to 10 events
    .range(d3.range(11).map(function(d) { return "q" + d + "-11"; }));

var svg = d3.select("#cal").selectAll("svg")
    .data(d3.range(2015, 2016))
    .enter().append("svg")
    .attr("width", c_width)
    .attr("height", c_height)
    .attr("class", "RdYlGn")
    .append("g")
    .attr("transform", "translate(" + ((c_width - cellSize * 53) / 2) + "," + (c_height - cellSize * 7 - 1) + ")");

var c_rect = svg.selectAll(".day")
    .data(function(d) { return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
    .enter().append("rect")
    .attr("class", "day")
    .attr("width", cellSize)
    .attr("height", cellSize)
    .attr("x", function(d) { return week(d) * cellSize; })
    .attr("y", function(d) { return day(d) * cellSize; })
    .datum(format);

c_rect.append("title")
    .text(function(d) { return d + ": " + cal[d] + " eventi"; }); //text seen with rect hover

svg.selectAll(".month")
    .data(function(d) { return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
    .enter().append("path")
    .attr("class", "month")
    .attr("d", monthPath);

c_rect.filter(function(d) { return d in cal; }) //check every years' days
      .attr("class", function(d) { return "day " + color(cal[d]); }) //here colors the rect

function monthPath(t0) {
  var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
      d0 = +day(t0), w0 = +week(t0),
      d1 = +day(t1), w1 = +week(t1);
  return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
      + "H" + w0 * cellSize + "V" + 7 * cellSize
      + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
      + "H" + (w1 + 1) * cellSize + "V" + 0
      + "H" + (w0 + 1) * cellSize + "Z";
}

/* END CALENDAR */
                var duration = 200;
                var marginTop = 5;
                var marginRight = 0;
                var marginBottom = 40;
                var marginLeft = 0;
                var padding = 2;
                var width = 1140 - marginRight - marginLeft;
                var height = 290 - marginTop - marginBottom;
                var miniHeight = 75;
                var mainHeight = height - miniHeight - 50;

                var zoom = 1;
                var maxZoom = 20;
                var zoomIncrement = 1;

                /* A global variable to control which event/location to show first*/
                var counter = Math.floor((Math.random() * json.length) + 1);

                /* A global variable to control the amout of ticks visible */
                var ticks = 8;

                /* Find the earliest and latest time in the range */
                var timeFirst = d3.min(items, function(d) {
                    return d.date1;
                });
                var timeLast = d3.max(items, function(d) {
                    return d.date2;
                });

                /* Buffer time in timeline before and after events */
                var timeDiff = timeLast - timeFirst;

                /* Extend the time range before the first date and after the last date 
						to make for a more attractive timeline */
                var timeBegin = getDate(items[counter].date1.getTime() - timeDiff);
                var timeEnd = getDate(items[counter].date1.getTime() + timeDiff);

                /* Scales */
                var x = d3.time.scale()
                    .domain([timeBegin, timeEnd])
                    .range([0, width]);

                /* Create the SVG and its elements */
                var chart = d3.select(".timeline")
                    .append("svg")
                    .attr("width", width + marginRight + marginLeft)
                    .attr("height", height + marginTop + marginBottom)
                    .attr("class", "chart");


                /* Draw the four icons for zooming and moving through the time line as well as their enclosing
						rects. Add functionality for hover and click. */
                var zoomInIcon = chart.append("path")
                    .attr("d", "M22.646,19.307c0.96-1.583,1.523-3.435,1.524-5.421C24.169,8.093,19.478,3.401,13.688,3.399C7.897,3.401,3.204,8.093,3.204,13.885c0,5.789,4.693,10.481,10.484,10.481c1.987,0,3.839-0.563,5.422-1.523l7.128,7.127l3.535-3.537L22.646,19.307zM13.688,20.369c-3.582-0.008-6.478-2.904-6.484-6.484c0.006-3.582,2.903-6.478,6.484-6.486c3.579,0.008,6.478,2.904,6.484,6.486C20.165,17.465,17.267,20.361,13.688,20.369zM15.687,9.051h-4v2.833H8.854v4.001h2.833v2.833h4v-2.834h2.832v-3.999h-2.833V9.051z")
                    .style("pointer-events", "none")
                    .attr("transform", "translate(15,65), scale(1.25)");

                var zoomInButton = chart.append("rect")
                    .attr("width", 50)
                    .attr("height", 50)
                    .style("opacity", 0.2)
                    .attr("transform", "translate(10,60)")
                    .style("cursor", "pointer")
                    .on("click", function(e) {
                        if (zoom < maxZoom) {
                            zoom += zoomIncrement;
                            showLocation();
                        };
                        d3.event.preventDefault();
                        return false;
                    })
                    .on("mouseover", function() {
                        if (zoom < maxZoom) {
                            d3.select(this).transition()
                                .duration(duration)
                                .style("opacity", 0.5);
                        };
                    })
                    .on("mouseout", function() {
                        d3.select(this).transition()
                            .duration(duration)
                            .style("opacity", 0.2);
                    });

                var zoomOutIcon = chart.append("path")
                    .attr("d", "M22.646,19.307c0.96-1.583,1.523-3.435,1.524-5.421C24.169,8.093,19.478,3.401,13.688,3.399C7.897,3.401,3.204,8.093,3.204,13.885c0,5.789,4.693,10.481,10.484,10.481c1.987,0,3.839-0.563,5.422-1.523l7.128,7.127l3.535-3.537L22.646,19.307zM13.688,20.369c-3.582-0.008-6.478-2.904-6.484-6.484c0.006-3.582,2.903-6.478,6.484-6.486c3.579,0.008,6.478,2.904,6.484,6.486C20.165,17.465,17.267,20.361,13.688,20.369zM8.854,11.884v4.001l9.665-0.001v-3.999L8.854,11.884z")
                    .style("pointer-events", "none")
                    .attr("transform", "translate(65,65), scale(1.25)");

                var zoomOutButton = chart.append("rect")
                    .attr("width", 50)
                    .attr("height", 50)
                    .style("opacity", 0.2)
                    .attr("transform", "translate(60,60)")
                    .style("cursor", "pointer")
                    .on("click", function(e) {
                        if (zoom > 1) {
                            zoom -= zoomIncrement;
                            showLocation();
                        };

                        d3.event.preventDefault();
                        return false;
                    })
                    .on("mouseover", function() {
                        if (zoom > 1) {
                            d3.select(this).transition()
                                .duration(duration)
                                .style("opacity", 0.5);
                        };

                    })
                    .on("mouseout", function() {
                        d3.select(this).transition()
                            .duration(duration)
                            .style("opacity", 0.2);
                    });

                var leftIcon = chart.append("path")
                    .attr("d", "M20.834,8.037L9.641,14.5c-1.43,0.824-1.43,2.175,0,3l11.193,6.463c1.429,0.826,2.598,0.15,2.598-1.5V9.537C23.432,7.887,22.263,7.211,20.834,8.037z")
                    .style("pointer-events", "none")
                    .attr("transform", "translate(10,5), scale(1.5)");

                var leftButton = chart.append("rect")
                    .attr("width", 50)
                    .attr("height", 50)
                    .style("opacity", 0.2)
                    .attr("transform", "translate(10,5)")
                    .style("cursor", "pointer")
                    .on("click", function(e) {
                        if (counter > 0) {
                            counter -= 1;
                        };

                        showLocation();
                        loadEvent(items[counter].subject); //uduvudu load

                        d3.event.preventDefault();
                        return false;
                    })
                    .on("mouseover", function() {

                        if (counter > 0) {
                            d3.select(this).transition()
                                .duration(duration)
                                .style("opacity", 0.5);
                        };
                    })
                    .on("mouseout", function() {
                        d3.select(this).transition()
                            .duration(duration)
                            .style("opacity", 0.2);
                    });

                var rightIcon = chart.append("path")
                    .attr("d", "M11.166,23.963L22.359,17.5c1.43-0.824,1.43-2.175,0-3L11.166,8.037c-1.429-0.826-2.598-0.15-2.598,1.5v12.926C8.568,24.113,9.737,24.789,11.166,23.963z")
                    .style("pointer-events", "none")
                    .attr("transform", "translate(60,5), scale(1.5)");

                var rightButton = chart.append("rect")
                    .attr("width", 50)
                    .attr("height", 50)
                    .style("opacity", 0.2)
                    .attr("transform", "translate(60,5)")
                    .style("cursor", "pointer")
                    .on("click", function(e) {
                        if (counter < (items.length - 1)) {
                            counter += 1;
                        };

                        showLocation();
                        loadEvent(items[counter].subject); //uduvudu load

                        d3.event.preventDefault();
                        return false;
                    })
                    .on("mouseover", function() {

                        if (counter < (items.length - 1)) {
                            d3.select(this).transition()
                                .duration(duration)
                                .style("opacity", 0.5);
                        };

                    })
                    .on("mouseout", function() {
                        d3.select(this).transition()
                            .duration(duration)
                            .style("opacity", 0.2);
                    });

                /* Prepare a cliping path to stop the locations and scales breaking spilling over the edges
						of the SVG in IE */
                chart.append("defs").append("clipPath")
                    .attr("id", "clip")
                    .append("rect")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", width)
                    .attr("height", height + marginTop + marginBottom);

                chart.append("g")
                    .append("rect")
                    .attr("x", 0)
                    .attr("y", (height - miniHeight))
                    .attr("width", width)
                    .attr("height", miniHeight)
                    .attr("fill", "#FFFFFF")
                    .style("opacity", 0.5);

                var miniHolder = chart.append("g")
                    .attr("clip-path", "url(#clip)");

                var mini = miniHolder.append("g")
                    .attr("width", width)
                    .attr("height", miniHeight)
                    .attr("class", "mini")
                    .attr("transform", "translate(0," + (height - miniHeight) + ")")


                /* create three seperate x axis for Year, Month and Day based on the same x scale */
                var xYearAxis = d3.svg.axis()
                    .scale(x)
                    .tickSize(15, 0)
                    .ticks(d3.time.years, 1)
                    .tickFormat(d3.time.format('%Y'))
                    .orient('top');

                var yearAxis = mini.append('g')
                    .attr('class', 'year-axis')
                    .call(xYearAxis);

                var xMonthAxis = d3.svg.axis()
                    .scale(x)
                    .tickSize(-miniHeight, 0)
                    .orient('top');

                var monthAxis = mini.append('g')
                    .attr('class', 'axis')
                    .call(xMonthAxis);

                var xDayAxis = d3.svg.axis()
                    .scale(x)
                    .tickSize(10, 0)
                    .tickFormat(function(d) {
                        return '';
                    })
                    .orient('bottom');

                var dayAxis = mini.append('g')
                    .attr('class', 'axis')
                    .attr("transform", "translate(0," + (miniHeight - 10) + ")")
                    .call(xDayAxis);


                /* Draw the static triangle to act as a pointer */
                chart.append("path")
                    .attr("d", "M10,0 L20,20 L0,20z")
                    .style("pointer-events", "none")
                    .attr("transform", "translate(" + ((width / 2) - 10) + "," + height + ")");

                /* Add rect for each point on the timeline */
                var locations = mini.append("g").selectAll("rect")
                    .data(items)
                    .enter()
                    .append("rect")
                    .attr("class", function(d, i) {
                        if (i === counter) {
                            return "locations selected";
                        } else {
                            return "locations";
                        };
                    })
                    .attr("x", function(d, i) {
                        return x(d.date1);
                    })
                    .attr("y", function(d, i) {
                        /* Work out if the first date of the current range overlaps the last date of the previous
							if so move the current rect down so that there is no overlap*/
                        var prev = 0;

                        if (i > 0) {
                            prev = i - 1;
                        }

                        if (i === 0) {
                            return 0;
                        } else if (items[prev].date2 < items[i].date1) {
                            return 0;
                        } else {
                            return (miniHeight - 10) / 2;
                        }
                    })
                    .attr("width", function(d) {
                        if (d.date1 < d.date2) {
                            /* 	decide the width of the rect based on the range of dates */
                            return x(d.date2) - x(d.date1);
                        } else {
                            /* 	if no end date is specified add 86,400,000 milliseconds (1 day) to the first
				date to create a span of time for the width but make sure that it is at least 4 px wide */
                            var thisWidth = x(getDate(d.date1.getTime() + 86400000)) - x(d.date1);

                            if (thisWidth < 4) {
                                return 4;
                            } else {
                                return thisWidth;
                            }
                        }
                    })
                    .attr("height", function(d, i) { //XXX needs better workaround
                        /* Work out if the first date of the current range overlaps the last date of the previous
								if so half the height of the block to accomadate */
                        var prev = 0;
                        var next;

                        if (i > 0) {
                            prev = i - 1;
                        }

                        if (i < items.length - 1) {
                            next = i + 1
                        } else {
                            next = items.length - 1;
                        }

                        if (prev > 0) {
                            if (items[i].date2 > items[next].date1) {
                                return (miniHeight - 10) / 2;
                            } else if (items[prev].date2 > items[i].date1) {
                                return (miniHeight - 10) / 2;
                            } else {
                                return (miniHeight - 10);
                            }
                        } else {
                            return (miniHeight - 10);
                        }

                    })
                    .on("mouseover", function(d, i) {

                        if (d.date1 < d.date2) {
                            d3.select(".outerwrapper .timeline .tooltip")
                                .html("<p>" + d.dateStart + " - <br />" + d.dateEnd + "</p>");
                        } else {
                            d3.select(".outerwrapper .timeline .tooltip")
                                .html("<p>" + d.dateStart + "</p>");
                        }

                        var eventLeft = parseInt(d3.select(this).attr("x"));
                        var eventWidth = parseInt(d3.select(this).attr("width"));

                        var eventTop = parseInt(d3.select(this).attr("y"));

                        var tooltipHeight = parseInt($(".outerwrapper .timeline .tooltip").css("height"));

                        $(".outerwrapper .timeline .tooltip")
                            .css({
                                "left": eventLeft + (eventWidth / 2) + "px",
                                "top": 145 - (tooltipHeight - eventTop) + "px"
                            });

                        $(".outerwrapper .timeline .tooltip").css({
                            "opacity": 1,
                            "display": "block"
                        });

                    })
                    .on("mouseout", function() {
                        $(".outerwrapper .timeline .tooltip").css({
                            "opacity": 0,
                            "display": "none"
                        });
                    })
                    .on("click", function(d, i) {
                        counter = i;

                        showLocation();
                        loadEvent(items[counter].subject); //uduvudu load

                        $(".outerwrapper .timeline .tooltip").css({
                            "opacity": 0,
                            "display": "none"
                        });

                        d3.event.preventDefault();
                        return false;
                    })

                /*	Function to add the info for the next selected location
						Adds the relevent content to info-box and provides a new value for xPosition
						to center the timeline on the selected location*/
                function showLocation() {

                    position = eventWidth * counter;

                    $('.outerwrapper .info-box').animate({
                        scrollLeft: position
                    }, duration);

                    /*	Recalculate the start and end point of the time range based upon
							the current location and the zoom level */
                    timeBegin = getDate(items[counter].date1.getTime() - (timeDiff / zoom));
                    timeEnd = getDate(items[counter].date1.getTime() + (timeDiff / zoom));

                    /*	Replace the values used in the x domain */
                    x.domain([timeBegin, timeEnd]);


                    /*	Adjust the ticks for each x axis depening on the time range */
                    /* ticks for than 5 years, 157,788,000,000 milliseconds */
                    if ((timeEnd - timeBegin) > 157788000000) {
                        xMonthAxis.ticks(d3.time.years, 1).tickFormat(function(d) {
                            return '';
                        });
                        xDayAxis.ticks(d3.time.years, 1);
                    }
                    /* ticks for than a year, 31,557,600,000 milliseconds */
                    else if ((timeEnd - timeBegin) > 31557600000) {
                        xMonthAxis.ticks(d3.time.months, 3).tickFormat(d3.time.format('%d %b'));
                        xDayAxis.ticks(d3.time.months, 1);
                    }
                    /* ticks for than six months 31,557,600,000 milliseconds divided by 2 */
                    else if ((timeEnd - timeBegin) > 15778800000) {
                        xMonthAxis.ticks(d3.time.months, 1).tickFormat(d3.time.format('%d %b'));
                        xDayAxis.ticks(d3.time.weeks, 1);
                    }
                    /* ticks for than two months 31,557,600,000 milliseconds divided by 6 */
                    else if ((timeEnd - timeBegin) > 5259600000) {
                        xMonthAxis.ticks(d3.time.months, 1).tickFormat(d3.time.format('%d %b'));
                        xDayAxis.ticks(d3.time.days, 1);
                    }
                    /* ticks for than a month 31,557,600,000 milliseconds divided by 12 */
                    else if ((timeEnd - timeBegin) > 2629800000) {
                        xMonthAxis.ticks(d3.time.weeks, 1).tickFormat(d3.time.format('%d %b'));
                        xDayAxis.ticks(d3.time.days, 1);
                    }
                    /* ticks for a day */
                    else {
                        xMonthAxis.ticks(d3.time.days, 4).tickFormat(d3.time.format('%d %b'));
                        xDayAxis.ticks(d3.time.days, 1);
                    }



                    /*	Redraw each x axis based on the new domain */
                    yearAxis.transition()
                        .duration(duration)
                        .call(xYearAxis);

                    monthAxis.transition()
                        .duration(duration)
                        .call(xMonthAxis);

                    dayAxis.transition()
                        .duration(duration)
                        .call(xDayAxis);


                    /*	Give the selected location the class of 'selected'
							then animate the locations to their new position based on the updated x scale */
                    locations.classed("selected", false)
                        .attr("class", function(d, i) {
                            if (i === counter) {
                                return "locations selected";
                            } else {
                                return "locations";
                            };
                        })
                        .transition()
                        .duration(duration)
                        .attr("x", function(d, i) {
                            return x(d.date1);
                        })
                        .attr("width", function(d) {
                            if (d.date1 < d.date2) {
                                /* 	decide the width of the rect based on the range of dates */
                                return x(d.date2) - x(d.date1);
                            } else {
                                /* 	if no end date is specified add 86,400,000 milliseconds to the first
										date to create a span of time for the width
										but make sure that it is at least 4 px wide */
                                var thisWidth = x(getDate(d.date1.getTime() + 86400000)) - x(d.date1);

                                if (thisWidth < 4) {
                                    return 4;
                                } else {
                                    return thisWidth;
                                }
                            }
                        });
                    if (firstTime) {
                        closeAlert(".timealert");
                        for (var i = 0; i < $('.outerwrapper div[class^="event"]').length; i++) {
                            if (items[i].headline) {
                                $('.outerwrapper div[class="event-' + i + '"]')
                                .append('<h2 style="text-align:left; float:left;">' + items[i].headline + '</h2>');
                            }
                            if (items[i].date1 < items[i].date2) {
                                $('.outerwrapper div[class="event-' + i + '"]')
                                .append('<h3 style="text-align:right; float:right;">' + items[i].dateStart + ' – ' + items[i].dateEnd + '</h3>');
                            } else {
                                $('.outerwrapper div[class="event-' + i + '"]')
                                .append('<h3 style="text-align:right; float:right;">' + items[i].dateStart + '</h3>');
                            }
                        };
                        firstTime = 0;
                    }
                }

                /* Initial call of show position to adjust the timeline on page load */
                showLocation();
                loadEvent(items[counter].subject); //uduvudu load

            }); /* End of getScript callback function */

            /* Insert an .event div for each event with the text we want to show */
            for (var i = 0; i < items.length; i++) {
                $(".outerwrapper .info-box .panel").append('<div class="event-' + i + '"></div>');
            };

            var eventWidth = $('.outerwrapper .info-box').width();
            var position = 0;
            var panelWidth = eventWidth * items.length;

            $(".outerwrapper .info-box .panel").css({
                "width": panelWidth + "px"
            });

        }
    });

}
