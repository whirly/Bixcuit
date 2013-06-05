/*
    This file deals with the Bixi data service.
 */

function Station( name, latitude, longitude, nbBikes, nbEmptyDocks, locked ) {
    this.name = name;
    this.latitude = latitude;
    this.longitude = longitude;
    this.nbBikes = nbBikes;
    this.nbEmptyDocks = nbEmptyDocks;
    this.meshFull = null;
    this.meshEmpty = null;
    this.meshLocked = null;
    this.currentFullValue = 0;
    this.currentEmptyValue = 0;
    this.heat = 0.0;
    this.locked = locked;
}

var BIXI = {
    url : "/stations/",
    stations : new Array(),
    updates_till_now : 0.0,

    getInformation : function( callback ) {

        this.stations = new Array();

        // Retrieve data then call the callback
        $.ajax( {
            type: "GET",
            url: this.url,
            dataType: "xml",
            success: function( data ) {

                $(data).find( 'station').each( function() {

                    var $station = $(this);

                    var maStation = new Station(
                        $station.find( "name").text(),
                        parseFloat( $station.find( "lat").text() ),
                        parseFloat( $station.find("long").text() ),
                        parseInt( $station.find("nbBikes").text() ),
                        parseInt( $station.find("nbEmptyDocks").text() ),
                        $station.find("locked").text() == "true" );

                    BIXI.stations.push( maStation );
                });

                callback( BIXI.stations );
            }
        });
    },

    // This method will update our array of station with the new value.
    // Our hypothesis is that all stations are always in the same order from
    // one update to another.
    updateInformation : function() {

        // Retrieve data then call the callback
        $.ajax( {
            type: "GET",
            url: this.url,
            dataType: "xml",
            success: function( data ) {

                var i = 0;

                $(data).find( 'station').each( function() {

                    var old_nb_bikes = BIXI.stations[ i ].nbBikes;

                    var $station = $(this);
                    BIXI.stations[ i ].nbBikes = parseInt( $station.find("nbBikes").text() );
                    BIXI.stations[ i ].nbEmptyDocks = parseInt( $station.find("nbEmptyDocks").text() );

                    var new_nb_bikes = BIXI.stations[ i ].nbBikes;

                    var variation = Math.abs( new_nb_bikes - old_nb_bikes );
                    var accumulation = BIXI.stations[ i ].heat * BIXI.updates_till_now;

                    BIXI.stations[ i ].heat = ( variation + accumulation ) / ( BIXI.updates_till_now + 1.0 );

                    i++;
                });

                BIXI.updates_till_now += 1.0;
            }
        });
    }
}