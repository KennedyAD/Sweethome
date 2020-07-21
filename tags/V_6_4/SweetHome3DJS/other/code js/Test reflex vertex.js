                var vector0 = vec3.create();
                var vector1 = vec3.create();
                var vector2 = vec3.create();
                var polygonNormal = vec3.cross(vec3.create(), 
                    vec3.sub(vector0, vertices [polygonVertexIndices [1]], vertices [polygonVertexIndices [0]]),
                    vec3.sub(vector1, vertices [polygonVertexIndices [polygonVertexIndices.length - 1]], vertices [polygonVertexIndices [0]]));
                var normal = vec3.create();
                var oppositeNormalCout = 0;
                var oppositeNormal;
                for (var k = 1; k < polygonVertexIndices.length; k++) {
                  var previousIndex = k - 1;
                  var nextIndex = k < polygonVertexIndices.length - 1 ? k + 1 : 0;
                  vec3.cross(normal, 
                      vec3.sub(vector0, vertices [polygonVertexIndices [nextIndex]], vertices [polygonVertexIndices [k]]),
                      vec3.sub(vector1, vertices [polygonVertexIndices [previousIndex]], vertices [polygonVertexIndices [k]]));
                  if (vec3.dot(polygonNormal, normal) < 0) {
                    oppositeNormalCout++;
                    oppositeNormal = normal;
                  }
                }                
                if (oppositeNormalCout > polygonVertexIndices.length / 2) {
                  polygonNormal = oppositeNormal;
                  console.log("opposite")
                }
                
                while (polygonVertexIndices.length > 3) {
                  // Search ear vertex (with an angle < Math.PI)
                  var k = 0;
                  for ( ; k < polygonVertexIndices.length; k++) {
                    var vertexIndex = polygonVertexIndices [k];
                    var vertex = vertices [vertexIndex];
                    var nextIndex = k < polygonVertexIndices.length - 1 ? k + 1 : 0;
                    var nextVertexIndex = polygonVertexIndices [nextIndex];
                    vec3.sub(vector0, vertices [nextVertexIndex], vertex);
                    if (vector0 [0] === 0 && vector0 [1] === 0 && vector0 [2] === 0) {
                      // Same point
                      break;
                    } else {
                      var previousIndex = k > 0 ? k - 1 : polygonVertexIndices.length - 1;
                      var previousVertexIndex = polygonVertexIndices [previousIndex];
                      vec3.sub(vector1, vertices [previousVertexIndex], vertex);
                      if (vector1 [0] === 0 && vector1 [1] === 0 && vector1 [2] === 0) {
                        // Same point
                        break;
                      } else {
                        var dot01 = vec3.dot(vector0, vector1);
                        // If the angle between vector0 and vector1 is acute and not reflex 
                        if (dot01 > 0
                            // Check angle is not reflex  
                            && vec3.dot(vec3.cross(vector2, vector0, vector1), polygonNormal) > 0
                            ) {
                          // Check no other points of the polygon is the triangle (previousVertex, vertex, nextIndex)  
                          // using barycentric technique http://www.blackpawn.com/texts/pointinpoly/
                          var ignoreVertex = false;
