// blocks가 배열되어 있는 js 파일 가져오기
import blocks from "./blocks.js";


// 변수 선언
// DOM
const playground = document.querySelector(".playground > ul");
const gameText = document.querySelector(".game-text");
const scoreDisplay = document.querySelector(".score");
const restartButton = document.querySelector(".game-text > button");
const start = document.querySelector(".game-start");
const startButton = document.querySelector(".game-start > button");

// Setting
const game_rows = 20;
const game_cols = 10;

// variables
let score = 0;
let duration = 500;
let downInterval;
let tempMovingItem;     // moving을 실행하기 전에 잠깐 담아두는 용도
const movingItem = {    // 다음 블럭의 타입과 좌표를 담고있는 변수
    type: "",           // tree, bar, zee 등등
    direction: 3,       // 화살표 위 방향키를 눌렀을 때 좌우로 돌리는 역할, 지표
    top: 0,             // Y 지표
    left: 0,            // X 지표
}; 


// functions 스크립트가 시작이될 때 실행이 되는 함수
// init();
init();
function init() {
    tempMovingItem = { ...movingItem};  // 스프레드 오퍼레이트는 오브젝의 껍데기를 벗긴 내용만 가져오는 것
    for (let i=0; i<game_rows; i++) {
        prependNewLine();
    }
    generateNewBlock();
}


// ul 안에 넣을 개체들 만들기
function prependNewLine() {
    const li = document.createElement("li");
    const ul = document.createElement("ul");
    for (let j=0; j<game_cols; j++) {
        const matrix = document.createElement("li");
        ul.prepend(matrix);
    }
    li.prepend(ul);
    playground.prepend(li);
}


// block의 모양 움직이는 과정 보여주는 함수
function renderBlocks(moveType = "") {
    const { type, direction, top, left } = tempMovingItem;
    const movingBlocks = document.querySelectorAll(".moving");
    movingBlocks.forEach(moving => {
        moving.classList.remove(type, "moving");
    })
    blocks[type][direction].some(block => {
        const x = block[0] + left;
        const y = block[1] + top;
        console.log(playground.childNodes[y])
        // 조건 ? 참일경우 : 거짓일 경우
        const target = playground.childNodes[y] ? playground.childNodes[y].childNodes[0].childNodes[x] : null;
        const isAvailable = checkEmpty(target);
        if (isAvailable) {
            target.classList.add(type, "moving"); 
        } else {
            tempMovingItem = { ...movingItem};
            if (moveType === 'retry') {
                clearInterval(downInterval);
                showGameoverText();
            }
            setTimeout(() => {
                renderBlocks('retry');
                if (moveType === "top") {
                    seizeBlock();
                }
            }, 0)
            return true;
        }
    })
    movingItem.left = left;
    movingItem.top = top;
    movingItem.direction = direction;
}


// 끝에서 내려갈 곳이 없으면 고정을 시키고 moving이라는 class를 다 뗀 후 새로운 블럭 생성하는 함수
function seizeBlock() {
    const movingBlocks = document.querySelectorAll(".moving");
    movingBlocks.forEach(moving => {
        moving.classList.remove("moving");
        moving.classList.add("seized");
    })
    checkMatch();
}
function checkMatch() {
    const childNodes = playground.childNodes;
    childNodes.forEach(child => {
        let matched = true;
        child.children[0].childNodes.forEach(li => {
            if (!li.classList.contains("seized")) {
                matched = false;
            }
        })
        if (matched) {
            child.remove();
            prependNewLine();
            score++;
            scoreDisplay.innerHTML = score;
        }
    })
    generateNewBlock();
}


// 상단에 새로운 블럭 생성 함수
function generateNewBlock() {
    clearInterval(downInterval);
    downInterval = setInterval(() => {
        moveBlock('top',1);
    }, duration);

    // console.log(Object.entries(blocks).length)
    const blockArray = Object.entries(blocks);
    const randomIndex = Math.floor(Math.random() * blockArray.length);
    
    movingItem.type = blockArray[randomIndex][0];
    movingItem.top = 0;
    movingItem.left = 3;
    movingItem.direction = 0;
    tempMovingItem = { ...movingItem};
    renderBlocks();
}


// 바깥으로 벗어나지 않도록 빈 여백을 체크하거나 블럭이 떨어졌을 때 밑에 블럭이 있는지 없는지 체크하는 함수
function checkEmpty(target) {
    if(!target || target.classList.contains("seized")) {
        return false;
    }
    return true;
}


// 값만큼 움직이게 하는 함수
function moveBlock(moveType, amount) {
    tempMovingItem[moveType] += amount;
    renderBlocks(moveType);
}


// 움직이는 방향 변환 함수
function changeDirection() {
    const direction = tempMovingItem.direction;
    direction === 3 ? tempMovingItem.direction = 0 : tempMovingItem.direction += 1;
    // tempMovingItem.direction += 1;
    // if (tempMovingItem.direction === 4) {
    //     tempMovingItem.direction = 0;
    // } 
    renderBlocks();
}


// 스페이스바를 눌렀을 때 빠르게 떨어지는 블럭을 보여주는 함수
function dropBlock() {
    clearInterval(downInterval);
    downInterval = setInterval(() => {
        moveBlock('top', 1);
    }, 10);
}


// 게임이 종료됐을 때 게임종료 보여주는 함수
function showGameoverText() {
    gameText.style.display = "flex";
}


// event handling 방향키에 따라 움직이는함수
document.addEventListener("keydown", e => {
    switch(e.keyCode) {
        case 39:
            moveBlock("left", 1);
            break;
        case 37:
            moveBlock("left", -1);
            break;
        case 40:
            moveBlock("top", 1);
            break;
        case 38:
            changeDirection();
            break;
        case 32:
            dropBlock();
            break;
        default:
            break;
    }
    //console.log(e);
})
// 첫 start button event handling
startButton.addEventListener("click", () => {
    playground.innerHTML = "";
    start.style.display = "none";
    init();
})

// 게임종료 화면에 button을 눌렀을 때 event handling
restartButton.addEventListener("click", () => {
    playground.innerHTML = "";
    gameText.style.display = "none";
    init();
})