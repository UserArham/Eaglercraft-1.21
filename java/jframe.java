import javax.swing.*;
import java.awt.*;
import java.awt.event.KeyAdapter;
import java.awt.event.KeyEvent;

public class Minecraft2D extends JPanel {
    // Game World dimensions
    private static final int WORLD_WIDTH = 50;
    private static final int WORLD_HEIGHT = 15;
    private static final int BLOCK_SIZE = 40;

    // Block ID mappings
    private static final int AIR = 0;
    private static final int GRASS = 1;
    private static final int DIRT = 2;

    private int[][] worldMap = new int[WORLD_HEIGHT][WORLD_WIDTH];
    private int cameraX = 0; // Horizontal scroll camera

    public Minecraft2D() {
        generateWorld();
        setFocusable(true);
        
        // Key listener for moving the camera/player
        addKeyListener(new KeyAdapter() {
            @Override
            public void keyPressed(KeyEvent e) {
                if (e.getKeyCode() == KeyEvent.VK_RIGHT) {
                    cameraX += 10; // Scroll right
                } else if (e.getKeyCode() == KeyEvent.VK_LEFT) {
                    cameraX = Math.max(0, cameraX - 10); // Scroll left
                }
                repaint(); // Redraw screen
            }
        });
    }

    private void generateWorld() {
        for (int y = 0; y < WORLD_HEIGHT; y++) {
            for (int x = 0; x < WORLD_WIDTH; x++) {
                if (y < 6) {
                    worldMap[y][x] = AIR;    // Sky
                } else if (y == 6) {
                    worldMap[y][x] = GRASS;  // Top surface layer
                } else {
                    worldMap[y][x] = DIRT;   // Underground layers
                }
            }
        }
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        Graphics2D g2d = (Graphics2D) g;

        // Render the visible background sky color
        g2d.setColor(new Color(135, 206, 235)); // Sky blue
        g2d.fillRect(0, 0, getWidth(), getHeight());

        // Draw blocks relative to the camera shift
        for (int y = 0; y < WORLD_HEIGHT; y++) {
            for (int x = 0; x < WORLD_WIDTH; x++) {
                int blockType = worldMap[y][x];
                int renderX = (x * BLOCK_SIZE) - cameraX;

                // Only draw blocks that fit on the active viewport screen
                if (renderX + BLOCK_SIZE >= 0 && renderX <= getWidth()) {
                    if (blockType == GRASS) {
                        g2d.setColor(new Color(34, 139, 34)); // Grass green
                        g2d.fillRect(renderX, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                    } else if (blockType == DIRT) {
                        g2d.setColor(new Color(139, 69, 19)); // Dirt brown
                        g2d.fillRect(renderX, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                    }
                    
                    // Draw block wireframe grid
                    if (blockType != AIR) {
                        g2d.setColor(Color.BLACK);
                        g2d.drawRect(renderX, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                    }
                }
            }
        }
    }

    public static void main(String[] args) {
        JFrame frame = new JFrame("2D Minecraft Sandbox");
        Minecraft2D gamePanel = new Minecraft2D();
        
        frame.add(gamePanel);
        frame.setSize(800, 600);
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setLocationRelativeTo(null); // Center window
        frame.setVisible(true);
    }
}
