const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Configuration constants
const BLOCK_SIZE = 32;
const COLS = 40; 
const ROWS = 20;

canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;

// Block Types
const AIR = 0;
const GRASS = 1;
const DIRT = 2;
const STONE = 3;

// Map colors to block types
const BLOCK_COLORS = {
    [AIR]: "transparent",
    [GRASS]: "#5cc447",
    [DIRT]: "#866043",
    [STONE]: "#7c7c7c"
};

// --- World Generation ---
let world = [];
for (let x = 0; x < COLS; x++) {
    world[x] = [];
    // Generate a simple sin-wave terrain curve
    let groundHeight = Math.floor(ROWS / 2 + Math.sin(x * 0.15) * 3);
    
    for (let y = 0; y < ROWS; y++) {
        if (y < groundHeight) {
            world[x][y] = AIR;
        } else if (y === groundHeight) {
            world[x][y] = GRASS;
        } else if (y < groundHeight + 4) {
            world[x][y] = DIRT;
        } else {
            world[x][y] = STONE;
        }
    }
}

// --- Player Setup ---
const player = {
    x: 100,
    y: 50,
    width: 20,
    height: 52,
    vx: 0,
    vy: 0,
    speed: 4,
    jumpForce: -10,
    gravity: 0.4,
    grounded: false
};

// --- Input Handling ---
const keys = {};
window.addEventListener("keydown", e => keys[e.code] = true);
window.addEventListener("keyup", e => keys[e.code] = false);

// Prevent right-click context menu popping up on the canvas
canvas.addEventListener("contextmenu", e => e.preventDefault());

canvas.addEventListener("mousedown", e => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Convert click coordinates to world grid indices
    const gridX = Math.floor(mouseX / BLOCK_SIZE);
    const gridY = Math.floor(mouseY / BLOCK_SIZE);

    if (gridX >= 0 && gridX < COLS && gridY >= 0 && gridY < ROWS) {
        if (e.button === 0) {
            // Left click: Break block
            world[gridX][gridY] = AIR;
        } else if (e.button === 2) {
            // Right click: Place dirt block (only if empty)
            if (world[gridX][gridY] === AIR) {
                world[gridX][gridY] = DIRT;
            }
        }
    }
});

// --- Physics & Collision ---
function checkTileCollision(x, y) {
    const gridX = Math.floor(x / BLOCK_SIZE);
    const gridY = Math.floor(y / BLOCK_SIZE);
    
    if (gridX < 0 || gridX >= COLS || gridY < 0 || gridY >= ROWS) {
        return true; // Boundaries behave like solid walls
    }
    return world[gridX][gridY] !== AIR;
}

function updatePlayer() {
    // Horizontal Movement
    if (keys["KeyA"] || keys["ArrowLeft"]) player.vx = -player.speed;
    else if (keys["KeyD"] || keys["ArrowRight"]) player.vx = player.speed;
    else player.vx = 0;

    // Apply gravity
    player.vy += player.gravity;

    // Jump logic
    if ((keys["Space"] || keys["KeyW"]) && player.grounded) {
        player.vy = player.jumpForce;
        player.grounded = false;
    }

    // Move horizontally & handle collisions
    player.x += player.vx;
    if (checkTileCollision(player.x, player.y) || checkTileCollision(player.x + player.width, player.y) ||
        checkTileCollision(player.x, player.y + player.height) || checkTileCollision(player.x + player.width, player.y + player.height)) {
        player.x -= player.vx; // Revert movement if intersecting
    }

    // Move vertically & handle collisions
    player.y += player.vy;
    player.grounded = false;
    
    if (player.vy > 0) { // Falling down
        if (checkTileCollision(player.x, player.y + player.height) || checkTileCollision(player.x + player.width, player.y + player.height)) {
            player.y = Math.floor((player.y + player.height) / BLOCK_SIZE) * BLOCK_SIZE - player.height;
            player.vy = 0;
            player.grounded = true;
        }
    } else if (player.vy < 0) { // Jumping up
        if (checkTileCollision(player.x, player.y) || checkTileCollision(player.x + player.width, player.y)) {
            player.y = Math.floor(player.y / BLOCK_SIZE + 1) * BLOCK_SIZE;
            player.vy = 0;
        }
    }
}

// --- Render Loop ---
function draw() {
    // Clear canvas with structural clear sky
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Blocks
    for (let x = 0; x < COLS; x++) {
        for (let y = 0; y < ROWS; y++) {
            let type = world[x][y];
            if (type !== AIR) {
                ctx.fillStyle = BLOCK_COLORS[type];
                ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                
                // Block outlines to emphasize grid
                ctx.strokeStyle = "rgba(0,0,0,0.15)";
                ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }

    // Draw Player
    ctx.fillStyle = "#d23c3c"; // Red player model
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function gameLoop() {
    updatePlayer();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the loop
gameLoop();
