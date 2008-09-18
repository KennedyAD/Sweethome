/*
 * OBJWriter.java 18 sept. 2008
 *
 * Copyright (c) 2008 Emmanuel PUYBARET / eTeks <info@eteks.com>. All Rights Reserved.
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

import java.awt.image.RenderedImage;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FilterWriter;
import java.io.IOException;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.text.NumberFormat;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

import javax.imageio.ImageIO;
import javax.media.j3d.Appearance;
import javax.media.j3d.ColoringAttributes;
import javax.media.j3d.Geometry;
import javax.media.j3d.GeometryArray;
import javax.media.j3d.Group;
import javax.media.j3d.ImageComponent2D;
import javax.media.j3d.IndexedGeometryArray;
import javax.media.j3d.IndexedQuadArray;
import javax.media.j3d.IndexedTriangleArray;
import javax.media.j3d.IndexedTriangleFanArray;
import javax.media.j3d.IndexedTriangleStripArray;
import javax.media.j3d.Material;
import javax.media.j3d.Node;
import javax.media.j3d.QuadArray;
import javax.media.j3d.Shape3D;
import javax.media.j3d.Texture;
import javax.media.j3d.Transform3D;
import javax.media.j3d.TransformGroup;
import javax.media.j3d.TransparencyAttributes;
import javax.media.j3d.TriangleArray;
import javax.media.j3d.TriangleFanArray;
import javax.media.j3d.TriangleStripArray;
import javax.vecmath.Color3f;
import javax.vecmath.Point3f;
import javax.vecmath.TexCoord2f;
import javax.vecmath.Vector3f;

/**
 * An output stream that writes Java 3D nodes at OBJ + MTL format.
 * <p>Once you wrote nodes, call <code>close</code> method to create the MTL file
 * and the texture images in the same directory as OBJ file. This feature applies
 * only to constructor that takes a file as parameter.
 * @author Emmanuel Puybaret
 */
public class OBJWriter extends FilterWriter {
  private final NumberFormat numberFormat;  
  private final String  header;
  
  private boolean firstNode = true;
  private String  mtlFileName;

  private int vertexOffset = 1;
  private int normalOffset = 1;
  private int textureCoordinatesOffset = 1;
  private Map<ComparableAppearance, String> appearances = 
    new LinkedHashMap<ComparableAppearance, String>();
  
  /**
   * Create an OBJ writer for the given file, with no header and default precision.
   */
  public OBJWriter(File objFile) throws FileNotFoundException, IOException {
    this(objFile, null, -1);
  }
  
  /**
   * Create an OBJ writer for the given file.
   * @param objFile the file into which 3D nodes will be written at OBJ format
   * @param header  a header written as a comment at start of the OBJ file and its MTL counterpart
   * @param maximumFractionDigits the maximum digits count used in fraction part of numbers,
   *                or -1 for default value. Using -1 may cause writing nodes to be twice faster.
   */
  public OBJWriter(File objFile, String header, 
                   int maximumFractionDigits) throws FileNotFoundException, IOException {
    this(objFile.toString(), header, maximumFractionDigits);
  }
  
  /**
   * Create an OBJ writer for the given file name, with no header and default precision.
   */
  public OBJWriter(String objFileName) throws FileNotFoundException, IOException {
    this(objFileName, null, -1);
  }
  
  /**
   * Create an OBJ writer for the given file name.
   * @param objFileName the name of the file into which 3D nodes will be written at OBJ format
   * @param header  a header written as a comment at start of the OBJ file and its MTL counterpart
   * @param maximumFractionDigits the maximum digits count used in fraction part of numbers,
   *                or -1 for default value. Using -1 may cause writing nodes to be twice faster.
   */
  public OBJWriter(String objFileName, String header, 
                   int maximumFractionDigits) throws FileNotFoundException, IOException {
    this(new FileOutputStream(objFileName), header, maximumFractionDigits);
    if (objFileName.toLowerCase().endsWith(".obj")) {
      this.mtlFileName = objFileName.substring(0, objFileName.length() - 4) + ".mtl";
    } else {
      this.mtlFileName = objFileName + ".mtl";
    }
  }
  
  /**
   * Create an OBJ writer that will writes in <code>out</code> stream, 
   * with no header and default precision.
   */
  public OBJWriter(OutputStream out) throws IOException {
    this(out, null, -1);
  }

  /**
   * Create an OBJ writer that will writes in <code>out</code> stream.
   * @param objFile the file into which 3D nodes will be written at OBJ format
   * @param header  a header written as a comment at start of the stream
   * @param maximumFractionDigits the maximum digits count used in fraction part of numbers,
   *                or -1 for default value. Using -1 may cause writing nodes to be twice faster.
   */
  public OBJWriter(OutputStream out, String header, 
                   int maximumFractionDigits) throws IOException {
    this(new OutputStreamWriter(new BufferedOutputStream(out), "US-ASCII"), header, maximumFractionDigits);
  }

  /**
   * Create an OBJ writer that will writes in <code>out</code> stream, 
   * with no header and default precision.
   */
  public OBJWriter(Writer out) throws IOException {
    this(out, null, -1);
  }
  
  /**
   * Create an OBJ writer that will writes in <code>out</code> stream.
   * @param objFile the file into which 3D nodes will be written at OBJ format
   * @param header  a header written as a comment at start of the stream
   * @param maximumFractionDigits the maximum digits count used in fraction part of numbers,
   *                or -1 for default value. Using -1 may cause writing nodes to be twice faster.
   */
  public OBJWriter(Writer out, String header, 
                   int maximumFractionDigits) throws IOException {
    super(out);
    if (maximumFractionDigits >= 0) {
      this.numberFormat = NumberFormat.getNumberInstance(Locale.US);
      this.numberFormat.setMinimumFractionDigits(0);
      this.numberFormat.setMaximumFractionDigits(maximumFractionDigits);
    } else {
      this.numberFormat = null;
    }
    this.header = header;
    writeHeader(this.out);
  }
  
  /**
   * Writes header to <code>writer</code>
   */
  private void writeHeader(Writer writer) throws IOException {
    if (this.header != null) {
      if (!this.header.startsWith("#")) {
        writer.write("# ");
      }
      writer.write(this.header.replace("\n", "\n# "));
      writer.write("\n");
    }
  }

  /**
   * Write a single character in a comment at OBJ format.
   */
  @Override
  public void write(int c) throws IOException {
    this.out.write("# ");
    this.out.write(c);
    this.out.write("\n");
  }

  /**
   * Write a portion of an array of characters in a comment at OBJ format.
   */
  @Override
  public void write(char cbuf[], int off, int len) throws IOException {
    this.out.write("# ");
    this.out.write(cbuf, off, len);
    this.out.write("\n");
  }

  /**
   * Write a portion of a string in a comment at OBJ format.
   */
  @Override
  public void write(String str, int off, int len) throws IOException {
    this.out.write("# ");
    this.out.write(str, off, len);
    this.out.write("\n");
  }
  
  /**
   * Write a string in a comment at OBJ format.
   */
  @Override
  public void write(String str) throws IOException {
    this.out.write("# ");
    this.out.write(str, 0, str.length());
    this.out.write("\n");
  }

  /**
   * Writes all the 3D shapes children of <code>node</code> at OBJ format. 
   * If there are transformation groups on the path from <code>node</code> to its shapes, 
   * they'll be applied to the coordinates written on output.
   * The <code>node</code> shouldn't be alive or if it's alive it should have the 
   * capabilities to read its children, the geometries and the appearance of its shapes.
   * Only geometries which are instances of <code>GeometryArray</code> will be written.
   * @param node a Java 3D node  
   */
  public void writeNode(Node node) throws IOException {
    writeNode(node, null);
  }
  
  /**
   * Writes all the 3D shapes children of <code>node</code> at OBJ format. 
   * If there are transformation groups on the path from <code>node</code> to its shapes, 
   * they'll be applied to the coordinates written on output.
   * The <code>node</code> shouldn't be alive or if it's alive, it should have the 
   * capabilities to read its children, the geometries and the appearance of its shapes.
   * Only geometries which are instances of <code>GeometryArray</code> will be written.
   * @param node     a Java 3D node  
   * @param nodeName the name of the node. This is usefull to distinguish the objects 
   *                 names in output. If this name is <code>null</code> or isn't built 
   *                 with A-Z, a-z, 0-9 and underscores, it will be ignored.
   */
  public void writeNode(Node node, String nodeName) throws IOException {
    if (this.firstNode) {
      if (this.mtlFileName != null) {
        this.out.write("mtllib " + new File(this.mtlFileName).getName() + "\n");
      }
      this.firstNode = false;
    }
    
    writeNode(node, node, nodeName);
  }

  /**
   * Writes all the 3D shapes children of <code>node</code> at OBJ format.
   */ 
  private void writeNode(Node parent, Node node, String nodeName) throws IOException {
    if (node instanceof Group) {
      // Write all children
      Enumeration enumeration = ((Group)node).getAllChildren(); 
      while (enumeration.hasMoreElements()) {
        writeNode(parent, (Node)enumeration.nextElement(), nodeName);
      }
    } else if (node instanceof Shape3D) {
      Shape3D shape = (Shape3D)node;
      Appearance appearance = shape.getAppearance();
      
      // Retrieve transformation needed to be applied to vertices
      Transform3D transformationToParent = getTransformationToParent(parent, node);

      // Build a unique human readable object name
      String objectName = "";
      if (accept(nodeName)) {
        objectName = nodeName + "_";
      }
        
      String shapeName = null;
      if (shape.getUserData() instanceof String) {
        shapeName = (String)shape.getUserData(); 
      }
      if (accept(shapeName)) {
        objectName += shapeName + "_";
      } 
      
      objectName += String.valueOf(this.vertexOffset);
      
      // Start a new object at OBJ format 
      this.out.write("g " + objectName + "\n");
      
      if (this.mtlFileName != null) {
        if (appearance != null) {
          ComparableAppearance comparableAppearance = new ComparableAppearance(appearance);
          String appearanceName = this.appearances.get(comparableAppearance);
          if (appearanceName == null) {
            // Store appearance
            appearanceName = objectName;
            this.appearances.put(comparableAppearance, appearanceName);
          } 
          this.out.write("usemtl " + appearanceName + "\n");
        }
      }
      
      // Write object geometries
      for (int i = 0, n = shape.numGeometries(); i < n; i++) {
        writeNodeGeometry(shape.getGeometry(i), transformationToParent);
      }
    }    
  }
  
  /**
   * Returns the transformation applied to a <code>child</code> 
   * on the path to <code>parent</code>. 
   */
  private Transform3D getTransformationToParent(Node parent, Node child) {
    Transform3D transform = new Transform3D();
    if (child instanceof TransformGroup) {
      ((TransformGroup)child).getTransform(transform);
    }
    if (child != parent) {
      Transform3D parentTransform = getTransformationToParent(parent, child.getParent());
      parentTransform.mul(transform);
      return parentTransform;
    } else {
      return transform;
    }
  }
  
  /**
   * Returns <code>true</code> if <code>name</code> contains 
   * only letters, digits and underscores. 
   */
  private boolean accept(String name) {
    if (name == null) {
      return false;
    }
    for (int i = 0; i < name.length(); i++) {
      char car = name.charAt(i);
      if (!(car >= 'a' && car <= 'z'
            || car >= 'A' && car <= 'Z'
            || car >= '0' && car <= '9'
            || car == '_')) {
        return false;
      }
    }
    return true;
  }

  /**
   * Writes a 3D geometry at OBJ format.
   */
  private void writeNodeGeometry(Geometry geometry, Transform3D transformationToParent) throws IOException {
    if (geometry instanceof GeometryArray) {
      GeometryArray geometryArray = (GeometryArray)geometry;      
      
      Map<Point3f, Integer> vertexIndices = new HashMap<Point3f, Integer>();
      int [] vertexIndexSubstitutes = new int [geometryArray.getVertexCount()];
      
      boolean normalsDefined = (geometryArray.getVertexFormat() & GeometryArray.NORMALS) != 0;
      Map<Vector3f, Integer> normalIndices = new HashMap<Vector3f, Integer>();
      int [] normalIndexSubstitutes = new int [geometryArray.getVertexCount()];
      
      boolean textureCoordinatesDefined = (geometryArray.getVertexFormat() & GeometryArray.TEXTURE_COORDINATE_2) != 0;
      Map<TexCoord2f, Integer> textureCoordinatesIndices = new HashMap<TexCoord2f, Integer>();
      int [] textureCoordinatesIndexSubstitutes = new int [geometryArray.getVertexCount()];
      
      if ((geometryArray.getVertexFormat() & GeometryArray.BY_REFERENCE) != 0) {
        if ((geometryArray.getVertexFormat() & GeometryArray.INTERLEAVED) != 0) {
          float [] vertexData = geometryArray.getInterleavedVertices();
          int vertexSize = vertexData.length / geometryArray.getVertexCount();
          // Write vertices coordinates 
          for (int index = 0, i = vertexSize - 3, n = geometryArray.getVertexCount(); 
               index < n; index++, i += vertexSize) {
            Point3f vertex = new Point3f(vertexData [i], vertexData [i + 1], vertexData [i + 2]);
            writeVertex(transformationToParent, vertex, index,
                vertexIndices, vertexIndexSubstitutes);
          }
          // Write normals
          if (normalsDefined) {
            for (int index = 0, i = vertexSize - 6, n = geometryArray.getVertexCount(); 
                 index < n; index++, i += vertexSize) {
              Vector3f normal = new Vector3f(vertexData [i], vertexData [i + 1], vertexData [i + 2]);
              writeNormal(transformationToParent, normal, index,
                  normalIndices, normalIndexSubstitutes);
            }
          }
          // Write texture coordinates
          if (textureCoordinatesDefined) {
            for (int index = 0, i = 0, n = geometryArray.getVertexCount(); 
                  index < n; index++, i += vertexSize) {
              TexCoord2f textureCoordinates = new TexCoord2f(vertexData [i], vertexData [i + 1]);
              writeTextureCoordinates(textureCoordinates, index, textureCoordinatesIndices, textureCoordinatesIndexSubstitutes);
            }
          }
        } else {
          // Write vertices coordinates
          float [] vertexCoordinates = geometryArray.getCoordRefFloat();
          for (int index = 0, i = 0, n = geometryArray.getVertexCount(); index < n; index++, i += 3) {
            Point3f vertex = new Point3f(vertexCoordinates [i], vertexCoordinates [i + 1], vertexCoordinates [i + 2]);
            writeVertex(transformationToParent, vertex, index,
                vertexIndices, vertexIndexSubstitutes);
          }
          // Write normals
          if (normalsDefined) {
            float [] normalCoordinates = geometryArray.getNormalRefFloat();
            for (int index = 0, i = 0, n = geometryArray.getVertexCount(); index < n; index++, i += 3) {
              Vector3f normal = new Vector3f(normalCoordinates [i], normalCoordinates [i + 1], normalCoordinates [i + 2]);
              writeNormal(transformationToParent, normal, index,
                  normalIndices, normalIndexSubstitutes);
            }
          }
          // Write texture coordinates
          if (textureCoordinatesDefined) {
            float [] textureCoordinatesArray = geometryArray.getTexCoordRefFloat(0);
            for (int index = 0, i = 0, n = geometryArray.getVertexCount(); index < n; index++, i += 2) {
              TexCoord2f textureCoordinates = new TexCoord2f(textureCoordinatesArray [i], textureCoordinatesArray [i + 1]);
              writeTextureCoordinates(textureCoordinates, index, textureCoordinatesIndices, textureCoordinatesIndexSubstitutes);
            }
          }
        }
      } else {
        // Write vertices coordinates
        for (int index = 0, n = geometryArray.getVertexCount(); index < n; index++) {
          Point3f vertex = new Point3f();
          geometryArray.getCoordinate(index, vertex);
          writeVertex(transformationToParent, vertex, index,
              vertexIndices, vertexIndexSubstitutes);
        }
        // Write normals
        if (normalsDefined) {
          for (int index = 0, n = geometryArray.getVertexCount(); index < n; index++) {
            Vector3f normal = new Vector3f();
            geometryArray.getNormal(index, normal);
            writeNormal(transformationToParent, normal, index,
                normalIndices, normalIndexSubstitutes);
          }
        }
        // Write texture coordinates
        if (textureCoordinatesDefined) {
          for (int index = 0, n = geometryArray.getVertexCount(); index < n; index++) {
            TexCoord2f textureCoordinates = new TexCoord2f();
            geometryArray.getTextureCoordinate(0, index, textureCoordinates);
            writeTextureCoordinates(textureCoordinates, index, textureCoordinatesIndices, textureCoordinatesIndexSubstitutes);
          }
        }
      }

      // Write triangles or quadrilaterals depending on the geometry
      if (geometryArray instanceof IndexedGeometryArray) {
        if (geometryArray instanceof IndexedTriangleArray) {
          IndexedTriangleArray triangleArray = (IndexedTriangleArray)geometryArray;
          for (int i = 0, n = triangleArray.getIndexCount(); i < n; i += 3) {
            writeIndexedTriangle(triangleArray, i, i + 1, i + 2, 
                vertexIndexSubstitutes, normalIndexSubstitutes,  
                textureCoordinatesIndexSubstitutes);
          }
        } else if (geometryArray instanceof IndexedQuadArray) {
          IndexedQuadArray quadArray = (IndexedQuadArray)geometryArray;
          for (int i = 0, n = quadArray.getIndexCount(); i < n; i += 4) {
            writeIndexedQuadrilateral(quadArray, i, i + 1, i + 2, i + 3, 
                vertexIndexSubstitutes, normalIndexSubstitutes,  
                textureCoordinatesIndexSubstitutes);
          }
        } else if (geometryArray instanceof IndexedTriangleStripArray) {
          IndexedTriangleStripArray triangleStripArray = (IndexedTriangleStripArray)geometryArray;
          int [] stripVertexCount = new int [triangleStripArray.getNumStrips()];
          triangleStripArray.getStripIndexCounts(stripVertexCount);
          int initialIndex = 0;
          for (int strip = 0; strip < stripVertexCount.length; strip++) {
            for (int i = initialIndex, n = initialIndex + stripVertexCount [strip] - 2, j = 0; i < n; i++, j++) {
              if (j % 2 == 0) {
                writeIndexedTriangle(triangleStripArray, i, i + 1, i + 2, 
                    vertexIndexSubstitutes, normalIndexSubstitutes,   
                    textureCoordinatesIndexSubstitutes);
              } else { // Vertices of odd triangles are in reverse order               
                writeIndexedTriangle(triangleStripArray, i, i + 2, i + 1, 
                    vertexIndexSubstitutes, normalIndexSubstitutes,  
                    textureCoordinatesIndexSubstitutes);
              }
            }
            initialIndex += stripVertexCount [strip];
          }
        } else if (geometryArray instanceof IndexedTriangleFanArray) {
          IndexedTriangleFanArray triangleFanArray = (IndexedTriangleFanArray)geometryArray;
          int [] stripVertexCount = new int [triangleFanArray.getNumStrips()];
          triangleFanArray.getStripIndexCounts(stripVertexCount);
          int initialIndex = 0;
          for (int strip = 0; strip < stripVertexCount.length; strip++) {
            for (int i = initialIndex, n = initialIndex + stripVertexCount [strip] - 2; i < n; i++) {
              writeIndexedTriangle(triangleFanArray, initialIndex, i + 1, i + 2, 
                  vertexIndexSubstitutes, normalIndexSubstitutes,   
                  textureCoordinatesIndexSubstitutes);
            }
            initialIndex += stripVertexCount [strip];
          }
        } 
      } else {
        if (geometryArray instanceof TriangleArray) {
          TriangleArray triangleArray = (TriangleArray)geometryArray;
          for (int i = 0, n = triangleArray.getVertexCount(); i < n; i += 3) {
            writeTriangle(triangleArray, i, i + 1, i + 2, 
                vertexIndexSubstitutes, normalIndexSubstitutes,   
                textureCoordinatesIndexSubstitutes);
          }
        } else if (geometryArray instanceof QuadArray) {
          QuadArray quadArray = (QuadArray)geometryArray;
          for (int i = 0, n = quadArray.getVertexCount(); i < n; i += 4) {
            writeQuadrilateral(quadArray, i, i + 1, i + 2, i + 3, 
                vertexIndexSubstitutes, normalIndexSubstitutes,   
                textureCoordinatesIndexSubstitutes);
          }
        } else if (geometryArray instanceof TriangleStripArray) {
          TriangleStripArray triangleStripArray = (TriangleStripArray)geometryArray;
          int [] stripVertexCount = new int [triangleStripArray.getNumStrips()];
          triangleStripArray.getStripVertexCounts(stripVertexCount);
          int initialIndex = 0;
          for (int strip = 0; strip < stripVertexCount.length; strip++) {
            for (int i = initialIndex, n = initialIndex + stripVertexCount [strip] - 2, j = 0; i < n; i++, j++) {
              if (j % 2 == 0) {
                writeTriangle(triangleStripArray, i, i + 1, i + 2, 
                    vertexIndexSubstitutes, normalIndexSubstitutes,  
                    textureCoordinatesIndexSubstitutes);
              } else { // Vertices of odd triangles are in reverse order               
                writeTriangle(triangleStripArray, i, i + 2, i + 1, 
                    vertexIndexSubstitutes, normalIndexSubstitutes,  
                    textureCoordinatesIndexSubstitutes);
              }
            }
            initialIndex += stripVertexCount [strip];
          }
        } else if (geometryArray instanceof TriangleFanArray) {
          TriangleFanArray triangleFanArray = (TriangleFanArray)geometryArray;
          int [] stripVertexCount = new int [triangleFanArray.getNumStrips()];
          triangleFanArray.getStripVertexCounts(stripVertexCount);
          int initialIndex = 0;
          for (int strip = 0; strip < stripVertexCount.length; strip++) {
            for (int i = initialIndex, n = initialIndex + stripVertexCount [strip] - 2; i < n; i++) {
              writeTriangle(triangleFanArray, initialIndex, i + 1, i + 2, 
                  vertexIndexSubstitutes, normalIndexSubstitutes,  
                  textureCoordinatesIndexSubstitutes);
            }
            initialIndex += stripVertexCount [strip];
          }
        }
      }
      
      this.vertexOffset += vertexIndices.size();
      if (normalsDefined) {
        this.normalOffset += normalIndices.size();
      }        
      if (textureCoordinatesDefined) {
        this.textureCoordinatesOffset += textureCoordinatesIndices.size();
      } 
    } 
  }

  /**
   * Applies to <code>vertex</code> the given transformation, and writes it in
   * a line v at OBJ format, if the vertex isn't a key of <code>vertexIndices</code> yet.  
   */
  private void writeVertex(Transform3D transformationToParent,
                           Point3f vertex, int index,
                           Map<Point3f, Integer> vertexIndices,
                           int [] vertexIndexSubstitutes) throws IOException {
    transformationToParent.transform(vertex);
    Integer vertexIndex = vertexIndices.get(vertex);
    if (vertexIndex == null) {
      vertexIndexSubstitutes [index] = vertexIndices.size();
      vertexIndices.put(vertex, vertexIndexSubstitutes [index]);
      // Write only once unique vertices
      if (this.numberFormat != null) {
        this.out.write("v " + this.numberFormat.format(vertex.x) 
            + " " + this.numberFormat.format(vertex.y) 
            + " " + this.numberFormat.format(vertex.z) + "\n");
      } else {
        this.out.write("v " + vertex.x + " " + vertex.y + " " + vertex.z + "\n");
      }
    } else {
      vertexIndexSubstitutes [index] = vertexIndex;
    }
  }

  /**
   * Applies to <code>normal</code> the given transformation, and writes it in
   * a line vn at OBJ format, if the normal isn't a key of <code>normalIndices</code> yet.  
   */
  private void writeNormal(Transform3D transformationToParent,
                           Vector3f normal, int index,
                           Map<Vector3f, Integer> normalIndices,
                           int [] normalIndexSubstitutes) throws IOException {
    transformationToParent.transform(normal);
    Integer normalIndex = normalIndices.get(normal);
    if (normalIndex == null) {
      normalIndexSubstitutes [index] = normalIndices.size();
      normalIndices.put(normal, normalIndexSubstitutes [index]);
      // Write only once unique normals
      if (this.numberFormat != null) {
        this.out.write("vn " + this.numberFormat.format(normal.x) 
            + " " + this.numberFormat.format(normal.y) 
            + " " + this.numberFormat.format(normal.z) + "\n");
      } else {
        this.out.write("vn " + normal.x + " " + normal.y + " " + normal.z + "\n");
      }
    } else {
      normalIndexSubstitutes [index] = normalIndex;
    }
  }

  /**
   * Writes <code>textureCoordinates</code> in a line vt at OBJ format, 
   * if the texture coordinates isn't a key of <code>textureCoordinatesIndices</code> yet.  
   */
  private void writeTextureCoordinates(TexCoord2f textureCoordinates, int index,
                                       Map<TexCoord2f, Integer> textureCoordinatesIndices,
                                       int [] textureCoordinatesIndexSubstitutes) throws IOException {
    Integer textureCoordinatesIndex = textureCoordinatesIndices.get(textureCoordinates);
    if (textureCoordinatesIndex == null) {
      textureCoordinatesIndexSubstitutes [index] = textureCoordinatesIndices.size();
      textureCoordinatesIndices.put(textureCoordinates, textureCoordinatesIndexSubstitutes [index]);
      // Write only once unique texture coordinates
      if (this.numberFormat != null) {
        this.out.write("vt " + this.numberFormat.format(textureCoordinates.x) 
            + " " + this.numberFormat.format(textureCoordinates.y) + " 0\n");
      } else {
        this.out.write("vt " + textureCoordinates.x + " " + textureCoordinates.y + " 0\n");
      }
    } else {
      textureCoordinatesIndexSubstitutes [index] = textureCoordinatesIndex;
    }
  }

  /**
   * Writes the triangle indices given at vertexIndex1, vertexIndex2, vertexIndex3, 
   * in a line f at OBJ format. 
   */
  private void writeIndexedTriangle(IndexedGeometryArray geometryArray, 
                                    int vertexIndex1, int vertexIndex2, int vertexIndex3, 
                                    int [] vertexIndexSubstitutes, 
                                    int [] normalIndexSubstitutes,                                     
                                    int [] textureCoordinatesIndexSubstitutes) throws IOException {
    if ((geometryArray.getVertexFormat() & GeometryArray.TEXTURE_COORDINATE_2) != 0) {
      if ((geometryArray.getVertexFormat() & GeometryArray.NORMALS) != 0) {
        this.out.write("f " + (this.vertexOffset + vertexIndexSubstitutes [geometryArray.getCoordinateIndex(vertexIndex1)]) 
            + "/" + (this.textureCoordinatesOffset + textureCoordinatesIndexSubstitutes [geometryArray.getTextureCoordinateIndex(0, vertexIndex1)]) 
            + "/" + (this.normalOffset + normalIndexSubstitutes [geometryArray.getNormalIndex(vertexIndex1)]) 
            + " " + (this.vertexOffset + vertexIndexSubstitutes [geometryArray.getCoordinateIndex(vertexIndex2)]) 
            + "/" + (this.textureCoordinatesOffset + textureCoordinatesIndexSubstitutes [geometryArray.getTextureCoordinateIndex(0, vertexIndex2)]) 
            + "/" + (this.normalOffset + normalIndexSubstitutes [geometryArray.getNormalIndex(vertexIndex2)]) 
            + " " + (this.vertexOffset + vertexIndexSubstitutes [geometryArray.getCoordinateIndex(vertexIndex3)]) 
            + "/" + (this.textureCoordinatesOffset + textureCoordinatesIndexSubstitutes [geometryArray.getTextureCoordinateIndex(0, vertexIndex3)]) 
            + "/" + (this.normalOffset + normalIndexSubstitutes [geometryArray.getNormalIndex(vertexIndex3)]) + "\n");
      } else {
        this.out.write("f " + (this.vertexOffset + vertexIndexSubstitutes [geometryArray.getCoordinateIndex(vertexIndex1)]) 
            + "/" + (this.textureCoordinatesOffset + textureCoordinatesIndexSubstitutes [geometryArray.getTextureCoordinateIndex(0, vertexIndex1)]) 
            + " " + (this.vertexOffset + vertexIndexSubstitutes [geometryArray.getCoordinateIndex(vertexIndex2)]) 
            + "/" + (this.textureCoordinatesOffset + textureCoordinatesIndexSubstitutes [geometryArray.getTextureCoordinateIndex(0, vertexIndex2)]) 
            + " " + (this.vertexOffset + vertexIndexSubstitutes [geometryArray.getCoordinateIndex(vertexIndex3)]) 
            + "/" + (this.textureCoordinatesOffset + textureCoordinatesIndexSubstitutes [geometryArray.getTextureCoordinateIndex(0, vertexIndex3)]) + "\n");
      }
    } else {
      if ((geometryArray.getVertexFormat() & GeometryArray.NORMALS) != 0) {
        this.out.write("f " + (this.vertexOffset + vertexIndexSubstitutes [geometryArray.getCoordinateIndex(vertexIndex1)]) 
            + "//" + (this.normalOffset + normalIndexSubstitutes [geometryArray.getNormalIndex(vertexIndex1)]) 
            + " "  + (this.vertexOffset + vertexIndexSubstitutes [geometryArray.getCoordinateIndex(vertexIndex2)]) 
            + "//" + (this.normalOffset + normalIndexSubstitutes [geometryArray.getNormalIndex(vertexIndex2)]) 
            + " "  + (this.vertexOffset + vertexIndexSubstitutes [geometryArray.getCoordinateIndex(vertexIndex3)]) 
            + "//" + (this.normalOffset + normalIndexSubstitutes [geometryArray.getNormalIndex(vertexIndex3)]) + "\n");
      } else {
        this.out.write("f " + (this.vertexOffset + vertexIndexSubstitutes [geometryArray.getCoordinateIndex(vertexIndex1)]) 
            + " "  + (this.vertexOffset + vertexIndexSubstitutes [geometryArray.getCoordinateIndex(vertexIndex2)]) 
            + " "  + (this.vertexOffset + vertexIndexSubstitutes [geometryArray.getCoordinateIndex(vertexIndex3)]) + "\n");
      }
    }
  }
  
  /**
   * Writes the quadrilateral indices given at vertexIndex1, vertexIndex2, vertexIndex3, vertexIndex4,
   * in a line f at OBJ format. 
   */
  private void writeIndexedQuadrilateral(IndexedGeometryArray geometryArray, 
                                         int vertexIndex1, int vertexIndex2, int vertexIndex3, int vertexIndex4, 
                                         int [] vertexIndexSubstitutes, 
                                         int [] normalIndexSubstitutes,                                      
                                         int [] textureCoordinatesIndexSubstitutes) throws IOException {
    if ((geometryArray.getVertexFormat() & GeometryArray.TEXTURE_COORDINATE_2) != 0) {
      if ((geometryArray.getVertexFormat() & GeometryArray.NORMALS) != 0) {
        this.out.write("f " + (this.vertexOffset + vertexIndexSubstitutes [geometryArray.getCoordinateIndex(vertexIndex1)]) 
            + "/" + (this.textureCoordinatesOffset + textureCoordinatesIndexSubstitutes [geometryArray.getTextureCoordinateIndex(0, vertexIndex1)]) 
            + "/" + (this.normalOffset + normalIndexSubstitutes [geometryArray.getNormalIndex(vertexIndex1)]) 
            + " " + (this.vertexOffset + vertexIndexSubstitutes [geometryArray.getCoordinateIndex(vertexIndex2)]) 
            + "/" + (this.textureCoordinatesOffset + textureCoordinatesIndexSubstitutes [geometryArray.getTextureCoordinateIndex(0, vertexIndex2)]) 
            + "/" + (this.normalOffset + normalIndexSubstitutes [geometryArray.getNormalIndex(vertexIndex2)]) 
            + " " + (this.vertexOffset + vertexIndexSubstitutes [geometryArray.getCoordinateIndex(vertexIndex3)]) 
            + "/" + (this.textureCoordinatesOffset + textureCoordinatesIndexSubstitutes [geometryArray.getTextureCoordinateIndex(0, vertexIndex3)]) 
            + "/" + (this.normalOffset + normalIndexSubstitutes [geometryArray.getNormalIndex(vertexIndex3)]) 
            + " " + (this.vertexOffset + vertexIndexSubstitutes [geometryArray.getCoordinateIndex(vertexIndex4)]) 
            + "/" + (this.textureCoordinatesOffset + textureCoordinatesIndexSubstitutes [geometryArray.getTextureCoordinateIndex(0, vertexIndex4)]) 
            + "/" + (this.normalOffset + normalIndexSubstitutes [geometryArray.getNormalIndex(vertexIndex4)]) + "\n");
      } else {
        this.out.write("f " + (this.vertexOffset + vertexIndexSubstitutes [geometryArray.getCoordinateIndex(vertexIndex1)]) 
            + "/" + (this.textureCoordinatesOffset + textureCoordinatesIndexSubstitutes [geometryArray.getTextureCoordinateIndex(0, vertexIndex1)]) 
            + " " + (this.vertexOffset + vertexIndexSubstitutes [geometryArray.getCoordinateIndex(vertexIndex2)]) 
            + "/" + (this.textureCoordinatesOffset + textureCoordinatesIndexSubstitutes [geometryArray.getTextureCoordinateIndex(0, vertexIndex2)]) 
            + " " + (this.vertexOffset + vertexIndexSubstitutes [geometryArray.getCoordinateIndex(vertexIndex3)]) 
            + "/" + (this.textureCoordinatesOffset + textureCoordinatesIndexSubstitutes [geometryArray.getTextureCoordinateIndex(0, vertexIndex3)]) 
            + " " + (this.vertexOffset + vertexIndexSubstitutes [geometryArray.getCoordinateIndex(vertexIndex4)]) 
            + "/" + (this.textureCoordinatesOffset + textureCoordinatesIndexSubstitutes [geometryArray.getTextureCoordinateIndex(0, vertexIndex4)]) + "\n");
      }
    } else {
      if ((geometryArray.getVertexFormat() & GeometryArray.NORMALS) != 0) {
        this.out.write("f " + (this.vertexOffset + vertexIndexSubstitutes [geometryArray.getCoordinateIndex(vertexIndex1)]) 
            + "//" + (this.normalOffset + normalIndexSubstitutes [geometryArray.getNormalIndex(vertexIndex1)]) 
            + " "  + (this.vertexOffset + vertexIndexSubstitutes [geometryArray.getCoordinateIndex(vertexIndex2)]) 
            + "//" + (this.normalOffset + normalIndexSubstitutes [geometryArray.getNormalIndex(vertexIndex2)]) 
            + " "  + (this.vertexOffset + vertexIndexSubstitutes [geometryArray.getCoordinateIndex(vertexIndex3)]) 
            + "//" + (this.normalOffset + normalIndexSubstitutes [geometryArray.getNormalIndex(vertexIndex3)]) 
            + " "  + (this.vertexOffset + vertexIndexSubstitutes [geometryArray.getCoordinateIndex(vertexIndex4)]) 
            + "//" + (this.normalOffset + normalIndexSubstitutes [geometryArray.getNormalIndex(vertexIndex4)]) + "\n");
      } else {
        this.out.write("f " + (this.vertexOffset + vertexIndexSubstitutes [geometryArray.getCoordinateIndex(vertexIndex1)]) 
            + " "  + (this.vertexOffset + vertexIndexSubstitutes [geometryArray.getCoordinateIndex(vertexIndex2)]) 
            + " "  + (this.vertexOffset + vertexIndexSubstitutes [geometryArray.getCoordinateIndex(vertexIndex3)]) 
            + " "  + (this.vertexOffset + vertexIndexSubstitutes [geometryArray.getCoordinateIndex(vertexIndex4)]) + "\n");
      }
    }
  }
  
  /**
   * Writes the triangle indices given at vertexIndex1, vertexIndex2, vertexIndex3, 
   * in a line f at OBJ format. 
   */
  private void writeTriangle(GeometryArray geometryArray, 
                             int vertexIndex1, int vertexIndex2, int vertexIndex3, 
                             int [] vertexIndexSubstitutes,  
                             int [] normalIndexSubstitutes,                                       
                             int [] textureCoordinatesIndexSubstitutes) throws IOException {
    if ((geometryArray.getVertexFormat() & GeometryArray.TEXTURE_COORDINATE_2) != 0) {
      if ((geometryArray.getVertexFormat() & GeometryArray.NORMALS) != 0) {
        this.out.write("f " + (this.vertexOffset + vertexIndexSubstitutes [vertexIndex1]) 
            + "/" + (this.textureCoordinatesOffset + textureCoordinatesIndexSubstitutes [vertexIndex1]) 
            + "/" + (this.normalOffset + normalIndexSubstitutes [vertexIndex1]) 
            + " " + (this.vertexOffset + vertexIndexSubstitutes [vertexIndex2]) 
            + "/" + (this.textureCoordinatesOffset + textureCoordinatesIndexSubstitutes [vertexIndex2]) 
            + "/" + (this.normalOffset + normalIndexSubstitutes [vertexIndex2]) 
            + " " + (this.vertexOffset + vertexIndexSubstitutes [vertexIndex3]) 
            + "/" + (this.textureCoordinatesOffset + textureCoordinatesIndexSubstitutes [vertexIndex3]) 
            + "/" + (this.normalOffset + normalIndexSubstitutes [vertexIndex3]) + "\n");
      } else {
        this.out.write("f " + (this.vertexOffset + vertexIndexSubstitutes [vertexIndex1]) 
            + "/" + (this.textureCoordinatesOffset + textureCoordinatesIndexSubstitutes [vertexIndex1]) 
            + " " + (this.vertexOffset + vertexIndexSubstitutes [vertexIndex2]) 
            + "/" + (this.textureCoordinatesOffset + textureCoordinatesIndexSubstitutes [vertexIndex2]) 
            + " " + (this.vertexOffset + vertexIndexSubstitutes [vertexIndex3]) 
            + "/" + (this.textureCoordinatesOffset + textureCoordinatesIndexSubstitutes [vertexIndex3]) + "\n");
      }
    } else {
      if ((geometryArray.getVertexFormat() & GeometryArray.NORMALS) != 0) {
        this.out.write("f " + (this.vertexOffset + vertexIndexSubstitutes [vertexIndex1]) 
            + "//" + (this.normalOffset + normalIndexSubstitutes [vertexIndex1]) 
            + " "  + (this.vertexOffset + vertexIndexSubstitutes [vertexIndex2]) 
            + "//" + (this.normalOffset + normalIndexSubstitutes [vertexIndex2]) 
            + " "  + (this.vertexOffset + vertexIndexSubstitutes [vertexIndex3]) 
            + "//" + (this.normalOffset + normalIndexSubstitutes [vertexIndex3]) + "\n");
      } else {
        this.out.write("f " + (this.vertexOffset + vertexIndexSubstitutes [vertexIndex1]) 
            + " "  + (this.vertexOffset + vertexIndex2) 
            + " "  + (this.vertexOffset + vertexIndex3) + "\n");
      }
    }
  }
  
  /**
   * Writes the quadrilateral indices given at vertexIndex1, vertexIndex2, vertexIndex3, vertexIndex4,
   * in a line f at OBJ format. 
   */
  private void writeQuadrilateral(GeometryArray geometryArray, 
                                  int vertexIndex1, int vertexIndex2, int vertexIndex3, int vertexIndex4, 
                                  int [] vertexIndexSubstitutes, 
                                  int [] normalIndexSubstitutes,                                       
                                  int [] textureCoordinatesIndexSubstitutes) throws IOException {
    if ((geometryArray.getVertexFormat() & GeometryArray.TEXTURE_COORDINATE_2) != 0) {
      if ((geometryArray.getVertexFormat() & GeometryArray.NORMALS) != 0) {
        this.out.write("f " + (this.vertexOffset + vertexIndexSubstitutes [vertexIndex1]) 
            + "/" + (this.textureCoordinatesOffset + textureCoordinatesIndexSubstitutes [vertexIndex1]) 
            + "/" + (this.normalOffset + normalIndexSubstitutes [vertexIndex1]) 
            + " " + (this.vertexOffset + vertexIndexSubstitutes [vertexIndex2]) 
            + "/" + (this.textureCoordinatesOffset + textureCoordinatesIndexSubstitutes [vertexIndex2]) 
            + "/" + (this.normalOffset + normalIndexSubstitutes [vertexIndex2]) 
            + " " + (this.vertexOffset + vertexIndexSubstitutes [vertexIndex3]) 
            + "/" + (this.textureCoordinatesOffset + textureCoordinatesIndexSubstitutes [vertexIndex3]) 
            + "/" + (this.normalOffset + normalIndexSubstitutes [vertexIndex3]) 
            + " " + (this.vertexOffset + vertexIndexSubstitutes [vertexIndex4]) 
            + "/" + (this.textureCoordinatesOffset + textureCoordinatesIndexSubstitutes [vertexIndex4]) 
            + "/" + (this.normalOffset + normalIndexSubstitutes [vertexIndex4]) + "\n");
      } else {
        this.out.write("f " + (this.vertexOffset + vertexIndexSubstitutes [vertexIndex1]) 
            + "/" + (this.textureCoordinatesOffset + textureCoordinatesIndexSubstitutes [vertexIndex1]) 
            + " " + (this.vertexOffset + vertexIndexSubstitutes [vertexIndex2]) 
            + "/" + (this.textureCoordinatesOffset + textureCoordinatesIndexSubstitutes [vertexIndex2]) 
            + " " + (this.vertexOffset + vertexIndexSubstitutes [vertexIndex3]) 
            + "/" + (this.textureCoordinatesOffset + textureCoordinatesIndexSubstitutes [vertexIndex3]) 
            + " " + (this.vertexOffset + vertexIndexSubstitutes [vertexIndex4]) 
            + "/" + (this.textureCoordinatesOffset + textureCoordinatesIndexSubstitutes [vertexIndex4]) + "\n");
      }
    } else {
      if ((geometryArray.getVertexFormat() & GeometryArray.NORMALS) != 0) {
        this.out.write("f " + (this.vertexOffset + vertexIndexSubstitutes [vertexIndex1]) 
            + "//" + (this.normalOffset + normalIndexSubstitutes [vertexIndex1]) 
            + " "  + (this.vertexOffset + vertexIndexSubstitutes [vertexIndex2]) 
            + "//" + (this.normalOffset + normalIndexSubstitutes [vertexIndex2]) 
            + " "  + (this.vertexOffset + vertexIndexSubstitutes [vertexIndex3]) 
            + "//" + (this.normalOffset + normalIndexSubstitutes [vertexIndex3]) 
            + " "  + (this.vertexOffset + vertexIndexSubstitutes [vertexIndex4]) 
            + "//" + (this.normalOffset + normalIndexSubstitutes [vertexIndex4]) + "\n");
      } else {
        this.out.write("f " + (this.vertexOffset + vertexIndexSubstitutes [vertexIndex1]) 
            + " "  + (this.vertexOffset + vertexIndexSubstitutes [vertexIndex2]) 
            + " "  + (this.vertexOffset + vertexIndexSubstitutes [vertexIndex3]) 
            + " "  + (this.vertexOffset + vertexIndexSubstitutes [vertexIndex4]) + "\n");
      }
    }
  }
  
  /**
   * Closes this writer and writes MTL file and its texture images, 
   * if this writer was created from a file. 
   */
  @Override
  public void close() throws IOException {
    super.close();
    if (this.mtlFileName != null) {
      writeAppearancesToMTLFile();
    }
  }

  /**
   * Exports a set of appearance to a MTL file built from OBJ file name.  
   */
  private void writeAppearancesToMTLFile() throws IOException {
    Writer writer = null;
    try {
      writer = new OutputStreamWriter(
          new BufferedOutputStream(new FileOutputStream(this.mtlFileName)), "ISO-8859-1");
      writeHeader(writer);      
      for (Map.Entry<ComparableAppearance, String> appearanceEntry : this.appearances.entrySet()) {
        Appearance appearance = appearanceEntry.getKey().getAppearance();        
        String appearanceName = appearanceEntry.getValue();
        writer.write("\nnewmtl " + appearanceName + "\n");
        Material material = appearance.getMaterial();
        if (material != null) {
          writer.write("illum 1\n");
          Color3f color = new Color3f();
          material.getAmbientColor(color);          
          writer.write("Ka " + color.x + " " + color.y + " " + color.z + "\n");
          material.getDiffuseColor(color);          
          writer.write("Kd " + color.x + " " + color.y + " " + color.z + "\n");
          material.getSpecularColor(color);          
          writer.write("Ks " + color.x + " " + color.y + " " + color.z + "\n");
          writer.write("Ns " + material.getShininess() + "\n");
        } else {
          ColoringAttributes coloringAttributes = appearance.getColoringAttributes();
          if (coloringAttributes != null) {
            writer.write("illum 0\n");
            Color3f color = new Color3f();
            coloringAttributes.getColor(color);          
            writer.write("Ka " + color.x + " " + color.y + " " + color.z + "\n");
            writer.write("Kd " + color.x + " " + color.y + " " + color.z + "\n");
            writer.write("Ks " + color.x + " " + color.y + " " + color.z + "\n");
          }
        }
        TransparencyAttributes transparency = appearance.getTransparencyAttributes();
        if (transparency != null) {
          writer.write("Ni 1\n");
          writer.write("d " + (1f - transparency.getTransparency()) + "\n");
        }
        Texture texture = appearance.getTexture();
        if (texture != null) {
          ImageComponent2D imageComponent = (ImageComponent2D)texture.getImage(0);
          RenderedImage image = imageComponent.getRenderedImage();
          File imageFile = new File(this.mtlFileName.substring(0, this.mtlFileName.length() - 4) + "_" + appearanceName + ".jpg");
          ImageIO.write(image, "JPEG", imageFile);
          writer.write("map_Kd " + imageFile.getName() + "\n");
        }
      }      
    } finally {
      if (writer != null) {
        writer.close();
      }
    }
  }

  /**
   * An <code>Appearance</code> wrapper able to compare 
   * if two appearances are equal for MTL format.  
   */
  public static class ComparableAppearance {
    private Appearance appearance;
    
    public ComparableAppearance(Appearance appearance) {
      this.appearance = appearance;
    }
    
    public Appearance getAppearance() {
      return this.appearance;
    }
    
    /**
     * Returns <code>true</code> if this appearance and the one of <code>obj</code>
     * describe the same colors, transparency and texture. 
     */
    @Override
    public boolean equals(Object obj) {
      if (obj instanceof ComparableAppearance) {
        Appearance appearance2 = ((ComparableAppearance)obj).appearance;
        // Compare coloring attributes
        ColoringAttributes coloringAttributes1 = this.appearance.getColoringAttributes();
        ColoringAttributes coloringAttributes2 = appearance2.getColoringAttributes();
        if ((coloringAttributes1 == null) ^ (coloringAttributes2 == null)) {
          return false;
        } else if (coloringAttributes1 != coloringAttributes2) {
          Color3f color1 = new Color3f();
          Color3f color2 = new Color3f();
          coloringAttributes1.getColor(color1);
          coloringAttributes2.getColor(color2);
          if (!color1.equals(color2)) {
            return false;
          } 
        }
        // Compare material colors
        Material material1 = this.appearance.getMaterial();
        Material material2 = appearance2.getMaterial();
        if ((material1 == null) ^ (material2 == null)) {
          return false;
        } else if (material1 != material2) {
          Color3f color1 = new Color3f();
          Color3f color2 = new Color3f();
          material1.getAmbientColor(color1);
          material2.getAmbientColor(color2);
          if (!color1.equals(color2)) {
            return false;
          } else {
            material1.getDiffuseColor(color1);
            material2.getDiffuseColor(color2);
            if (!color1.equals(color2)) {
              return false;
            } else {
              material1.getEmissiveColor(color1);
              material2.getEmissiveColor(color2);
              if (!color1.equals(color2)) {
                return false;
              } else {
                material1.getSpecularColor(color1);
                material2.getSpecularColor(color2);
                if (!color1.equals(color2)) {
                  return false;
                } else if (material1.getShininess() != material2.getShininess()) {
                  return false;
                }
              }
            }
          }
        }
        // Compare transparency
        TransparencyAttributes transparency1 = this.appearance.getTransparencyAttributes();
        TransparencyAttributes transparency2 = appearance2.getTransparencyAttributes();
        if ((transparency1 == null) ^ (transparency2 == null)) {
          return false;
        } else if (transparency1 != transparency2) {
          if (transparency1.getTransparency() != transparency2.getTransparency()) {
            return false;
          }
        }
        // Compare texture
        Texture texture1 = this.appearance.getTexture();
        Texture texture2 = appearance2.getTexture();
        if ((texture1 == null) ^ (texture2 == null)) {
          return false;
        } else if (texture1 != texture2) {
          if (texture1.getImage(0) != texture2.getImage(0)) {
            return false;
          }
        }
        return true;
      }
      return false;
    }
    
    @Override
    public int hashCode() {
      int code = 0;
      ColoringAttributes coloringAttributes = appearance.getColoringAttributes();
      if (coloringAttributes != null) {
        Color3f color = new Color3f();
        coloringAttributes.getColor(color);
        code += color.hashCode();
      }
      Material material = this.appearance.getMaterial();
      if (material != null) {
        Color3f color = new Color3f();
        material.getAmbientColor(color);
        code += color.hashCode();
        material.getDiffuseColor(color);
        code += color.hashCode();
        material.getEmissiveColor(color);
        code += color.hashCode();
        material.getSpecularColor(color);
        code += color.hashCode();
        code += Float.floatToIntBits(material.getShininess());
      }
      TransparencyAttributes transparency = this.appearance.getTransparencyAttributes();
      if (transparency != null) {
        code += Float.floatToIntBits(transparency.getTransparency());
      }
      Texture texture = this.appearance.getTexture();
      if (texture != null) {
        code += texture.getImage(0).hashCode();
      }
      return code;
    }
  }
}
