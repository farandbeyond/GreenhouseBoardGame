
//conversion between tile and canvas
var squareSize = 100;

//canvas dimensions
var canvasWidth = 700;
var canvasHeight = 700;

//tile amount(s) on main board
var tileWidth = 7;
var tileHeight = 7;

//tile dictionary
var tileDict = [];

//tile Deck
var tileDeck = [];

//control variables
var safeMode = true;

//global access: Board and Hand(s)
var board;
var boardCanvas;

var turnPlayer = 0;
var numPlayers = 3;
var tilesPlaced = 0;

var handSize = 5;
var hands = [];
var handCanvases = [];

//global access: player indicators
var deckIndicator;
var turnIndicator;
var boardIndicator;

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


//Add tiles to the global tile dictionary
function addTile(tile){
    tileDict.push(tile);
}
function addTiles(tile, rotations){
    var namesArr = [];
    for(var i=0;i<rotations;i++){
        namesArr.push(tile.name);
    }
    addTilesNames(tile, rotations, namesArr);
}
function addTilesNames(tile, rotations, namesArr){
    // tile.name = namesArr[0];
    addTile(tile);
    for(var i=0;i<rotations;i++){
        tile = tile.rotated;
        tile.name = namesArr[i];
        addTile(tile);
    }
}
function makeTileDictionary(){
    //Flowers: Single Zone
    addTilesNames(new Tile("Daybloom", "Score [Strength] in [Pref]", true, false, false, false), 3, ["Waterlily","Moonglow","Fireblossom"]);
    addTiles(new Tile("Picky Pref", "Score [2] in [Strength 2+] [Pref]. Score [-1] everywhere else", true, false, false, false), 3);
    addTiles(new Tile("Weak Preferred","Score [1] in [Pref]", true, false, false, false),3);
    addTiles(new Tile("Thriving Preferred","Score [2] in [Pref] if [Location] is [Strength 1], ", true, false, false, false),3);
    addTiles(new Tile("Anywhere but There", "Score [1] if [Location] is [Not] [Opposite]", true, false, false, false), 3);
    addTiles(new Tile("Spacious", "Score [+1] per [Adjacent] [Empty]", false, false, false, false), 1);

    //Flowers: Hybrid Zone
    addTiles(new Tile("Hybrid Flower", "Score [Strength] in [Pref]. If [Location] is [Both Pref], Score [3] instead", true, true, false, false), 3);
    addTiles(new Tile("Varied Flower", "Score [2] in [Pref]", true, true, false, false), 3);
    
    //Flowers: Unique Effect
    addTiles(new Tile("Weeds", "Score [-2]", false, false, false, false), 3);
    addTiles(new Tile("Cluster Flower", "Score [+1] per same flower [Adjacent]", false, false, false, false), 5);
    
    //Devices:
    addTilesNames(new Tile("Sun Lamp", "[Device]*Score [-1]. [Strength][+1] of [Pref] to [Adjacent]", true, false, false, false), 3, ["Sprinkler","Shadecloth","Dehumidifier"]);
    addTiles(new Tile("Dolly", "Device*Score [1] if [Adjacent] to [Fountain]", false, false, false, false), 0);
    addTiles(new Tile("Shovel", "Place covering [Flower] tile. This tile counts as [Empty]", false, false, false, false), 1);
    
    //Decorations:  
    addTiles(new Tile("Decorative Rock", "Decor*If [Adjacent] [Plant] has [Score 2+], Score [1]", false, false, false, false), 1);
    addTiles(new Tile("Regional Decor", "Decor*Score [1] per [Adjacent][Plant] with same [Pref]", true, false, false, false), 3);
}
//update the player view
function updateDeckIndicator(){
    deckIndicator.innerText = "Remaining Tiles: "+tileDeck.length;
}
function updateTurnIndicator(){
    turnIndicator.innerText = "Player "+(turnPlayer+1)+"'s turn";
}
function updateBoardIndicator(){
    boardIndicator.innerText = tilesPlaced+" tiles Placed";
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

    // console.log(event);
    //if we ControlClick, bring up the Score Display Editing stuff
    if(event.ctrlKey || event.shiftKey){
        //first: hilite the tile we are editing
        board.hilight(tileX, tileY);
        if(board.getTileHilighted() == null) return;
        if(event.shiftKey && event.ctrlKey){
            board.getTileHilighted().scoreNote = 0;
        }else if (event.ctrlKey){
            board.getTileHilighted().scoreNote -= 1;
        }else{ //if shiftKey
            board.getTileHilighted().scoreNote += 1;
        }
    }else{
        //otherwise, we do normal things
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
            if(board.getTileHilighted() != null && safeMode) return;
            else hands.forEach(hand => {
                if(hand.isHilighted) placeTile(hand);
            });
        }
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
    tilesPlaced++;
    
    //unhilight the board
    board.unhilight();

    //fill the hand from the deck
    hand.setTileHilighted(tileDeck.shift());
    // console.log("Remaining Tiles: "+tileDeck.length);

    //and unhilight the hand
    hand.unhilight();

    //then redraw both board and hand
    // hand.draw(handCanvas);
    for(var i=0;i<hands.length;i++){
        hands[i].draw(handCanvases[i]);
    }
    board.draw(boardCanvas);
    
    passTurn();
    updateDeckIndicator();
    updateBoardIndicator();
}

function setupNewGame(){
    //setup Board and Hand
    board = new Board(7,7);
    board.drawBackground = true;
    //hand = new Board(5,1);

    //get Canvases for drawing purposes
    boardCanvas = document.getElementById("board");
    boardCanvas.onclick = onClickBoard;

    // handCanvas = document.getElementById("hand");
    // handCanvas.onclick = onClickHand;

    //get a number of hands, equal to the number of selected players
    handCanvases.forEach(e => {
        e.remove();
    });
    hands = [];
    handCanvases = [];
    for(var i = 0; i < numPlayers; i++){
        //make the Canvas Element
        // if(document.getElementById("hand"+i) != null){
        //     document.getElementById("hand"+i).remove();
        //     console.log("Delet!");
        // }
        // //<canvas id="hand" width="500", height="100" style="float: left; border: 1px solid #000000; margin: 1em;"></canvas>
        var thisHand = document.createElement("canvas");
        thisHand.name = "hand" + i;
        thisHand.id = "hand" + i;
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

    //setup the "deck" and the "hand"
    tileDeck = [...tileDict];
    Shuffle(tileDeck);
    for(var i = 0; i<handSize;i++){
        hands.forEach(hand => hand.setTile(tileDeck.shift(), i, 0));
    }

    //setup the "board"
    board.setTile(new Tile("Fountain", "Starting Position",true, true, true, true), 3, 3);

    //do the inital draw
    board.draw(boardCanvas);
    for(var i=0;i<hands.length;i++){
        hands[i].draw(handCanvases[i]);
    }

    tilesPlaced = 0;
    turnPlayer = -1;
    passTurn();

    updateTurnIndicator();
    updateDeckIndicator();
    updateBoardIndicator();
    //debug: set up the board with random shit
    // board.setTile(tileDict[2], 1, 1);
    // board.setTile(tileDict[3], 3, 1);
    // board.setTile(tileDict[0], 1, 6);
    // board.setTile(tileDict[5], 2, 6);
    // board.setTile(tileDict[8], 5, 6);
    // board.setTile(tileDict[12], 4, 6);
}
function passTurn(){
    if(turnPlayer != -1){
        handCanvases[turnPlayer].style = "float: left; border: 1px solid #000000; margin: 1em;";
    }
    turnPlayer++;
    if(turnPlayer>=numPlayers) turnPlayer = 0;
    handCanvases[turnPlayer].style = "float: left; border: 1em solid #FF0000; margin: 1px;";
    updateTurnIndicator();
}


function main(){
    //grab static UI from the webpage
    turnIndicator = document.getElementById("turnIndicator");
    deckIndicator = document.getElementById("deckIndicator");
    boardIndicator = document.getElementById("boardIndicator");
    
    //make the predefined tiles
    makeTileDictionary();

    //setup a fresh gamestate
    setupNewGame();

    //element hooks: for the Buttons
    document.getElementById("2Game").onclick = (e => {numPlayers = 2; setupNewGame()});
    document.getElementById("3Game").onclick = (e => {numPlayers = 3; setupNewGame()});
    document.getElementById("4Game").onclick = (e => {numPlayers = 4; setupNewGame()});

    document.getElementById("safeModeCheck").onchange = (e => safeMode = e.target.checked);
    safeMode = document.getElementById("safeModeCheck").checked;

    //draw everything for the first time
    board.draw(boardCanvas);
    for(var i=0;i<hands.length;i++){
        hands[i].draw(handCanvases[i]);
    }
    // hand.draw(handCanvas);
}

main();
