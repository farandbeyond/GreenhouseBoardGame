
//conversion between tile and canvas
var squareSize = 100;

//canvas dimensions
var canvasWidth = 700;
var canvasHeight = 700;

//tile amount(s) on main board
var tileWidth = 7;
var tileHeight = 7;

//dictionaries
var tileDict = [];
var objectiveDict = [];

//Decks
var tileDeck = [];
var objectiveDeck = [];
var activeObjectives = [];

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
var scoreIndicator;

//helper functions
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

//Add entries to the global tile dictionary
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
    addTilesNames(new Tile("Caladium", "Score [Strength] in [Pref]", true, false, false, false), 3, ["Primrose","Fern","Stonecrop"]);
    addTilesNames(new Tile("Sunflower", "Score [2] in [Strength 2+] [Pref]. Score [-1] everywhere else", true, false, false, false), 3, ["Milkweed","English Ivy","Cactus"]);
    addTilesNames(new Tile("Rosemary","Score [1] in [Pref]", true, false, false, false),3, ["Marigold", "Arrowhead", "Sage"]);
    addTilesNames(new Tile("Thyme","Score [2] in [Pref] if [Location] is *[Strength 1], ", true, false, false, false),3, ["Mint", "Chinese Evergreen", "Dwarf Palm"]);
    addTilesNames(new Tile("Latana", "Score [-1] if [Opposite], Score [+1] otherwise", true, false, false, false), 3, ["Lily", "Lungwort", "Iris"]);

    //Flowers: Hybrid Zone
    addTilesNames(new Tile("Cattail", "Score [Strength] in [Pref]. If [Location] is [Both Pref], Score [3] instead", true, true, false, false), 3, ["Calla Lily", "Succulent", "Yucca"]);
    addTilesNames(new Tile("Forget-me-not", "Score [2] in [Either] [Pref]", true, true, false, false), 3, ["Orchid", "Hosta", "Lavender"]);
    
    //Flowers: Unique Effect
    addTilesNames(new Tile("Dandelion", "Score [-2]", false, false, false, false), 3, ["Knotweed", "Hogweed", "Poison Ivy"]);
    addTiles(new Tile("Mushroom Cluster", "Score [+1] per [Adjacent] Mushroom Cluster", false, false, false, false), 5);
    addTilesNames(new Tile("Lemon Tree", "Score [+1] per [Adjacent] [Empty]", false, false, false, false), 3, ["Orange Tree", "Cherry Tree", "Fig Tree"]);
    
    //Devices:
    addTilesNames(new Tile("Grow Light", "[Device]*Score [-1]. [Strength][+1] of [Pref] to [Adjacent]", true, false, false, false), 3, ["Sprinkler","Shadecloth","Drainage Mat"]);
    addTiles(new Tile("Dolly", "Device*Score [1] if [Adjacent] to [Fountain]", false, false, false, false), 0);
    addTiles(new Tile("Shovel", "Place covering [Flower] tile. This tile counts as [Empty]", false, false, false, false), 1);
    
    //Decorations:  
    addTilesNames(new Tile("Statue", "Decor*For each [Adjacent] [Plant] with [Score 2+], Score [+1]", false, false, false, false), 3, ["Stone Arch","Garden Stones", "Decorative Stone"]);
    addTilesNames(new Tile("Sundial", "Decor*Score [1] per [Adjacent][Plant] with same [Pref]", true, false, false, false), 3, ["Birdbath", "Garden Stools", "Birdhouse"]);
}
function makeObjectiveDictionary(){
    objectiveDict = [
        "(1) Have 8+ Plants in Shade areas",
        "(2) Have 8+ Plants in Sun areas",
        "(3) Have 8+ Plants in Damp areas",
        "(4) Have 8+ Plants in Dry areas",
        "(5) Attain a total Greenhouse score of 35 or more",
        "(6) Attain a total Greenhouse score of 21 or less",
        "(7) Have 6+ Plants with a negative score",
        "(8) Have 4+ Plants with a +3 or greater score",
        "(9) Have a single Mushroom Cluster score 2+ points",
        "(10) Have a Plant with no preferred zone score 0 points",
        "(11) Have 12+ Plants in (one or more of) their preferred zone(s)",
        "(12) Have a Decoration score 3+",
        "(13) Have 2+ Plants without a preferred zone in a Strength 3+ tile",
        "(14) Have a device add 2+ Strength to its preferred zone",
        "(15) Have a device remove 2+ Strength from its opposing zone",
        "(16) Have a tile placed in each corner"
    ];
    var objectiveCardHolder = document.getElementById("objectiveCardHolder");
    for(var i = 0; i < objectiveDict.length; i++){
        activeObjectives[i] = true;

        // var div = document.createElement("div");
        // div.id = "objective" + (i+1) + "Div";
        // div.title = (i+1) + ": " + objectiveDict[i];

        var toggle = document.createElement("input");
        toggle.id = "objective" + (i+1) + "Toggle";
        toggle.type = "checkbox";
        toggle.title = objectiveDict[i];
        toggle.checked = true;
        toggle.number = i;        
        toggle.addEventListener("change", e => {activeObjectives[e.target.number] = e.target.checked});

        var title = document.createElement("label");
        title.for = "objective" + (i+1) + "Toggle";
        title.innerText = i + 1;
        title.title = objectiveDict[i]; 

        // div.appendChild(title);
        // div.appendChild(toggle);
        // objectiveCardHolder.appendChild(div);

        objectiveCardHolder.appendChild(title);
        objectiveCardHolder.appendChild(toggle);
    }
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
function updateScoreIndicator(score){
    scoreIndicator.innerText = "Total (Marked) Score: " + score;
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
        updateScoreIndicator(board.getMarkedScore());
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

//game functions
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
        thisHand.style = "";
        thisHand.number = i;
        thisHand.onclick = onClickHand;
        //add it to the main, at the end
        document.getElementById("hands").append(thisHand);

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

    //set up the objective cards
    objectiveDeck = [];
    for(var i = 0; i < objectiveDict.length; i++){
        if(activeObjectives[i]){
            objectiveDeck.push(objectiveDict[i]);
        }
    }
    Shuffle(objectiveDeck);
    handCanvases.forEach(canvas => {
        canvas.title = "Objectives Are: \n"
        canvas.title += "1 - " + objectiveDeck.pop() + "\n";
        canvas.title += "2 - " + objectiveDeck.pop() + "\n";

        canvas.objectiveText = canvas.title;
    });

    //setup the "board"
    board.setTile(new Tile("Fountain", "Starting Position",true, true, true, true), 3, 3);

    //do the inital draw
    board.draw(boardCanvas);
    for(var i=0;i<hands.length;i++){
        hands[i].draw(handCanvases[i]);
    }

    //set up the variables to display to the player
    tilesPlaced = 0;
    turnPlayer = -1;
    passTurn();

    updateTurnIndicator();
    updateDeckIndicator();
    updateBoardIndicator();
    updateScoreIndicator(0);
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
    scoreIndicator = document.getElementById("scoreIndicator");
    
    //make the predefined tiles and cards
    makeTileDictionary();
    makeObjectiveDictionary();

    //setup a fresh gamestate
    setupNewGame();

    //element hooks: for the Buttons
    document.getElementById("2Game").onclick = (e => {numPlayers = 2; setupNewGame()});
    document.getElementById("3Game").onclick = (e => {numPlayers = 3; setupNewGame()});
    document.getElementById("4Game").onclick = (e => {numPlayers = 4; setupNewGame()});

    //...and the checkboxes
    document.getElementById("safeModeCheck").onchange = (e => safeMode = e.target.checked);
    document.getElementById("hideBonusCards").onchange = (e => {
        handCanvases.forEach(canvas => {
            if(e.target.checked){
                canvas.title = "";
            }else{
                canvas.title = canvas.objectiveText;
            }
        });
    });
    // safeMode = document.getElementById("safeModeCheck").checked;

    //draw everything for the first time
    board.draw(boardCanvas);
    for(var i=0;i<hands.length;i++){
        hands[i].draw(handCanvases[i]);
    }
    // hand.draw(handCanvas);
}

main();
