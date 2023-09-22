<?php 
  /*
   * listHomes.php 21 sept 2023
   *
   * Sweet Home 3D, Copyright (c) 2023 Emmanuel PUYBARET / eTeks <info@eteks.com>
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
   
  // Returns a JSON array containing available homes without their extension
  $dataDir = "data";
  
  echo "[";
  
  if (is_dir($dataDir)) {
    $handler = opendir($dataDir);
    $i = 0;
    while ($file = readdir($handler)) {
      if (!is_dir($file) && str_ends_with($file, '.sh3x')) {
        if ($i++ > 0) {
          echo ",";
        }
        echo "\"".substr($file, 0, -5)."\"";
      }  
    }
    closedir($handler);
  }
  
  echo "]";
  
?>