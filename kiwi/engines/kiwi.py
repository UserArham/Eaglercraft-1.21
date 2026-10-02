import pygame
import sys
import random

# 1. Setup Constants
SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600
TILE_SIZE = 32
GRAVITY = 0.5

# Colors (representing different blocks/elements)
SKY_BLUE = (135, 206, 235)
DIRT = (155, 118, 83)
GRASS = (34, 139, 34)
STONE = (128, 128, 128)
PLAYER_COLOR = (255, 105, 180)

class Player:
    def __init__(self, x, y):
        self.rect = pygame.Rect(x, y, 24, 48) # 2 tiles high, slightly thinner
        self.vx = 0
        self.vy = 0
        self.on_ground = False

    def update(self, world):
        # Apply Gravity
        self.vy += GRAVITY
        if self.vy > 12: 
            self.vy = 12

        # Move X and check collisions
        self.rect.x += self.vx
        self.handle_collisions(world, 'x')

        # Move Y and check collisions
        self.rect.y += self.vy
        self.handle_collisions(world, 'y')

    def handle_collisions(self, world, direction):
        for block_pos, block_type in world.items():
            block_rect = pygame.Rect(block_pos[0] * TILE_SIZE, block_pos[1] * TILE_SIZE, TILE_SIZE, TILE_SIZE)
            
            if self.rect.colliderect(block_rect):
                if direction == 'x':
                    if self.vx > 0: self.rect.right = block_rect.left
                    if self.vx < 0: self.rect.left = block_rect.right
                if direction == 'y':
                    if self.vy > 0:
                        self.rect.bottom = block_rect.top
                        self.vy = 0
                        self.on_ground = True
                    elif self.vy < 0:
                        self.rect.top = block_rect.bottom
                        self.vy = 0

def generate_world():
    world = {}
    cols = SCREEN_WIDTH // TILE_SIZE
    rows = SCREEN_HEIGHT // TILE_SIZE
    
    for x in range(cols):
        # Create a simple terrain wave using sine
        ground_height = int(rows / 2 + random.randint(-1, 1))
        for y in range(rows):
            if y == ground_height:
                world[(x, y)] = GRASS
            elif ground_height < y < ground_height + 4:
                world[(x, y)] = DIRT
            elif y >= ground_height + 4:
                world[(x, y)] = STONE
    return world

def main():
    pygame.init()
    screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
    pygame.display.set_caption("2D Kiwi Minecraft Engine")
    clock = pygame.time.Clock()

    world = generate_world()
    player = Player(100, 100)
    selected_block = GRASS

    while True:
        screen.fill(SKY_BLUE)
        
        # 2. Event Handling
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
                
            # Mouse interaction (Break/Place blocks)
            if event.type == pygame.MOUSEBUTTONDOWN:
                mx, my = pygame.mouse.get_pos()
                grid_x, grid_y = mx // TILE_SIZE, my // TILE_SIZE
                
                if event.button == 1: # Left Click to Break
                    world.pop((grid_x, grid_y), None)
                elif event.button == 3: # Right Click to Place
                    if (grid_x, grid_y) not in world:
                        world[(grid_x, grid_y)] = selected_block

        # 3. Input Controls
        keys = pygame.key_with_pressed() if hasattr(pygame, 'key_with_pressed') else pygame.key.get_pressed()
        player.vx = 0
        if keys[pygame.K_a]: player.vx = -4
        if keys[pygame.K_d]: player.vx = 4
        if keys[pygame.K_SPACE] and player.on_ground:
            player.vy = -10
            player.on_ground = False

        # Hotbar selection
        if keys[pygame.K_1]: selected_block = GRASS
        if keys[pygame.K_2]: selected_block = DIRT
        if keys[pygame.K_3]: selected_block = STONE

        # 4. Engine Updates
        player.update(world)

        # 5. Rendering
        # Draw World
        for pos, color in world.items():
            pygame.draw.rect(screen, color, (pos[0]*TILE_SIZE, pos[1]*TILE_SIZE, TILE_SIZE, TILE_SIZE))
        
        # Draw Player
        pygame.draw.rect(screen, PLAYER_COLOR, player.rect)

        pygame.display.flip()
        clock.tick(60)

if __name__ == "__main__":
    main()
