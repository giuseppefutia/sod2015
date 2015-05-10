var distanceKm = 1; //hardcoded the distance for calculating near POI
var earthCirc = 40075 //in Km

exports.calculateLimitCoords = function (lat, long) {
    var POIcoords = new Object;

    POIcoords.lowLat = (0.009 * distanceKm) - lat;
    POIcoords.highLat = (0.009 * distanceKm) + lat;
    POIcoords.lowLong = ((360/(Math.cos(lat) * earthCirc)) * distanceKm) - long;
    POIcoords.highLong = ((360/(Math.cos(lat) * earthCirc)) * distanceKm) + long;

    return POIcoords;
};
