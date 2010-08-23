/*
 * HomeComponent3D.java 24 ao?t 2006
 *
 * Copyright (c) 2006 Emmanuel PUYBARET / eTeks <info@eteks.com>. All Rights Reserved.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 */
package com.eteks.sweethome3d.swing;

import java.awt.AlphaComposite;
import java.awt.Color;
import java.awt.Component;
import java.awt.Composite;
import java.awt.Container;
import java.awt.Dimension;
import java.awt.EventQueue;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.GridLayout;
import java.awt.Insets;
import java.awt.LayoutManager;
import java.awt.Point;
import java.awt.Rectangle;
import java.awt.RenderingHints;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.ComponentAdapter;
import java.awt.event.ComponentEvent;
import java.awt.event.ComponentListener;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.awt.event.MouseMotionAdapter;
import java.awt.event.MouseWheelEvent;
import java.awt.event.MouseWheelListener;
import java.awt.geom.Area;
import java.awt.geom.PathIterator;
import java.awt.geom.Rectangle2D;
import java.awt.image.BufferedImage;
import java.awt.image.FilteredImageSource;
import java.awt.image.RGBImageFilter;
import java.awt.print.PageFormat;
import java.awt.print.Printable;
import java.beans.PropertyChangeEvent;
import java.beans.PropertyChangeListener;
import java.lang.ref.WeakReference;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import javax.media.j3d.Alpha;
import javax.media.j3d.AmbientLight;
import javax.media.j3d.Appearance;
import javax.media.j3d.Background;
import javax.media.j3d.BoundingBox;
import javax.media.j3d.BoundingSphere;
import javax.media.j3d.BranchGroup;
import javax.media.j3d.Canvas3D;
import javax.media.j3d.ColoringAttributes;
import javax.media.j3d.DirectionalLight;
import javax.media.j3d.Geometry;
import javax.media.j3d.Group;
import javax.media.j3d.IllegalRenderingStateException;
import javax.media.j3d.J3DGraphics2D;
import javax.media.j3d.Light;
import javax.media.j3d.Node;
import javax.media.j3d.OrderedGroup;
import javax.media.j3d.Shape3D;
import javax.media.j3d.Texture;
import javax.media.j3d.Transform3D;
import javax.media.j3d.TransformGroup;
import javax.media.j3d.TransformInterpolator;
import javax.media.j3d.TransparencyAttributes;
import javax.media.j3d.View;
import javax.swing.AbstractAction;
import javax.swing.ActionMap;
import javax.swing.Icon;
import javax.swing.ImageIcon;
import javax.swing.InputMap;
import javax.swing.JButton;
import javax.swing.JComponent;
import javax.swing.JPanel;
import javax.swing.JPopupMenu;
import javax.swing.KeyStroke;
import javax.swing.RepaintManager;
import javax.swing.SwingUtilities;
import javax.swing.Timer;
import javax.swing.event.AncestorEvent;
import javax.swing.event.AncestorListener;
import javax.swing.event.ChangeEvent;
import javax.swing.event.ChangeListener;
import javax.swing.event.MouseInputAdapter;
import javax.vecmath.Color3f;
import javax.vecmath.Point3d;
import javax.vecmath.Point3f;
import javax.vecmath.TexCoord2f;
import javax.vecmath.Vector3f;

import com.eteks.sweethome3d.j3d.Component3DManager;
import com.eteks.sweethome3d.j3d.Ground3D;
import com.eteks.sweethome3d.j3d.HomePieceOfFurniture3D;
import com.eteks.sweethome3d.j3d.ModelManager;
import com.eteks.sweethome3d.j3d.Object3DBranch;
import com.eteks.sweethome3d.j3d.Room3D;
import com.eteks.sweethome3d.j3d.TextureManager;
import com.eteks.sweethome3d.j3d.Wall3D;
import com.eteks.sweethome3d.model.Camera;
import com.eteks.sweethome3d.model.CollectionEvent;
import com.eteks.sweethome3d.model.CollectionListener;
import com.eteks.sweethome3d.model.Home;
import com.eteks.sweethome3d.model.HomeEnvironment;
import com.eteks.sweethome3d.model.HomeFurnitureGroup;
import com.eteks.sweethome3d.model.HomePieceOfFurniture;
import com.eteks.sweethome3d.model.HomeTexture;
import com.eteks.sweethome3d.model.Room;
import com.eteks.sweethome3d.model.Selectable;
import com.eteks.sweethome3d.model.UserPreferences;
import com.eteks.sweethome3d.model.Wall;
import com.eteks.sweethome3d.tools.OperatingSystem;
import com.eteks.sweethome3d.viewcontroller.HomeController3D;
import com.sun.j3d.utils.geometry.GeometryInfo;
import com.sun.j3d.utils.universe.SimpleUniverse;
import com.sun.j3d.utils.universe.Viewer;
import com.sun.j3d.utils.universe.ViewingPlatform;

/**
 * A component that displays home walls, rooms and furniture with Java 3D. 
 * @author Emmanuel Puybaret
 */
public class HomeComponent3D extends JComponent implements com.eteks.sweethome3d.viewcontroller.View, Printable {
  private enum ActionType {MOVE_CAMERA_FORWARD, MOVE_CAMERA_FAST_FORWARD, MOVE_CAMERA_BACKWARD, MOVE_CAMERA_FAST_BACKWARD,  
      ROTATE_CAMERA_YAW_LEFT, ROTATE_CAMERA_YAW_FAST_LEFT, ROTATE_CAMERA_YAW_RIGHT, ROTATE_CAMERA_YAW_FAST_RIGHT, 
      ROTATE_CAMERA_PITCH_UP, ROTATE_CAMERA_PITCH_DOWN, ELEVATE_CAMERA_UP, ELEVATE_CAMERA_DOWN}
  
  private final Home                               home;
  private final boolean                            displayShadowOnFloor;
  private final Map<Selectable, Object3DBranch>    homeObjects = new HashMap<Selectable, Object3DBranch>();
  private Collection<Selectable>                   homeObjectsToUpdate;
  private Canvas3D                                 canvas3D;
  private SimpleUniverse                           universe;
  private Camera                                   camera;
  // Listeners bound to home that updates 3D scene objects
  private PropertyChangeListener                   cameraChangeListener;
  private PropertyChangeListener                   homeCameraListener;
  private PropertyChangeListener                   skyColorListener;
  private PropertyChangeListener                   groundColorAndTextureListener;
  private PropertyChangeListener                   lightColorListener;
  private PropertyChangeListener                   wallsAlphaListener;
  private PropertyChangeListener                   drawingModeListener;
  private CollectionListener<Wall>                 wallListener;
  private PropertyChangeListener                   wallChangeListener;
  private CollectionListener<HomePieceOfFurniture> furnitureListener;
  private PropertyChangeListener                   furnitureChangeListener;
  private CollectionListener<Room>                 roomListener;
  private PropertyChangeListener                   roomChangeListener;
  // Offscreen printed image cache
  // Creating an offscreen buffer is a quite lengthy operation so we keep the last printed image in this field
  // This image should be set to null each time the 3D view changes
  private BufferedImage                            printedImage;
  
  private JComponent                               navigationPanel;
  private ComponentListener                        navigationPanelListener;
  private BufferedImage                            navigationPanelImage;
  
  /**
   * Creates a 3D component that displays <code>home</code> walls, rooms and furniture, 
   * with no controller.
   * @throws IllegalRenderingStateException  if the canvas 3D displayed 
   *             by this component couldn't be created.
   */
  public HomeComponent3D(Home home) {
    this(home, null);  
  }
  
  /**
   * Creates a 3D component that displays <code>home</code> walls, rooms and furniture.
   * @throws IllegalRenderingStateException  if the canvas 3D displayed 
   *             by this component couldn't be created.
   */
  public HomeComponent3D(Home home, HomeController3D controller) {
    this(home, null, controller);
  }

  /**
   * Creates a 3D component that displays <code>home</code> walls, rooms and furniture, 
   * with shadows on the floor.
   * @throws IllegalRenderingStateException  if the canvas 3D displayed 
   *             by this component couldn't be created.
   */
  public HomeComponent3D(Home home, 
                         UserPreferences  preferences, 
                         boolean displayShadowOnFloor) {
    this(home, preferences, displayShadowOnFloor, null);  
  }
  
  /**
   * Creates a 3D component that displays <code>home</code> walls, rooms and furniture.
   * @throws IllegalRenderingStateException  if the canvas 3D displayed 
   *            by this component couldn't be created.
   */
  public HomeComponent3D(Home home,
                         UserPreferences  preferences,
                         HomeController3D controller) {
    this(home, preferences, false, controller);    
  }

  /**
   * Creates a 3D component that displays <code>home</code> walls, rooms and furniture.
   * @throws IllegalRenderingStateException  if the canvas 3D displayed 
   *            by this component couldn't be created.
   */
  private HomeComponent3D(Home home,
                          UserPreferences  preferences,
                          boolean displayShadowOnFloor,
                          HomeController3D controller) {
    this.home = home;
    this.displayShadowOnFloor = displayShadowOnFloor;

    this.canvas3D = Component3DManager.getInstance().getOnscreenCanvas3D(new Component3DManager.RenderingObserver() {        
        public void canvas3DSwapped(Canvas3D canvas3D) {
        }
        
        public void canvas3DPreRendered(Canvas3D canvas3D) {
        }
        
        public void canvas3DPostRendered(Canvas3D canvas3D) {
          // Copy reference to navigation panel image to avoid concurrency problems 
          // if it's modified in the EDT while this method draws it
          BufferedImage navigationPanelImage = HomeComponent3D.this.navigationPanelImage;
          // Render navigation panel upon canvas 3D if it exists
          if (navigationPanelImage != null) {
            J3DGraphics2D g2D = canvas3D.getGraphics2D();
            g2D.drawImage(navigationPanelImage, null, 0, 0);
            g2D.flush(true);
          }
        }
      });   
    JPanel canvasPanel = new JPanel(new LayoutManager() {
        public void addLayoutComponent(String name, Component comp) {
        }
        
        public void removeLayoutComponent(Component comp) {
        }
        
        public Dimension preferredLayoutSize(Container parent) {
          return canvas3D.getPreferredSize();
        }
        
        public Dimension minimumLayoutSize(Container parent) {
          return canvas3D.getMinimumSize();
        }
        
        public void layoutContainer(Container parent) {
          canvas3D.setBounds(0, 0, parent.getWidth(), parent.getHeight());
          if (navigationPanel != null 
              && navigationPanel.isVisible()) {
            // Ensure that navigationPanel is always in top corner             
            Dimension preferredSize = navigationPanel.getPreferredSize();
            navigationPanel.setBounds(0, 0, preferredSize.width, preferredSize.height);
          }
        }
      });
    canvasPanel.add(this.canvas3D);    
    setLayout(new GridLayout());
    add(canvasPanel);

    if (controller != null) {
      addMouseListeners(controller, this.canvas3D);
      if (preferences != null
          && (!OperatingSystem.isMacOSX()
              || OperatingSystem.isMacOSXLeopardOrSuperior())) {
        // No support for navigation panel under Mac OS X Tiger 
        // (too unstable, may crash system at 3D view resizing)
        this.navigationPanel = createNavigationPanel(home, preferences, controller);
        setNavigationPanelVisible(preferences.isNavigationPanelVisible());
        preferences.addPropertyChangeListener(UserPreferences.Property.NAVIGATION_PANEL_VISIBLE, 
            new NavigationPanelChangeListener(this, controller));
      }
      createActions(controller);
      installKeyboardActions();
      // Let this component manage focus
      setFocusable(true);
      SwingTools.installFocusBorder(this);
    }

    // Add an ancestor listener to create canvas universe once this component is made visible 
    // and clean up universe once its parent frame is disposed
    addAncestorListener(this.canvas3D, displayShadowOnFloor);
  }

  /**
   * Adds an ancestor listener to this component to manage canvas universe 
   * creation and clean up.  
   */
  private void addAncestorListener(final Canvas3D canvas3D,
                                   final boolean displayShadowOnFloor) {
    addAncestorListener(new AncestorListener() {        
        public void ancestorAdded(AncestorEvent event) {
          universe = createUniverse(displayShadowOnFloor, true, false);
          // Bind universe to canvas3D
          universe.getViewer().getView().addCanvas3D(canvas3D);
          canvas3D.setFocusable(false);
          updateNavigationPanelImage();
        }
        
        public void ancestorRemoved(AncestorEvent event) {
          universe.cleanup();
          removeHomeListeners();
          universe = null;
        }
        
        public void ancestorMoved(AncestorEvent event) {
        }        
      });
  }

  /**
   * Preferences property listener bound to this component with a weak reference to avoid
   * strong link between preferences and this component.  
   */
  private static class NavigationPanelChangeListener implements PropertyChangeListener {
    private final WeakReference<HomeComponent3D>  homeComponent3D;

    public NavigationPanelChangeListener(HomeComponent3D homeComponent3D,
                                         HomeController3D controller) {
      this.homeComponent3D = new WeakReference<HomeComponent3D>(homeComponent3D);
    }
    
    public void propertyChange(PropertyChangeEvent ev) {
      // If home pane was garbage collected, remove this listener from preferences
      HomeComponent3D homeComponent3D = this.homeComponent3D.get();
      if (homeComponent3D == null) {
        ((UserPreferences)ev.getSource()).removePropertyChangeListener(
            UserPreferences.Property.NAVIGATION_PANEL_VISIBLE, this);
      } else {
        homeComponent3D.setNavigationPanelVisible((Boolean)ev.getNewValue());
      }
    }
  }

  /**
   * Returns the component displayed as navigation panel by this 3D view.
   */
  private JComponent createNavigationPanel(Home home, 
                                           UserPreferences preferences, 
                                           HomeController3D controller) {
    JPanel navigationPanel = new JPanel(new GridBagLayout()) {
        @Override
        protected void paintComponent(Graphics g) {
          Graphics2D g2D = (Graphics2D)g;
          g2D.setColor(Color.BLACK);
          g2D.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
          g2D.drawOval(3, 3, getWidth() - 4, getHeight() - 4);
        }
      };   
      
    navigationPanel.setOpaque(false);
    navigationPanel.add(new NavigationButton(controller, 0, -(float)Math.PI / 36, 0,
        new ImageIcon(HomeComponent3D.class.getResource("resources/icons/tango/go-previous.png"))),
        new GridBagConstraints(0, 1, 1, 2, 0, 0, 
            GridBagConstraints.CENTER, GridBagConstraints.NONE, new Insets(0, 5, 0, 0), 0, 0));
    navigationPanel.add(new NavigationButton(controller, 5, 0, 0, 
        new ImageIcon(HomeComponent3D.class.getResource("resources/icons/tango/go-up.png"))),
        new GridBagConstraints(1, 0, 1, 1, 0, 0, 
            GridBagConstraints.CENTER, GridBagConstraints.NONE, new Insets(5, 0, 0, 0), 0, 0));
    navigationPanel.add(new NavigationButton(controller, 0, (float)Math.PI / 36, 0, 
        new ImageIcon(HomeComponent3D.class.getResource("resources/icons/tango/go-next.png"))),
        new GridBagConstraints(2, 1, 1, 2, 0, 0, 
            GridBagConstraints.CENTER, GridBagConstraints.NONE, new Insets(0, 0, 0, 2), 0, 0));
    navigationPanel.add(new NavigationButton(controller, -5, 0, 0, 
        new ImageIcon(HomeComponent3D.class.getResource("resources/icons/tango/go-down.png"))),
        new GridBagConstraints(1, 3, 1, 1, 0, 0, 
            GridBagConstraints.CENTER, GridBagConstraints.NONE, new Insets(0, 0, 2, 0), 0, 0));
    navigationPanel.add(new NavigationButton(controller, 0, 0, -(float)Math.PI / 72, 
        new ImageIcon(HomeComponent3D.class.getResource("resources/icons/tango/go-up-small.png"))),
        new GridBagConstraints(1, 1, 1, 1, 0, 0, 
            GridBagConstraints.CENTER, GridBagConstraints.NONE, new Insets(1, 1, 1, 1), 0, 0));
    navigationPanel.add(new NavigationButton(controller, 0, 0, (float)Math.PI / 72, 
        new ImageIcon(HomeComponent3D.class.getResource("resources/icons/tango/go-down-small.png"))),
        new GridBagConstraints(1, 2, 1, 1, 0, 0, 
            GridBagConstraints.CENTER, GridBagConstraints.NONE, new Insets(0, 0, 1, 0), 0, 0));
    return navigationPanel;
  }
  
  /**
   * An icon button that changes camera location and angles when pressed.
   */
  private static class NavigationButton extends JButton {
    private boolean shiftDown;

    public NavigationButton(final HomeController3D controller, 
                            final float moveDelta, 
                            final float yawDelta, 
                            final float pitchDelta, 
                            Icon icon) {
      super(icon);
      // Create a darker press icon
      setPressedIcon(new ImageIcon(createImage(new FilteredImageSource(
          ((ImageIcon)getIcon()).getImage().getSource(),
          new RGBImageFilter() {
            {
              canFilterIndexColorModel = true;
            }

            public int filterRGB (int x, int y, int rgb) {
              // Return darker color
              int alpha = rgb & 0xFF000000;
              int darkerRed = ((rgb & 0xFF0000) >> 1) & 0xFF0000;
              int darkerGreen  = ((rgb & 0x00FF00) >> 1) & 0x00FF00;
              int darkerBlue  = (rgb & 0x0000FF) >> 1;
              return alpha | darkerRed | darkerGreen | darkerBlue;
            }
          }))));
     
      // Track shift key press
      addMouseMotionListener(new MouseMotionAdapter() {
          @Override
          public void mouseDragged(MouseEvent ev) {
            shiftDown = ev.isShiftDown();
          }
        });
      addMouseListener(new MouseAdapter() {
          @Override
          public void mousePressed(MouseEvent ev) {
            shiftDown = ev.isShiftDown();
            SwingUtilities.getAncestorOfClass(HomeComponent3D.class, 
                NavigationButton.this).requestFocusInWindow();
          }
        });
      
      // Create a timer that will update camera angles and location
      final Timer timer = new Timer(50, new ActionListener() {
          public void actionPerformed(ActionEvent ev) {
            controller.moveCamera(shiftDown ? moveDelta / 10 : moveDelta);
            controller.rotateCameraYaw(shiftDown ? yawDelta / 10 : yawDelta);
            controller.rotateCameraPitch(pitchDelta);
          }
        });
      timer.setInitialDelay(0);
      
      // Update camera when button is armed
      addChangeListener(new ChangeListener() {
          public void stateChanged(ChangeEvent ev) {
            if (getModel().isArmed()
                && !timer.isRunning()) {
              timer.restart();
            } else if (!getModel().isArmed()
                       && timer.isRunning()) {
              timer.stop();
            }  
          }
        });
      setFocusable(false);
      setBorder(null);
      setContentAreaFilled(false);
    }
  }

  /**
   * Sets the component that will be drawn upon the heavyweight 3D component shown by this component.
   * Mouse events will targeted to the navigation panel when needed.
   * Supports transparent components. 
   */
  private void setNavigationPanelVisible(boolean visible) {
    if (this.navigationPanel != null) {
      this.navigationPanel.setVisible(visible);
      if (visible) {
        // Add a component listener that updates navigation panel image
        this.navigationPanelListener = new ComponentAdapter() {
            @Override
            public void componentResized(ComponentEvent ev) {
              updateNavigationPanelImage();          
            }
            
            @Override
            public void componentMoved(ComponentEvent e) {
              updateNavigationPanelImage();          
            }
          };
        this.navigationPanel.addComponentListener(this.navigationPanelListener);
        // Add the navigation panel to this component to be able to paint it 
        // but show it behind heavyweight canvas 3D
        this.canvas3D.getParent().add(this.navigationPanel);    
      } else {
        this.navigationPanel.removeComponentListener(this.navigationPanelListener);
        if (this.navigationPanel.getParent() != null) {
          this.navigationPanel.getParent().remove(this.navigationPanel);
        }
      }
      revalidate();
      updateNavigationPanelImage();          
      this.canvas3D.repaint();
    }
  }
  
  /**
   * Updates the image of the components that may overlap canvas 3D 
   * (with a Z order smaller than the one of the canvas 3D).
   */
  private void updateNavigationPanelImage() {
    if (this.navigationPanel != null 
        && this.navigationPanel.isVisible()) {
      Rectangle componentBounds = this.navigationPanel.getBounds();
      Rectangle imageSize = new Rectangle(this.canvas3D.getX(), this.canvas3D.getY());
      imageSize.add(componentBounds.x + componentBounds.width, 
          componentBounds.y + componentBounds.height);
      if (!imageSize.isEmpty()) {
        BufferedImage updatedImage = this.navigationPanelImage;
        // Consider that no navigation panel image is available 
        // while it's updated
        this.navigationPanelImage = null;        
        Graphics2D g2D;
        if (updatedImage == null
            || updatedImage.getWidth() != imageSize.width
            || updatedImage.getHeight() != imageSize.height) {
          updatedImage = new BufferedImage(
              imageSize.width, imageSize.height, BufferedImage.TYPE_INT_ARGB);
          g2D = (Graphics2D)updatedImage.getGraphics();
        } else {
          // Clear image
          g2D = (Graphics2D)updatedImage.getGraphics();
          Composite oldComposite = g2D.getComposite();
          g2D.setComposite(AlphaComposite.getInstance(AlphaComposite.CLEAR, 0));
          g2D.fill(new Rectangle2D.Double(0, 0, imageSize.width, imageSize.height));
          g2D.setComposite(oldComposite);
        }
        this.navigationPanel.paintAll(g2D);
        g2D.dispose();
        // Navigation panel image ready to be displayed
        this.navigationPanelImage = updatedImage;
        return;
      }
    }
    this.navigationPanelImage = null;
  }

  /**
   * Returns a new 3D universe that displays <code>home</code> objects.
   */
  private SimpleUniverse createUniverse(boolean displayShadowOnFloor,
                                        boolean listenToHomeUpdates, 
                                        boolean waitForLoading) {
    // Create a universe bound to no canvas 3D
    ViewingPlatform viewingPlatform = new ViewingPlatform();
    // Add an interpolator to view transform to get smooth transition 
    TransformGroup viewPlatformTransform = viewingPlatform.getViewPlatformTransform();
    CameraInterpolator cameraInterpolator = new CameraInterpolator(viewPlatformTransform);
    cameraInterpolator.setSchedulingBounds(new BoundingSphere(new Point3d(), 1E7));
    viewPlatformTransform.addChild(cameraInterpolator);
    viewPlatformTransform.setCapability(TransformGroup.ALLOW_CHILDREN_READ);
    
    Viewer viewer = new Viewer(new Canvas3D [0]);
    SimpleUniverse universe = new SimpleUniverse(viewingPlatform, viewer);
    
    View view = viewer.getView();
    // Update field of view from current camera
    updateView(view, this.home.getCamera(), this.home.getTopCamera() == this.home.getCamera());
    
    // Update point of view from current camera
    updateViewPlatformTransform(viewPlatformTransform, this.home.getCamera(), false);
    
    // Add camera listeners to update later point of view from camera
    if (listenToHomeUpdates) {
      addCameraListeners(view, viewPlatformTransform);
    }
    
    // Link scene matching home to universe
    universe.addBranchGraph(createSceneTree(
        displayShadowOnFloor, listenToHomeUpdates, waitForLoading));
    
    return universe;
  }
  
  /**
   * Remove all listeners bound to home that updates 3D scene objects.
   */
  private void removeHomeListeners() {
    this.home.removePropertyChangeListener(Home.Property.CAMERA, this.homeCameraListener);
    HomeEnvironment homeEnvironment = this.home.getEnvironment();
    homeEnvironment.removePropertyChangeListener(HomeEnvironment.Property.SKY_COLOR, this.skyColorListener);
    homeEnvironment.removePropertyChangeListener(HomeEnvironment.Property.SKY_TEXTURE, this.skyColorListener);
    homeEnvironment.removePropertyChangeListener(HomeEnvironment.Property.GROUND_COLOR, this.groundColorAndTextureListener);
    homeEnvironment.removePropertyChangeListener(HomeEnvironment.Property.GROUND_TEXTURE, this.groundColorAndTextureListener);
    homeEnvironment.removePropertyChangeListener(HomeEnvironment.Property.LIGHT_COLOR, this.lightColorListener);
    homeEnvironment.removePropertyChangeListener(HomeEnvironment.Property.WALLS_ALPHA, this.wallsAlphaListener);
    homeEnvironment.removePropertyChangeListener(HomeEnvironment.Property.DRAWING_MODE, this.drawingModeListener);
    this.home.getCamera().removePropertyChangeListener(this.cameraChangeListener);
    this.home.removeWallsListener(this.wallListener);
    for (Wall wall : this.home.getWalls()) {
      wall.removePropertyChangeListener(this.wallChangeListener);
    }
    this.home.removeFurnitureListener(this.furnitureListener);
    for (HomePieceOfFurniture piece : this.home.getFurniture()) {
      piece.removePropertyChangeListener(this.furnitureChangeListener);
    }
    this.home.removeRoomsListener(this.roomListener);
    for (Room room : this.home.getRooms()) {
      room.removePropertyChangeListener(this.roomChangeListener);
    }
  }

  /**
   * Prints this component to make it fill <code>pageFormat</code> imageable size.
   */
  public int print(Graphics g, PageFormat pageFormat, int pageIndex) {
    if (pageIndex == 0) {     
      // Compute printed image size to render 3D view in 150 dpi
      double printSize = Math.min(pageFormat.getImageableWidth(), 
          pageFormat.getImageableHeight());
      int printedImageSize = (int)(printSize / 72 * 150);
      if (this.printedImage == null 
          || this.printedImage.getWidth() != printedImageSize) {
        try {
          this.printedImage = getOffScreenImage(printedImageSize, printedImageSize);
        } catch (IllegalRenderingStateException ex) {
          // If off screen canvas failed, consider that 3D view page doesn't exist
          return NO_SUCH_PAGE;
        }
      }
  
      Graphics2D g2D = (Graphics2D)g.create();
      // Center the 3D view in component
      g2D.translate(pageFormat.getImageableX() + (pageFormat.getImageableWidth() - printSize) / 2, 
          pageFormat.getImageableY() + (pageFormat.getImageableHeight() - printSize) / 2);
      double scale = printSize / printedImageSize;
      g2D.scale(scale, scale);
      g2D.drawImage(this.printedImage, 0, 0, this);
      g2D.dispose();

      return PAGE_EXISTS;
    } else {
      return NO_SUCH_PAGE;
    }
  }
  
  /**
   * Optimizes this component for the creation of a sequence of multiple off screen images. 
   * Once off screen images are generated with {@link #getOffScreenImage(int, int) getOffScreenImage}, 
   * call {@link #endOffscreenImagesCreation() endOffscreenImagesCreation} method to free resources.
   */
  void startOffscreenImagesCreation() {
    if (this.universe == null) {
      this.universe = createUniverse(this.displayShadowOnFloor, true, true);
    }
  }
  
  /**
   * Returns an image of the home viewed by this component at the given size.
   */
  public BufferedImage getOffScreenImage(int width, int height) {
    SimpleUniverse offScreenImageUniverse = null;
    try {
      View view;
      if (this.universe == null) {
        offScreenImageUniverse = createUniverse(this.displayShadowOnFloor, false, true);
        view = offScreenImageUniverse.getViewer().getView();
      } else {
        view = this.universe.getViewer().getView();
      }
   
      return Component3DManager.getInstance().getOffScreenImage(view, width, height);
    } finally {
      if (offScreenImageUniverse != null) {
        offScreenImageUniverse.cleanup();
      } 
    }
  }
  
  /**
   * Frees unnecessary resources after the creation of a sequence of multiple offscreen images.
   */
  void endOffscreenImagesCreation() {
    if (this.universe != null) {
      this.universe.cleanup();
      removeHomeListeners();
      this.universe = null;
    }
  }
  
  /**
   * Adds listeners to home to update point of view from current camera.
   */
  private void addCameraListeners(final View view, 
                                  final TransformGroup viewPlatformTransform) {
    this.cameraChangeListener = new PropertyChangeListener() {
        public void propertyChange(PropertyChangeEvent ev) {
          // Update view transform later to avoid flickering in case of multiple camera changes 
          EventQueue.invokeLater(new Runnable() {
            public void run() {
              updateView(view, home.getCamera(), home.getTopCamera() == home.getCamera());
              updateViewPlatformTransform(viewPlatformTransform, home.getCamera(), true);
            }
          });
        }
      };
    this.home.getCamera().addPropertyChangeListener(this.cameraChangeListener);
    this.homeCameraListener = new PropertyChangeListener() {
        public void propertyChange(PropertyChangeEvent ev) {
          updateView(view, home.getCamera(), home.getTopCamera() == home.getCamera());
          updateViewPlatformTransform(viewPlatformTransform, home.getCamera(), false);
          // Add camera change listener to new active camera
          ((Camera)ev.getOldValue()).removePropertyChangeListener(cameraChangeListener);
          home.getCamera().addPropertyChangeListener(cameraChangeListener);
        }
      };
    this.home.addPropertyChangeListener(Home.Property.CAMERA, this.homeCameraListener);
  }

  /**
   * Updates <code>view</code> from <code>camera</code> field of view.
   */
  private void updateView(View view, Camera camera, boolean topCamera) {
    float fieldOfView = camera.getFieldOfView();
    if (fieldOfView == 0) {
      fieldOfView = (float)(Math.PI * 63 / 180);
    }
    view.setFieldOfView(fieldOfView);
    double frontClipDistance;
    // Use a variable front clip distance for camera 
    // depending on the elevation (at an elevation higher than 3 m
    // back clip distance must be greater than 6000 or a black zone appears 
    // at the horizon in off screen images)
    if (topCamera) {
      frontClipDistance = 5;
      if (camera.getZ() > 750) {
        frontClipDistance += (camera.getZ() - 750) / 150;
      }
    } else {
      frontClipDistance = 2;
      if (camera.getZ() > 300) {
        frontClipDistance += (camera.getZ() - 300) / 150;
      }
    }
    // Update front and back clip distance to ensure their ratio is less than 3000
    view.setFrontClipDistance(frontClipDistance);
    view.setBackClipDistance(frontClipDistance * 3000);
    clearPrintedImageCache();
  }

  /**
   * Frees printed image kept in cache.
   */
  private void clearPrintedImageCache() {
    this.printedImage = null;
  }
  
  /**
   * Updates <code>viewPlatformTransform</code> transform from <code>camera</code> angles and location.
   */
  private void updateViewPlatformTransform(TransformGroup viewPlatformTransform, 
                                           Camera camera, boolean updateWithAnimation) {
    if (updateWithAnimation) {
      // Get the camera interpolator
      CameraInterpolator cameraInterpolator = 
          (CameraInterpolator)viewPlatformTransform.getChild(viewPlatformTransform.numChildren() - 1);
      cameraInterpolator.moveCamera(camera);
    } else {
      Transform3D transform = new Transform3D();
      updateViewPlatformTransform(transform, camera.getX(), camera.getY(), 
          camera.getZ(), camera.getYaw(), camera.getPitch());
      viewPlatformTransform.setTransform(transform);
    }
    clearPrintedImageCache();
  }

  /**
   * An interpolator that computes smooth camera moves. 
   */
  private class CameraInterpolator extends TransformInterpolator {
    private final ScheduledExecutorService scheduledExecutor;
    private Camera initialCamera;
    private Camera finalCamera;
    
    public CameraInterpolator(TransformGroup transformGroup) {
      this.scheduledExecutor = Executors.newSingleThreadScheduledExecutor();
      setTarget(transformGroup);
    }
    
    /**
     * Moves the camera to a new location.
     */
    public void moveCamera(Camera finalCamera) {
      if (this.finalCamera == null
          || this.finalCamera.getX() != finalCamera.getX()
          || this.finalCamera.getY() != finalCamera.getY()
          || this.finalCamera.getZ() != finalCamera.getZ()
          || this.finalCamera.getYaw() != finalCamera.getYaw()
          || this.finalCamera.getPitch() != finalCamera.getPitch()) {
        synchronized (this) {
          Alpha alpha = getAlpha();
          if (alpha == null || alpha.finished()) {
            this.initialCamera = new Camera(camera.getX(), camera.getY(), camera.getZ(), 
                camera.getYaw(), camera.getPitch(), camera.getFieldOfView());
          } else if (alpha.value() < 0.3) {
            Transform3D finalTransformation = new Transform3D();
            // Jump directly to final location
            updateViewPlatformTransform(finalTransformation, this.finalCamera.getX(), this.finalCamera.getY(), this.finalCamera.getZ(), 
                this.finalCamera.getYaw(), this.finalCamera.getPitch());
            getTarget().setTransform(finalTransformation);
            this.initialCamera = this.finalCamera;
          } else {
            // Compute initial location from current alpha value 
            this.initialCamera = new Camera(this.initialCamera.getX() + (this.finalCamera.getX() - this.initialCamera.getX()) * alpha.value(), 
                this.initialCamera.getY() + (this.finalCamera.getY() - this.initialCamera.getY()) * alpha.value(), 
                this.initialCamera.getZ() + (this.finalCamera.getZ() - this.initialCamera.getZ()) * alpha.value(),
                this.initialCamera.getYaw() + (this.finalCamera.getYaw() - this.initialCamera.getYaw()) * alpha.value(), 
                this.initialCamera.getPitch() + (this.finalCamera.getPitch() - this.initialCamera.getPitch()) * alpha.value(), 
                finalCamera.getFieldOfView());
          }
          this.finalCamera = new Camera(finalCamera.getX(), finalCamera.getY(), finalCamera.getZ(), 
              finalCamera.getYaw(), finalCamera.getPitch(), finalCamera.getFieldOfView());
          
          // Create an animation that will interpolate camera location 
          // between initial camera and final camera in 150 ms
          if (alpha == null) {
            alpha = new Alpha(1, 150);
            setAlpha(alpha);
          }
          // Start animation now
          alpha.setStartTime(System.currentTimeMillis());
          // In case system is overloaded computeTransform won't be called
          // ensure final location will always be set after 150 ms
          this.scheduledExecutor.schedule(new Runnable() {
              public void run() {
                if (getAlpha().value() == 1) {
                  Transform3D transform = new Transform3D();
                  computeTransform(1, transform);
                  getTarget().setTransform(transform);
                }
              }
            }, 150, TimeUnit.MILLISECONDS);
        }
      } 
    }
    
    @Override
    public synchronized void computeTransform(float alpha, Transform3D transform) {
      updateViewPlatformTransform(transform, 
          this.initialCamera.getX() + (this.finalCamera.getX() - this.initialCamera.getX()) * alpha, 
          this.initialCamera.getY() + (this.finalCamera.getY() - this.initialCamera.getY()) * alpha, 
          this.initialCamera.getZ() + (this.finalCamera.getZ() - this.initialCamera.getZ()) * alpha, 
          this.initialCamera.getYaw() + (this.finalCamera.getYaw() - this.initialCamera.getYaw()) * alpha, 
          this.initialCamera.getPitch() + (this.finalCamera.getPitch() - this.initialCamera.getPitch()) * alpha);
    }
  }
  
  /**
   * Updates <code>viewPlatformTransform</code> transform from camera angles and location.
   */
  private void updateViewPlatformTransform(Transform3D transform, 
                                           float cameraX, float cameraY, float cameraZ, 
                                           float cameraYaw, float cameraPitch) {
    Transform3D yawRotation = new Transform3D();
    yawRotation.rotY(-cameraYaw + Math.PI);
    
    Transform3D pitchRotation = new Transform3D();
    pitchRotation.rotX(-cameraPitch);
    yawRotation.mul(pitchRotation);
    
    transform.setIdentity();
    transform.setTranslation(new Vector3f(cameraX, cameraZ, cameraY));
    transform.mul(yawRotation);
    
    this.camera = new Camera(cameraX, cameraY, cameraZ, cameraYaw, cameraPitch, 0);
  }

  /**
   * Adds AWT mouse listeners to <code>canvas3D</code> that calls back <code>controller</code> methods.  
   */
  private void addMouseListeners(final HomeController3D controller, final Component canvas3D) {
    MouseInputAdapter mouseListener = new MouseInputAdapter() {
        private int        xLastMouseMove;
        private int        yLastMouseMove;
        private Component  grabComponent;
        private Component  previousMouseEventTarget;
        
        @Override
        public void mousePressed(MouseEvent ev) {
          if (!retargetMouseEventToNavigationPanelChildren(ev)) {
            if (ev.isPopupTrigger()) {
              mouseReleased(ev);
            } else if (isEnabled()) {
              requestFocusInWindow();
              this.xLastMouseMove = ev.getX();
              this.yLastMouseMove = ev.getY();
            }
          }
        }
  
        @Override
        public void mouseReleased(MouseEvent ev) {
          if (!retargetMouseEventToNavigationPanelChildren(ev)) {
            if (ev.isPopupTrigger()) {
              JPopupMenu componentPopupMenu = getComponentPopupMenu();
              if (componentPopupMenu != null) {
                componentPopupMenu.show(HomeComponent3D.this, ev.getX(), ev.getY());
              }
            }
          }
        }

        @Override
        public void mouseClicked(MouseEvent ev) {
          retargetMouseEventToNavigationPanelChildren(ev);
        }
        
        @Override
        public void mouseMoved(MouseEvent ev) {
          retargetMouseEventToNavigationPanelChildren(ev);
        }
        
        @Override
        public void mouseDragged(MouseEvent ev) {
          if (!retargetMouseEventToNavigationPanelChildren(ev)) {
            if (isEnabled()) {
              if (ev.isAltDown()) {
                // Mouse move along Y axis while alt is down changes camera location
                float delta = 0.5f * (this.yLastMouseMove - ev.getY());
                // Multiply delta by 10 if shift isn't down
                if (!ev.isShiftDown()) {
                  delta *= 10;
                } 
                controller.moveCamera(delta);
              } else {
                final float ANGLE_FACTOR = 0.005f;
                // Mouse move along X axis changes camera yaw 
                float yawDelta = ANGLE_FACTOR * (ev.getX() - this.xLastMouseMove);
                // Multiply yaw delta by 10 if shift isn't down
                if (!ev.isShiftDown()) {
                  yawDelta *= 10;
                } 
                controller.rotateCameraYaw(yawDelta);
                
                // Mouse move along Y axis changes camera pitch 
                float pitchDelta = ANGLE_FACTOR * (ev.getY() - this.yLastMouseMove);
                controller.rotateCameraPitch(pitchDelta);
              }
              
              this.xLastMouseMove = ev.getX();
              this.yLastMouseMove = ev.getY();
            }
          }
        }
        
        /**
         * Retargets to the first component of navigation panel able to manage the given event 
         * and returns <code>true</code> if a component consumed the event 
         * or needs to be repainted (meaning its state changed).
         * This implementation doesn't cover all the possible cases (mouseEntered and mouseExited
         * events are managed only during mouseDragged event).
         */
        private boolean retargetMouseEventToNavigationPanelChildren(MouseEvent ev) {
          if (navigationPanel != null 
              && navigationPanel.isVisible()) {
            if (this.grabComponent != null
                && (ev.getID() == MouseEvent.MOUSE_RELEASED
                    || ev.getID() == MouseEvent.MOUSE_DRAGGED)) {
              Point point = SwingUtilities.convertPoint(ev.getComponent(), ev.getPoint(), this.grabComponent);
              dispatchRetargetedEvent(deriveEvent(ev, this.grabComponent, ev.getID(), point.x, point.y));
              if (ev.getID() == MouseEvent.MOUSE_RELEASED) {
                this.grabComponent = null;
              } else {
                if (this.previousMouseEventTarget == null
                    && this.grabComponent.contains(point)) {
                  dispatchRetargetedEvent(deriveEvent(ev, this.grabComponent, MouseEvent.MOUSE_ENTERED, point.x, point.y));
                  this.previousMouseEventTarget = this.grabComponent;
                } else if (this.previousMouseEventTarget != null
                    && !this.grabComponent.contains(point)) { 
                  dispatchRetargetedEvent(deriveEvent(ev, this.grabComponent, MouseEvent.MOUSE_EXITED, point.x, point.y));
                  this.previousMouseEventTarget = null;
                }
              }
              return true;
            } else {                
              Component mouseEventTarget = retargetMouseEvent(navigationPanel, ev);
              if (mouseEventTarget != null) {
                this.previousMouseEventTarget = mouseEventTarget;
                return true;
              }
            }
          }
          return false;
        }
        
        private Component retargetMouseEvent(Component component, MouseEvent ev) {
          if (component.getBounds().contains(ev.getPoint())) {
            if (component instanceof Container) {
              Container container = (Container)component;
              for (int i = container.getComponentCount() - 1; i >= 0; i--) {
                Component c = container.getComponent(i);
                MouseEvent retargetedEvent = deriveEvent(ev, component, ev.getID(), 
                    ev.getX() - component.getX(), ev.getY() - component.getY());
                Component mouseEventTarget = retargetMouseEvent(c, retargetedEvent);
                if (mouseEventTarget != null) {
                  return mouseEventTarget;
                }
              }
            }
            int newX = ev.getX() - component.getX();
            int newY = ev.getY() - component.getY();
            if (dispatchRetargetedEvent(deriveEvent(ev, component, ev.getID(), newX, newY))) {              
              if (ev.getID() == MouseEvent.MOUSE_PRESSED) {
                this.grabComponent = component;
              }  
              return component;
            } 
          } 
          return null;
        }
        
        /**
         * Dispatches the given event to its component and returns <code>true</code> if component needs to be redrawn.
         */
        private boolean dispatchRetargetedEvent(MouseEvent ev) {
          ev.getComponent().dispatchEvent(ev);
          if (!RepaintManager.currentManager(ev.getComponent()).getDirtyRegion((JComponent)ev.getComponent()).isEmpty()) {
            updateNavigationPanelImage();
            canvas3D.repaint();
            return true;
          }
          return false;
        }
        
        /**
         * Returns a new <code>MouseEvent</code> derived from the one given in parameter.
         */
        private MouseEvent deriveEvent(MouseEvent ev, Component component, int id, int x, int y) {
          return new MouseEvent(component, id, ev.getWhen(), 
              ev.getModifiersEx() | ev.getModifiers(), x, y, 
              ev.getClickCount(), ev.isPopupTrigger(), ev.getButton());
        }
      };
    MouseWheelListener mouseWheelListener = new MouseWheelListener() {
        public void mouseWheelMoved(MouseWheelEvent ev) {
          if (isEnabled()) {
            // Mouse wheel changes camera location 
            float delta = -ev.getWheelRotation();
            // Multiply delta by 10 if shift isn't down
            if (!ev.isShiftDown()) {
              delta *= 10;
            } 
            controller.moveCamera(delta);
          }
        }
      };
    
    canvas3D.addMouseListener(mouseListener);
    canvas3D.addMouseMotionListener(mouseListener);
    canvas3D.addMouseWheelListener(mouseWheelListener);
    // Add a mouse listener to this component to request focus in case user clicks in component border
    this.addMouseListener(new MouseInputAdapter() {
        @Override
        public void mousePressed(MouseEvent e) {
          requestFocusInWindow();
        }
      });
  }

  /**
   * Installs keys bound to actions. 
   */
  private void installKeyboardActions() {
    InputMap inputMap = getInputMap(WHEN_FOCUSED);
    inputMap.put(KeyStroke.getKeyStroke("shift UP"), ActionType.MOVE_CAMERA_FORWARD);
    inputMap.put(KeyStroke.getKeyStroke("shift W"), ActionType.MOVE_CAMERA_FORWARD);
    inputMap.put(KeyStroke.getKeyStroke("UP"), ActionType.MOVE_CAMERA_FAST_FORWARD);
    inputMap.put(KeyStroke.getKeyStroke("W"), ActionType.MOVE_CAMERA_FAST_FORWARD);
    inputMap.put(KeyStroke.getKeyStroke("shift DOWN"), ActionType.MOVE_CAMERA_BACKWARD);
    inputMap.put(KeyStroke.getKeyStroke("shift S"), ActionType.MOVE_CAMERA_BACKWARD);
    inputMap.put(KeyStroke.getKeyStroke("DOWN"), ActionType.MOVE_CAMERA_FAST_BACKWARD);
    inputMap.put(KeyStroke.getKeyStroke("S"), ActionType.MOVE_CAMERA_FAST_BACKWARD);
    inputMap.put(KeyStroke.getKeyStroke("shift LEFT"), ActionType.ROTATE_CAMERA_YAW_LEFT);
    inputMap.put(KeyStroke.getKeyStroke("shift A"), ActionType.ROTATE_CAMERA_YAW_LEFT);
    inputMap.put(KeyStroke.getKeyStroke("LEFT"), ActionType.ROTATE_CAMERA_YAW_FAST_LEFT);
    inputMap.put(KeyStroke.getKeyStroke("A"), ActionType.ROTATE_CAMERA_YAW_FAST_LEFT);
    inputMap.put(KeyStroke.getKeyStroke("shift RIGHT"), ActionType.ROTATE_CAMERA_YAW_RIGHT);
    inputMap.put(KeyStroke.getKeyStroke("shift D"), ActionType.ROTATE_CAMERA_YAW_RIGHT);
    inputMap.put(KeyStroke.getKeyStroke("RIGHT"), ActionType.ROTATE_CAMERA_YAW_FAST_RIGHT);
    inputMap.put(KeyStroke.getKeyStroke("D"), ActionType.ROTATE_CAMERA_YAW_FAST_RIGHT);
    inputMap.put(KeyStroke.getKeyStroke("PAGE_UP"), ActionType.ROTATE_CAMERA_PITCH_UP);
    inputMap.put(KeyStroke.getKeyStroke("PAGE_DOWN"), ActionType.ROTATE_CAMERA_PITCH_DOWN);
    inputMap.put(KeyStroke.getKeyStroke("HOME"), ActionType.ELEVATE_CAMERA_UP);
    inputMap.put(KeyStroke.getKeyStroke("END"), ActionType.ELEVATE_CAMERA_DOWN);
  }
 
  /**
   * Creates actions that calls back <code>controller</code> methods.  
   */
  private void createActions(final HomeController3D controller) {
    // Move camera action mapped to arrow keys 
    class MoveCameraAction extends AbstractAction {
      private final int delta;
      
      public MoveCameraAction(int delta) {
        this.delta = delta;
      }

      public void actionPerformed(ActionEvent e) {
        controller.moveCamera(this.delta);
      }
    }
    // Elevate camera action mapped to arrow keys 
    class ElevateCameraAction extends AbstractAction {
      private final float delta;
      
      public ElevateCameraAction(float delta) {
        this.delta = delta;
      }

      public void actionPerformed(ActionEvent e) {
        controller.elevateCamera(this.delta);
      }
    }
    // Rotate camera yaw action mapped to arrow keys 
    class RotateCameraYawAction extends AbstractAction {
      private final float delta;
      
      public RotateCameraYawAction(float delta) {
        this.delta = delta;
      }

      public void actionPerformed(ActionEvent e) {
        controller.rotateCameraYaw(this.delta);
      }
    }
    // Rotate camera pitch action mapped to arrow keys 
    class RotateCameraPitchAction extends AbstractAction {
      private final float delta;
      
      public RotateCameraPitchAction(float delta) {
        this.delta = delta;
      }

      public void actionPerformed(ActionEvent e) {
        controller.rotateCameraPitch(this.delta);
      }
    }
    ActionMap actionMap = getActionMap();
    actionMap.put(ActionType.MOVE_CAMERA_FORWARD, new MoveCameraAction(1));
    actionMap.put(ActionType.MOVE_CAMERA_FAST_FORWARD, new MoveCameraAction(10));
    actionMap.put(ActionType.MOVE_CAMERA_BACKWARD, new MoveCameraAction(-1));
    actionMap.put(ActionType.MOVE_CAMERA_FAST_BACKWARD, new MoveCameraAction(-10));
    actionMap.put(ActionType.ELEVATE_CAMERA_DOWN, new ElevateCameraAction(-2.5f));
    actionMap.put(ActionType.ELEVATE_CAMERA_UP, new ElevateCameraAction(2.5f));
    actionMap.put(ActionType.ROTATE_CAMERA_YAW_LEFT, new RotateCameraYawAction(-(float)Math.PI / 180));
    actionMap.put(ActionType.ROTATE_CAMERA_YAW_FAST_LEFT, new RotateCameraYawAction(-(float)Math.PI / 18));
    actionMap.put(ActionType.ROTATE_CAMERA_YAW_RIGHT, new RotateCameraYawAction((float)Math.PI / 180));
    actionMap.put(ActionType.ROTATE_CAMERA_YAW_FAST_RIGHT, new RotateCameraYawAction((float)Math.PI / 18));
    actionMap.put(ActionType.ROTATE_CAMERA_PITCH_UP, new RotateCameraPitchAction(-(float)Math.PI / 180));
    actionMap.put(ActionType.ROTATE_CAMERA_PITCH_DOWN, new RotateCameraPitchAction((float)Math.PI / 180));
  }

  /**
   * Returns a new scene tree root.
   */
  private BranchGroup createSceneTree(boolean displayShadowOnFloor,
                                      boolean listenToHomeUpdates, 
                                      boolean waitForLoading) {
    BranchGroup root = new BranchGroup();

    // Build scene tree
    root.addChild(createBackgroundNode(listenToHomeUpdates));
    
    Group groundAndRoomsGroup = createExtensibleGroup(true);
    // Add first ground then home rooms to an ordered group to ensure ground is always drawn behind floors   
    groundAndRoomsGroup.addChild(createGroundNode(-1E5f / 2, -1E5f / 2, 1E5f, 1E5f, listenToHomeUpdates, waitForLoading));
    for (Room room : this.home.getRooms()) {
      addObject(groundAndRoomsGroup, room, waitForLoading);
    }    
    root.addChild(groundAndRoomsGroup);
    
    Group wallsAndFurnitureGroup = createExtensibleGroup(false);
    // Add walls and pieces already available in a normal group 
    // (transparent shapes don't work well in ordered groups) 
    for (Wall wall : this.home.getWalls()) {
      addObject(wallsAndFurnitureGroup, wall, waitForLoading);
    }
    for (HomePieceOfFurniture piece : this.home.getFurniture()) {
      addObject(wallsAndFurnitureGroup, piece, waitForLoading);
    }
    if (displayShadowOnFloor) {
      addShadowOnFloor(groundAndRoomsGroup);
    }
    root.addChild(wallsAndFurnitureGroup);
    
    // Add default lights
    for (Light light : createLights(listenToHomeUpdates)) {
      root.addChild(light);
    }
    
    if (listenToHomeUpdates) {
      // Add wall, furniture, room listeners to home for further update    
      addWallListener(wallsAndFurnitureGroup);
      addFurnitureListener(wallsAndFurnitureGroup);
      addRoomListener(groundAndRoomsGroup, 1);
      // Add environment listeners
      addEnvironmentListeners();
      // Should update shadow on floor too but in the facts 
      // User Interface doesn't propose to modify the furniture of a home
      // that displays shadow on floor yet
    }

    return root;
  }

  /**
   * Returns a new background node.  
   */
  private Node createBackgroundNode(boolean listenToHomeUpdates) {
    final Appearance backgroundAppearance = new Appearance();
    ColoringAttributes backgroundColoringAttributes = new ColoringAttributes();
    backgroundAppearance.setColoringAttributes(backgroundColoringAttributes);
    // Allow background color and texture to change
    backgroundAppearance.setCapability(Appearance.ALLOW_TEXTURE_WRITE);
    backgroundAppearance.setCapability(Appearance.ALLOW_COLORING_ATTRIBUTES_READ);
    backgroundColoringAttributes.setCapability(ColoringAttributes.ALLOW_COLOR_WRITE);
    
    Geometry halfSphereGeometry = createHalfSphereGeometry();   
    final Shape3D halfSphere = new Shape3D(halfSphereGeometry, backgroundAppearance);
    BranchGroup backgroundBranch = new BranchGroup();
    backgroundBranch.addChild(halfSphere);
    
    final Background background = new Background(backgroundBranch);
    updateBackgroundColorAndTexture(backgroundAppearance, this.home);
    background.setImageScaleMode(Background.SCALE_FIT_ALL);
    background.setApplicationBounds(new BoundingBox(
        new Point3d(-1E6, -1E6, -1E6), 
        new Point3d(1E6, 1E6, 1E6)));    
    
    if (listenToHomeUpdates) {
      // Add a listener on sky color and texture properties change 
      this.skyColorListener = new PropertyChangeListener() {
          public void propertyChange(PropertyChangeEvent ev) {
            updateBackgroundColorAndTexture(backgroundAppearance, home);
          }
        };
      this.home.getEnvironment().addPropertyChangeListener(
          HomeEnvironment.Property.SKY_COLOR, this.skyColorListener);
      this.home.getEnvironment().addPropertyChangeListener(
          HomeEnvironment.Property.SKY_TEXTURE, this.skyColorListener);
    }
    return background;
  }

  /**
   * Returns a half sphere oriented inward and with texture ordinates 
   * that spread along an hemisphere. 
   */
  private Geometry createHalfSphereGeometry() {
    final int divisionCount = 48; 
    Point3f [] coords = new Point3f [divisionCount * divisionCount];
    TexCoord2f [] textureCoords = new TexCoord2f [divisionCount * divisionCount];
    for (int i = 0, k = 0; i < divisionCount; i++) {
      double alpha = i * 2 * Math.PI / divisionCount;
      float cosAlpha = (float)Math.cos(alpha);
      float sinAlpha = (float)Math.sin(alpha);
      double nextAlpha = (i  + 1) * 2 * Math.PI / divisionCount;
      float cosNextAlpha = (float)Math.cos(nextAlpha);
      float sinNextAlpha = (float)Math.sin(nextAlpha);
      for (int j = 0; j < divisionCount / 4; j++) {
        double beta = 2 * j * Math.PI / divisionCount;
        float cosBeta = (float)Math.cos(beta);
        float sinBeta = (float)Math.sin(beta);
        // Correct the bottom of the hemisphere to avoid seeing a black line at the horizon
        float y = j != 0 ? sinBeta : -0.05f;
        double nextBeta = 2 * (j + 1) * Math.PI / divisionCount;
        float cosNextBeta = (float)Math.cos(nextBeta);
        float sinNextBeta = (float)Math.sin(nextBeta);
        coords [k] = new Point3f(cosAlpha * cosBeta, y, sinAlpha * cosBeta);
        textureCoords [k++] = new TexCoord2f((float)i / divisionCount, sinBeta); 
        
        coords [k] = new Point3f(cosNextAlpha * cosBeta, y, sinNextAlpha * cosBeta);
        textureCoords [k++] = new TexCoord2f((float)(i + 1) / divisionCount, sinBeta); 
        
        coords [k] = new Point3f(cosNextAlpha * cosNextBeta, sinNextBeta, sinNextAlpha * cosNextBeta);
        textureCoords [k++] = new TexCoord2f((float)(i + 1) / divisionCount, sinNextBeta); 
        
        coords [k] = new Point3f(cosAlpha * cosNextBeta, sinNextBeta, sinAlpha * cosNextBeta);
        textureCoords [k++] = new TexCoord2f((float)i / divisionCount, sinNextBeta); 
      }
    }
    
    GeometryInfo geometryInfo = new GeometryInfo(GeometryInfo.QUAD_ARRAY);
    geometryInfo.setCoordinates(coords);
    geometryInfo.setTextureCoordinateParams(1, 2);
    geometryInfo.setTextureCoordinates(0, textureCoords);
    geometryInfo.indexify();
    geometryInfo.compact();
    Geometry halfSphereGeometry = geometryInfo.getIndexedGeometryArray();
    return halfSphereGeometry;
  }

  /**
   * Updates<code>backgroundAppearance</code> color and texture from <code>home</code> sky color and texture.
   */
  private void updateBackgroundColorAndTexture(final Appearance backgroundAppearance, Home home) {
    Color3f skyColor = new Color3f(new Color(home.getEnvironment().getSkyColor()));
    backgroundAppearance.getColoringAttributes().setColor(skyColor);
    HomeTexture skyTexture = home.getEnvironment().getSkyTexture();
    if (skyTexture != null) {
      final TextureManager imageManager = TextureManager.getInstance();
      imageManager.loadTexture(skyTexture.getImage(), 
          new TextureManager.TextureObserver() {
              public void textureUpdated(Texture texture) {
                backgroundAppearance.setTexture(texture);
              }
            });
    } else {
      backgroundAppearance.setTexture(null);
    }

    clearPrintedImageCache();
  }
  
  /**
   * Returns a new ground node.  
   */
  private Node createGroundNode(final float groundOriginX,
                                final float groundOriginY,
                                final float groundWidth,
                                final float groundDepth, 
                                boolean listenToHomeUpdates,
                                boolean waitForLoading) {
    final Ground3D ground3D = new Ground3D(this.home, 
        groundOriginX, groundOriginY, groundWidth, groundDepth, waitForLoading);
    Transform3D translation = new Transform3D();
    translation.setTranslation(new Vector3f(0, -0.2f, 0));
    TransformGroup transformGroup = new TransformGroup(translation);
    transformGroup.addChild(ground3D);
    
    if (listenToHomeUpdates) {
      // Add a listener on ground color and texture properties change 
      this.groundColorAndTextureListener = new PropertyChangeListener() {
          public void propertyChange(PropertyChangeEvent ev) {
            ground3D.update();
            clearPrintedImageCache();
          }
        };
      HomeEnvironment homeEnvironment = this.home.getEnvironment();
      homeEnvironment.addPropertyChangeListener(
          HomeEnvironment.Property.GROUND_COLOR, this.groundColorAndTextureListener); 
      homeEnvironment.addPropertyChangeListener(
          HomeEnvironment.Property.GROUND_TEXTURE, this.groundColorAndTextureListener);
    }
    
    return transformGroup;
  }
  
  /**
   * Returns the lights of the scene.
   */
  private Light [] createLights(boolean listenToHomeUpdates) {
    final Light [] lights = {
        new DirectionalLight(new Color3f(1, 1, 1), new Vector3f(1.5f, -0.8f, -1)),         
        new DirectionalLight(new Color3f(1, 1, 1), new Vector3f(-1.5f, -0.8f, -1)), 
        new DirectionalLight(new Color3f(1, 1, 1), new Vector3f(0, -0.8f, 1)), 
        new DirectionalLight(new Color3f(0.7f, 0.7f, 0.7f), new Vector3f(0, 1f, 0)), 
        new AmbientLight(new Color3f(0.2f, 0.2f, 0.2f))}; 
    for (int i = 0; i < lights.length - 1; i++) {
      // Allow directional lights color to change
      lights [i].setCapability(DirectionalLight.ALLOW_COLOR_WRITE);
      // Store default color in user data
      Color3f defaultColor = new Color3f();
      lights [i].getColor(defaultColor);
      lights [i].setUserData(defaultColor);
      updateLightColor(lights [i]);
    }
    
    for (Light light : lights) {
      light.setInfluencingBounds(new BoundingSphere(new Point3d(), 1E7));
    }
    
    if (listenToHomeUpdates) {
      // Add a listener on light color property change to home
      this.lightColorListener = new PropertyChangeListener() {
          public void propertyChange(PropertyChangeEvent ev) {
            for (int i = 0; i < lights.length - 1; i++) {
              updateLightColor(lights [i]);
            }
          }
        };
      this.home.getEnvironment().addPropertyChangeListener(
          HomeEnvironment.Property.LIGHT_COLOR, this.lightColorListener);
    }
    
    return lights;
  }

  /**
   * Updates<code>light</code> color from <code>home</code> light color.
   */
  private void updateLightColor(Light light) {
    Color3f defaultColor = (Color3f)light.getUserData();
    int lightColor = this.home.getEnvironment().getLightColor();
    light.setColor(new Color3f(((lightColor >>> 16) & 0xFF) / 256f * defaultColor.x,
                                ((lightColor >>> 8) & 0xFF) / 256f * defaultColor.y,
                                        (lightColor & 0xFF) / 256f * defaultColor.z));
    clearPrintedImageCache();
  }
  /**
   * Returns a new extensible group.  
   */
  private Group createExtensibleGroup(boolean ordered) {
    Group homeGroup = ordered
        ? new OrderedGroup()
        : new Group();    
    //  Allow group to have new children
    homeGroup.setCapability(Group.ALLOW_CHILDREN_WRITE);
    homeGroup.setCapability(Group.ALLOW_CHILDREN_EXTEND);
    return homeGroup;
  }

  /**
   * Adds a wall listener to home walls that updates the children of the given 
   * <code>group</code>, each time a wall is added, updated or deleted. 
   */
  private void addWallListener(final Group group) {
    this.wallChangeListener = new PropertyChangeListener() {
        public void propertyChange(PropertyChangeEvent ev) {
          updateWall((Wall)ev.getSource());          
          updateObjects(home.getRooms());
        }
      };
    for (Wall wall : this.home.getWalls()) {
      wall.addPropertyChangeListener(this.wallChangeListener);
    }      
    this.wallListener = new CollectionListener<Wall>() {
        public void collectionChanged(CollectionEvent<Wall> ev) {
          Wall wall = ev.getItem();
          switch (ev.getType()) {
            case ADD :
              addObject(group, wall, false);
              wall.addPropertyChangeListener(wallChangeListener);
              break;
            case DELETE :
              deleteObject(wall);
              wall.removePropertyChangeListener(wallChangeListener);
              break;
          }
          updateObjects(home.getRooms());
        }
      };
    this.home.addWallsListener(this.wallListener);
  }

  /**
   * Adds a furniture listener to home that updates the children of the given <code>group</code>, 
   * each time a piece of furniture is added, updated or deleted. 
   */
  private void addFurnitureListener(final Group group) {
    this.furnitureChangeListener = new PropertyChangeListener() {
        public void propertyChange(PropertyChangeEvent ev) {
        if (HomePieceOfFurniture.Property.X.name().equals(ev.getPropertyName())
            || HomePieceOfFurniture.Property.X.name().equals(ev.getPropertyName())
            || HomePieceOfFurniture.Property.Y.name().equals(ev.getPropertyName())
            || HomePieceOfFurniture.Property.ANGLE.name().equals(ev.getPropertyName())
            || HomePieceOfFurniture.Property.WIDTH.name().equals(ev.getPropertyName())
            || HomePieceOfFurniture.Property.DEPTH.name().equals(ev.getPropertyName())
            || HomePieceOfFurniture.Property.HEIGHT.name().equals(ev.getPropertyName())
            || HomePieceOfFurniture.Property.ELEVATION.name().equals(ev.getPropertyName())
            || HomePieceOfFurniture.Property.COLOR.name().equals(ev.getPropertyName())
            || HomePieceOfFurniture.Property.TEXTURE.name().equals(ev.getPropertyName())
            || HomePieceOfFurniture.Property.MODEL_MIRRORED.name().equals(ev.getPropertyName())
            || HomePieceOfFurniture.Property.VISIBLE.name().equals(ev.getPropertyName())) {
              HomePieceOfFurniture piece = (HomePieceOfFurniture)ev.getSource();
              updateObjects(Arrays.asList(new HomePieceOfFurniture [] {piece}));
              // If piece is or contains a door or a window, update walls that intersect with piece
              if (containsDoorsAndWindows(piece)) {
                updateObjects(home.getWalls());
              }
          }
        }
      };
    for (HomePieceOfFurniture piece : this.home.getFurniture()) {
      piece.addPropertyChangeListener(this.furnitureChangeListener);
    }      
    this.furnitureListener = new CollectionListener<HomePieceOfFurniture>() {
        public void collectionChanged(CollectionEvent<HomePieceOfFurniture> ev) {
          HomePieceOfFurniture piece = (HomePieceOfFurniture)ev.getItem();
          switch (ev.getType()) {
            case ADD :
              addObject(group, piece, false);
              piece.addPropertyChangeListener(furnitureChangeListener);
              break;
            case DELETE :
              deleteObject(piece);
              piece.removePropertyChangeListener(furnitureChangeListener);
              break;
          }
          // If piece is or contains a door or a window, update walls that intersect with piece
          if (containsDoorsAndWindows(piece)) {
            updateObjects(home.getWalls());
          }
        }
      };
    this.home.addFurnitureListener(this.furnitureListener);
  }

  /**
   * Returns <code>true</code> if the given <code>piece</code> is or contains a door or window.  
   */
  private boolean containsDoorsAndWindows(HomePieceOfFurniture piece) {
    if (piece instanceof HomeFurnitureGroup) {
      for (HomePieceOfFurniture groupPiece : ((HomeFurnitureGroup)piece).getFurniture()) {
        if (containsDoorsAndWindows(groupPiece)) {
          return true;
        }
      }
      return false;
    } else {
      return piece.isDoorOrWindow();
    }
  }
  
  /**
   * Adds a room listener to home rooms that updates the children of the given 
   * <code>group</code>, each time a room is added, updated or deleted. 
   */
  private void addRoomListener(final Group group, final int indexOffset) {
    this.roomChangeListener = new PropertyChangeListener() {
        public void propertyChange(PropertyChangeEvent ev) {
          updateObjects(Arrays.asList(new Room [] {(Room)ev.getSource()}));
          groundColorAndTextureListener.propertyChange(null);
        }
      };
    for (Room room : this.home.getRooms()) {
      room.addPropertyChangeListener(this.roomChangeListener);
    }      
    this.roomListener = new CollectionListener<Room>() {
        public void collectionChanged(CollectionEvent<Room> ev) {
          Room room = ev.getItem();
          switch (ev.getType()) {
            case ADD :
              // Add room to its group at the index indicated by the event 
              // to ensure the 3D rooms are drawn in the same order as in the plan  
              addObject(group, room, ev.getIndex() + indexOffset, false);
              room.addPropertyChangeListener(roomChangeListener);
              break;
            case DELETE :
              deleteObject(room);
              room.removePropertyChangeListener(roomChangeListener);
              break;
          }
          groundColorAndTextureListener.propertyChange(null);
        }
      };
    this.home.addRoomsListener(this.roomListener);
  }

  /**
   * Adds a walls alpha change listener and drawing mode change listener to home 
   * environment that updates the home scene objects appearance. 
   */
  private void addEnvironmentListeners() {
    this.wallsAlphaListener = new PropertyChangeListener() {
        public void propertyChange(PropertyChangeEvent ev) {
          updateObjects(home.getWalls());
        }
      };
    this.home.getEnvironment().addPropertyChangeListener(
        HomeEnvironment.Property.WALLS_ALPHA, this.wallsAlphaListener); 
    this.drawingModeListener = new PropertyChangeListener() {
        public void propertyChange(PropertyChangeEvent ev) {
          updateObjects(home.getWalls());
          updateObjects(home.getFurniture());
        }
      };
    this.home.getEnvironment().addPropertyChangeListener(
        HomeEnvironment.Property.DRAWING_MODE, this.drawingModeListener); 
  }

  /**
   * Adds to <code>group</code> a branch matching <code>homeObject</code>.
   */
  private void addObject(Group group, Selectable homeObject, boolean waitForLoading) {
    addObject(group, homeObject, -1, waitForLoading);
  }

  /**
   * Adds to <code>group</code> a branch matching <code>homeObject</code> at a given <code>index</code>.
   * If <code>index</code> is equal to -1, <code>homeObject</code> will be added at the end of the group.
   */
  private void addObject(Group group, Selectable homeObject, int index, boolean waitForLoading) {
    Object3DBranch object3D = createObject3D(homeObject, waitForLoading);
    this.homeObjects.put(homeObject, object3D);
    if (index == -1) {
      group.addChild(object3D);
    } else {
      group.insertChild(object3D, index);
    }
    clearPrintedImageCache();
  }

  /**
   * Returns the 3D object matching the given home object. If <code>waitForLoading</code> 
   * is <code>true</code> the resources used by the returned 3D object should be ready to be displayed.
   */
  protected Object3DBranch createObject3D(Selectable homeObject,
                                          boolean waitForLoading) {
    if (homeObject instanceof HomePieceOfFurniture) {
      return new HomePieceOfFurniture3D((HomePieceOfFurniture)homeObject, this.home, true, waitForLoading);
    } else if (homeObject instanceof Wall) {
      return new Wall3D((Wall)homeObject, this.home, true, waitForLoading);
    } else if (homeObject instanceof Room) {
      return new Room3D((Room)homeObject, this.home, false, false, waitForLoading);
    } else {
      throw new IllegalArgumentException("Can't create 3D object for an item of class " + homeObject.getClass());
    }
  }

  /**
   * Detaches from the scene the branch matching <code>homeObject</code>.
   */
  private void deleteObject(Selectable homeObject) {
    this.homeObjects.get(homeObject).detach();
    this.homeObjects.remove(homeObject);
    clearPrintedImageCache();
  }

  /**
   * Updates <code>objects</code> later. Should be invoked from Event Dispatch Thread.
   */
  private void updateObjects(Collection<? extends Selectable> objects) {
    if (this.homeObjectsToUpdate != null) {
      this.homeObjectsToUpdate.addAll(objects);
    } else {
      this.homeObjectsToUpdate = new HashSet<Selectable>(objects);
      // Invoke later the update of objects of homeObjectsToUpdate
      EventQueue.invokeLater(new Runnable () {
        public void run() {
          for (Selectable object : homeObjectsToUpdate) {
            Object3DBranch objectBranch = homeObjects.get(object);
            // Check object wasn't deleted since updateObjects call
            if (objectBranch != null) { 
              homeObjects.get(object).update();
            }
          }
          homeObjectsToUpdate = null;
        }
      });
    }
    clearPrintedImageCache();
  }
  
  /**
   * Updates <code>wall</code> geometry, 
   * and the walls at its end or start.
   */
  private void updateWall(Wall wall) {
    Collection<Wall> wallsToUpdate = new ArrayList<Wall>(3);
    wallsToUpdate.add(wall);
    if (wall.getWallAtStart() != null) {
      wallsToUpdate.add(wall.getWallAtStart());                
    }
    if (wall.getWallAtEnd() != null) {
      wallsToUpdate.add(wall.getWallAtEnd());                
    }
    updateObjects(wallsToUpdate);
  }

  /**
   * Adds to <code>homeRoot</code> a shape matching the shadow of furniture at ground level.
   */
  private void addShadowOnFloor(Group homeRoot) {
    Area areaOnFloor = new Area();
    // Compute union of the areas of pieces at ground level that are not lights, doors or windows
    for (Map.Entry<Selectable, Object3DBranch> object3DEntry : this.homeObjects.entrySet()) {
      if (object3DEntry.getKey() instanceof HomePieceOfFurniture) {
        HomePieceOfFurniture piece = (HomePieceOfFurniture)object3DEntry.getKey();
        // This operation can be lengthy, so give up if thread is interrupted 
        if (Thread.currentThread().isInterrupted()) {
          return;
        }
        if (piece.getElevation() == 0 
            && !piece.isDoorOrWindow()
            && !(piece instanceof com.eteks.sweethome3d.model.Light)) {
          Area pieceAreaOnFloor = ModelManager.getInstance().getAreaOnFloor(object3DEntry.getValue());
          areaOnFloor.add(pieceAreaOnFloor);
        }
      }
    }
    
    // Create the 3D shape matching computed area
    List<Point3f> coords = new ArrayList<Point3f>();
    List<Integer> stripCounts = new ArrayList<Integer>();
    int pointsCount = 0;
    float [] modelPoint = new float[2];
    for (PathIterator it = areaOnFloor.getPathIterator(null); !it.isDone(); ) {
      if (it.currentSegment(modelPoint) == PathIterator.SEG_CLOSE) {
        stripCounts.add(pointsCount);
        pointsCount = 0;
      } else {
        coords.add(new Point3f(modelPoint [0], 0.49f, modelPoint [1]));
        pointsCount++;
      }
      it.next();
    }

    if (coords.size() > 0) {
      GeometryInfo geometryInfo = new GeometryInfo(GeometryInfo.POLYGON_ARRAY);
      geometryInfo.setCoordinates (coords.toArray(new Point3f [coords.size()]));
      int [] stripCountsArray = new int [stripCounts.size()];
      for (int i = 0; i < stripCountsArray.length; i++) {
        stripCountsArray [i] = stripCounts.get(i);
      }
      geometryInfo.setStripCounts(stripCountsArray);
 
      Shape3D shadow = new Shape3D(geometryInfo.getIndexedGeometryArray());
      Appearance shadowAppearance = new Appearance();
      shadowAppearance.setColoringAttributes(new ColoringAttributes(new Color3f(), ColoringAttributes.SHADE_FLAT));
      shadowAppearance.setTransparencyAttributes(new TransparencyAttributes(TransparencyAttributes.NICEST, 0.7f));
      shadow.setAppearance(shadowAppearance);    
      homeRoot.addChild(shadow);
    }
  }
}
