//TODO: show a list of features

let history = {list:[],current : 0};
const wrapper = document.querySelector(".calculator-wrapper");
const screen = document.querySelector(".screen");
const errorOutput = document.querySelector(".error");
const opRegxG = /[-+*/]/;
const opRegxLast = /[-+*/]$/;
const opRegxFirst = /^[-+*/]/;


function logError(msg, clr){
    if(errorOutput.innerHTML == ""){
        if(msg == ""){errorOutput.innerHTML = "";return;}
        errorOutput.innerHTML = "> " + msg;
    }else{
        if(msg == ""){errorOutput.innerHTML = "";return;}
        errorOutput.appendChild(document.createElement("br"));
        errorOutput.innerHTML += "> " + msg;
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
    else if(operator == "/"){
        if(num2 == 0){
            if(num2 == num1){logError(`result is undefined!`, "red");return null;}
            logError(`cannot devide by zero!`, "red");return null;
        }
        opResult = num1 / num2;
    }
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
    
    //history
    history.list.push(expression);
    history.current = history.list.length;

    //check for ousider symbole
    let outsiderPosition = expression.search(/[^0-9-*+/().]/);
    if(outsiderPosition != -1){
        logError(`outsider symbol (${expression[outsiderPosition]}), reformat your expression`, "red");return;
    }
    
    //remove spaces
    while(expression.includes(" ")){expression.replace(" ", "")}
    
    //remove last/extra operator
    if(expression.search(opRegxLast) != -1){
        if(expression.length == 1){return;}
        logError(`last operator (${expression[expression.length-1]}) was ignored!`, "red");
        expression = strReplace(expression, -1, 1, "");
    }

    //parse&calc
    while(1){

        let leftPar = chunk = chunkLength = 0;

        if(expression.search(/[()]/) != -1){
            ////// extract the expression out of parentheses

            //check for even parentheses number && map parentheses pairs
            console.log("expression: " + expression);
            let parenthesesMap = mapParentheses(expression);
            if(parenthesesMap == -1){return;}
            console.log(parenthesesMap);
            
            //get last parentheses (left&right)
            leftPar = parseFloat(Object.keys(parenthesesMap).reverse()[0]);
            let rightPar = parseFloat(parenthesesMap[leftPar]);
            chunk = expression.slice(leftPar+1, rightPar);
            chunkLength = chunk.length;//chunk length with parentheses
        }else{
            leftPar = 0;
            chunk = expression;
            chunkLength = expression.length;
        }

        if(chunk.search(/[()]/) != -1){logError("unexpected Error, check your expression", "red");return;}
        
        //remove last/extra operator
        if(chunk.search(opRegxLast) != -1){
            if(chunk.length == 1){return;}
            logError(`last operator (${chunk[chunk.length-1]}) was ignored!`, "red");
            chunk = strReplace(chunk, -1, 1, "");
        }

        //parse extra opererator
        let operator = "+";
        if(chunk.search(opRegxFirst) != -1){
            if(chunk[0] == "*" || chunk[0] == "/"){
                logError(`extra (${chunk[0]}) was ignored`, "red");
                chunk = strReplace(chunk, 0, 1, "");
            }
            else{chunk = "0" + chunk;}
        }
        
        //calc loop
        let calcResult = 0;
        let position = chunk.search(opRegxG);
        if(position == -1){
            if(chunkLength==0){logError("no operator or oprand in the expression", "red");return;}
        }

        while(position != -1){
            calcResult = calc(calcResult, parseFloat(chunk.slice(0, position)), operator);
            if(calcResult == null){return;}
            operator = chunk[position];//set the new operator
            //clean
            chunk = chunk.slice(position+1);
            position = chunk.search(opRegxG);
        }

        //calc the last operand && update result
        calcResult = calc(calcResult, parseFloat(chunk), operator);
        if(calcResult == null){return;}
        chunk = String(calcResult);
        expression = strReplace(expression, leftPar, chunkLength+2, chunk);//+2 to replace the parentheses if they exist, else it has no effect

        //so unprofessional, I have to learn RegEx
        if(expression.search(/[()]/) == -1 && (expression.search(opRegxG) == -1 || (expression.search(opRegxFirst) != -1 && expression.slice(1).search(opRegxG) == -1)))
        {break;}
    }
    
    let fpPos = expression.search(/[.]/);
    if(fpPos != -1 && expression.length-fpPos-1 > 4){expression = expression.slice(0, fpPos+5);logError("the result was rounded because the floating point exceeded 4 digits");}
    screen.value = expression;
}

function validateOperator(operator){
    const screenValue = screen.value;
    let lastCharIsOp = screenValue.search(opRegxLast) != -1;
    if(lastCharIsOp){screen.value = strReplace(screen.value, -1, 1, operator);return;}
    screen.value += operator;
}

function validateParenthese(evetTarget){
    if (screen.value == "" && evetTarget.getAttribute("right") != null){
        logError("did you mean to type a closing parenthes?", "red");return;
    }

    if(evetTarget.getAttribute("left") != null){screen.value += "(";}
    else if(evetTarget.getAttribute("right") != null){screen.value += ")";}
}

function validateFloatingPoint(){
    let reversedStr = screen.value.split("").reverse().join("");
        
    let position = reversedStr.search(opRegxG);
    if(position != -1){reversedStr = reversedStr.slice(0, position);}

    if(reversedStr.search(/[.]/) != -1){
        logError("only single floatig point values are allowed!", "red");return;
    }

    screen.value += ".";
}

function handleClick(e){
    if(e.target == e.currenttarget){return -1}
    
    logError("");//clear if there's any old error msg

         if(e.target.getAttribute("data-calc"     ) != null){parse();}
    else if(e.target.getAttribute("data-operator" ) != null){validateOperator(e.target.getAttribute("data-operator"));}
    else if(e.target.getAttribute("data-num"      ) != null){screen.value += e.target.getAttribute("data-num");}
    else if(e.target.getAttribute("data-fp"       ) != null){validateFloatingPoint();}
    else if(e.target.getAttribute("data-par"      ) != null){validateParenthese(e.target);}
    else if(e.target.getAttribute("data-del"      ) != null){screen.value = screen.value.slice(0, screen.value.length-1);}
    else if(e.target.getAttribute("data-clr"      ) != null){screen.value = "";}
    else if(e.target.getAttribute("data-prev"     ) != null){
        (history.current>0) ? screen.value = history.list[--history.current] : screen.value = history.list[history.current]
    }
    else if(e.target.getAttribute("data-next"     ) != null){
        (history.current<history.list.length-1) ? screen.value = history.list[++history.current] : screen.value = history.list[history.current]
    }
}

wrapper.addEventListener("click", handleClick);
