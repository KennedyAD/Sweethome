/*
 * scene3d.js
 */

/**
 * Creates the 3D geometry of an indexed line strip array.
 * @param {vec3 []} vertices 
 * @param {number []} vertexIndices
 * @param {vec2 []} textureCoordinates
 * @param {number []} textureCoordinateIndices
 * @constructor
 * @extends IndexedGeometryArray3D
 * @author Emmanuel Puybaret
 */
function IndexedLineStripArray3D(vertices, vertexIndices,
                                 textureCoordinates, textureCoordinateIndices) {
  IndexedGeometryArray3D.call(this, vertices, vertexIndices, textureCoordinates, textureCoordinateIndices);
}
IndexedLineStripArray3D.prototype = Object.create(IndexedGeometryArray3D.prototype);
IndexedLineStripArray3D.prototype.constructor = IndexedLineStripArray3D;


/**
 * Creates the 3D geometry of an indexed triangle strip array.
 * @param {vec3 []} vertices 
 * @param {number []} vertexIndices
 * @param {vec2 []} textureCoordinates
 * @param {number []} textureCoordinateIndices
 * @param {vec3 []} normals 
 * @param {number []} normalsIndices
 * @constructor
 * @extends IndexedGeometryArray3D
 * @author Emmanuel Puybaret
 */
function IndexedTriangleStripArray3D(vertices, vertexIndices,
                                     textureCoordinates, textureCoordinateIndices, 
                                     normals, normalIndices) {
  IndexedGeometryArray3D.call(this, vertices, vertexIndices, textureCoordinates, textureCoordinateIndices);
  this.normals = normals;
  this.normalIndices = normalIndices;
}
IndexedTriangleStripArray3D.prototype = Object.create(IndexedGeometryArray3D.prototype);
IndexedTriangleStripArray3D.prototype.constructor = IndexedTriangleStripArray3D;

/**
 * Disposes the vertices, texture coordinates and normals used by this geometry.
 */
IndexedTriangleStripArray3D.prototype.disposeCoordinates = function() {
  IndexedGeometryArray3D.prototype.disposeCoordinates.call(this);
  delete this.normals;
  delete this.normalIndices;
}


/**
 * Creates the 3D geometry of an indexed triangle fan array.
 * @param {vec3 []} vertices 
 * @param {number []} vertexIndices
 * @param {vec2 []} textureCoordinates
 * @param {number []} textureCoordinateIndices
 * @param {vec3 []} normals 
 * @param {number []} normalsIndices
 * @constructor
 * @extends IndexedGeometryArray3D
 * @author Emmanuel Puybaret
 */
function IndexedTriangleFanArray3D(vertices, vertexIndices,
                                   textureCoordinates, textureCoordinateIndices, 
                                   normals, normalIndices) {
  IndexedGeometryArray3D.call(this, vertices, vertexIndices, textureCoordinates, textureCoordinateIndices);
  this.normals = normals;
  this.normalIndices = normalIndices;
}
IndexedTriangleFanArray3D.prototype = Object.create(IndexedGeometryArray3D.prototype);
IndexedTriangleFanArray3D.prototype.constructor = IndexedTriangleFanArray3D;

/**
 * Disposes the vertices, texture coordinates and normals used by this geometry.
 */
IndexedTriangleFanArray3D.prototype.disposeCoordinates = function() {
  IndexedGeometryArray3D.prototype.disposeCoordinates.call(this);
  delete this.normals;
  delete this.normalIndices;
}



/*
 * HTMLCanvas3D.js
 */

dans HTMLCanvas3D.prepareScene :

if (nodeGeometry instanceof IndexedTriangleArray3D) {
  displayedGeometry.mode = canvas3D.gl.TRIANGLES;
  displayedGeometry.normalBuffer = canvas3D.prepareBuffer(nodeGeometry.normals, nodeGeometry.normalIndices);
} else if (nodeGeometry instanceof IndexedTriangleStripArray3D) {
  displayedGeometry.mode = canvas3D.gl.TRIANGLE_STRIP;
  displayedGeometry.normalBuffer = canvas3D.prepareBuffer(nodeGeometry.normals, nodeGeometry.normalIndices);
} else if (nodeGeometry instanceof IndexedTriangleFanArray3D) {
  displayedGeometry.mode = canvas3D.gl.TRIANGLE_FAN;
  displayedGeometry.normalBuffer = canvas3D.prepareBuffer(nodeGeometry.normals, nodeGeometry.normalIndices);
} else if (nodeGeometry instanceof IndexedLineStripArray3D) {
  displayedGeometry.mode = canvas3D.gl.LINE_STRIP;
} else {
  displayedGeometry.mode = canvas3D.gl.LINES;
} 


displayedGeometry.lightingEnabled = (newValue === undefined || newValue >= 1)
    && (displayedGeometry.mode === canvas3D.gl.TRIANGLES
        || displayedGeometry.mode === canvas3D.gl.TRIANGLE_STRIP
        || displayedGeometry.mode === canvas3D.gl.TRIANGLE_FAN);



dans HTMLCanvas3D.drawGeometry :

if (lightingEnabled 
    && (displayedGeometry.mode === this.gl.TRIANGLES
        || displayedGeometry.mode === canvas3D.gl.TRIANGLE_STRIP
        || displayedGeometry.mode === canvas3D.gl.TRIANGLE_FAN)) {
}