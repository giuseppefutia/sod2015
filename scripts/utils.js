/* smooth scrolling for nav sections */
$('a').click(function(){
    $('html, body').animate({
        scrollTop: $( $(this).attr('href') ).offset().top -80
    }, 500);
    return false;
});

/* info and error alerts */
var timeAlertInfo = function (source) {
    document.getElementById('time').innerHTML +=  ''
        + '<div class="alert alert-info timealert">'
        + '  <button type="button" class="close" data-dismiss="alert">&times;</button>'
        + '  <strong>Loading</strong> '+source
        + '</div>';
};

var alertInfo = function (source) {
    document.getElementById('alerts').innerHTML +=  ''
        + '<div class="alert alert-info uduvudualert">'
        + '  <button type="button" class="close" data-dismiss="alert">&times;</button>'
        + '  <strong>Loading</strong> '+source
        + '</div>';
};

var alertDanger = function (error) {
    document.getElementById('alerts').innerHTML +=  ''
        + '<div class="alert alert-danger">'
        + '  <button type="button" class="close" data-dismiss="alert">&times;</button>'
        + '  <strong>Error:</strong> '+ error +'.'
        + '</div>';
};

/* autoclose alerts */
var closeAlert = function (c) {
    window.setTimeout(function() {
        $(c).fadeTo(1500, 0).slideUp(500, function(){
            $(this).remove(); 
        });
    }, 1000);
};

/* calculate coord range */
var distanceKm = 20; //hardcoded the distance for calculating near POI
var earthCirc = 40075; //in Km

var calculateLimitCoords = function (lat, long) {
    var POIcoords = new Object;

    POIcoords.lowLat = Math.abs((0.009 * distanceKm) - lat);
    POIcoords.highLat = (0.009 * distanceKm) + Math.abs(lat);
    POIcoords.highLong = Math.abs(((360/(Math.cos(lat) * earthCirc)) * distanceKm) - long);
    POIcoords.lowLong = ((360/(Math.cos(lat) * earthCirc)) * distanceKm) + Math.abs(long);

    return POIcoords;
};
