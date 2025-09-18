
//conversion between tile and canvas
// var squareSize = 100;


var drawGrid = true;

var hand;
var handCanvas;

class Board{
    tiles = [];
    isHilighted = false;
    highlightX = -1;
    highlightY = -1;
    drawBackground = false;
    constructor(tilesLong, tilesHigh){
        this.tiles = [tilesHigh * tilesLong];
        for(var x = 0; x < tilesLong; x++){
            for(var y = 0; y < tilesHigh; y++){
                this.setTile(null, x, y);
            }
        }
    }

    get highlightX(){
        return this.highlightX;
    }
    get highlightY(){
        return this.highlightY;
    }
    get isHilighted(){
        return this.isHilighted;
    }

    getMarkedScore(){
        var score = 0;
        this.tiles.forEach(tile => {
            if(tile == null) return;
            score += tile.scoreNote;
        });
        return score;
    }

    draw(canvas){
        //get the graphics to draw with
        var ctx = canvas.getContext("2d");

        ctx.strokeStyle = "black";
        ctx.fillStyle = "white";

        //draw in the border of the tile
        // ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.strokeRect(0, 0, canvasWidth, canvasHeight);

        ctx.drawImage(boardImage, 0, 0, 700, 700);

        //for each tile in the Tiles array, draw it in its position
        //the tile knows how to Draw itself.
        for(var x = 0; x < tileWidth; x++){
            for(var y = 0; y < tileHeight; y++){
                this.drawTile(canvas, x, y);
            }
        }
        //fill colour for the four corners
        // if(this.drawBackground){
        //     ctx.globalAlpha = 0.5;
        //     ctx.beginPath();
        //     ctx.fillStyle = "yellow";
        //     ctx.arc(0, 0, 275, 0, 2*Math.PI, true);
        //     ctx.fill();

        //     ctx.beginPath();
        //     ctx.fillStyle = "blue";
        //     ctx.arc(canvasWidth, 0, 275, 0, 2*Math.PI, true);
        //     ctx.fill();

        //     ctx.beginPath();
        //     ctx.fillStyle = "purple";
        //     ctx.arc(canvasWidth, canvasHeight, 275, 0, 2*Math.PI, true);
        //     ctx.fill();

        //     ctx.beginPath();
        //     ctx.fillStyle = "orange";
        //     ctx.arc(0, canvasHeight, 275, 0, 2*Math.PI, true);
        //     ctx.fill();
        //     ctx.globalAlpha = 1;
        // }
    }

    drawTile(canvas, x, y){
        //get the specific tile
        var thisTile = this.tiles[y * tileWidth + x];
        //if the tile hasnt been set
        if(thisTile == null){
            //get the graphics to draw with
            var ctx = canvas.getContext("2d");

            ctx.strokeStyle = "black";
            ctx.fillStyle = "white";
            //draw in the border of the tile
            ctx.strokeRect(x*squareSize, y*squareSize, squareSize, squareSize);
        }else{
            //if the tile has been set
            //it knows how to draw itself
            thisTile.draw(canvas, x, y);
        }

        //if we want this tile hilighted, for any reason
        //draw in a yellow border at the end
        if(x == this.highlightX && y == this.highlightY){
            var ctx = canvas.getContext("2d");
            ctx.strokeStyle = "yellow";
            ctx.strokeRect(x*squareSize, y*squareSize, squareSize, squareSize);
            ctx.strokeRect(x*squareSize+1, y*squareSize+1, squareSize-2, squareSize-2);
            ctx.strokeRect(x*squareSize+2, y*squareSize+2, squareSize-4, squareSize-4);
            ctx.strokeRect(x*squareSize+3, y*squareSize+3, squareSize-6, squareSize-6);
        }
    }

    setTile(tile, x, y){
        this.tiles[y * tileWidth + x] = tile;
    }
    getTile(x, y){
        return this.tiles[y * tileWidth + x];
    }

    hilight(x, y){
        this.highlightX = x;
        this.highlightY = y;
        this.isHilighted = true;
    }
    unhilight(){
        this.highlightX = -1;
        this.highlightY = -1;
        this.isHilighted = false;
    }
    getTileHilighted(){
        if(this.isHilighted)
            return this.getTile(this.highlightX, this.highlightY);
        else return null;
    }
    setTileHilighted(newTile){
        if(this.isHilighted)
            this.setTile(newTile, this.highlightX, this.highlightY);
        else console.log("Tried to set a tile to a non-hilighted board");
    }
}

