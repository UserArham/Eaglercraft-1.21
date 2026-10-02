#!/bin/bash
# Create a build directory if it doesn't exist
mkdir -p bin

# Compile the C file with SDL2 flags
gcc main.c -o bin/minecraft2d $(sdl2-config --cflags --libs)

echo "Build complete! Run ./bin/minecraft2d to play."
