#include <SDL2/SDL.h>
#include <stdbool.h>
#include <stdio.h>

#define SCREEN_WIDTH 800
#define SCREEN_HEIGHT 600
#define TILE_SIZE 40
#define MAP_WIDTH (SCREEN_WIDTH / TILE_SIZE)
#define MAP_HEIGHT (SCREEN_HEIGHT / TILE_SIZE)

// 0 = Air, 1 = Dirt, 2 = Grass
int world[MAP_WIDTH][MAP_HEIGHT];

void init_world() {
    for (int x = 0; x < MAP_WIDTH; x++) {
        for (int y = 0; y < MAP_HEIGHT; y++) {
            if (y > MAP_HEIGHT / 2) {
                world[x][y] = (y == MAP_HEIGHT / 2 + 1) ? 2 : 1; // Grass on top, dirt below
            } else {
                world[x][y] = 0; // Air
            }
        }
    }
}

int main(int argc, char* argv[]) {
    if (SDL_Init(SDL_INIT_VIDEO) < 0) {
        printf("SDL Init Failed: %s\n", SDL_GetError());
        return 1;
    }

    SDL_Window* window = SDL_CreateWindow("2D Minecraft Clone", SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED, SCREEN_WIDTH, SCREEN_HEIGHT, SDL_WINDOW_SHOWN);
    SDL_Renderer* renderer = SDL_CreateRenderer(window, -1, SDL_RENDERER_ACCELERATED);

    init_world();

    bool running = true;
    SDL_Event e;
    int current_block = 2; // Default to placing grass

    while (running) {
        while (SDL_PollEvent(&e) != 0) {
            if (e.type == SDL_QUIT) {
                running = false;
            } else if (e.type == SDL_MOUSEBUTTONDOWN) {
                int mouse_x, mouse_y;
                SDL_GetMouseState(&mouse_x, &mouse_y);
                int grid_x = mouse_x / TILE_SIZE;
                int grid_y = mouse_y / TILE_SIZE;

                if (e.button.button == SDL_BUTTON_LEFT) {
                    world[grid_x][grid_y] = 0; // Mine block
                } else if (e.button.button == SDL_BUTTON_RIGHT) {
                    world[grid_x][grid_y] = current_block; // Place block
                }
            } else if (e.type == SDL_KEYDOWN) {
                if (e.key.keysym.sym == SDLK_1) current_block = 1; // Dirt
                if (e.key.keysym.sym == SDLK_2) current_block = 2; // Grass
            }
        }

        // Clear screen (Sky blue)
        SDL_SetRenderDrawColor(renderer, 135, 206, 235, 255);
        SDL_RenderClear(renderer);

        // Render world blocks
        for (int x = 0; x < MAP_WIDTH; x++) {
            for (int y = 0; y < MAP_HEIGHT; y++) {
                if (world[x][y] == 0) continue;

                if (world[x][y] == 1) {
                    SDL_SetRenderDrawColor(renderer, 120, 81, 45, 255); // Brown for dirt
                } else if (world[x][y] == 2) {
                    SDL_SetRenderDrawColor(renderer, 34, 139, 34, 255); // Green for grass
                }

                SDL_Rect rect = { x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE - 1, TILE_SIZE - 1 };
                SDL_RenderFillRect(renderer, &rect);
            }
        }

        SDL_RenderPresent(renderer);
    }

    SDL_DestroyRenderer(renderer);
    SDL_DestroyWindow(window);
    SDL_Quit();
    return 0;
}
