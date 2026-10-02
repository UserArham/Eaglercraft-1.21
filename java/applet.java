import java.applet.Applet;
import java.awt.Color;
import java.awt.Graphics;

/* 
<applet code="MinecraftApplet" width="400" height="300">
</applet>
*/
@Deprecated
public class MinecraftApplet extends Applet {
    
    @Override
    public void init() {
        setBackground(new Color(135, 206, 235)); // Sky background
    }

    @Override
    public void paint(Graphics g) {
        // Draw static 2D block grid rows
        
        // Grass surface layer
        g.setColor(new Color(34, 139, 34));
        for (int x = 0; x < 400; x += 40) {
            g.fillRect(x, 160, 40, 40);
            g.setColor(Color.BLACK);
            g.drawRect(x, 160, 40, 40);
            g.setColor(new Color(34, 139, 34));
        }

        // Subsurface dirt layer
        g.setColor(new Color(139, 69, 19));
        for (int x = 0; x < 400; x += 40) {
            g.fillRect(x, 200, 40, 40);
            g.setColor(Color.BLACK);
            g.drawRect(x, 200, 40, 40);
            g.setColor(new Color(139, 69, 19));
        }
    }
}
