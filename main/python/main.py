import random
import pygame

# Initialize Pygame
pygame.init()

# Grid & Screen Settings
TILE_SIZE = 40
COLS, ROWS = 20, 15
SCREEN_WIDTH = COLS * TILE_SIZE
SCREEN_HEIGHT = ROWS * TILE_SIZE
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("2D Minecraft Clone")
clock = pygame.time.Clock()

# Block IDs
AIR = 0
GRASS = 1
DIRT = 2
STONE = 3

# Colors
COLORS = {
    AIR: (135, 206, 235),  # Sky blue
    GRASS: (34, 139, 34),  # Forest green
    DIRT: (139, 69, 19),   # Saddle brown
    STONE: (128, 128, 128)  # Gray
}

# 1. Procedural Terrain Generation
world_map = []
for y in range(ROWS):
    row = []
    for x in range(COLS):
        # Determine flat terrain baseline with some random height variations
        surface_height = 8 + int(2 * (random.random() - 0.5))
        
        if y < surface_height:
            row.append(AIR)
        elif y == surface_height:
            row.append(GRASS)
        elif y <= surface_height + 2:
            row.append(DIRT)
        else:
            row.append(STONE)
    world_map.append(row)

# 2. Player Properties
player_width = 24
player_height = 36
player_x = 100
player_y = 50
player_speed = 5
velocity_y = 0
gravity = 0.6
is_grounded = False

def check_collision(px, py):
    """Checks if the player's bounding box intersects with any solid block."""
    player_rect = pygame.Rect(px, py, player_width, player_height)
    for y in range(ROWS):
        for x in range(COLS):
            if world_map[y][x] != AIR:
                block_rect = pygame.Rect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE)
                if player_rect.colliderect(block_rect):
                    return True
    return False

# 3. Main Game Loop
running = True
selected_block = GRASS  # Default block type to place

while running:
    screen.fill(COLORS[AIR])  # Reset background to sky color
    
    # Event Management
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
            
        # Hotkeys to switch blocks to build
        elif event.type == pygame.KEYDOWN:
            if event.key == pygame.K_1: selected_block = GRASS
            elif event.key == pygame.K_2: selected_block = DIRT
            elif event.key == pygame.K_3: selected_block = STONE
            
        # Mouse Interactions (Mine / Place Blocks)
        elif event.type == pygame.MOUSEBUTTONDOWN:
            mouse_x, mouse_y = pygame.mouse.get_pos()
            grid_x = mouse_x // TILE_SIZE
            grid_y = mouse_y // TILE_SIZE
            
            if 0 <= grid_x < COLS and 0 <= grid_y < ROWS:
                if event.button == 1:    # Left Click -> Break Block
                    world_map[grid_y][grid_x] = AIR
                elif event.button == 3:  # Right Click -> Place Block
                    # Only place if the grid slot is currently empty
                    if world_map[grid_y][grid_x] == AIR:
                        world_map[grid_y][grid_x] = selected_block

    # Movement Logic
    keys = pygame.key.get_pressed()
    dx = 0
    if keys[pygame.K_a]: dx -= player_speed
    if keys[pygame.K_d]: dx += player_speed
    
    # Horizontal Collision Handle
    player_x += dx
    if check_collision(player_x, player_y):
        player_x -= dx  # Revert movement if hitting a block

    # Vertical Mechanics (Gravity & Jump)
    velocity_y += gravity
    player_y += velocity_y
    is_grounded = False
    
    if check_collision(player_x, player_y):
        player_y -= velocity_y  # Revert vertical step
        if velocity_y > 0:
            is_grounded = True  # Player landed on top of a surface
        velocity_y = 0
        
    if keys[pygame.K_w] or keys[pygame.K_SPACE]:
        if is_grounded:
            velocity_y = -10  # Jump impulse force

    # 4. Render Layout
    # Draw Environment Blocks
    for y in range(ROWS):
        for x in range(COLS):
            block_type = world_map[y][x]
            if block_type != AIR:
                pygame.draw.rect(
                    screen, 
                    COLORS[block_type], 
                    (x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE)
                )
                # Outer black border line for block separation
                pygame.draw.rect(
                    screen, 
                    (0, 0, 0), 
                    (x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE), 
                    1
                )

    # Draw Character Sprite (Red Box)
    pygame.draw.rect(screen, (255, 0, 0), (player_x, player_y, player_width, player_height))
    
    pygame.display.flip()
    clock.tick(60)  # Maintain stable 60 FPS

pygame.quit()
