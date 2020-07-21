import java.io.*;
import java.net.URL;
import com.eteks.sweethome3d.applet.AppletUserPreferences;
import com.eteks.sweethome3d.io.HomeFileRecorder;
import com.eteks.sweethome3d.model.*;
import com.eteks.sweethome3d.plugin.exporthtml5.HomeXMLFileRecorder;

/**
 * /usr/local/jdk1.6.0_45/bin/java -Dj3d.rend=noop -cp .:SweetHome3D-5.2.2-withAppletClasses.jar:ExportToHTML5-1.1.sh3p:jnlp.jar:vecmath.jar:j3dutils.jar:j3dcore.jar:batik-svgpathparser-1.7.jar ExportToSH3V file.sh3d file.sh3v
 */
public class ExportToSH3V {   
  public static void main(String [] args) throws RecorderException, IOException {
    UserPreferences preferences = new AppletUserPreferences(
        new URL [] {new URL("http://www.sweethome3d.com/online/furnitureCatalog.zip"), 
                    new URL("http://www.sweethome3d.com/online/additionalFurnitureCatalog.zip")}, 
        new URL("http://www.sweethome3d.com/models/"), 
        new URL [] {new URL("http://www.sweethome3d.com/online/texturesCatalog.zip")}, 
        new URL("http://www.sweethome3d.com/textures/"), 
        null, null, null, "en");
    new HomeXMLFileRecorder(9, 
              HomeXMLFileRecorder.INCLUDE_VIEWER_DATA 
              | HomeXMLFileRecorder.INCLUDE_HOME_STRUCTURE 
              | HomeXMLFileRecorder.REDUCE_IMAGES 
              | HomeXMLFileRecorder.CONVERT_MODELS_TO_OBJ_FORMAT, 256).exportHome(
                  new File(args [0]).getAbsoluteFile(), new File(args [1]).getAbsoluteFile(), preferences);

/*    
    if (args.length > 2) {
      // To generate images on server (requires sunflow-0.07.3i.jar in classpath)
      BufferedImage image = new BufferedImage(400, 200, BufferedImage.TYPE_INT_RGB);
      new PhotoRenderer(home, PhotoRenderer.Quality.LOW).render(image, home.getTopCamera(), new ImageObserver() {
        public boolean imageUpdate(Image img, int infoflags, int x, int y, int width, int height) {
          System.out.println("Rendering " + x + " " + y);
          return false;
        }
      });
      ImageIO.write(image, "JPEG", new File(args [2]));
    }
*/ 
  }
}
