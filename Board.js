//canvas dimensions
var canvasWidth = 700;
var canvasHeight = 700;
//tile amount(s)
var tileWidth = 7;
var tileHeight = 7;
//conversion between tile and canvas
var squareSize = 100;
//tile formatting variables
var cornerSize = 15;
var fontHeight = 15;
var fontRowLength = 20;

var drawGrid = true;

//tile dictionary
var tileDict = [];

//tile Deck and Hand
var tileDeck = [];
var tilesInHand = [];
var handSize = 5;

//global access: Board and Hand(s)
var board;
var boardCanvas;
var hand;
var handCanvas;

var numPlayers = 3;
var hands = [];
var handCanvases = [];

function Shuffle(array){
    let currentIndex = array.length;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {
        // Pick a remaining element...
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
}

class Tile{
    
    constructor(name, text, brightIcon, dampIcon, darkIcon, dryIcon){
        this.name = name;
        this.text = text;
        this.brightIcon = brightIcon;
        this.dampIcon = dampIcon;
        this.darkIcon = darkIcon;
        this.dryIcon = dryIcon;
    }
    draw(canvas, tileX, tileY){
        //get the graphics to draw with
        var ctx = canvas.getContext("2d");

        ctx.strokeStyle = "black";
        ctx.fillStyle = "gray";

        //switch from Grid measurements to Canvas measurements
        var positionX = tileX * squareSize;
        var positionY = tileY * squareSize;

        //draw in the border of the tile
        ctx.fillRect(positionX, positionY, squareSize, squareSize);
        ctx.strokeRect(positionX, positionY, squareSize, squareSize);

        //fill in the corners: Sun, Damp, Shade and Dry in the corners
        if(this.brightIcon){
            ctx.fillStyle = "yellow";
            ctx.fillRect(positionX+2, positionY+2, cornerSize, cornerSize);
        }
        if(this.dampIcon){
            ctx.fillStyle = "blue";
            ctx.fillRect(positionX + squareSize - cornerSize-2, positionY+2, cornerSize, cornerSize);
        }
        if(this.darkIcon){
            ctx.fillStyle = "purple";
            ctx.fillRect(positionX + squareSize - cornerSize-2, positionY + squareSize - cornerSize-2, cornerSize, cornerSize);
        }
        if(this.dryIcon){
            ctx.fillStyle = "orange";
            ctx.fillRect(positionX+2, positionY + squareSize - cornerSize-2, cornerSize, cornerSize);
        }
        
        //fill in the text defining the card
        ctx.textAlign = "center";
        ctx.strokeText(this.name, positionX + squareSize/2, positionY + fontHeight, squareSize);

        //sometimes the text is too long: split it up if so
        if(this.text.length > fontRowLength){
            var lineIndex = 0;
            var line = "";
            var word = "";
            var remaining = this.text;
            //while there is text remaining in the descriptive text
            while(remaining.length > 0){
                //take the first/next character
                var character = remaining[0];
                remaining = remaining.slice(1);
                //if we have asked for a line break with the * character
                if(character == "*"){
                    line += word;
                    word = "";
                    //draw the line of text, and begin a new line of text
                    ctx.strokeText(line, positionX + squareSize/2, positionY + squareSize/2 + fontHeight * lineIndex, squareSize);
                    lineIndex++;
                    line = "";
                //otherwise
                }else if(character != " "){
                    //if its NOT a space, add that character to a Word string
                    word += character;
                }else{
                    //if it IS a space, add it to the word string, 
                    word += character;
                    //and see if we can add it to the current line without squeezing
                    if(line.length + word.length > fontRowLength){
                        //if not: draw the line of text, and begin a new line of text
                        ctx.strokeText(line, positionX + squareSize/2, positionY + squareSize/2 + fontHeight * lineIndex, squareSize);
                        lineIndex++;
                        line = "";
                    }
                    //then, reset the line, add the new word and continue
                    line += word;
                    word = "";
                }
            }
            //anything left over when remaining text runs out, print it in the final position before moving on
            if(line.length + word.length > fontRowLength){
                ctx.strokeText(line, positionX + squareSize/2, positionY + squareSize/2 + fontHeight * lineIndex, squareSize);
                lineIndex++;
                line = "";
            }
            line += word;
            word = "";
            ctx.strokeText(line, positionX + squareSize/2, positionY + squareSize/2 + fontHeight * lineIndex, squareSize);
        }else{
            //if text is not too long, just print it out as is.
            ctx.strokeText(this.text, positionX + squareSize/2, positionY + squareSize/2, squareSize);
        }
    }
    get rotated(){
        return new Tile(this.name, this.text, this.dampIcon, this.darkIcon, this.dryIcon, this.brightIcon);
    }
}

class Board{
    tiles = [];
    isHilighted = false;
    highlightX = -1;
    highlightY = -1;
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

    draw(canvas){
        //get the graphics to draw with
        var ctx = canvas.getContext("2d");

        ctx.strokeStyle = "black";
        ctx.fillStyle = "white";

        //draw in the border of the tile
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.strokeRect(0, 0, canvasWidth, canvasHeight);

        //fill colour for the four corners
        ctx.beginPath();
        ctx.fillStyle = "yellow";
        ctx.arc(0, 0, 275, 0, 2*Math.PI, true);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = "blue";
        ctx.arc(canvasWidth, 0, 275, 0, 2*Math.PI, true);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = "purple";
        ctx.arc(canvasWidth, canvasHeight, 275, 0, 2*Math.PI, true);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = "orange";
        ctx.arc(0, canvasHeight, 275, 0, 2*Math.PI, true);
        ctx.fill();

        //for each tile in the Tiles array, draw it in its position
        //the tile knows how to Draw itself.
        for(var x = 0; x < tileWidth; x++){
            for(var y = 0; y < tileHeight; y++){
                this.drawTile(canvas, x, y);
            }
        }
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

//Add tiles to the global tile dictionary
function addTile(tile){
    tileDict.push(tile);
}
function addTiles(tile, rotations){
    addTile(tile);
    for(var i=0;i<rotations;i++){
        tile = tile.rotated;
        addTile(tile);
    }
}
function makeTileDictionary(){
    //Flowers: Single Zone
    addTiles(new Tile("Variable Flower", "Score [Strength] in [Pref]", true, false, false, false), 3);
    addTiles(new Tile("+2 Flower", "Score [2] in [Pref]", true, false, false, false), 3);
    addTiles(new Tile("Strong Preferred","If [Location] is [Pref] with [Strength 2+], Score [2]", true, false, false, false),3);
    addTiles(new Tile("Thriving Preferred","If [Location] is [Pref] with [Strength 1], Score [2]", true, false, false, false),3);
    addTiles(new Tile("Anywhere but There", "Score [1] if [Location] is [Not] [Opposite]", true, false, false, false), 3);
    addTiles(new Tile("Spacious", "Score [+1] per [Adjacent] [Empty]", false, false, false, false), 1);

    //Flowers: Hybrid Zone
    addTiles(new Tile("Hybrid Flower", "If [Location] is [Both Pref], Score [1]. Also, Score [Strength] in [Pref]", true, true, false, false), 3);
    
    //Flowers: Unique Effect
    addTiles(new Tile("Weeds", "Score [-1]", true, true, true, true), 3);
    addTiles(new Tile("Cluster Flower", "Score [1] same flower [Adjacent]", false, false, false, false), 3);
    
    //Devices:
    addTiles(new Tile("Zoning Device", "[Device]*[Strength][+1] of [Pref] to [Adjacent]", true, false, false, false), 3);
    addTiles(new Tile("Dolly", "Device*Score [1] if [Adjacent] to [Fountain]", false, false, false, false), 0);
    
    //Decorations:  
    addTiles(new Tile("Decorative Rock", "Decor*If [Adjacent] [Plant] has [Score 2+], Score [1]", false, false, false, false), 1);
    addTiles(new Tile("Regional Decor", "Decor*Score [1] per [Adjacent][Plant] with same [Pref]", true, false, false, false), 3);
}
//functional: onClicks
function onClickHand(event){
    //find the click
    var clickX = event.offsetX;
    var clickY = event.offsetY;

    //convert it into tile space
    var tileX = Math.floor(clickX / squareSize);
    var tileY = Math.floor(clickY / squareSize);

    //grab the hand that was clicked on
    var canvas = event.target;
    var index = canvas.number;

    //check1: if we click a previously hilighted tile, cancel the hilight
    if(hands[index].highlightX == tileX && hands[index].highlightY == tileY){
        hands[index].unhilight();
    }else{
        //otherwise, hilight that tile
        hands[index].hilight(tileX, tileY);
    }

    //check2: if we hilighted the board and a hand, place the tile from the hand onto the board.
    // if(board.isHilighted){
    //     placeTile();
    // }
        

    //then, redraw the hand, so we see the hilight, unhilight, or placed tile
    hands[index].draw(event.target);
}
function onClickBoard(event){
    var clickX = event.offsetX;
    var clickY = event.offsetY;

    var tileX = Math.floor(clickX / squareSize);
    var tileY = Math.floor(clickY / squareSize);

    //check1: if we click a previously hilighted tile, cancel the hilight
    if(board.highlightX == tileX && board.highlightY == tileY){
        board.unhilight();
    }else{
        //otherwise, hilight that tile
        board.hilight(tileX, tileY);
    }

    //check2: if we have a hilighted tile in hand, try to place it on the board
    // if(board.isHilighted && hand.isHilighted){
    //     placeTile();
    // }
    if(board.isHilighted){
        hands.forEach(hand => {
            if(hand.isHilighted) placeTile(hand);
        });
    }

    //then, redraw the board so we see the hilight, unhilight, or placed tile
    board.draw(event.target);
}

function placeTile(hand){
    //check condition: if the board already has a tile, dont place unless a setting is checked
    //TODO: update this with a checkbox condition
    if(!board.isHilighted) return;

    //get the tile from hand
    var tile = hand.getTileHilighted();

    //add it to the board
    board.setTileHilighted(tile);
    
    //unhilight the board
    board.unhilight();

    //fill the hand from the deck
    hand.setTileHilighted(tileDeck.shift());
    console.log("Remaining Tiles: "+tileDeck.length);

    //and unhilight the hand
    hand.unhilight();

    //then redraw both board and hand
    // hand.draw(handCanvas);
    for(var i=0;i<hands.length;i++){
        hands[i].draw(handCanvases[i]);
    }
    board.draw(boardCanvas);
}


function main(){
    //setup Board and Hand
    board = new Board(7,7);
    hand = new Board(5,1);
    //get Canvases for drawing purposes
    boardCanvas = document.getElementById("board");
    boardCanvas.onclick = onClickBoard;

    // handCanvas = document.getElementById("hand");
    // handCanvas.onclick = onClickHand;

    //get a number of hands, equal to the number of selected players
    for(var i = 0; i < numPlayers; i++){
        //make the Canvas Element
        // //<canvas id="hand" width="500", height="100" style="float: left; border: 1px solid #000000; margin: 1em;"></canvas>
        var thisHand = document.createElement("canvas");
        thisHand.name = "hand" + i;
        thisHand.width = 500; //5 tiles wide
        thisHand.height = 100; //1 tile tall
        thisHand.style = "float: left; border: 1px solid #000000; margin: 1em;";
        thisHand.number = i;
        thisHand.onclick = onClickHand;
        //add it to the main, at the end
        document.getElementById("main").append(thisHand);

        //record the canvas, and make the board
        handCanvases[i] = thisHand;
        hands[i] = new Board(5, 1);
        hands[i].draw(thisHand);
    }

    //make the predefined tiles
    makeTileDictionary();

    //setup the "deck" and the "hand"
    tileDeck = [...tileDict];
    Shuffle(tileDeck);
    for(var i = 0; i<handSize;i++){
        hands.forEach(hand => hand.setTile(tileDeck.shift(), i, 0));
    }

    //setup the "board"
    board.setTile(new Tile("Fountain", "Starting Position",true, true, true, true), 3, 3);
    
    //debug: set up the board with random shit
    // board.setTile(tileDict[2], 1, 1);
    // board.setTile(tileDict[3], 3, 1);
    // board.setTile(tileDict[0], 1, 6);
    // board.setTile(tileDict[5], 2, 6);
    // board.setTile(tileDict[8], 5, 6);
    // board.setTile(tileDict[12], 4, 6);

    //draw everything for the first time
    board.draw(boardCanvas);
    for(var i=0;i<hands.length;i++){
        hands[i].draw(handCanvases[i]);
    }
    // hand.draw(handCanvas);
    
}

main();