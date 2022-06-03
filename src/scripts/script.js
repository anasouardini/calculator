const wrapper = document.querySelector(".calculator-wrapper");
const screen = document.querySelector(".screen");
const symbolsRegx = /[*+-/]/;
const symbolsRegxLastChar = /[*+-/]$/;
const symbolsRegxFirstChar = /^[*+-/]/;

// let o = "*aaa-";
// console.log(o.search(symbolsRegxFirstChar));

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

function parse(){
    let expression = screen.value;
    let calcResult = 0;
    operator = "+";//the first operator with an empty calcResult=0 (0+op1)
    
    //remove last/extra operator
    if(expression.search(symbolsRegxLastChar) != -1){
        if(expression.length == 1){return;}
        expression = strReplace(expression, -1, 1, "");
    }

    if(expression.search(symbolsRegxFirstChar) != -1){expression = "0" + expression;}

    //parse&calc
    let position = 0;
    position = expression.search(symbolsRegx);
    if(position == -1){return;}
    while(position != -1){
        calcResult = calc(calcResult, parseInt(expression.slice(0, position)), operator);
        operator = expression[position];//set the new operator
        //clean
        expression = expression.slice(position+1);
        position = expression.search(symbolsRegx);
    }
    screen.value = calc(calcResult, parseInt(expression), operator);//calc the last operand && update result
}

function validateOperator(operator){
    const screenValue = screen.value;
    let lastCharIsOp = screenValue.search(symbolsRegxLastChar) != -1;

    if(screenValue == ""){
        if(operator != "+" && operator != "-"){return;}
        screen.value += operator;
    }
    else if(lastCharIsOp){
        if(screenValue.length == 1){
            if(operator != "+" && operator != "-"){return;}
            screen.value = strReplace(screen.value, -1, 1, operator);
        }else{
            screen.value = strReplace(screen.value, -1, 1, operator);
        }
    }
    else{
        screen.value += operator;
    }
    
}

function handleClick(e){
    if(e.target == e.currenttarget){return -1}

    if(e.target.getAttribute("data-calc") != null){parse();}
    else if(e.target.getAttribute("data-operator") != null){validateOperator(e.target.getAttribute("data-operator"));}
    else if(e.target.getAttribute("data-num") != null){screen.value += e.target.getAttribute("data-num");}
    else if(e.target.getAttribute("data-del") != null){screen.value = strReplace(screen.value, -1, 1, "");/*-1: last char */}
    else if(e.target.getAttribute("data-clr") != null){screen.value = "";}
}

wrapper.addEventListener("click", handleClick);