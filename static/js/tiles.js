
var TILES = {
    zoom : 14,
    nbr : 5,
    startXTile : 0,
    startYTile : 0,
    // renvoi une tableau de deux dimensions pour faire une grille de tiles
    getTiles : function( lon,lat,zoom,nbr){
        //on récupère la tile correspondant à la longitude et latitude
        var xtile = (Math.floor((lon+180)/360*Math.pow(2,zoom)));
        var ytile = (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180)
                            + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2
                    * Math.pow(2,zoom)));
        // on décale la tile en haut à gauche pour avoir la latitude et longitude demander au centrede la grille
        TILES.startXTile = xtile - Math.floor(nbr/2);
        TILES.startYTile = ytile - Math.floor(nbr/2);
        var retArray = new Array();
        var tmpArray;
        TILES.zoom = zoom;
        TILES.nbr = nbr;
        // et on rajoute tout les tiles dans un tableau
        for( i =0 ; i < nbr ; i++) {
            tmpArray = new Array();
            for( j =0 ; j < nbr ; j++) {
                tmpArray.push("http://tile.openstreetmap.org/"+
                        zoom+"/"+(TILES.startXTile+i)+"/"+(TILES.startYTile+j)+".png");

            }
            retArray.push(tmpArray);
        }
        return retArray;
    },
    //renvoi en fonction de la latitude et longitude un point sur la grille de tiles.
    //le point renvoyer et la distance entre le point et le haut gauche de la grille ( toutes les tiles)
    getPos : function(lon,lat){

         //on récupère la tile correspondant à la longitude et latitude
         var xtile = (Math.floor((lon+180)/360*Math.pow(2,TILES.zoom)));
         var ytile = (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180)
                             + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2
                     * Math.pow(2,TILES.zoom)));

         //on récupère la latitude et longitude du haut gauche de la tile
         longitude_hg = (xtile/Math.pow(2,TILES.zoom)*360-180);
         var n = Math.PI-2*Math.PI*ytile/Math.pow(2,TILES.zoom);
         latitude_hg = (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n))));

         //on récupère la latitude et longitude du coin haut gauche de la tile diagonale ( en bas à droit) 
         //ce qui donne la latitude et longitude du coin bas gauche
         longitude_bd = ((xtile+1)/Math.pow(2,TILES.zoom)*360-180);
         var n = Math.PI-2*Math.PI*(ytile+1)/Math.pow(2,TILES.zoom);
         latitude_bd = (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n))));
         //produit en croix pour connaitre la position sur l'images

        return Array(
                // pourcentage de haut + nombre de tiles au dessus (sur la grille des tiles faite grace a getTiles) multiplier par la taille d'une tile
                ((Math.abs(longitude_hg-lon)/Math.abs(longitude_hg-longitude_bd))+xtile-TILES.startXTile),
                ((Math.abs(latitude_hg-lat)/Math.abs(latitude_hg-latitude_bd))+ytile-TILES.startYTile)
                );
     }
}
