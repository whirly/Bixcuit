/*!
    Bixcuit, this code was done by Stéphane Becker
 */


var stretch = 3;
var bar_speed = 3;
var updates_till_now = 0.0;

var available_color = 0x86b547;
var unavailable_color = 0xF6F600;
var locked_color = 0xc60000;

var clock = new THREE.Clock();
var timeSinceLastUpdate = 0;

// Text display
var node_text = null;

var container = document.getElementById("viewport");
var width = viewport.offsetWidth;
var height = viewport.offsetHeight; //document.getElementById("container").offsetHeight;

var movement = { x: 0, y: 0, z: 0, r:0 };
var position = { x: 0, y: 30, z: 100, r: Math.PI / 2 };
var renderer = new THREE.WebGLRenderer( { antialias: true } );

var mouse = { x:0, y:0 }, INTERSECTED;

renderer.setSize( width, height );

linkNavigation();
document.getElementById("viewport").appendChild( renderer.domElement );

renderer.setClearColorHex( 0xEEEEEE, 1.0 );
renderer.clear();

var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera( 75, width / height, 1, 1000 );
scene.add( camera );

camera.position.z = 100;
camera.position.y = 30;

lookForCamera();

renderer.shadowMapEnabled = false;

light = new THREE.SpotLight( 0xffffff, 1, 0, Math.PI / 2, 1 );
light.position.set( 0, 1500, 1000 );
light.target.position.set( 0, 0, 0 );
light.castShadow = true;

light.shadowMapWidth = 2048;
light.shadowMapHeight = 2048;

light.shadowDarkness = 0.5;

light.shadowCameraNear = 10;
light.shadowCameraFar = camera.far;
light.shadowCameraFov = 50;

scene.add( light );


// Creation de la carte
createMap( scene );

var last = new Date().getTime();

// Ask the list of stations
BIXI.getInformation( populateMap );

// Lance l'animation
animate( last );

document.getElementById("viewport").addEventListener( 'mousemove', onDocumentMouseMove, false );


function linkNavigation() {
    $('#linkWhat').click( function() {
        $("#sectionWhat").siblings().filter(":visible").fadeOut( 500, function() {
                $("#sectionWhat").fadeIn( 500 );
        });
    });

    $('#linkWhy').click( function() {
        $("#sectionWhy").siblings().filter(":visible").fadeOut( 500, function() {
                $("#sectionWhy").fadeIn( 500 );
        });
    });

    $('#linkWho').click( function() {
        $("#sectionWho").siblings().filter(":visible").fadeOut( 500, function() {
                $("#sectionWho").fadeIn( 500 );
        });
    });

    $('#linkHow').click( function() {
        $("#sectionHow").siblings().filter(":visible").fadeOut( 500, function() {
                $("#sectionHow").fadeIn( 500 );
        });
    });



}

function onWindowResize() {
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( container.offsetWidth, container.offsetHeight );
}

function onDocumentMouseMove( event ) {
    event.preventDefault();

   var parentOffset = $("#viewport").offset();
   var projector = new THREE.Projector();

   //or $(this).offset(); if you really just want the current element's offset
   var relX = event.pageX - parentOffset.left;
   var relY = event.pageY - parentOffset.top;

    mouse.x = ( relX / container.offsetWidth ) * 2 - 1;
    mouse.y = -( relY / container.offsetHeight ) * 2 + 1;

    var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
    projector.unprojectVector( vector, camera );

    var raycaster = new THREE.Raycaster( camera.position, vector.sub(camera.position).normalize() );
    var intersects = raycaster.intersectObjects(scene.children);

    $('#mouseX').html( mouse.x );
    $('#mouseY').html( mouse.y );

    if( intersects.length > 0 ) {

        object = intersects[0].object;
        if( object.index )
        {
            displayInfoForIndex( object.index );
        }
    }
}

function lookForCamera()
{
    var positionToLookAt = new THREE.Vector3();

    positionToLookAt.y = 0;
    positionToLookAt.z = position.z;
    positionToLookAt.x = position.x;

    var x = 100 * Math.cos( position.r );
    var y = 100 * Math.sin( position.r );

    camera.position.x = position.x + x;
    camera.position.z = position.z + y;
    camera.position.y = position.y;

    camera.lookAt( positionToLookAt )
}

function animate( t )
{
    // Manage the camera movement. Well I do not use standard Three.js
    // item for that, because I can.

    position.r += movement.r;
    position.x += -movement.z * Math.cos( Math.PI + position.r ) + movement.x * Math.sin( Math.PI - position.r );
    position.y += movement.y;
    position.z += movement.x * Math.cos( Math.PI - position.r ) - movement.z * Math.sin( Math.PI + position.r );

    movement.x = movement.x * 0.9;
    movement.y = movement.y * 0.9;
    movement.z = movement.z * 0.9;
    movement.r = movement.r * 0.9;

    if( Math.abs( movement.x ) < 0.1 )  movement.x = 0;
    if( Math.abs( movement.y ) < 0.1 )  movement.y = 0;
    if( Math.abs( movement.z ) < 0.1 )  movement.z = 0;
    if( Math.abs( movement.r ) < 0.001 )  movement.r = 0;

    camera.position.y = Math.max( camera.position.y, 5 );

    lookForCamera();

    var timeElapsed = clock.getDelta();

    // Update the dataset
    updateDataset( BIXI.stations, timeElapsed );

    // Update text
    updateTimer( timeElapsed );

    // Picking

    renderer.setClearColorHex( 0x3e95fe, 1.0 );
    renderer.render( scene, camera );

    requestAnimationFrame( animate, renderer.domElement );
}

function createMap( scene )
{
    var lon = -73.5851;
    var lat = 45.51;
    var zoom = 14;
    var nbr = 10;

    var tiles = TILES.getTiles( lon, lat, zoom, nbr );

    for( y = 0; y < 10; y++ )
    {
        for( x = 0; x < 10; x++ )
        {
            var mapItem = new THREE.Mesh(
                    new THREE.CubeGeometry( 50, 1, 50 ),
                    new THREE.MeshPhongMaterial( { map: THREE.ImageUtils.loadTexture( tiles[ x ][ y ] ) })
            );

            mapItem.receiveShadow = true;
            scene.add( mapItem );

            mapItem.position.x = -( 5 * 50 ) + x * 50;
            mapItem.position.z = -( 5 * 50 ) + y * 50;
        }
    }
}

$(document).keydown( function( e )
                     {
                         var processed = false;

                         switch(e.keyCode)
                         {
                             case 39:
                                 // right arrow
                                 movement.x = 5;
                                 processed = true;
                                 break;
                             case 37:
                                 // left arrow
                                 movement.x = -5;
                                 processed = true;
                                 break;

                             case 38:
                                 // up arrow
                                 movement.z = -5;
                                 processed = true;
                                 break;

                             case 40:
                                 // down arrow
                                 movement.z = 5;
                                 processed = true;
                                 break;

                             case 33:
                                 // page up
                                 movement.y = 2;
                                 processed = true;
                                 break;

                             case 34:
                                 // page down
                                 movement.y = -2;
                                 processed = true;
                                 break;

                             case 65:
                                 // a
                                 movement.r = Math.PI / 120;
                                 processed = true;
                                 break;

                             case 90:
                                 // b
                                 movement.r = -Math.PI / 120;
                                 processed = true;
                                 break;
                         }

                         return !processed;

                     }
);

function populateMap( stations )
{
    var material_available = new THREE.MeshLambertMaterial( { color: available_color });
    var material_unavailable = new THREE.MeshLambertMaterial( { color: unavailable_color });
    var material_locked = new THREE.MeshLambertMaterial( { color: locked_color });

    for( var i = 0; i < stations.length; i++ )
    {
        var station = stations[ i ];

        var da_cube = new THREE.Mesh(
                new THREE.CylinderGeometry( 1, 1, 1, 10, 10 ),
                material_available
            );

        da_cube.index = i;
        station.meshFull = da_cube;


        var da_other_cube = new THREE.Mesh(
                new THREE.CylinderGeometry( 1, 1, 1, 10, 10 ),
                material_unavailable
        );

        da_other_cube.index = i;
        station.meshEmpty = da_other_cube;

        var da_another_cube = new THREE.Mesh(
                new THREE.CylinderGeometry( 1, 1, 1, 10, 10, false ),
                material_locked
        );

        da_another_cube.index = i;
        station.meshLocked = da_another_cube;

        scene.add( station.meshEmpty );
        scene.add( station.meshFull );
        scene.add( station.meshLocked );
    }

    updateDataset( stations, 0 )
}

function displayInfoForIndex( index )
{
    $(".plain-detail-info").show();
    $("#placeholderName").html( "Station : " + BIXI.stations[ index ].name );
    $("#placeholderAvailable").html( "Available bikes : " + BIXI.stations[ index ].nbBikes );
    $("#placeholderNotAvailable").html( "Empty docks : " + BIXI.stations[ index ].nbEmptyDocks );
}

// This function will perform the update of the current value of the bargraph to converge with the real value
// this will add an animation effect as the bar increase/decrease to match the new value.
function updateDataset( stations, timeElapsed )
{
    for( var i = 0; i < stations.length; i++ )
    {
        var station = stations[ i ];

        var needRefresh = false;

        var position = TILES.getPos( station.longitude, station.latitude );

        if( station.nbBikes < station.currentFullValue )
        {
            station.currentFullValue -= Math.min( Math.abs( station.nbBikes - station.currentFullValue ), bar_speed );
            needRefresh = true;
        }
        else if( station.nbBikes > station.currentFullValue )
        {
            station.currentFullValue += Math.min( Math.abs( station.nbBikes - station.currentFullValue ), bar_speed );
            needRefresh = true;
        }

        if( station.nbEmptyDocks < station.currentEmptyValue )
        {
            station.currentEmptyValue -= Math.min( Math.abs( station.nbEmptyDocks - station.currentEmptyValue ), bar_speed );
            needRefresh = true;
        }
        else if( station.nbEmptyDocks > station.currentEmptyValue )
        {
            station.currentEmptyValue += Math.min( Math.abs( station.nbEmptyDocks - station.currentEmptyValue ), bar_speed );
            needRefresh = true;
        }

        if( station.locked )
        {
            station.meshEmpty.visible = false;
            station.meshFull.visible = false;
            station.meshLocked.visible = true;
        }
        else
        {
            station.meshEmpty.visible = station.currentEmptyValue != 0;
            station.meshFull.visible = station.currentFullValue != 0;
            station.meshLocked.visible = false;
        }

        if( needRefresh )
        {
            station.meshFull.scale.y = station.currentFullValue / stretch;

            station.meshFull.position.x = - ( 5 * 50 ) + position[ 0 ] * 50 - 25;
            station.meshFull.position.z = - ( 5 * 50 ) + position[ 1 ] * 50 - 25;
            station.meshFull.position.y = 0.5 + ( station.currentFullValue / stretch ) / 2;
            station.meshFull.castShadow = true;
            station.meshFull.receiveShadow = true;

            station.meshEmpty.scale.y = station.currentEmptyValue / stretch;

            station.meshEmpty.position.x = - ( 5 * 50 ) + position[ 0 ] * 50 - 25;
            station.meshEmpty.position.z = - ( 5 * 50 ) + position[ 1 ] * 50 - 25;
            station.meshEmpty.position.y = 0.5 + ( station.currentFullValue / stretch ) + ( station.currentEmptyValue / stretch ) / 2;
            station.meshEmpty.castShadow = true;
            station.meshEmpty.receiveShadow = true;

            station.meshLocked.scale.y = 0.5;

            station.meshLocked.position.x = - ( 5 * 50 ) + position[ 0 ] * 50 - 25;
            station.meshLocked.position.z = - ( 5 * 50 ) + position[ 1 ] * 50 - 25;
            station.meshLocked.position.y = 0.5;
            station.meshLocked.castShadow = true;
            station.meshLocked.receiveShadow = true;
        }

        station.meshFull.rotation.y += timeElapsed * ( station.heat * 2.0 * 12.0 * Math.PI / 360.0 );
        station.meshEmpty.rotation.y += timeElapsed * ( station.heat * 2.0 * 12.0 * Math.PI / 360.0 );
    }
}

function updateTimer( timeElapsed )
{
    if( node_text )
    {
        scene.remove( node_text );
    }

    timeSinceLastUpdate += timeElapsed;

    if( timeSinceLastUpdate > 60 )
    {
        timeSinceLastUpdate = 0;
        BIXI.updateInformation();
        updates_till_now += 1.0;
    }

    var timeRemaining = 60 - Math.floor( timeSinceLastUpdate );
    var geometry = new THREE.TextGeometry( timeRemaining, {

        size: 20,
        height: 5,
        curveSegments: 12,

        face: "helvetiker",
        weight: "bold",
        style: "normal"
    });

    var material = new THREE.MeshPhongMaterial( { color: available_color, specular: 0xffffff, ambient: 0xaa0000 });
    node_text = new THREE.Mesh( geometry, material );
    node_text.position.x = -5 * 50;
    node_text.position.z = -5 * 50;
    node_text.position.y = 0.5;

    scene.add( node_text );
}
