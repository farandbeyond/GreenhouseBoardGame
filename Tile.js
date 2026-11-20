
//tile formatting variables
var cornerSize = 10;
var fontHeight = 15;
var fontRowLength = 25;

const scoreImages = {}

var s1 = new Image();
s1.src = `./assets/tile/ScoreMarkers/TT_1.png`;
scoreImages["1"] = s1;
var s2 = new Image();
s2.src = `./assets/tile/ScoreMarkers/TT_2.png`;
scoreImages["2"] = s2;
var s3 = new Image();
s3.src = `./assets/tile/ScoreMarkers/TT_3.png`;
scoreImages["3"] = s3;
var s_1 = new Image();
s_1.src = `./assets/tile/ScoreMarkers/TT_-1.png`;
scoreImages["-1"] = s_1
var s_2 = new Image();
s_2.src = `./assets/tile/ScoreMarkers/TT_-2.png`;
scoreImages["-2"] = s_2
var s_3 = new Image();
s_3.src = `./assets/tile/ScoreMarkers/TT_-3.png`;
scoreImages["-3"] = s_3

class Tile{
    // scoreNote;
    


    constructor(name, text, brightIcon, dampIcon, darkIcon, dryIcon, imgPath){
        this.name = name;
        this.text = text;
        this.brightIcon = brightIcon;
        this.dampIcon = dampIcon;
        this.darkIcon = darkIcon;
        this.dryIcon = dryIcon;
        this.scoreNote = 0;
        this.img = new Image();

        this.updateImgPath(imgPath);
        this.img.src = this.fullImgPath;
    }
    get tileName(){
        return this.name;
    }

    updateImgPath(imgPath){
        this.imgPath = imgPath;
        this.fullImgPath = imgPath;
        if(this.brightIcon) this.fullImgPath += "Sun";
        if(this.darkIcon) this.fullImgPath += "Shade";
        if(this.dampIcon) this.fullImgPath += "Damp";
        if(this.dryIcon) this.fullImgPath += "Dry";
        if(!this.brightIcon && !this.dampIcon && !this.darkIcon && !this.dryIcon) this.fullImgPath += this.name;
        this.fullImgPath += ".png";
        this.img.src = this.fullImgPath;
    }

    draw(canvas, tileX, tileY){
        if(legacyTiles){
            this.drawLegacy(canvas, tileX, tileY);
        }else{
            //get the graphics to draw with
            var ctx = canvas.getContext("2d");

            ctx.strokeStyle = "black";
            ctx.fillStyle = this.myBackgroundColor;

            //switch from Grid measurements to Canvas measurements
            var positionX = tileX * squareSize;
            var positionY = tileY * squareSize;

            //draw shayla's image, scaled to the tile size
            ctx.drawImage(this.img, positionX, positionY, squareSize, squareSize);

            //draw the score overlay
            // ctx.font = "13px sans-serif";
            // ctx.strokeStyle = this.scoreNote > 0 ? "green" : "red";
            // ctx.strokeText(`---|${Math.abs(this.scoreNote)}|---`, positionX, positionY + 2 * fontHeight, squareSize);
            if(this.scoreNote != 0 && this.scoreNote <= 3 && this.scoreNote >= -3){
                var key = this.scoreNote + "";
                ctx.drawImage(scoreImages[key], positionX + squareSize / 3, positionY, 48, 48);
            }
        }
        
    }
    drawLegacy(canvas, tileX, tileY){
        //get the graphics to draw with
        var ctx = canvas.getContext("2d");

        ctx.strokeStyle = "black";
        ctx.fillStyle = this.myBackgroundColor;

        //switch from Grid measurements to Canvas measurements
        var positionX = tileX * squareSize;
        var positionY = tileY * squareSize;

        //draw in the border of the tile
        ctx.fillRect(positionX, positionY, squareSize, squareSize);
        ctx.strokeRect(positionX, positionY, squareSize, squareSize);
        ctx.font = "13px sans-serif";
        

        //fill in the corners: Sun, Damp, Shade and Dry in the corners
        if(this.brightIcon){
            ctx.fillStyle = "yellow";
            ctx.fillRect(positionX+2, positionY+2, cornerSize, cornerSize);
        }
        if(this.dryIcon){
            
            ctx.fillStyle = "orange";
            ctx.fillRect(positionX + squareSize - cornerSize-2, positionY+2, cornerSize, cornerSize);
        }
        if(this.darkIcon){
            ctx.fillStyle = "purple";
            ctx.fillRect(positionX + squareSize - cornerSize-2, positionY + squareSize - cornerSize-2, cornerSize, cornerSize);
        }
        if(this.dampIcon){
            
            ctx.fillStyle = "blue";
            ctx.fillRect(positionX+2, positionY + squareSize - cornerSize-2, cornerSize, cornerSize);
        }
        
        //fill in the text defining the card
        //starting with the cards name
        ctx.textAlign = "center";
        ctx.strokeText(this.name, positionX + squareSize/2, positionY + fontHeight, squareSize-4);

        //add a border between Name and Effect Text
        //this is also where the Score Note will rest
        ctx.strokeText("---| " + this.scoreNote + " |---", positionX + squareSize/2, positionY + 2 * fontHeight, squareSize);

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
        return new Tile(this.name, this.text, this.dryIcon, this.brightIcon, this.dampIcon, this.darkIcon, this.imgPath);
    }
    get myBackgroundColor(){
        var totalColors = this.brightIcon + this.dampIcon + this.darkIcon + this.dryIcon;
        if(totalColors == 1){
            if(this.brightIcon) return "rgb(200, 153, 0)";
            if(this.dampIcon)   return "rgb(0, 106, 255)";;
            if(this.darkIcon)   return "rgb(172, 48, 133)";
            if(this.dryIcon)    return "rgb(160, 56, 0)";
        }else if(totalColors == 2){
            if(this.brightIcon && this.dampIcon)    return "rgb(  0 255 122)";
            if(this.brightIcon && this.dryIcon)     return "rgb(200 122  20)";
            if(this.darkIcon && this.dampIcon)      return "rgb( 61  10 200)";
            if(this.darkIcon && this.dryIcon)       return "rgb(200  10  61)";
        }else{
            return "gray";
        }
    }
}

class BlankTile{
    constructor(){
        this.name = "";
        this.text = "";
        this.brightIcon = false;
        this.dampIcon = false;
        this.darkIcon = false;
        this.dryIcon = false;
        this.scoreNote = 0;
        this.imgPath = "";
    }
    draw(canvas, tileX, tileY){
        var ctx = canvas.getContext("2d");
        ctx.strokeStyle = "black";

        //switch from Grid measurements to Canvas measurements
        var positionX = tileX * squareSize;
        var positionY = tileY * squareSize;

        //draw in the border of the tile
        ctx.strokeRect(positionX, positionY, squareSize, squareSize);
        return;
    }
}