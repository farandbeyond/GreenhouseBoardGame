
//tile formatting variables
var cornerSize = 10;
var fontHeight = 15;
var fontRowLength = 25;

class Tile{
    // scoreNote;
    constructor(name, text, brightIcon, dampIcon, darkIcon, dryIcon){
        this.name = name;
        this.text = text;
        this.brightIcon = brightIcon;
        this.dampIcon = dampIcon;
        this.darkIcon = darkIcon;
        this.dryIcon = dryIcon;
        this.scoreNote = 0;
    }
    get tileName(){
        return this.name;
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
        ctx.font = "13px sans-serif";
        

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
        return new Tile(this.name, this.text, this.dryIcon, this.brightIcon, this.dampIcon, this.darkIcon);
    }
}

