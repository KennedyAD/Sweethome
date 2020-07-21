  // Gather group geometries that share the same material and with normals already defined
  var groupKeys = Object.keys(groups);
  for (var i = 0; i < groupKeys.length; i++) {
    var geometries = groups [groupKeys [i]].geometries;
    var material = null;
    var movedGeometryCount;
    for (var j = geometries.length - 1; j >= 0; j -= 1 + movedGeometryCount) {
      movedGeometryCount = 0;
      var geometry = geometries [j];
      if ((geometry instanceof OBJFace) 
          && geometry.normalIndices.length > 0
          && material != geometry.material) {
        material = geometry.material;
        for (var k = i + 1; k < groupKeys.length; k++) {
          var furtherGeometries = groups [groupKeys [k]].geometries;
          var increment;
          for (var l = furtherGeometries.length - 1; l >= 0; l -= increment) {
            var geometry = furtherGeometries [l];
            if ((geometry instanceof OBJFace) 
                && geometry.normalIndices.length > 0
                && material == geometry.material) {
              var m;
              for (m = l - 1; m >= 0; m--) {
                geometry = furtherGeometries [m];
                if (!((geometry instanceof OBJFace) 
                     && geometry.normalIndices.length > 0
                     && material == geometry.material)) {
                  break;
                }
              }
              increment = l - m;
              for (var n = 0; n < increment; n++) {
                geometries.splice(j + 1 + n, 0, furtherGeometries [m + 1 + n]);
              }
              furtherGeometries.splice(m + 1, increment);
              movedGeometryCount += increment;
            } else {
              increment = 1;
            }
          }
        }
      }
    }
  }
