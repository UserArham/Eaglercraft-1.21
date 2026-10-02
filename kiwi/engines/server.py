import math
from flask import Flask, jsonify, request
from flask_cors import CORS
from noise import pnoise1

app = Flask(__name__)
CORS(app)  # Allows JavaScript Client to communicate with Python smoothly

# --- Game Engine Constants ---
CHUNK_SIZE = 16
AIR = 0
GRASS = 1
DIRT = 2
STONE = 3
BEDROCK = 4

# Store modified chunks dynamically in memory
world_cache = {}

def generate_chunk(chunk_x):
    """Generates a 16-width slice of a 2D voxel landscape safely."""
    if chunk_x in world_cache:
        return world_cache[chunk_x]

    chunk_data = []
    for x in range(chunk_x * CHUNK_SIZE, (chunk_x + 1) * CHUNK_SIZE):
        # 1D Perlin Noise determines the surface height map
        raw_noise = pnoise1(x * 0.05, octaves=4, persistence=0.5, lacunarity=2.0)
        surface_y = int((raw_noise + 1.0) * 12) + 20  # Map height offset
        
        column = []
        for y in range(0, 64):  # World max height limit
            if y == 0:
                block = BEDROCK
            elif y < surface_y - 4:
                block = STONE
            elif y < surface_y - 1:
                block = DIRT
            elif y == surface_y - 1:
                block = GRASS
            else:
                block = AIR
            column.append(block)
        chunk_data.append(column)
        
    world_cache[chunk_x] = chunk_data
    return chunk_data

@app.route('/get_chunk', methods=['GET'])
def get_chunk():
    cx = request.args.get('cx', default=0, type=int)
    return jsonify({"chunk_x": cx, "data": generate_chunk(cx)})

@app.route('/update_block', methods=['POST'])
def update_block():
    req = request.json
    bx, by, block_type = req['x'], req['y'], req['type']
    
    cx = math.floor(bx / CHUNK_SIZE)
    local_x = bx % CHUNK_SIZE
    
    # Ensure chunk generated before edit
    generate_chunk(cx)
    
    if 0 <= by < 64:
        world_cache[cx][local_x][by] = block_type
        return jsonify({"status": "success"})
    return jsonify({"status": "error", "message": "Out of vertical bounds"}), 400

if __name__ == '__main__':
    app.run(port=5000, debug=True)
