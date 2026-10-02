const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const blockSize = 40;
const rows = canvas.height / blockSize;
const cols = canvas.width / blockSize;

// Game state
let grid = Array.from({ length: rows }, () => Array(cols).fill(null));
let currentBlockType = 'grass';
let player = {
    x: 5,
    y: 5,
    health: 100,
    hunger: 100,
    experience: 0,
    inventory: {},
    maxInventory: 20,
    tools: {
        pickaxe: { durability: 100, type: 'mining' },
        axe: { durability: 100, type: 'woodcutting' }
    }
};

let inventory = { grass: 0, dirt: 0, stone: 0, wood: 0, water: 0, sand: 0, food: 0, craftingTable: 0, chest: 0 };
let mobs = [];

// Block images
const blockImages = {
    grass: 'https://i.imgur.com/2QlhwGo.png',
    dirt: 'https://i.imgur.com/VAnlYmM.png',
    stone: 'https://i.imgur.com/6R9L9ML.png',
    wood: 'https://i.imgur.com/0D6zPiE.png',
    water: 'https://i.imgur.com/NiMHnHp.png',
    sand: 'https://i.imgur.com/PZhl9g1.png',
    food: 'https://i.imgur.com/f1b7Wjo.png',
    craftingTable: 'https://i.imgur.com/1w4IfvG.png',
    chest: 'https://i.imgur.com/10Ko0AQ.png' // Example chest image
};

// Load block images
const images = {};
for (const [key, value] of Object.entries(blockImages)) {
    const img = new Image();
    img.src = value;
    images[key] = img;
}

// Create mobs
function spawnMob() {
    const x = Math.floor(Math.random() * cols);
    const y = Math.floor(Math.random() * rows);
    mobs.push({ x, y, type: 'cow' });
}

// Draw grid, player, and mobs
function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const block = grid[row][col];
            if (block) {
                ctx.drawImage(images[block], col * blockSize, row * blockSize, blockSize, blockSize);
            } else {
                ctx.fillStyle = '#A9A9A9'; // Default color for empty blocks
                ctx.fillRect(col * blockSize, row * blockSize, blockSize, blockSize);
            }
            ctx.strokeRect(col * blockSize, row * blockSize, blockSize, blockSize);
        }
    }
    drawPlayer();
    drawMobs();
}

// Draw the player
function drawPlayer() {
    ctx.fillStyle = 'blue'; // Player color
    ctx.fillRect(player.x * blockSize, player.y * blockSize, blockSize, blockSize);
}

// Draw mobs
function drawMobs() {
    mobs.forEach(mob => {
        ctx.fillStyle = 'green'; // Placeholder color for mobs
        ctx.fillRect(mob.x * blockSize, mob.y * blockSize, blockSize, blockSize);
    });
}

// Handle click events for placing/removing blocks
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const col = Math.floor(x / blockSize);
    const row = Math.floor(y / blockSize);

    if (event.shiftKey) {
        // Remove block
        const removedBlock = grid[row][col];
        if (removedBlock) {
            grid[row][col] = null;
            // Increment inventory if a block is removed
            if (removedBlock in inventory) {
                inventory[removedBlock]++;
                player.experience += 1; // Gain experience from mining
            }
        }
    } else {
        // Place block if possible
        if (inventory[currentBlockType] > 0 && countInventory() < player.maxInventory) {
            grid[row][col] = currentBlockType;
            inventory[currentBlockType]--;
        }
    }
    drawGrid();
    updateInventoryUI();
});

// Update inventory UI
function updateInventoryUI() {
    const inventoryItemsDiv = document.getElementById('inventoryItems');
    inventoryItemsDiv.innerHTML = '';
    for (const [key, value] of Object.entries(inventory)) {
        if (value > 0) {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'inventory-item';
            itemDiv.style.backgroundImage = `url(${blockImages[key]})`;
            itemDiv.title = `${key}: ${value}`;
            inventoryItemsDiv.appendChild(itemDiv);
        }
    }
}

// Count the items in inventory
function countInventory() {
    return Object.values(inventory).reduce((sum, value) => sum + value, 0);
}

// Crafting system
const craftingRecipes = {
    "woodenPlank": { wood: 2 },
    "pickaxe": { woodenPlank: 3, stick: 2 },
    "axe": { woodenPlank: 3, stick: 2 },
};

function craftItem(item) {
    const recipe = craftingRecipes[item];
    if (recipe) {
        let canCraft = true;
        for (const [key, value] of Object.entries(recipe)) {
            if (inventory[key] < value) {
                canCraft = false;
                break;
            }
        }
        if (canCraft) {
            for (const [key, value] of Object.entries(recipe)) {
                inventory[key] -= value;
            }
            inventory[item] = (inventory[item] || 0) + 1; // Add crafted item to inventory
            updateInventoryUI();
        } else {
            alert("Not enough materials!");
        }
    }
}

// Time and Day/Night Cycle
let timeOfDay = 0; // 0 to 24, where 0 is night and 12 is day
let dayLength = 10000; // 10 seconds for a full cycle

function updateTime() {
    timeOfDay += 0.1; // Increment time
    if (timeOfDay >= 24) {
        timeOfDay = 0; // Reset time
    }
    updateTimeDisplay();
    drawGrid();
}

function updateTimeDisplay() {
    const timeDisplay = document.getElementById('timeDisplay');
    timeDisplay.innerText = timeOfDay < 12 ? "Night" : "Day";
}

setInterval(updateTime, dayLength / 240); // Adjust time increment based on day length

// Update health and hunger
function updateHealthAndHunger() {
    player.hunger -= 0.01; // Decrease hunger over time
    if (player.hunger <= 0) {
        player.health -= 0.1; // Decrease health if hunger is 0
    }
    document.getElementById('health').innerText = player.health.toFixed(1);
    document.getElementById('hunger').innerText = player.hunger.toFixed(1);
}

setInterval(updateHealthAndHunger, 100); // Update health and hunger every second

// Spawn mobs every few seconds
setInterval(spawnMob, 5000); // Spawn a new mob every 5 seconds

// Initial draw
drawGrid();
updateInventoryUI();
updateTimeDisplay();
