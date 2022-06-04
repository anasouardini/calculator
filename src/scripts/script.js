const wrapper = document.querySelector(".calculator-wrapper");
const screen = document.querySelector(".screen");
const errorOutput = document.querySelector(".error");
const opRegxG = /[*+-/]/;
const opRegxLast = /[*+-/]$/;
const opRegxFirst = /^[*+-/]/;

// let o = "*aaa-";
// console.log(o.search(symbolsRegxFirstChar));


function logError(msg, clr){
    if(errorOutput.innerHTML == ""){
        errorOutput.innerHTML = msg;
    }else{
        if(msg == ""){errorOutput.innerHTML = "";return;}
        errorOutput.appendChild(document.createElement("br"));
        errorOutput.innerHTML += msg;
    }

    errorOutput.style.cssText = `color: ${clr};`;
}

function strReplace(str, pos, num, repStr){
    let screenVal = str;
    if(pos == -1){pos = screenVal.length-1}
    return screenVal.slice(0, pos) + repStr + screenVal.slice(pos+num);
}

function calc(num1, num2, operator){
    let opResult = 0;
    if(operator == "+"){opResult = num1 + num2;}
    else if(operator == "-"){opResult = num1 - num2;}
    else if(operator == "*"){opResult = num1 * num2;}
    else if(operator == "/"){opResult = num1 / num2;}
    return opResult;
}

//this took me 4 hours to figure it out
function mapParentheses(expressionCpy){
    let foundParPos = expressionCpy.search(/[()]/);
    let leftParCounter = 0;
    let rightParCounter = 0;
    let parenthesesMap = {};
    let basesList = [{base:0, prevDiff:0}];
    while(foundParPos != -1){
        //set a base for the next series of parentheses, 0 is the default
        if((leftParCounter-rightParCounter) == 0){
            if(basesList.length > 1){
                //remove the temp added righties
                rightParCounter -= basesList[basesList.length-1].prevDiff;
                basesList.pop();
            }
            else{basesList[basesList.length-1].base = leftParCounter;}
        }
        
        if(expressionCpy[foundParPos] == "("){
            if(rightParCounter-basesList[basesList.length-1].base > 0){
                //equate lefties and righties temporarily
                basesList = [...basesList, {base:leftParCounter, prevDiff:leftParCounter-rightParCounter}];
                rightParCounter += leftParCounter-rightParCounter;
            }
            
            parenthesesMap[foundParPos] = 0;
            // console.log(`${foundParPos} (`);
            leftParCounter++;

        }else{
            rightParCounter++;
            parenthesesMap[Object.keys(parenthesesMap)[basesList[basesList.length-1].base+leftParCounter-rightParCounter]] = foundParPos;
            // console.log(`${Object.keys(parenthesesMap)[basesList[basesList.length-1].base+leftParCounter-rightParCounter]} (${basesList[basesList.length-1].base+leftParCounter-rightParCounter})=> ${foundParPos} \n)`);
        }

        //clean
        expressionCpy = expressionCpy.replace(expressionCpy[foundParPos], "_");
        foundParPos = expressionCpy.search(/[()]/);
    }
    if(leftParCounter-rightParCounter != 0){logError("uneven number of parentheses", "red"); return -1;}

    return parenthesesMap;
}

function parse(){
    let expression = screen.value;
    //remove spaces
    while(expression.includes(" ")){expression.replace(" ", "")}
    
    //remove last/extra operator
    if(expression.search(opRegxLast) != -1){
        if(expression.length == 1){return;}
        expression = strReplace(expression, -1, 1, "");
        logError("last operator was remvoed!", "red");
    }

    //parse&calc
    while(1){

        let leftPar = chunk = chunkLength = 0;

        if(expression.search(/[()]/) != -1){
            //check for even parentheses number && map parentheses pairs
            console.log("expression: " + expression);
            let parenthesesMap = mapParentheses(expression);
            if(parenthesesMap == -1){return;}
            console.log(parenthesesMap);
            
            //get last parentheses (left&right)
            leftPar = parseInt(Object.keys(parenthesesMap).reverse()[0]);
            let rightPar = parseInt(parenthesesMap[leftPar]);
            chunk = expression.slice(leftPar+1, rightPar);
            chunkLength = chunk.length;//chunk length with parentheses
        }else{
            leftPar = 0;
            chunk = expression;
            chunkLength = expression.length;
        }

        if(chunk.search(/[()]/) != -1){logError("unexpected Error, check your expression", "red");return;}
        
        let operator = "+";//the first operator with an empty calcResult=0 (0+op1)
        //if first char is an operand, sign(+/-)
        if(chunk.search(opRegxFirst) != -1){chunk = "0" + chunk;}
        
        let calcResult = 0;
        let position = chunk.search(opRegxG);
        if(position == -1){logError("no operand in the expression", "red");return;}
        while(position != -1){
            calcResult = calc(calcResult, parseInt(chunk.slice(0, position)), operator);
            operator = chunk[position];//set the new operator
            //clean
            chunk = chunk.slice(position+1);
            position = chunk.search(opRegxG);
        }

        chunk = String(calc(calcResult, parseInt(chunk), operator));//calc the last operand && update result
        expression = strReplace(expression, leftPar, chunkLength+2, chunk);//-1 & +1 to replace the parentheses as well

        if(expression.search(/[()]/) == -1 && expression.search(opRegxG) == -1){break;}
    }

    screen.value = expression;
}

function validateOperator(operator){
    const screenValue = screen.value;
    let lastCharIsOp = screenValue.search(opRegxLast) != -1;

    if(screenValue == ""){
        if(operator != "+" && operator != "-"){logError("you can only start with a sign or a number", "red");return;}
        logError("", "red");
        screen.value += operator;
    }
    else if(lastCharIsOp){
        if(screenValue.length == 1){
            if(operator != "+" && operator != "-"){logError("you can only start with a sign or a number", "red");return;}
            logError("", "red");
            screen.value = strReplace(screen.value, -1, 1, operator);
        }else{
            screen.value = strReplace(screen.value, -1, 1, operator);
        }
    }
    //TODO: disallow * or / after a "("
    else{
        screen.value += operator;
    }
    
}

function handleClick(e){
    if(e.target == e.currenttarget){return -1}
    
    logError("", "red");//clear if there's any error msg
    //TODO: floating point

    if(e.target.getAttribute("data-calc") != null){parse();}
    else if(e.target.getAttribute("data-operator") != null){validateOperator(e.target.getAttribute("data-operator"));}
    else if(e.target.getAttribute("data-num") != null){screen.value += e.target.getAttribute("data-num");}
    else if(e.target.getAttribute("data-par") != null){
        if (screen.value == "" && e.target.getAttribute("right") != null){
            logError("did you mean to type a closing parenthes?", "red");return;
        }logError("", "red");

        if(e.target.getAttribute("left") != null){screen.value += "(";}
        else if(e.target.getAttribute("right") != null){screen.value += ")";}
        //TODO: disallow ")" after an operator
    }
    else if(e.target.getAttribute("data-del") != null){screen.value = strReplace(screen.value, -1, 1, "");/*-1: last char */}
    else if(e.target.getAttribute("data-clr") != null){screen.value = "";}
}

wrapper.addEventListener("click", handleClick);