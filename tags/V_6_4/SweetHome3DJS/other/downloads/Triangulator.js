/*
 * Triangulator.js
 *
 * Sweet Home 3D, Copyright (c) 2015 Emmanuel PUYBARET / eTeks <info@eteks.com>
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

// Requires core.js
// Requires Node3D.js
// Requires jszip.min.js
// Requires jszip-utils.min.js

/**
 * Triangulator class (v0).
 * Inspired from Java 3D com.sun.j3d.utils.geometry.Triangulator class, distributed under BSD license. 
 * @constructor
 */
function Triangulator() {
  this.loops = null;
  this.chains = null;
  this.points = null;
  this.numPoints = 0;
  this.triangles = null;
  this.list = null;

  this.firstNode = 0;
  
  // For Clean class
  this.pUnsorted = null;
  this.maxNumPUnsorted = 0;

  // For NoHash class
  this.noHashingEdges = false;
  this.noHashingPnts = false;
  this.loopMin = 0;
  this.loopMax = 0;
  this.vertexList = null;
  this.reflexVertices = 0;
  this.numReflex = 0;

  // For Bridge class
  this.distances = null;
  this.maxNumDist = 0;

  // For Heap class
  this.heap = null;
  this.numHeap = 0;
  this.numZero = 0;

  // For Orientation class
  this.polyArea = null;

  this.ccwLoop = true;
  this.identCntr;  

  this.epsilon = 1.0e-12;
}

Triangulator.ZERO = 1.0e-8;

Triangulator.prototype.triangulate = function(vertices, vertexIndices, textureCoordinateIndices, normalIndices, stripCounts,
                                              triangleCoordinateIndices, triangleTextureCoordinateIndices, triangleNormalIndices) {
  this.vertices = vertices;  
  this.maxNumDist = 0;
  this.maxNumPUnsorted = 0;
  this.loops = [];
  this.list = [];
  this.numReflex = 0;
  this.numPoints = 0;
  var index = 0;
  for (var j = 0; j < stripCounts.length; j++) {
    var currLoop = this.makeLoopHeader();
    var lastInd = this.loops[currLoop];
    for (var k = 0; k < stripCounts[j]; k++) {
      var ind = this.list.length;
      this.list.push(new ListNode(vertexIndices[index]));
      this.insertAfter(lastInd, ind);
      this.list[ind].setCommonIndex(index);
      lastInd = ind;
      index++;
    } 
    this.deleteHook(currLoop);
  }

  this.triangles = [];
  this.epsilon = Triangulator.ZERO;
  var reset = false, troubles = false;
  var done = [false];
  var gotIt = [false];
  for (var j = 0; j < stripCounts.length; j++) {
    this.ccwLoop = true;
    if (!Simple.simpleFace(this, this.loops[j])) {
      this.preProcessList(j);
      Project.projectFace(this, j, j + 1);
      var removed = Clean.cleanPolyhedralFace(this, j, j + 1);
      Orientation.determineOrientation(this, this.loops[j]);
      this.noHashingEdges = false;
      this.noHashingPnts  = false;
  
      EarClip.classifyAngles(this, this.loops[j]);
      this.resetPolyList(this.loops[j]);
      NoHash.prepareNoHashPnts(this, j);
      EarClip.classifyEars(this, this.loops[j]);
      done[0] = false;
  
      // Triangulate the polygon
      while (!done[0]) {
        if (!EarClip.clipEar(this, done)) {
          if (reset) {
            var ind = this.getNode();
            this.resetPolyList(ind);
            this.loops[j] = ind;
            if (Desperate.desperate(this, ind, j, done)) {
              if (!Desperate.letsHope(this, ind)) {
                return;
              }
            } else {
              reset = false;
            }
          } else {
            troubles = true;
            var ind = this.getNode();
            this.resetPolyList(ind);
            EarClip.classifyEars(this, ind);
            reset = true;
          }
        } else {
          reset = false;
        }
  
        if (done[0]) {
          var ind = this.getNextChain(gotIt);
          if (gotIt[0]) {
            this.resetPolyList(ind);
            this.loops[j] = ind;
            this.noHashingPnts = false;
            NoHash.prepareNoHashPnts(this, j);
            EarClip.classifyEars(this, ind);
            reset = false;
            done[0]  = false;
          }
        }
      }
    }
  }
  
  this.copyToTriangles(vertexIndices, textureCoordinateIndices, normalIndices,
      triangleCoordinateIndices, triangleTextureCoordinateIndices, triangleNormalIndices);
}

Triangulator.prototype.preProcessList = function(i1) {
  this.resetPolyList(this.loops[i1]);
  var tInd = this.loops[i1];
  var tInd1 = tInd;
  var tInd2 = this.list[tInd1].next;
  while (tInd2 !== tInd) {
    if (this.list[tInd1].index === this.list[tInd2].index) {
      if (tInd2 === this.loops[i1]) {
        this.loops[i1] = this.list[tInd2].next;
      }
      this.deleteLinks(tInd2);
    }
    tInd1 = this.list[tInd1].next;
    tInd2 = this.list[tInd1].next;
  }
}

Triangulator.prototype.copyToTriangles = function(vertexIndices, textureCoordinateIndices, normalIndices,
                                                  triangleCoordinateIndices, triangleTextureCoordinateIndices, triangleNormalIndices) {
  for (var i = 0; i < this.triangles.length; i++) {
    var index = this.list[this.triangles[i].v1].getCommonIndex();
    triangleCoordinateIndices.push(vertexIndices[index]);
    index = this.list[this.triangles[i].v2].getCommonIndex();
    triangleCoordinateIndices.push(vertexIndices[index]);
    index = this.list[this.triangles[i].v3].getCommonIndex();
    triangleCoordinateIndices.push(vertexIndices[index]);
  }

  if (textureCoordinateIndices !== null
      && textureCoordinateIndices.length > 0) {
    for (var i = 0; i < this.triangles.length; i++) {
      var index = this.list[this.triangles[i].v1].getCommonIndex();
      triangleTextureCoordinateIndices.push(textureCoordinateIndices[index]);
      index = this.list[this.triangles[i].v2].getCommonIndex();
      triangleTextureCoordinateIndices.push(textureCoordinateIndices[index]);
      index = this.list[this.triangles[i].v3].getCommonIndex();
      triangleTextureCoordinateIndices.push(textureCoordinateIndices[index]);
    }
  }

  if (normalIndices !== null
      && normalIndices.length) {
    currIndex = 0;
    for (var i = 0; i < this.triangles.length; i++) {
      var index = this.list[this.triangles[i].v1].getCommonIndex();
      triangleNormalIndices.push(normalIndices[index]);
      index = this.list[this.triangles[i].v2].getCommonIndex();
      triangleNormalIndices.push(normalIndices[index]);
      index = this.list[this.triangles[i].v3].getCommonIndex();
      triangleNormalIndices.push(normalIndices[index]);
    }
  }
}

// Methods of handling ListNode.
Triangulator.prototype.inPolyList = function(ind) {
  return (ind >= 0)  && (ind < this.list.length);
}

Triangulator.prototype.updateIndex = function(ind, index) {
  this.list[ind].index = index;
}

Triangulator.prototype.getAngle = function(ind) {
  return this.list[ind].convex;
}

Triangulator.prototype.setAngle = function(ind, convex) {
  this.list[ind].convex = convex;
}

Triangulator.prototype.resetPolyList = function(ind) {
  this.firstNode = ind;
}

Triangulator.prototype.getNode = function() {
  return this.firstNode;
}

Triangulator.prototype.inLoopList = function(loop) {
  return loop >= 0 && loop < this.loops.length;
}

Triangulator.prototype.deleteHook = function(currLoop) {
  var ind1 = this.loops[currLoop];
  var ind2 = this.list[ind1].next;
  if (this.inPolyList(ind1) && this.inPolyList(ind2)) {
    this.deleteLinks(ind1);
    this.loops[currLoop] = ind2;
  }
}

Triangulator.prototype.deleteLinks = function(ind) {
  if (this.inPolyList(ind) && this.inPolyList(this.list[ind].prev) 
      && this.inPolyList(this.list[ind].next)) {
    if (this.firstNode === ind) {
      this.firstNode = this.list[ind].next;
    }

    this.list[this.list[ind].next].prev = this.list[ind].prev;
    this.list[this.list[ind].prev].next = this.list[ind].next;
    this.list[ind].prev = this.list[ind].next = ind;
  }
}

Triangulator.prototype.rotateLinks = function(ind1, ind2) {
  var ind0 = this.list[ind1].next;
  var ind3 = this.list[ind2].next;
  var ind = this.list[ind1].next;
  this.list[ind1].next = this.list[ind2].next;
  this.list[ind2].next = ind;
  this.list[ind0].prev = ind2;
  this.list[ind3].prev = ind1;
}

Triangulator.prototype.storeChain = function(ind) {
  if (this.chains === null) {
    this.chains = [];
  }
  this.chains.push(ind);
}

Triangulator.prototype.getNextChain = function (done) {
  if (this.chains !== null 
      && this.chains.length > 0) {
    done[0] = true;
    return this.chains.pop();
  } else {
   done[0] = false;
   this.chains = null;
   return 0;
  }
}

Triangulator.prototype.splitSplice = function(ind1, ind2, ind3, ind4) {
  this.list[ind1].next = ind4;
  this.list[ind4].prev = ind1;
  this.list[ind2].prev = ind3;
  this.list[ind3].next = ind2;
}

Triangulator.prototype.makeHook = function() {
  var node = new ListNode(-1);
  node.prev = this.list.length;
  node.next = this.list.length;
  this.list.push(node);
  return this.list.length - 1;
}

Triangulator.prototype.makeLoopHeader = function() {
  this.loops.push(this.makeHook());
  return this.loops.length - 1;
}

Triangulator.prototype.makeNode = function(index) {
  this.list.push(new ListNode(index));
  return this.list.length - 1;
}

Triangulator.prototype.insertAfter = function(ind1, ind2) {
  if (this.inPolyList(ind1) && this.inPolyList(ind2)) {
    this.list[ind2].next = this.list[ind1].next;
    this.list[ind2].prev = ind1;
    this.list[ind1].next = ind2;
    var ind3 = this.list[ind2].next;

    if (this.inPolyList(ind3)) {
      this.list[ind3].prev = ind2;
    }
  }
}

Triangulator.prototype.fetchNextData = function(ind1) {
  return this.list[ind1].next;
}

Triangulator.prototype.fetchData = function(ind1) {
  return this.list[ind1].index;
}

Triangulator.prototype.fetchPrevData = function(ind1) {
  return this.list[ind1].prev;
}

Triangulator.prototype.swapLinks = function(ind1) {
  var ind2 = this.list[ind1].next;
  this.list[ind1].next = this.list[ind1].prev;
  this.list[ind1].prev = ind2;
  var ind3 = ind2;
  while (ind2 !== ind1) {
    ind3 = this.list[ind2].next;
    this.list[ind2].next = this.list[ind2].prev;
    this.list[ind2].prev = ind3;
    ind2 = ind3;
  }
}

Triangulator.prototype.storeTriangle = function(i, j, k) {
  if (this.ccwLoop) {
    this.triangles.push(new Triangle(i,j,k));
  } else {
    this.triangles.push(new Triangle(j,i,k));
  }
}

Triangulator.prototype.initPnts = function(number) {
  this.points = [];
  for(var i = 0; i < number; i++) {
    this.points [i] = [0., 0.];
  }
  this.numPoints = 0;
}

Triangulator.prototype.inPointsList = function(index) {
  return index >= 0 && index < this.numPoints;
}

Triangulator.prototype.storePoint = function(x, y) {
  if (this.points === null)  {
    this.points = [];
  }
  this.points[this.numPoints] = [x, y];
  return this.numPoints++;
}

// Simple class
var Simple = {}

Simple.simpleFace = function(triangulator, ind1) {
  var ind0 = triangulator.fetchPrevData(ind1);
  var i0 = triangulator.fetchData(ind0);
  if (ind0 === ind1) {
    return true;
  }

  var ind2 = triangulator.fetchNextData(ind1);
  var i2 = triangulator.fetchData(ind2);
  if (ind0 === ind2) {
    return true;
  }

  var ind3 = triangulator.fetchNextData(ind2);
  var i3 = triangulator.fetchData(ind3);
  if (ind0 === ind3) {
    triangulator.storeTriangle(ind1, ind2, ind3);
    return true;
  }

  var ind4 = triangulator.fetchNextData(ind3);
  var i4 = triangulator.fetchData(ind4);
  if (ind0 === ind4) {
    triangulator.initPnts(5);
    var i1 = triangulator.fetchData(ind1);

    var pq = vec3.subtract(vec3.create(), triangulator.vertices[i1], triangulator.vertices[i2]);
    var pr = vec3.subtract(vec3.create(), triangulator.vertices[i3], triangulator.vertices[i2]);
    var nr = vec3.cross(vec3.create(), pq, pr);

    var x = Math.abs(nr [0]);
    var y = Math.abs(nr [1]);
    var z = Math.abs(nr [2]);
    if (z >= x && z >= y) {
      triangulator.points[1][0] = triangulator.vertices[i1][0];
      triangulator.points[1][1] = triangulator.vertices[i1][1];
      triangulator.points[2][0] = triangulator.vertices[i2][0];
      triangulator.points[2][1] = triangulator.vertices[i2][1];
      triangulator.points[3][0] = triangulator.vertices[i3][0];
      triangulator.points[3][1] = triangulator.vertices[i3][1];
      triangulator.points[4][0] = triangulator.vertices[i4][0];
      triangulator.points[4][1] = triangulator.vertices[i4][1];
    } else if (x >= y && x >= z) {
      triangulator.points[1][0] = triangulator.vertices[i1][2];
      triangulator.points[1][1] = triangulator.vertices[i1][1];
      triangulator.points[2][0] = triangulator.vertices[i2][2];
      triangulator.points[2][1] = triangulator.vertices[i2][1];
      triangulator.points[3][0] = triangulator.vertices[i3][2];
      triangulator.points[3][1] = triangulator.vertices[i3][1];
      triangulator.points[4][0] = triangulator.vertices[i4][2];
      triangulator.points[4][1] = triangulator.vertices[i4][1];
    } else {
      triangulator.points[1][0] = triangulator.vertices[i1][0];
      triangulator.points[1][1] = triangulator.vertices[i1][2];
      triangulator.points[2][0] = triangulator.vertices[i2][0];
      triangulator.points[2][1] = triangulator.vertices[i2][2];
      triangulator.points[3][0] = triangulator.vertices[i3][0];
      triangulator.points[3][1] = triangulator.vertices[i3][2];
      triangulator.points[4][0] = triangulator.vertices[i4][0];
      triangulator.points[4][1] = triangulator.vertices[i4][2];
    }
    triangulator.numPoints = 5;

    var ori2 = Numerics.orientation(triangulator, 1, 2, 3);
    var ori4 = Numerics.orientation(triangulator, 1, 3, 4);
    if ((ori2 > 0 && ori4 > 0) || (ori2 < 0 && ori4 < 0)) {
      triangulator.storeTriangle(ind1, ind2, ind3);
      triangulator.storeTriangle(ind1, ind3, ind4);
    } else {
      triangulator.storeTriangle(ind2, ind3, ind4);
      triangulator.storeTriangle(ind2, ind4, ind1);
    }
    return  true;
  }
  return false;
}

// Numerics class
var Numerics = {}

Numerics.max3 = function(a, b, c) {
  return (a > b) 
      ? ((a > c) ? a : c) 
      : ((b > c) ? b : c);
}

Numerics.min3 = function(a, b, c) {
  return (a < b) 
      ? ((a < c) ? a : c)
      : ((b < c) ? b : c);
}

Numerics.baseLength = function(u, v) {
  return Math.abs(v[0] - u[0]) + Math.abs(v[1] - u[1]);
}

Numerics.sideLength = function(u, v) {
  var x = v [0] - u [0];
  var y = v [1] - u [1];
  return x * x + y * y;
}

Numerics.inBetween = function(i1, i2, i3) {
  return i1 <= i3  && i3 <= i2;
}

Numerics.strictlyInBetween = function(i1, i2, i3) {
  return i1 < i3 && i3 < i2;
}

Numerics.stableDet2D = function(triangulator, i, j, k) {
  var det;
  if (i === j || i === k || j === k) {
    det = 0.0;
  } else {
    var numericsHP = triangulator.points [i];
    var numericsHQ = triangulator.points [j];
    var numericsHR = triangulator.points [k];
    if (i < j) {
      if (j < k) {
        det =  Numerics.det2D(numericsHP, numericsHQ, numericsHR);
      } else if (i < k) {
        det = -Numerics.det2D(numericsHP, numericsHR, numericsHQ);
      } else {
        det =  Numerics.det2D(numericsHR, numericsHP, numericsHQ);
      }
    } else {
      if (i < k) {
        det = -Numerics.det2D(numericsHQ, numericsHP, numericsHR);
      } else if (j < k) {
        det =  Numerics.det2D(numericsHQ, numericsHR, numericsHP);
      } else {
        det = -Numerics.det2D(numericsHR, numericsHQ, numericsHP);
      }
    }
  }

  return det;
}

Numerics.det2D = function(u, v, w) {
  return (u[0] - v[0]) * (v[1] - w[1]) + (v[1] - u[1]) * (v[0] - w[0]);
}

Numerics.orientation = function(triangulator, i, j, k) {
  var numericsHDet = Numerics.stableDet2D(triangulator, i, j, k);
  if (numericsHDet < -triangulator.epsilon) {
    return -1;
  } else if (!(numericsHDet <= triangulator.epsilon)) {
    return 1;
  } else {
    return 0;
  }
}

Numerics.isInCone = function(triangulator, i, j, k, l, convex) {
  if (convex) {
    if (i !== j) {
      var numericsHOri1 = Numerics.orientation(triangulator, i, j, l);
      if (numericsHOri1 < 0) {
        return false;
      } else if (numericsHOri1 === 0) {
        if (i < j) {
          if (!Numerics.inBetween(i, j, l)) {
            return false;
          }
        } else if (!Numerics.inBetween(j, i, l)) {
          return false;
        }
      }
    }
    if (j !== k) {
      var numericsHOri2 = Numerics.orientation(triangulator, j, k, l);
      if (numericsHOri2 < 0) {
        return false;
      } else if (numericsHOri2 === 0) {
        if (j < k) {
          if (!Numerics.inBetween(j, k, l)) {
            return false;
          }
        } else if (!Numerics.inBetween(k, j, l)) {
          return false;
        }
      }
    }
  } else if (Numerics.orientation(triangulator, i, j, l) <= 0
             && Numerics.orientation(triangulator, j, k, l) < 0) {
    return false;
  }
  return true;
}

Numerics.isConvexAngle = function(triangulator, i, j, k, ind) {
  if (i === j) {
    if (j === k) {
      return 1;
    } else {
      return 1;
    }
  } else if (j === k) {
    return -1;
  } else {
    var numericsHOri1 = Numerics.orientation(triangulator, i, j, k);
    if (numericsHOri1 > 0) {
      return  1;
    } else if (numericsHOri1 < 0) {
      return -1;
    } else {
      var numericsHP = [triangulator.points[i][0] - triangulator.points[j][0],
                        triangulator.points[i][1] - triangulator.points[j][1]];
      var numericsHQ = [triangulator.points[k][0] - triangulator.points[j][0],
                        triangulator.points[k][1] - triangulator.points[j][1]];
      var numericsHDot = numericsHP[0] * numericsHQ[0] + numericsHP[1] * numericsHQ[1];
      if (numericsHDot < 0.0) {
        return 0;
      } else {
        return Numerics.spikeAngle(triangulator, i, j, k, ind);
      }
    }
  }
}

Numerics.pntInTriangle = function(triangulator, i1, i2, i3, i4) {
  var numericsHOri1 = Numerics.orientation(triangulator, i2, i3, i4);
  if (numericsHOri1 >= 0) {
    numericsHOri1 = Numerics.orientation(triangulator, i1, i2, i4);
    if (numericsHOri1 >= 0) {
      numericsHOri1 = Numerics.orientation(triangulator, i3, i1, i4);
      if (numericsHOri1 >= 0) {
        return true;
      }
    }
  }
  return false;
}

Numerics.vtxInTriangle = function(triangulator, i1, i2, i3, i4, type) {
  var numericsHOri1 = Numerics.orientation(triangulator, i2, i3, i4);
  if (numericsHOri1 >= 0) {
    numericsHOri1 = Numerics.orientation(triangulator, i1, i2, i4);
    if (numericsHOri1 > 0) {
      numericsHOri1 = Numerics.orientation(triangulator, i3, i1, i4);
      if (numericsHOri1 > 0) {
        type[0] = 0;
        return true;
      } else if (numericsHOri1 === 0) {
        type[0] = 1;
        return true;
      }
    } else if (numericsHOri1 === 0) {
      numericsHOri1 = Numerics.orientation(triangulator, i3, i1, i4);
      if (numericsHOri1 > 0) {
        type[0] = 2;
        return true;
      } else if (numericsHOri1 === 0) {
        type[0] = 3;
        return true;
      }
    }
  }
  return false;
}

Numerics.segIntersect = function(triangulator, i1, i2, i3, i4, i5) {
  if (i1 === i2 || i3 === i4) {
    return  false;
  }
  if (i1 === i3 && i2 === i4) {
    return  true;
  }
  if (i3 === i5 || i4 === i5) {
    ++triangulator.identCntr;
  } 
  
  var ori3 = Numerics.orientation(triangulator, i1, i2, i3);
  var ori4 = Numerics.orientation(triangulator, i1, i2, i4);
  if ((ori3 ===  1 && ori4 ===  1)  ||
      (ori3 === -1 && ori4 === -1)) {
    return  false;
  }
  if (ori3 === 0) {
    if (Numerics.strictlyInBetween(i1, i2, i3)) {
      return  true;
    }
    if (ori4 === 0) {
      if (Numerics.strictlyInBetween(i1, i2, i4)) {
        return  true;
      }
    } else {
      return  false;
    } 
  } else if (ori4 === 0) {
    if (Numerics.strictlyInBetween(i1, i2, i4)) {
      return  true;
    } else {
      return  false;
    }
  }
  
  var ori1 = orientation(triangulator, i3, i4, i1);
  var ori2 = orientation(triangulator, i3, i4, i2);
  if ((ori1 <= 0 && ori2 <= 0) 
      || (ori1 >= 0 && ori2 >= 0)) {
    return  false;
  }
  return  true;
}

Numerics.getRatio = function(triangulator, i, j, k) {
  var p = triangulator.points[i];
  var q = triangulator.points[j];
  var r = triangulator.points[k];

  var a = Numerics.baseLength(p, q);
  var b = Numerics.baseLength(p, r);
  var c = Numerics.baseLength(r, q);
  var base = Numerics.max3(a, b, c);

  if ((10.0 * a) < Math.min(b, c)) {
    return 0.1;
  }
  
  var area = Numerics.stableDet2D(triangulator, i, j, k);
  if (area < -triangulator.epsilon) {
    area = -area;
  } else if (area <= triangulator.epsilon) {
    if (base > a) {
      return 0.1;
    } else {
      return Number.MAX_VALUE;
    }                         
  }

  var ratio = base * base / area;
  if (ratio < 10.0) {
    return ratio;
  } else {
    if (a < base) {
      return 0.1;
    } else {
      return ratio;
    }
  }
}

Numerics.spikeAngle = function(triangulator, i, j, k, ind) {
  var ind2 = ind;
  var i2 = triangulator.fetchData(ind2);
  var ind1 = triangulator.fetchPrevData(ind2);
  var i1 = triangulator.fetchData(ind1);
  var ind3 = triangulator.fetchNextData(ind2);
  var i3 = triangulator.fetchData(ind3);
  return Numerics.recSpikeAngle(triangulator, i, j, k, ind1, ind3);
}

Numerics.recSpikeAngle = function(triangulator, i1, i2, i3, ind1, ind3) {
  if (ind1 === ind3) {
    return -2;
  }

  if (i1 !== i3) {
    var ii1;
    var ii2;
    if (i1 < i2) {
      ii1 = i1;
      ii2 = i2;
    } else {
      ii1 = i2;
      ii2 = i1;
    }
    if (Numerics.inBetween(ii1, ii2, i3)) {
      i2 = i3;
      ind3 = triangulator.fetchNextData(ind3);
      i3 = triangulator.fetchData(ind3);
      if (ind1 === ind3) {
        return 2;
      }  
      var ori = Numerics.orientation(triangulator, i1, i2, i3);
      if (ori > 0) {
        return  2;
      } else if (ori < 0) {
        return -2;
      } else {
        return Numerics.recSpikeAngle(triangulator, i1, i2, i3, ind1, ind3);
      }
    } else {
      i2 = i1;
      ind1 = triangulator.fetchPrevData(ind1);
      i1 = triangulator.fetchData(ind1);
      if (ind1 === ind3) {
        return 2;
      }
      var ori = Numerics.orientation(triangulator, i1, i2, i3);
      if (ori > 0) {
        return  2;
      } else if (ori < 0)  {
        return -2;
      } else {
        return Numerics.recSpikeAngle(triangulator, i1, i2, i3, ind1, ind3);
      }
    }
  } else {
    var i0 = i2;
    i2   = i1;
    ind1 = triangulator.fetchPrevData(ind1);
    i1 = triangulator.fetchData(ind1);
    if (ind1 === ind3) {
      return 2;
    }
    ind3 = triangulator.fetchNextData(ind3);
    i3 = triangulator.fetchData(ind3);
    if (ind1 === ind3) {
      return 2;
    }
    ori = Numerics.orientation(triangulator, i1, i2, i3);
    if (ori > 0) {
      if (Numerics.orientation(triangulator, i1, i2, i0) > 0
          && Numerics.orientation(triangulator, i2, i3, i0) > 0) {
        return -2;
      }
      return 2;
    } else if (ori < 0)  {
      if (Numerics.orientation(triangulator, i2, i1, i0) > 0
          && Numerics.orientation(triangulator, i3, i2, i0) > 0) {
        return 2;
      }
      return -2;
    } else {
      var pq = [triangulator.points[i1][0] - triangulator.points[i2][0], 
                triangulator.points[i1][1] - triangulator.points[i2][1]];
      var pr = [triangulator.points[i3][0] - triangulator.points[i2][0], 
                triangulator.points[i3][1] - triangulator.points[i2][1]];
      var dot = pq [0] * pr [0] + pq [1] * pr [1];
      if (dot < 0.) {
        if (Numerics.orientation(triangulator, i2, i1, i0) > 0) {
          return  2;
        } else {
          return -2;
        }
      } else {
        return Numerics.recSpikeAngle(triangulator, i1, i2, i3, ind1, ind3);
      }
    }
  }
}

Numerics.angle = function(triangulator, p, p1, p2) {
  var det = (p2[0] - p[0]) * (p[1] - p1[1]) + (p[1] - p2[1]) * (p[0] - p1[0]);
  var sign = det <= triangulator.epsilon  ? (det < -triangulator.epsilon ? -1 : 0)  : 1;
  if (sign === 0) {
    return 0.0;
  }

  var v1 = [p1[0] - p[0], p1[1] - p[1]];
  var v2 = [p2[0] - p[0], p2[1] - p[1]];
  var angle1 = Math.atan2(v1[1], v1[0]);
  var angle2 = Math.atan2(v2[1], v2[0]);

  if (angle1 < 0.0) {
    angle1 += 2.0 * Math.PI;
  }
  if (angle2 < 0.0) {
    angle2 += 2.0 * Math.PI;
  }
  
  var angle = angle1 - angle2;
  if (angle > Math.PI) {
    angle  = 2.0 * Math.PI - angle;
  } else if (angle < -Math.PI) {
    angle  = 2.0 * Math.PI + angle;
  }
  
  if (sign === 1) {
    if (angle < 0.0) {
      return  -angle;
    } else {
      return   angle;
    }
  }
  else {
    if (angle > 0.0) {
      return  -angle;
    } else {
      return   angle;
    }
  }
}


// Project class
var Project = {}

Project.projectFace = function(triangulator, loopMin, loopMax) {
  var normal = vec3.create();
  var nr = vec3.create();
  Project.determineNormal(triangulator, triangulator.loops[loopMin], normal);
  var j = loopMin + 1;
  if (j < loopMax) {
    for (var i = j;  i < loopMax; i++) {
      Project.determineNormal(triangulator, triangulator.loops[i], nr);
      if (vec3.dot(normal, nr) < 0.0) {
        vec3.negate(nr, nr);
      }
      vec3.add(normal, nr, normal);
    }
    var d = vec3.length(normal);
    if (!(d <= Triangulator.ZERO)) {
      vec3.divide(normal, normal, [d, d, d]);
    } else {
      normal[0] = normal[1] = 0.;
      normal[2] = 1.;
    }
  }

  Project.projectPoints(triangulator, loopMin, loopMax, normal);
}

Project.determineNormal = function(triangulator, ind, normal) {
  var ind1 = ind;
  var i1 = triangulator.fetchData(ind1);
  var ind0 = triangulator.fetchPrevData(ind1);
  var i0 = triangulator.fetchData(ind0);
  var ind2 = triangulator.fetchNextData(ind1);
  var i2 = triangulator.fetchData(ind2);
  var pq = vec3.subtract(vec3.create(), triangulator.vertices[i0], triangulator.vertices[i1]);
  var pr = vec3.subtract(vec3.create(), triangulator.vertices[i2], triangulator.vertices[i1]);
  var nr = vec3.cross(vec3.create(), pq, pr);
  var d = vec3.length(nr);
  if (!(d <= Triangulator.ZERO)) {
    vec3.divide(normal, nr, [d, d, d]);
  } else {
    normal[0] = normal[1] = normal[2] = 0.;
  }

  vec3.copy(pq, pr);
  ind1 = ind2;
  ind2 = triangulator.fetchNextData(ind1);
  i2 = triangulator.fetchData(ind2);
  while (ind1 !== ind) {
    vec3.subtract(pr, triangulator.vertices[i2], triangulator.vertices[i1]);
    vec3.cross(nr, pq, pr);
    d = vec3.length(nr);
    if (!(d <= Triangulator.ZERO))  {
      vec3.divide(nr, nr, [d, d, d]);
      if (vec3.dot(normal, nr) < 0.) {
        vec3.negate(nr, nr);
      }
      vec3.add(normal, nr, normal);
    }
    vec3.copy(pq, pr);
    ind1 = ind2;
    ind2 = triangulator.fetchNextData(ind1);
    i2 = triangulator.fetchData(ind2);
  }

  d = vec3.length(normal);
  if (!(d <= Triangulator.ZERO)) {
    vec3.divide(normal, normal, [d, d, d]);
  } else {
    normal[0] = normal[1] = 0.;
    normal[2] = 1.;
  }
}

Project.projectPoints = function(triangulator, i1, i2, n3) {
  var n1 = vec3.create();
  var n2 = vec3.create();
  if ((Math.abs(n3[0]) > 0.1)  || (Math.abs(n3[1]) > 0.1)) {
    n1[0] = -n3[1];
    n1[1] =  n3[0];
    n1[2] =  0.;
  } else {
    n1[0] =  n3[2];
    n1[2] = -n3[0];
    n1[1] =  0.;
  }
  var d = vec3.length(n1);
  vec3.divide(n1, n1, [d, d, d]);
  vec3.cross(n2, n1, n3);
  d = vec3.length(n2);
  vec3.divide(n2, n2, [d, d, d]);

  var matrix = mat4.create();
  matrix[0] = n1[0];
  matrix[4] = n1[1];
  matrix[8] = n1[2];
  matrix[1] = n2[0];
  matrix[5] = n2[1];
  matrix[9] = n2[2];
  matrix[2] = n3[0];
  matrix[6] = n3[1];
  matrix[10] = n3[2];

  var vtx = vec3.create();
  triangulator.initPnts(20);
  for (var i = i1; i < i2; i++) {
    var ind = triangulator.loops[i];
    var ind1 = ind;
    var j1 = triangulator.fetchData(ind1);
    vec3.transformMat4(vtx, triangulator.vertices[j1], matrix);
    j1 = triangulator.storePoint(vtx[0], vtx[1]);
    triangulator.updateIndex(ind1, j1);
    ind1 = triangulator.fetchNextData(ind1);
    j1 = triangulator.fetchData(ind1);
    while (ind1 !== ind) {
      vec3.transformMat4(vtx, triangulator.vertices[j1], matrix);
      j1 = triangulator.storePoint(vtx[0], vtx[1]);
      triangulator.updateIndex(ind1, j1);
      ind1 = triangulator.fetchNextData(ind1);
      j1 = triangulator.fetchData(ind1);
    }
  }
}

// Clean class
var Clean = {}

Clean.initPUnsorted = function(triangulator, number) {
  if (number > triangulator.maxNumPUnsorted) {
    triangulator.maxNumPUnsorted = number;
    triangulator.pUnsorted = new Array(triangulator.maxNumPUnsorted);
    for (var i = 0; i < triangulator.maxNumPUnsorted; i++) {
      triangulator.pUnsorted [i] = [0., 0.];
    }
  }
}

Clean.cleanPolyhedralFace = function(triangulator, i1, i2) {
  Clean.initPUnsorted(triangulator, triangulator.numPoints);

  for (var i = 0; i < triangulator.numPoints; i++) {
    triangulator.pUnsorted[i][0] = triangulator.points[i][0];
    triangulator.pUnsorted[i][1] = triangulator.points[i][1];
  }

  Clean.sort(triangulator.points, triangulator.numPoints);
  var i = 0;
  var j;
  for (j = 1; j < triangulator.numPoints; j++) {
    if (Clean.pComp(triangulator.points[i], triangulator.points[j]) !== 0) {
      triangulator.points[++i] = triangulator.points[j];
    }
  }
  var numSorted = i + 1;
  var removed = triangulator.numPoints - numSorted;
  for (i = i1;  i < i2;  ++i) {
    var ind1 = triangulator.loops[i];
    var ind2 = triangulator.fetchNextData(ind1);
    var index = triangulator.fetchData(ind2);
    while (ind2 !== ind1) {
      j = Clean.findPInd(triangulator.points, numSorted, triangulator.pUnsorted[index]);
      triangulator.updateIndex(ind2, j);
      ind2 = triangulator.fetchNextData(ind2);
      index = triangulator.fetchData(ind2);
    }
    j = Clean.findPInd(triangulator.points, numSorted, triangulator.pUnsorted[index]);
    triangulator.updateIndex(ind2, j);
  }

  triangulator.numPoints = numSorted;
  return removed;
}

Clean.sort = function(points, numPts) {
  for (var i = 0; i < numPts; i++) {
    for (var j = i + 1; j < numPts; j++) {
      if (Clean.pComp(points[i], points[j]) > 0) {
        var x = points[i][0];
        var y = points[i][1];
        points[i][0] = points[j][0];
        points[i][1] = points[j][1];
        points[j][0] = x;
        points[j][1] = y;
      }
    }
  }
}

Clean.findPInd = function(sorted, numPts, pnt) {
  for (var i = 0; i < numPts; i++) {
    if (pnt[0] === sorted[i][0] 
        && pnt[1] === sorted[i][1]) {
      return i;
    }
  }
  return -1;
}

Clean.pComp = function(a, b) {
  if (a[0] < b[0]) {
    return -1;
  } else if (a[0] > b[0]) {
    return  1;
  } else {
    if (a[1] < b[1]) {
      return -1;
    } else if (a[1] > b[1]) {
      return  1;
    } else {
      return  0;
    }
  }
}

// Orientation class
var Orientation = {}

Orientation.adjustOrientation = function(triangulator, i1, i2) {
  if (triangulator.polyArea === null)  {
    triangulator.polyArea = [];
  }
  for (var i = i1;  i < i2;  ++i) {
    var ind = triangulator.loops[i];
    triangulator.polyArea[i] = Orientation.polygonArea(triangulator, ind);
  }
  var area  = Math.abs(triangulator.polyArea[i1]);
  var outer = i1;
  for (var i = i1 + 1;  i < i2;  ++i) {
    if (area < Math.abs(triangulator.polyArea[i]))  {
      area  = Math.abs(triangulator.polyArea[i]);
      outer = i;
    }
  }
  if (outer !== i1) {
    var ind = triangulator.loops[i1];
    triangulator.loops[i1] = triangulator.loops[outer];
    triangulator.loops[outer] = ind;
    area = triangulator.polyArea[i1];
    triangulator.polyArea[i1] = triangulator.polyArea[outer];
    triangulator.polyArea[outer] = area;
  }
  if (triangulator.polyArea[i1] < 0.0) {
    triangulator.swapLinks(triangulator.loops[i1]);
  }
  for (var i = i1 + 1;  i < i2;  ++i) {
    if (triangulator.polyArea[i] > 0.0) {
      triangulator.swapLinks(triangulator.loops[i]);
    }
  }
}

Orientation.polygonArea = function(triangulator, ind) {
  var hook = 0;
  var ind1 = ind;
  var i1 = triangulator.fetchData(ind1);
  var ind2 = triangulator.fetchNextData(ind1);
  var i2 = triangulator.fetchData(ind2);
  var area = Numerics.stableDet2D(triangulator, hook, i1, i2);

  ind1 = ind2;
  i1   = i2;
  while (ind1 !== ind) {
    ind2  = triangulator.fetchNextData(ind1);
    i2 = triangulator.fetchData(ind2);
    area += Numerics.stableDet2D(triangulator, hook, i1, i2);
    ind1  = ind2;
    i1    = i2;
  }

  return  area;
}

Orientation.determineOrientation = function(triangulator, ind) {
  if (Orientation.polygonArea(triangulator, ind) < 0.0)   {
    triangulator.swapLinks(ind);
    triangulator.ccwLoop = false;
  }
}

// EarClip class
var EarClip = {}

EarClip.classifyAngles = function(triangulator, ind) {
  var ind1 = ind;
  var i1 = triangulator.fetchData(ind1);
  var ind0 = triangulator.fetchPrevData(ind1);
  var i0 = triangulator.fetchData(ind0);
  do {
    var ind2 = triangulator.fetchNextData(ind1);
    var i2 = triangulator.fetchData(ind2);
    var angle = Numerics.isConvexAngle(triangulator, i0, i1, i2, ind1);
    triangulator.setAngle(ind1, angle);
    i0 = i1;
    i1 = i2;
    ind1 = ind2;
  } while (ind1 !== ind);
}

EarClip.classifyEars = function(triangulator, ind) {
  var ind0 = [0];
  var ind2 = [0];
  var ratio = [0.];
  Heap.initHeap(triangulator);
  var ind1 = ind;
  var i1 = triangulator.fetchData(ind1);

  do {
    if ((triangulator.getAngle(ind1) > 0) 
        && EarClip.isEar(triangulator, ind1, ind0, ind2, ratio))   {
      Heap.dumpOnHeap(triangulator, ratio[0], ind1, ind0[0], ind2[0]);
    }
    ind1 = triangulator.fetchNextData(ind1);
    i1 = triangulator.fetchData(ind1);
  } while (ind1 !== ind);
}

EarClip.isEar = function(triangulator, ind2, ind1, ind3, ratio) {
  var i2 = triangulator.fetchData(ind2);
  ind3[0] = triangulator.fetchNextData(ind2);
  var i3 = triangulator.fetchData(ind3[0]);
  var ind4 = triangulator.fetchNextData(ind3[0]);
  var i4 = triangulator.fetchData(ind4);
  ind1[0] = triangulator.fetchPrevData(ind2);
  var i1 = triangulator.fetchData(ind1[0]);
  var ind0 = triangulator.fetchPrevData(ind1[0]);
  var i0 = triangulator.fetchData(ind0);

  if (i1 === i3 || i1 === i2 || i2 === i3 || triangulator.getAngle(ind2) === 2) {
    ratio[0] = 0.0;
    return  true;
  }

  if (i0 === i3) {
    if (triangulator.getAngle(ind0) < 0 || triangulator.getAngle(ind3[0]) < 0) {
      ratio[0] = 0.0;
      return  true;
    }
    else {
      return  false;
    }
  }

  if (i1 === i4) {
    if ((triangulator.getAngle(ind1[0]) < 0)  ||  (triangulator.getAngle(ind4) < 0)) {
      ratio[0] = 0.0;
      return  true;
    }
    else {
      return  false;
    }
  }

  var convex = triangulator.getAngle(ind1[0]) > 0;
  var coneOk = Numerics.isInCone(triangulator, i0, i1, i2, i3, convex);
  if (!coneOk) {
    return false;
  }
  var convex = triangulator.getAngle(ind3[0]) > 0;
  var coneOk = Numerics.isInCone(triangulator, i2, i3, i4, i1, convex);
  if (coneOk) {
    var box = new BoundingBox(triangulator, i1, i3);
    if (!NoHash.noHashIntersectionExists(triangulator, i2, ind2, i3, i1, box)) {
      ratio[0] = 1.0;
      return true;
    }
  }

  return  false;
}

EarClip.clipEar = function(triangulator, done) {
  var index1 = [0];
  var index3 = [0];
  var ind1;
  var ind2 = [0];
  var ind3;
  var i1;
  var i3;
  do {
    if (!Heap.deleteFromHeap(triangulator, ind2, index1, index3)) {
      return false;
    }
    ind1 = triangulator.fetchPrevData(ind2[0]);
    i1 = triangulator.fetchData(ind1);
    ind3 = triangulator.fetchNextData(ind2[0]);
    i3 = triangulator.fetchData(ind3);
  } while (index1[0] !== ind1 || index3[0] !== ind3);

  var i2 = triangulator.fetchData(ind2[0]);
  triangulator.deleteLinks(ind2[0]);
  triangulator.storeTriangle(ind1, ind2[0], ind3);

  var ind0 = triangulator.fetchPrevData(ind1);
  var i0 = triangulator.fetchData(ind0);
  if (ind0 === ind3) {
    done[0] = true;
    return  true;
  }

  var angle1 = Numerics.isConvexAngle(triangulator, i0, i1, i3, ind1);
  var ind4 = triangulator.fetchNextData(ind3);
  var i4 = triangulator.fetchData(ind4);
  var angle3 = Numerics.isConvexAngle(triangulator, i1, i3, i4, ind3);
  if (i1 !== i3) {
    if (angle1 >= 0 && triangulator.getAngle(ind1) < 0) {
      NoHash.deleteReflexVertex(triangulator, ind1);
    }
    if (angle3 >= 0 && triangulator.getAngle(ind3) < 0) {
      NoHash.deleteReflexVertex(triangulator, ind3);
    }
  } else {
    if (angle1 >= 0 && triangulator.getAngle(ind1) < 0) {
      NoHash.deleteReflexVertex(triangulator, ind1);
    } else if (angle3 >= 0 && triangulator.getAngle(ind3) < 0) {
      NoHash.deleteReflexVertex(triangulator, ind3);
    }
  }

  triangulator.setAngle(ind1, angle1);
  triangulator.setAngle(ind3, angle3);

  var ratio = [0.];
  var index0 = [0];
  var index2 = [0];
  if (angle1 > 0) {
    if (EarClip.isEar(triangulator, ind1, index0, index2, ratio)) {
      Heap.insertIntoHeap(triangulator, ratio[0], ind1, index0[0], index2[0]);
    }
  }

  var index4 = [0];
  if (angle3 > 0) {
    if (EarClip.isEar(triangulator, ind3, index2, index4, ratio)) {
      Heap.insertIntoHeap(triangulator, ratio[0], ind3, index2[0], index4[0]);
    }
  }

  ind0 = triangulator.fetchPrevData(ind1);
  i0 = triangulator.fetchData(ind0);
  ind4 = triangulator.fetchNextData(ind3);
  i4 = triangulator.fetchData(ind4);
  if (ind0 === ind4) {
    triangulator.storeTriangle(ind1, ind3, ind4);
    done[0] = true;
  } else {
    done[0] = false;
  }

  return true;
}

// NoHash class
var NoHash = {}

NoHash.NIL = -1;

NoHash.insertAfterVertex = function(triangulator, vertexIndex) {
  if (triangulator.vertexList === null) {
    triangulator.vertexList = [];
  }
  var node = new PointNode();
  node.pnt = vertexIndex;
  node.next = triangulator.reflexVertices;
  triangulator.vertexList.push(node);
  triangulator.reflexVertices = triangulator.vertexList.length - 1;
  ++triangulator.numReflex;
}

NoHash.deleteFromList = function(triangulator, i) {
  if (triangulator.numReflex === 0) {
    return;
  }
  var indPnt = triangulator.reflexVertices;
  var indVtx = triangulator.vertexList[indPnt].pnt;

  if (indVtx === i) {
    triangulator.reflexVertices = triangulator.vertexList[indPnt].next;
    --triangulator.numReflex;
  } else {
    var indPnt1 = triangulator.vertexList[indPnt].next;
    while (indPnt1 !== NoHash.NIL) {
      indVtx = triangulator.vertexList[indPnt1].pnt;
      if (indVtx === i) {
        triangulator.vertexList[indPnt].next = triangulator.vertexList[indPnt1].next;
        indPnt1 = NoHash.NIL;
        --triangulator.numReflex;
      } else {
        indPnt = indPnt1;
        indPnt1 = triangulator.vertexList[indPnt].next;
      }
    }
  }
}

NoHash.inVtxList = function(triangulator, vtx) {
  return 0 <= vtx && triangulator.vertexList !== null && vtx < triangulator.vertexList.length;
}

NoHash.freeNoHash = function(triangulator) {
  triangulator.noHashingEdges = false;
  triangulator.noHashingPnts  = false;
  triangulator.vertexList = null;
}

NoHash.prepareNoHashEdges = function(triangulator, currLoopMin, currLoopMax) {
  triangulator.loopMin = currLoopMin;
  triangulator.loopMax = currLoopMax;
  triangulator.noHashingEdges = true;
}


NoHash.prepareNoHashPnts = function(triangulator, currLoopMin) {
  triangulator.vertexList = null;
  triangulator.reflexVertices = NoHash.NIL;

  var ind = triangulator.loops[currLoopMin];
  var ind1 = ind;
  triangulator.numReflex = 0;
  var i1 = triangulator.fetchData(ind1);

  do {
    if (triangulator.getAngle(ind1) < 0) {
      NoHash.insertAfterVertex(triangulator, ind1);
    }
    ind1 = triangulator.fetchNextData(ind1);
    i1 = triangulator.fetchData(ind1);
  } while (ind1 !== ind);

  triangulator.noHashingPnts = true;
}

NoHash.noHashIntersectionExists = function(triangulator, i1, ind1, i2, i3, box) {
  if (triangulator.numReflex <= 0) {
    return false;
  }
  
  if (i1 < box.imin) {
    box.imin = i1;
  } else if (i1 > box.imax) {
    box.imax = i1;
  }
  var y = triangulator.points[i1].y;
  if (y < box.ymin) {
    box.ymin = y;
  } else if (y > box.ymax) {
    box.ymax = y;
  }
  
  var indPnt = triangulator.reflexVertices;
  var type = [0];
  do {
    var indVtx = triangulator.vertexList[indPnt].pnt;
    var i4 = triangulator.fetchData(indVtx);

    if (box.inBoundingBox(triangulator, i4)) {
      var ind5 = triangulator.fetchNextData(indVtx);
      var i5 = triangulator.fetchData(ind5);
      if (indVtx !== ind1 && indVtx !== ind5) {
        if (i4 === i1) {
          if (Degenerate.handleDegeneracies(triangulator, i1, ind1, i2, i3, i4, indVtx)) {
            return  true;
          }
        } else if (i4 !== i2 && i4 !== i3) {
          if (Numerics.vtxInTriangle(triangulator, i1, i2, i3, i4, type)) {
            return true;
          }
        }
      }
    }
    indPnt = triangulator.vertexList[indPnt].next;
  } while (indPnt !== NoHash.NIL);

  return false;
}

NoHash.deleteReflexVertex = function(triangulator, ind) {
  NoHash.deleteFromList(triangulator, ind);
}

NoHash.noHashEdgeIntersectionExists = function(triangulator, box, i1, i2, ind5, i5) {
  triangulator.identCntr = 0;
  for (var i = triangulator.loopMin; i < triangulator.loopMax; i++) {
    var ind  = triangulator.loops[i];
    var ind2 = ind;
    var i3 = triangulator.fetchData(ind2);
    do {
      ind2 = triangulator.fetchNextData(ind2);
      var i4 = triangulator.fetchData(ind2);
      var box1 = new BoundingBox(triangulator, i3, i4);
      if (box.overlap(box1)) {
        if (Numerics.segIntersect(triangulator, box.imin, box.imax, box1.imin, box1.imax, i5))
          return  true;
        }
        i3 = i4;
    } while (ind2 !== ind);
  }

  if (triangulator.identCntr >= 4) {
    return BottleNeck.checkBottleNeck(triangulator, i5, i1, i2, ind5); 
  }
  return false;
}

// Degenerate class
var Degenerate = {}

Degenerate.handleDegeneracies = function(triangulator, i1, ind1, i2, i3, i4, ind4) {
  var ind5 = triangulator.fetchPrevData(ind4);
  var i5 = triangulator.fetchData(ind5);
  if (i5 !== i2 && i5 !== i3) {
    var type = [0];
    var flag = Numerics.vtxInTriangle(triangulator, i1, i2, i3, i5, type);
    if (flag && type[0] === 0) {
      return true;
    }
    if (i2 <= i3) {
      if (i4 <= i5) {
        flag = Numerics.segIntersect(triangulator, i2, i3, i4, i5, -1);
      } else {
        flag = Numerics.segIntersect(triangulator, i2, i3, i5, i4, -1);
      }
    } else {
      if (i4 <= i5) {
        flag = Numerics.segIntersect(triangulator, i3, i2, i4, i5, -1);
      } else {
        flag = Numerics.segIntersect(triangulator, i3, i2, i5, i4, -1);
      }
    }
    if (flag) {
      return true;
    }
  }

  ind5 = triangulator.fetchNextData(ind4);
  i5 = triangulator.fetchData(ind5);
  if (i5 !== i2 && i5 !== i3) {
    var type = [0];
    var flag = Numerics.vtxInTriangle(triangulator, i1, i2, i3, i5, type);
    if (flag && type[0] === 0) {
      return true;
    }
    if (i2 <= i3) {
      if (i4 <= i5) {
        flag = Numerics.segIntersect(triangulator, i2, i3, i4, i5, -1);
      } else {               
        flag = Numerics.segIntersect(triangulator, i2, i3, i5, i4, -1);
      }
    } else {
      if (i4 <= i5) {
        flag = Numerics.segIntersect(triangulator, i3, i2, i4, i5, -1);
      } else {
        flag = Numerics.segIntersect(triangulator, i3, i2, i5, i4, -1);
      }
    }
    if (flag) {
      return true;
    }
  }

  var i0   = i1;
  var ind0 = ind1;
  var aera = 0.; 
  var area1 = 0.;
  ind1 = triangulator.fetchNextData(ind1);
  i1 = triangulator.fetchData(ind1);
  while (ind1 !== ind4) {
    var ind2  = triangulator.fetchNextData(ind1);
    i2 = triangulator.fetchData(ind2);
    area = Numerics.stableDet2D(triangulator, i0, i1, i2);
    area1 += area;
    ind1   = ind2;
    i1     = i2;
  }

  var aera2 = 0.;
  ind1 = triangulator.fetchPrevData(ind0);
  i1 = triangulator.fetchData(ind1);
  while (ind1 !== ind4) {
    var ind2  = triangulator.fetchPrevData(ind1);
    i2 = triangulator.fetchData(ind2);
    area = Numerics.stableDet2D(triangulator, i0, i1, i2);
    area2 += area;
    ind1   = ind2;
    i1     = i2;
  }

  if (area1 <= triangulator.ZERO && area2 <= triangulator.ZERO) {
    return false;
  } else if (!(area1 <= -triangulator.ZERO) && !(area2 <= -triangulator.ZERO)) { 
    return false;
  } else {
    return true;
  }
}

// Desperate class
var Desperate = {}

Desperate.desperate = function(triangulator, ind, i, splitted) {
  var i1 = [0];
  var i2 = [0];
  var i3 = [0];
  var i4 = [0];
  var ind1 = [0];
  var ind2 = [0];
  var ind3 = [0];
  var ind4 = [0];

  splitted[0] = false;
  if (Desperate.existsCrossOver(triangulator, ind, ind1, i1, ind2, i2, ind3, i3, ind4, i4)) {
    Desperate.handleCrossOver(triangulator, ind1[0], i1[0], ind2[0], i2[0], ind3[0], i3[0], ind4[0], i4[0]);
    return false;
  }

  NoHash.prepareNoHashEdges(triangulator, i, i+1);
  if (Desperate.existsSplit(triangulator, ind, ind1, i1, ind2, i2)) {
    Desperate.handleSplit(triangulator, ind1[0], i1[0], ind2[0], i2[0]);
    splitted[0] = true;
    return false;
  }

  return true;
}

Desperate.existsCrossOver = function(triangulator, ind, ind1, i1, ind2, i2, ind3, i3, ind4, i4) {
  ind1[0] = ind;
  i1[0] = triangulator.fetchData(ind1[0]);
  ind2[0] = triangulator.fetchNextData(ind1[0]);
  i2[0] = triangulator.fetchData(ind2[0]);
  ind3[0] = triangulator.fetchNextData(ind2[0]);
  i3[0] = triangulator.fetchData(ind3[0]);
  ind4[0] = triangulator.fetchNextData(ind3[0]);
  i4[0] = triangulator.fetchData(ind4[0]);
  do {
    var box1 = new BoundingBox(triangulator, i1[0], i2[0]);
    var box2 = new BoundingBox(triangulator, i3[0], i4[0]);
    if (box1.overlap(box2)) {
      if (Numerics.segIntersect(triangulator, box1.imin, box1.imax, box2.imin, box2.imax, -1)) {
        return true;
      }
    }
    ind1[0] = ind2[0];
    i1[0]   = i2[0];
    ind2[0] = ind3[0];
    i2[0]   = i3[0];
    ind3[0] = ind4[0];
    i3[0]   = i4[0];
    ind4[0] = triangulator.fetchNextData(ind3[0]);
    i4[0] = triangulator.fetchData(ind4[0]);
  } while (ind1[0] !== ind);

  return false;
}

Desperate.handleCrossOver = function(triangulator, ind1, i1, ind2, i2, ind3, i3, ind4, i4) {
  var angle1 = triangulator.getAngle(ind1);
  var angle4 = triangulator.getAngle(ind4);
  var first;
  if (angle1 < angle4) {
    first = true;
  } else if (angle1 > angle4) {
    first = false;
  } else {
    first = true;
  }

  if (first) {
    triangulator.deleteLinks(ind2);
    triangulator.storeTriangle(ind1, ind2, ind3);
    triangulator.setAngle(ind3, 1);
    Heap.insertIntoHeap(triangulator, 0.0, ind3, ind1, ind4);
  } else {
    triangulator.deleteLinks(ind3);
    triangulator.storeTriangle(ind2, ind3, ind4);
    triangulator.setAngle(ind2, 1);
    Heap.insertIntoHeap(triangulator, 0.0, ind2, ind1, ind4);
  }
}

Desperate.letsHope = function(triangulator, ind) {
  var ind1 = ind;
  do  {
    if (triangulator.getAngle(ind1) > 0) {
      var ind0 = triangulator.fetchPrevData(ind1);
      var ind2 = triangulator.fetchNextData(ind1);
      Heap.insertIntoHeap(triangulator, 0.0, ind1, ind0, ind2);
      return true;
    }
    ind1 = triangulator.fetchNextData(ind1);
  } while (ind1 !== ind);

  triangulator.setAngle(ind, 1);
  var ind0 = triangulator.fetchPrevData(ind);
  var ind2 = triangulator.fetchNextData(ind);
  Heap.insertIntoHeap(triangulator, 0.0, ind, ind0, ind2);
  return true;
}

Desperate.existsSplit = function(triangulator, ind, ind1, i1, ind2, i2) {
  if (triangulator.numPoints > triangulator.maxNumDist) {
    triangulator.maxNumDist = triangulator.numPoints;
    triangulator.distances = new Array(triangulator.maxNumDist);
    for (var k = 0; k < triangulator.maxNumDist; k++) {
      triangulator.distances[k] = new Distance();
    }
  }
  ind1[0] = ind;
  i1[0] = triangulator.fetchData(ind1[0]);
  var ind4 = triangulator.fetchNextData(ind1[0]);
  var i4 = triangulator.fetchData(ind4);
  var ind5 = triangulator.fetchNextData(ind4);
  var i5 = triangulator.fetchData(ind5);
  var ind3  = triangulator.fetchPrevData(ind1[0]);
  var i3 = triangulator.fetchData(ind3);
  if (Desperate.foundSplit(triangulator, ind5, i5, ind3, ind1[0], i1[0], i3, i4, ind2, i2)) {
    return true;
  }
  i3      = i1[0];
  ind1[0] = ind4;
  i1[0]   = i4;
  ind4    = ind5;
  i4      = i5;
  ind5    = triangulator.fetchNextData(ind4);
  i5      = triangulator.fetchData(ind5);
  while (ind5 !== ind) {
    if (Desperate.foundSplit(triangulator, ind5, i5, ind, ind1[0], i1[0], i3, i4, ind2, i2)) {
      return true;
    }
    i3    = i1[0];
    ind1[0] = ind4;
    i1[0]   = i4;
    ind4  = ind5;
    i4    = i5;
    ind5  = triangulator.fetchNextData(ind4);
    i5    = triangulator.fetchData(ind5);
  }
  
  return false;
}

Desperate.windingNumber = function(triangulator, ind, p) {
  var i1 = triangulator.fetchData(ind);
  var ind2 = triangulator.fetchNextData(ind);
  var i2 = triangulator.fetchData(ind2);
  var angle = Numerics.angle(triangulator, p, triangulator.points[i1], triangulator.points[i2]);
  while (ind2 !== ind) {
    i1   = i2;
    ind2 = triangulator.fetchNextData(ind2);
    i2 = triangulator.fetchData(ind2);
    angle += Numerics.angle(triangulator, p, triangulator.points[i1], triangulator.points[i2]);
  }

  angle += Math.PI;
  return (int)(angle / (Math.PI*2.0));
}

Desperate.foundSplit = function(triangulator, ind5, i5, ind, ind1, i1, i3, i4, ind2, i2) {
  var numDist = 0;
  do {
    triangulator.distances[numDist].dist = Numerics.baseLength(triangulator.points[i1],
        triangulator.points[i5]);
    triangulator.distances[numDist].ind = ind5;
    ++numDist;
    ind5 = triangulator.fetchNextData(ind5);
    i5 = triangulator.fetchData(ind5);
  } while (ind5 !== ind);

  Bridge.sortDistance(triangulator.distances, numDist);

  for (var j = 0; j < numDist; j++) {
    ind2[0] = triangulator.distances[j].ind;
    i2[0] = triangulator.fetchData(ind2[0]);
    if (i1 !== i2[0]) {
      var ind6  = triangulator.fetchPrevData(ind2[0]);
      var i6 = triangulator.fetchData(ind6);
      var ind7  = triangulator.fetchNextData(ind2[0]);
      var i7 = triangulator.fetchData(ind7);
      var convex = triangulator.getAngle(ind2[0]) > 0;
      if (Numerics.isInCone(triangulator, i6, i2[0], i7, i1, convex)) {
        convex = triangulator.getAngle(ind1) > 0;
        if (Numerics.isInCone(triangulator, i3, i1, i4, i2[0], convex)) {
          var box = new BoundingBox(triangulator, i1, i2[0]);
          if (!NoHash.noHashEdgeIntersectionExists(triangulator, box, -1, -1, ind1, -1)) {
            var center = [(triangulator.points[i1][0] + triangulator.points[i2[0]][0]) * 0.5, 
                          (triangulator.points[i1][1] + triangulator.points[i2[0]][1]) * 0.5];
            if (Desperate.windingNumber(triangulator, ind, center) === 1) {
              return true;
            }
          }
        }
      }
    }
  }

  return false;
}

Desperate.handleSplit = function(triangulator, ind1, i1, ind3, i3) {
  var ind2 = triangulator.makeNode(i1);
  triangulator.insertAfter(ind1, ind2);
  var comIndex = triangulator.list[ind1].getCommonIndex();
  triangulator.list[ind2].setCommonIndex(comIndex);
  
  var ind4 = triangulator.makeNode(i3);
  triangulator.insertAfter(ind3, ind4);
  comIndex = triangulator.list[ind3].getCommonIndex();
  triangulator.list[ind4].setCommonIndex(comIndex);
  
  triangulator.splitSplice(ind1, ind2, ind3, ind4);

  triangulator.storeChain(ind1);
  triangulator.storeChain(ind3);
  
  var next = triangulator.fetchNextData(ind1);
  var nxt = triangulator.fetchData(next);
  var prev = triangulator.fetchPrevData(ind1);
  var prv = triangulator.fetchData(prev);
  var angle = Numerics.isConvexAngle(triangulator, prv, i1, nxt, ind1);
  triangulator.setAngle(ind1, angle);
  
  next = triangulator.fetchNextData(ind2);
  nxt = triangulator.fetchData(next);
  prev = triangulator.fetchPrevData(ind2);
  prv = triangulator.fetchData(prev);
  angle = Numerics.isConvexAngle(triangulator, prv, i1, nxt, ind2);
  triangulator.setAngle(ind2, angle);
  
  next = triangulator.fetchNextData(ind3);
  nxt = triangulator.fetchData(next);
  prev = triangulator.fetchPrevData(ind3);
  prv = triangulator.fetchData(prev);
  angle = Numerics.isConvexAngle(triangulator, prv, i3, nxt, ind3);
  triangulator.setAngle(ind3, angle);
  
  next = triangulator.fetchNextData(ind4);
  nxt = triangulator.fetchData(next);
  prev = triangulator.fetchPrevData(ind4);
  prv = triangulator.fetchData(prev);
  angle = Numerics.isConvexAngle(triangulator, prv, i3, nxt, ind4);
  triangulator.setAngle(ind4, angle);
}

// Heap class
var Heap = {}

Heap.initHeap = function(triangulator) {
  triangulator.heap = [];
  triangulator.numHeap = 0;
  triangulator.numZero = 0;
}

Heap.storeHeapData = function(triangulator, index, ratio, ind, prev, next) {
  triangulator.heap[index] = new HeapNode();
  triangulator.heap[index].ratio = ratio;
  triangulator.heap[index].index = ind;
  triangulator.heap[index].prev  = prev;
  triangulator.heap[index].next  = next;
}

Heap.dumpOnHeap = function(triangulator, ratio, ind, prev, next) {
  var index;
  if (ratio === 0.0) {
    if (triangulator.numZero < triangulator.numHeap) {
      if (triangulator.heap[triangulator.numHeap] === undefined) {
        Heap.storeHeapData(triangulator, triangulator.numHeap, triangulator.heap[triangulator.numZero].ratio,
            triangulator.heap[triangulator.numZero].index,
            triangulator.heap[triangulator.numZero].prev,
            triangulator.heap[triangulator.numZero].next);
      } else {
        triangulator.heap[triangulator.numHeap].copy(triangulator.heap[triangulator.numZero]);
      }
    }
    index = triangulator.numZero;
    ++triangulator.numZero;
  } else {
    index = triangulator.numHeap;
  }

  Heap.storeHeapData(triangulator, index, ratio, ind, prev, next);
  ++triangulator.numHeap;
}

Heap.insertIntoHeap = function(triangulator, ratio, ind, prev, next) {
  Heap.dumpOnHeap(triangulator, ratio, ind, prev, next);
}

Heap.deleteFromHeap = function(triangulator, ind, prev, next) {
  if (triangulator.numZero > 0) {
    --triangulator.numZero;
    --triangulator.numHeap;
    ind[0]  = triangulator.heap[triangulator.numZero].index;
    prev[0] = triangulator.heap[triangulator.numZero].prev;
    next[0] = triangulator.heap[triangulator.numZero].next;
    if (triangulator.numZero < triangulator.numHeap) {
      triangulator.heap[triangulator.numZero].copy(triangulator.heap[triangulator.numHeap]);
    }
    return true;
  } else {
    if (triangulator.numHeap <= 0) {
      triangulator.numHeap = 0;
      return false;
    }
    --triangulator.numHeap;
    ind[0]  = triangulator.heap[triangulator.numHeap].index;
    prev[0] = triangulator.heap[triangulator.numHeap].prev;
    next[0] = triangulator.heap[triangulator.numHeap].next;
    return true;
  }
}

// Bridge class
var Bridge = {}

Bridge.sortDistance = function(distances, numPts) {
  var swap = new Distance();
  for (var i = 0; i < numPts; i++) {
    for (var j = i + 1; j < numPts; j++) {
      if (Bridge.d_comp(distances[i], distances[j]) > 0) {
        swap.copy(distances[i]);
        distances[i].copy(distances[j]);
        distances[j].copy(swap);
      }
    }
  }
}

Bridge.d_comp = function(a, b) {
  if (a.dist < b.dist) {
    return -1;
  } else if (a.dist > b.dist) {
    return  1;
  } else {
    return 0;
  }
}

// BottleNeck class
var BottleNeck = {}

BottleNeck.checkArea = function(triangulator, ind4, ind5) {
  var i0 = triangulator.fetchData(ind4);
  var ind1 = triangulator.fetchNextData(ind4);
  var i1 = triangulator.fetchData(ind1);
  var area = 0.;
  var area1 = 0.;
  while (ind1 != ind5) {
    var ind2  = triangulator.fetchNextData(ind1);
    var i2 = triangulator.fetchData(ind2);
    area = Numerics.stableDet2D(triangulator, i0, i1, i2);
    area1 += area;
    ind1   = ind2;
    i1     = i2;
  }

  if (area1 <= triangulator.ZERO) {
    return false;
  }

  ind1 = triangulator.fetchNextData(ind5);
  i1 = triangulator.fetchData(ind1);
  var area2 = 0.;
  while (ind1 != ind4) {
    var ind2  = triangulator.fetchNextData(ind1);
    var i2 = triangulator.fetchData(ind2);
    area = Numerics.stableDet2D(triangulator, i0, i1, i2);
    area2 += area;
    ind1   = ind2;
    i1     = i2;
  }

  return !(area2 <= triangulator.ZERO);
}

BottleNeck.checkBottleNeck = function(triangulator, i1, i2, i3, ind4) {
  var i4 = i1;
  var ind5 = triangulator.fetchPrevData(ind4);
  var i5 = triangulator.fetchData(ind5);
  if (i5 !== i2 && i5 !== i3) {
    if (Numerics.pntInTriangle(triangulator, i1, i2, i3, i5)) {
      return true;
    }
  }

  var flag;
  if (i2 <= i3) {
    if (i4 <= i5) {
      flag = Numerics.segIntersect(triangulator, i2, i3, i4, i5, -1);
    } else {
      flag = Numerics.segIntersect(triangulator, i2, i3, i5, i4, -1);
    }
  } else {
    if (i4 <= i5) {
      flag = Numerics.segIntersect(triangulator, i3, i2, i4, i5, -1);
    } else {
      flag = Numerics.segIntersect(triangulator, i3, i2, i5, i4, -1);
    }
  }
  if (flag) {
    return true;
  }

  ind5 = triangulator.fetchNextData(ind4);
  i5 = triangulator.fetchData(ind5);
  if (i5 !== i2 && i5 !== i3) {
    if (Numerics.pntInTriangle(triangulator, i1, i2, i3, i5)) {
      return true;
    }
  }
  if (i2 <= i3) {
    if (i4 <= i5) {
      flag = Numerics.segIntersect(triangulator, i2, i3, i4, i5, -1);
    } else {
      flag = Numerics.segIntersect(triangulator, i2, i3, i5, i4, -1);
    }
  } else {
    if (i4 <= i5) {
      flag = Numerics.segIntersect(triangulator, i3, i2, i4, i5, -1);
    } else {
      flag = Numerics.segIntersect(triangulator, i3, i2, i5, i4, -1);
    }
  }
  if (flag) {
    return true;
  }

  ind5 = triangulator.fetchNextData(ind4);
  i5 = triangulator.fetchData(ind5);
  while (ind5 !== ind4) {
    if (i4 === i5) {
      if (BottleNeck.checkArea(triangulator, ind4, ind5)) {
        return true;
      }
    }
    ind5 = triangulator.fetchNextData(ind5);
    i5 = triangulator.fetchData(ind5);
  }

  return  false;
}

//ListNode class
function ListNode(ind) {
  this.index = ind;
  this.prev = -1;
  this.next = -1;
  this.convex = 0;
  this.vcntIndex = -1;
}

ListNode.prototype.setCommonIndex = function(comIndex) {
  this.vcntIndex = comIndex;
}

ListNode.prototype.getCommonIndex = function() {
  return this.vcntIndex;
}

// Triangle class
function Triangle(a, b, c) {
  this.v1 = a;
  this.v2 = b;
  this.v3 = c;
}

// BoundingBox class (from BBox class) 
function BoundingBox(triangulator, i, j) {
  this.imin = Math.min(i, j);
  this.imax = Math.max(i, j);
  this.ymin = Math.min(triangulator.points[this.imin].y, triangulator.points[this.imax].y);
  this.ymax = Math.max(triangulator.points[this.imin].y, triangulator.points[this.imax].y);
}

BoundingBox.prototype.inBoundingBox = function(triangulator, i) {
  return this.imax >= i 
      && this.imin <= i 
      && this.ymax >= triangulator.points[i].y 
      && this.ymin <= triangulator.points[i].y;
}

BoundingBox.prototype.overlap = function(box) {
  return this.imax >= box.imin 
      && this.imin <= box.imax 
      && this.ymax >= box.ymin 
      && this.ymin <= box.ymax;
}

// HeapNode class
function HeapNode() {
  this.index = 0;
  this.prev = 0;
  this.next = 0;
  this.ratio = 0.;
}

HeapNode.prototype.copy = function(hNode) {
  this.index = hNode.index;
  this.prev = hNode.prev;
  this.next = hNode.next;
  this.ratio = hNode.ratio;
}

// Distance class
function Distance() {
  this.ind = 0;
  this.dist = 0.;
}

Distance.prototype.copy = function(d) {
  this.ind = d.ind;
  this.dist = d.dist;
}

// PointNode class (from PntNode class)
function PointNode() {
  this.pnt = 0;
  this.next = 0;
}

