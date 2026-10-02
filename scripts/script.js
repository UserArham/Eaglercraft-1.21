// creating variables for continue use

const axe = document.querySelector('.axe');
const picaxe = document.querySelector('.picaxe');
const shovel = document.querySelector('.shovel');

const game = document.querySelector('.game-grid');

const grassInventory = document.querySelector('.inventory .grass');
const rockInventory = document.querySelector('.inventory .rock');
const soilInventory = document.querySelector('.inventory .soil');
const leavesInventory = document.querySelector('.inventory .leaves');
const woodInventory = document.querySelector('.inventory .wood');

const timer = document.querySelector('.timer');

const resetButton = document.querySelector('.tool-box--right-side button');
const entrenceScreen = document.querySelector('.entrence-screen');
const modifyScreen = document.querySelector('.modify-window');
const instructionScreen = document.querySelector('.instruction-window');
const [instructionsButton, modifyWorldButton, startModifyGameButton, startGameButton] = document.querySelectorAll('.entrence-screen button');
const modifyWorldInputs = document.querySelectorAll('input');
const openMainScreen = document.querySelectorAll('.tool-box--right-side .btn')[1];

const inventory = {};
const objOfBoxes = {};

let material;
let currentTool;
let currentMaterial;

// refrence to which tool and what he can harvest 
const materialObj = {
    'axe': ['leaves', 'wood'],
    'picaxe': ['rock'],
    'shovel': ['soil', 'grass']
}

// functions
// create 2d grid for the game
function landScapeMaker(material, rowStart = 1, rowEnd = 20, columnStart = 1, columnEnd = 25) {
    for (let row = rowStart; row <= rowEnd; row++) {
        for (let column = columnStart; column <= columnEnd; column++) {
            objOfBoxes[`${row}.${column}`].classList.add(material);
        }
    }
}

// basic world builder with set positions
function landMaker(length = 25) { // grid length
    landScapeMaker('grass', 14, 14, 1, length)
    landScapeMaker('soil', 15, 20, 1, length);
    landScapeMaker('cloud', 5, 5, 9, 13);
    landScapeMaker('cloud', 4, 4, 10, 13);
    landScapeMaker('cloud', 3, 3, 10, 11);
}

// x for future random location generator
function treeMaker(x = 20) {
    landScapeMaker('wood', 10, 13, x, x);
    landScapeMaker('leaves', 7, 9, x - 1, x + 1);
}

function rockMaker(x = 2, double = false) {
    double
        ?
        landScapeMaker('rock', 12, 13, x, x) :
        landScapeMaker('rock', 13, 13, x, x);
}

function bushMaker(x = 5) {
    landScapeMaker('leaves', 13, 13, x, x + 2);
    landScapeMaker('leaves', 12, 12, x + 1, x + 1);
}

// permanent set
function basicWorldMaker() {
    landMaker();
    treeMaker();
    rockMaker(13, true);
    rockMaker();
    bushMaker();
}

//cleaner for reset option - removes second class for each box because thats the background material
function worldCleaner(columnEnd = 25) {
    for (let row = 1; row <= 13; row++) {
        for (let column = 1; column <= columnEnd; column++) {
            objOfBoxes[`${row}.${column}`].classList[1] && // confirming there is a class to clean ([0] is .box)
                objOfBoxes[`${row}.${column}`].classList.remove(`${objOfBoxes[`${row}.${column}`].classList[1]}`);
        }
    }
    landMaker();
}

function markAsWorng(event) { // marks box as wrong with red border for 50ms
    event.target.style.border = '1px solid red';
    setTimeout(() => {
        event.target.style.border = 'none';
    }, 50);
}

//collect material functions (game function of harvesting with a tool)
function collectMaterial(event) {
    material = event.target.classList[1];
    // limit mainly the shovel to collect only from material with space near it or any access.
        let [row, column] = [event.target.style.gridRow.slice(0, -6) - 1, parseInt(event.target.style.gridColumn.slice(0, -7))]; // location of one box above
        if (objOfBoxes[`${row}.${column}`].classList.length == 1 
        || objOfBoxes[`${row + 1}.${column + 1}`].classList.length == 1 
        || objOfBoxes[`${row + 1}.${column - 1}`].classList.length == 1 
        || objOfBoxes[`${row + 2}.${column}`].classList.length == 1 ) { // check if there is material in the one box above // prevent coolecting soil from under ground
            if (materialObj[tool].includes(material)) {
                inventory[material] ? inventory[material] += 1 : inventory[material] = 1; //// updated inventory obj amounts
                event.target.classList.remove(material);
                updateInventory() // updated the written amount
            } else markAsWorng(event);
        } else markAsWorng(event);
}

// inventory update the html element to show amount
function updateInventory() {
    for (let [material, amount] of Object.entries(inventory)) {
        switch (material) {
            case 'grass':
                grassInventory.innerHTML = `<h4>${amount}</h4>`;
                break;
            case 'rock':
                rockInventory.innerHTML = `<h4>${amount}</h4>`;
                break;
            case 'soil':
                soilInventory.innerHTML = `<h4>${amount}</h4>`;
                break;
            case 'leaves':
                leavesInventory.innerHTML = `<h4>${amount}</h4>`;
                break;
            case 'wood':
                woodInventory.innerHTML = `<h4>${amount}</h4>`;
                break;
        }
    }
}

// functions to put material on game grid (the player bulding)
function putMaterial(event) {
    if (inventory[material]) {
        if (event.target.classList.length == 1) { // check there isnt a material class (not taken)
            event.target.classList.add(material)
            inventory[material] -= 1;
            updateInventory();
        }
    }
}

//short cut to remove listeners
function removeOtherEventListeners() {
    game.removeEventListener('click', collectMaterial)
    game.removeEventListener('click', putMaterial)
}

// background resetter. (to delete illusions of pickes (or clicked) on other elements)
function backgroundReset() {
    axe.classList.contains('red') && axe.classList.remove('red');
    axe.classList.contains('blue') && axe.classList.remove('blue');
    picaxe.classList.contains('red') && picaxe.classList.remove('red');
    picaxe.classList.contains('blue') && picaxe.classList.remove('blue');
    shovel.classList.contains('red') && shovel.classList.remove('red');
    shovel.classList.contains('blue') && shovel.classList.remove('blue');
    grassInventory.style.opacity = 0.75;
    woodInventory.style.opacity = 0.75;
    soilInventory.style.opacity = 0.75;
    leavesInventory.style.opacity = 0.75;
    rockInventory.style.opacity = 0.75;
}

// change visibility of html elements
function toggleElementsHidder(el, hide = true) {
    hide
        ?
        el.style.visibility = 'hidden' :
        el.style.visibility = 'visible'
}

// randomize world maker. works with the modify option of the game and pull from input the amount of elements.
let notExistedLocaions; // array of x grid locations

function randomWorldMaker(trees = 1, rocks = 1, bushes = 1) {
    trees <= 1 || rocks <= 1 || bushes <= 1 ? // if only one element for each than smaller world. smaller array.
        notExistedLocaions = [...Array(24).keys()] :
        notExistedLocaions = [...Array(49).keys()]; // creating list of location on x grid (columns) 
    notExistedLocaions.shift(); // deletes 0
    notExistedLocaions.shift(); // deletes 1 // to prevent element sitting to close to the starts

    //adjust grid to containe bigger world
    game.style.gridTemplateColumns = 'repeat(50, 1fr)'
    game.style.width = '1650px';
    game.style.margin = 0;

    worldCleaner(); //clears defaults
    boxGameCreator(1, 20, 25, 50) //creating more boxes and putting them on the grid.
    landScapeMaker('grass', 14, 14, 1, 50) // creating land for the world
    landScapeMaker('soil', 15, 20, 1, 50);

    for (let i = 1; i <= trees; i++) { // creating elements for the world (for amount of user choice)
        let location = Math.floor(Math.random() * notExistedLocaions.length); // generate random index of not existed locations
        if (notExistedLocaions[location]) { // checks if location is valid
            treeMaker(notExistedLocaions[location]); // creates element
            notExistedLocaions[location] = false; // makes element false (not habitable)
        } else {
            i--; // make loop iterate again
        }
    }
    for (let i = 1; i <= rocks; i++) {
        let location = Math.floor(Math.random() * notExistedLocaions.length);
        if (notExistedLocaions[location]) {
            rockMaker(notExistedLocaions[location]);
            notExistedLocaions[location] = false;
        } else {
            i--;
        }
    }
    for (let i = 1; i <= bushes; i++) {
        let location = Math.floor(Math.random() * notExistedLocaions.length);
        if (notExistedLocaions[location] && notExistedLocaions[location + 1] && notExistedLocaions[location + 2]) {
            bushMaker(notExistedLocaions[location]);
            notExistedLocaions[location + 2] = false;
            notExistedLocaions[location + 1] = false;
            notExistedLocaions[location] = false;
        } else {
            i--;
        }
    }
}

// creating divs. giving them a specific location(row and column), and creating obj of boxes. for future play and positions options.
let indexOfBox = 0;

function boxGameCreator(rowStart = 1, rowEnd = 20, columnStart = 1, columnEnd = 25) { //starts counting from one for easier number reading (20 and 25 instead of 19 24)
    for (let row = rowStart; row <= rowEnd; row++) {
        for (let column = columnStart; column <= columnEnd; column++) {
            let box = document.createElement('div');
            box.classList.add('box');
            game.appendChild(box);
            box.style.gridRow = row;
            box.style.gridColumn = column;
            objOfBoxes[`${row}.${column}`] = box;
            indexOfBox++;
        }
    }
}

function inventoryReset() {
    for (let material of Object.keys(inventory)) { // calibrate inventory
        inventory[material] = 0;
    }
    updateInventory();
}

// sets timer. each minute (60s) the player gets one added material of each type.
let timerCounter = 0;

function timerMaterialReload() {
    if (timerCounter == 60) {
        for (let material of ['grass', 'soil', 'rock', 'leaves', 'wood']) {
            inventory[material] ? inventory[material] += 1 : inventory[material] = 1; // adding to inventory
            updateInventory(); // updated nunmber showen to player
        }
        timerCounter = 1; // resets timer
        timer.innerHTML = `<h4><i class="far fa-grin-tongue-wink"></i></h4>`; //  smiley face to represent stocking
    } else {
        timer.innerHTML = `<h4>${timerCounter}</h4>`
    }
    timerCounter++
}


// GAME PLAY -!!-

// making the base world
boxGameCreator(); // creating divs
basicWorldMaker(); // creating basic world with one instance of each element

setInterval(timerMaterialReload, 1000) // starts timer for adding to inventory each minute

// event listners for tool choise -> collects only the matching material
axe.addEventListener('click', (e) => {
    tool = 'axe'; // updates the currrent tool
    removeOtherEventListeners(); //clears other event listners
    backgroundReset(); // clears clicked effect from other items
    e.currentTarget.classList.add('blue') // make clicked effect on current item 
    game.addEventListener('click', collectMaterial); //activate material collection
})

picaxe.addEventListener('click', (e) => {
    tool = 'picaxe'
    removeOtherEventListeners()
    backgroundReset();
    e.currentTarget.classList.add('blue');
    game.addEventListener('click', collectMaterial);
})

shovel.addEventListener('click', (e) => {
    tool = 'shovel';
    removeOtherEventListeners()
    backgroundReset();
    e.currentTarget.classList.add('blue')
    game.addEventListener('click', collectMaterial)
})


// event listners for putting material
grassInventory.addEventListener('click', (event) => {
    removeOtherEventListeners() // clears other event listners
    material = 'grass'; // updates the currrent material used
    backgroundReset(); //clears clicked effect on others
    grassInventory.style.opacity = 1; // identicate the item as clicked
    game.addEventListener('click', putMaterial); // activate material collection
})

woodInventory.addEventListener('click', (event) => {
    removeOtherEventListeners()
    material = 'wood';
    backgroundReset();
    woodInventory.style.opacity = 1;
    game.addEventListener('click', putMaterial);
})

rockInventory.addEventListener('click', (event) => {
    removeOtherEventListeners()
    material = 'rock';
    backgroundReset();
    rockInventory.style.opacity = 1;
    game.addEventListener('click', putMaterial);
})

soilInventory.addEventListener('click', (event) => {
    removeOtherEventListeners()
    material = 'soil';
    backgroundReset();
    soilInventory.style.opacity = 1;
    game.addEventListener('click', putMaterial);
})

leavesInventory.addEventListener('click', (event) => {
    removeOtherEventListeners()
    material = 'leaves';
    backgroundReset();
    leavesInventory.style.opacity = 1;
    game.addEventListener('click', putMaterial);
})


// BUTTONS - 
// reset button event listener
resetButton.addEventListener('click', () => {
    inventoryReset() // calibrate inventory
    updateInventory(); // update amount showen to player.
    worldCleaner();
    basicWorldMaker();
    timerCounter = 0; // resets timer of new resources
})

// go back to entrence screen -- to menu
openMainScreen.addEventListener('click', () => {
    startGameButton.innerHTML = 'return to game'
    toggleElementsHidder(entrenceScreen, false);
})

// entrence screen
let firstStart = 0; // to identify first start
startGameButton.addEventListener('click', () => {
    if (!firstStart) { // action for starting game (and not return to game)
        timerCounter = 0; // resets timer of new resources
        inventoryReset() // prevents collectin material when on entrence screen (resets only if first start)
        firstStart = 1;
    }

    entrenceScreen.style.opacity = 0;
    entrenceScreen.style.transition = 'all 1.5s'; // animation of fade out

    toggleElementsHidder(entrenceScreen);
    setTimeout(() => {
        entrenceScreen.style.opacity = 1;
    }, 2000) // set back opacity to reopen window

    toggleElementsHidder(modifyScreen);
    toggleElementsHidder(instructionScreen);

})

instructionsButton.addEventListener('click', () => {
    toggleElementsHidder(instructionScreen, false);
})

modifyWorldButton.addEventListener('click', () => {
    toggleElementsHidder(modifyScreen, false);
})
instructionsButton.addEventListener('mouseover', () => {
    toggleElementsHidder(instructionScreen, false);
})

modifyWorldButton.addEventListener('mouseover', () => {
    toggleElementsHidder(modifyScreen, false);
})

//leaves window open until mouse out
modifyScreen.addEventListener('mouseover', () => {
    toggleElementsHidder(modifyScreen, false);
})
instructionScreen.addEventListener('mouseover', () => {
    toggleElementsHidder(instructionScreen, false);
})
instructionScreen.addEventListener('click', () => { // adds option for closing screen (makes it more comftarble for phone users)
    toggleElementsHidder(instructionScreen, false);
})
modifyScreen.addEventListener('mouseout', () => {
    toggleElementsHidder(modifyScreen);
})
instructionScreen.addEventListener('mouseout', () => {
    toggleElementsHidder(instructionScreen);
})

startModifyGameButton.addEventListener('click', () => {
    firstStart = 1;
    toggleElementsHidder(entrenceScreen);
    toggleElementsHidder(modifyScreen);
    toggleElementsHidder(instructionScreen);
    inventoryReset();
    timerCounter = 0;

    entrenceScreen.style.opacity = 0;
    entrenceScreen.style.transition = 'all 1.5s'; // animation of fade out

    toggleElementsHidder(entrenceScreen);
    setTimeout(() => {
        entrenceScreen.style.opacity = 1;
    }, 2000) // set back opacity to reopen window

    randomWorldMaker(modifyWorldInputs[0].value, modifyWorldInputs[1].value, modifyWorldInputs[2].value)
})
