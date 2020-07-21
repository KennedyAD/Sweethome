/*
 * objviewer.js
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

/**
 * Creates an instance of OBJ + MTL loader.
 * @constructor
 */
function OBJLoader() {
  if (Object.keys(OBJLoader.defaultAppearances).length === 0) {
    OBJLoader.parseMaterial(
        "newmtl amber\n" +
        "Ka 0.0531 0.0531 0.0531\n" +
        "Kd 0.5755 0.2678 0.0000\n" +
        "Ks 0.3000 0.3000 0.3000\n" +
        "illum 2\n" +
        "Ns 60.0000\n" +
        "\n" +
        "newmtl amber_trans\n" +
        "Ka 0.0531 0.0531 0.0531\n" +
        "Kd 0.5755 0.2678 0.0000\n" +
        "Ks 0.3000 0.3000 0.3000\n" +
        "illum 2\n" +
        "d 0.1600\n" +
        "Ns 60.0000\n" +
        "\n" +
        "newmtl charcoal\n" +
        "Ka 0.0082 0.0082 0.0082\n" +
        "Kd 0.0041 0.0041 0.0041\n" +
        "Ks 0.3000 0.3000 0.3000\n" +
        "illum 2\n" +
        "Ns 60.0000\n" +
        "\n" +
        "newmtl lavendar\n" +
        "Ka 0.1281 0.0857 0.2122\n" +
        "Kd 0.2187 0.0906 0.3469\n" +
        "Ks 0.3000 0.3000 0.3000\n" +
        "illum 2\n" +
        "Ns 60.0000\n" +
        "\n" +
        "newmtl navy_blue\n" +
        "Ka 0.0000 0.0000 0.0490\n" +
        "Kd 0.0000 0.0000 0.0531\n" +
        "Ks 0.1878 0.1878 0.1878\n" +
        "illum 2\n" +
        "Ns 91.4700\n" +
        "\n" +
        "newmtl pale_green\n" +
        "Ka 0.0444 0.0898 0.0447\n" +
        "Kd 0.0712 0.3796 0.0490\n" +
        "Ks 0.1878 0.1878 0.1878\n" +
        "illum 2\n" +
        "Ns 91.4700\n" +
        "\n" +
        "newmtl pale_pink\n" +
        "Ka 0.0898 0.0444 0.0444\n" +
        "Kd 0.6531 0.2053 0.4160\n" +
        "Ks 0.1878 0.1878 0.1878\n" +
        "illum 2\n" +
        "Ns 91.4700\n" +
        "\n" +
        "newmtl pale_yellow\n" +
        "Ka 0.3606 0.3755 0.0935\n" +
        "Kd 0.6898 0.6211 0.1999\n" +
        "Ks 0.1878 0.1878 0.1878\n" +
        "illum 2\n" +
        "Ns 91.4700\n" +
        "\n" +
        "newmtl peach\n" +
        "Ka 0.3143 0.1187 0.0167\n" +
        "Kd 0.6367 0.1829 0.0156\n" +
        "Ks 0.1878 0.1878 0.1878\n" +
        "illum 2\n" +
        "Ns 91.4700\n" +
        "\n" +
        "newmtl periwinkle\n" +
        "Ka 0.0000 0.0000 0.1184\n" +
        "Kd 0.0000 0.0396 0.8286\n" +
        "Ks 0.1878 0.1878 0.1878\n" +
        "illum 2\n" +
        "Ns 91.4700\n" +
        "\n" +
        "newmtl redwood\n" +
        "Ka 0.0204 0.0027 0.0000\n" +
        "Kd 0.2571 0.0330 0.0000\n" +
        "Ks 0.1878 0.1878 0.1878\n" +
        "illum 2\n" +
        "Ns 91.4700\n" +
        "\n" +
        "newmtl smoked_glass\n" +
        "Ka 0.0000 0.0000 0.0000\n" +
        "Kd 0.0041 0.0041 0.0041\n" +
        "Ks 0.1878 0.1878 0.1878\n" +
        "illum 2\n" +
        "d 0.0200\n" +
        "Ns 91.4700\n" +
        "\n" +
        "newmtl aqua_filter\n" +
        "Ka 0.0000 0.0000 0.0000\n" +
        "Kd 0.3743 0.6694 0.5791\n" +
        "Ks 0.1878 0.1878 0.1878\n" +
        "illum 2\n" +
        "d 0.0200\n" +
        "Ns 91.4700\n" +
        "\n" +
        "newmtl yellow_green\n" +
        "Ka 0.0000 0.0000 0.0000\n" +
        "Kd 0.1875 0.4082 0.0017\n" +
        "Ks 0.1878 0.1878 0.1878\n" +
        "illum 2\n" +
        "Ns 91.4700\n" +
        "\n" +
        "newmtl bluetint\n" +
        "Ka 0.1100 0.4238 0.5388\n" +
        "Kd 0.0468 0.7115 0.9551\n" +
        "Ks 0.3184 0.3184 0.3184\n" +
        "illum 9\n" +
        "d 0.4300\n" +
        "Ns 60.0000\n" +
        "sharpness 60.0000\n" +
        "\n" +
        "newmtl plasma\n" +
        "Ka 0.4082 0.0816 0.2129\n" +
        "Kd 1.0000 0.0776 0.4478\n" +
        "Ks 0.3000 0.3000 0.3000\n" +
        "illum 9\n" +
        "d 0.2500\n" +
        "Ns 60.0000\n" +
        "sharpness 60.0000\n" +
        "\n" +
        "newmtl emerald\n" +
        "Ka 0.0470 1.0000 0.0000\n" +
        "Kd 0.0470 1.0000 0.0000\n" +
        "Ks 0.2000 0.2000 0.2000\n" +
        "illum 9\n" +
        "d 0.2500\n" +
        "Ns 60.0000\n" +
        "sharpness 60.0000\n" +
        "\n" +
        "newmtl ruby\n" +
        "Ka 1.0000 0.0000 0.0000\n" +
        "Kd 1.0000 0.0000 0.0000\n" +
        "Ks 0.2000 0.2000 0.2000\n" +
        "illum 9\n" +
        "d 0.2500\n" +
        "Ns 60.0000\n" +
        "sharpness 60.0000\n" +
        "\n" +
        "newmtl sapphire\n" +
        "Ka 0.0235 0.0000 1.0000\n" +
        "Kd 0.0235 0.0000 1.0000\n" +
        "Ks 0.2000 0.2000 0.2000\n" +
        "illum 9\n" +
        "d 0.2500\n" +
        "Ns 60.0000\n" +
        "sharpness 60.0000\n" +
        "\n" +
        "newmtl white\n" +
        "Ka 0.4000 0.4000 0.4000\n" +
        "Kd 1.0000 1.0000 1.0000\n" +
        "Ks 0.3000 0.3000 0.3000\n" +
        "illum 2\n" +
        "Ns 60.0000\n" +
        "\n" +
        "newmtl red\n" +
        "Ka 0.4449 0.0000 0.0000\n" +
        "Kd 0.7714 0.0000 0.0000\n" +
        "Ks 0.8857 0.0000 0.0000\n" +
        "illum 2\n" +
        "Ns 136.4300\n" +
        "\n" +
        "newmtl blue_pure\n" +
        "Ka 0.0000 0.0000 0.5000\n" +
        "Kd 0.0000 0.0000 1.0000\n" +
        "Ks 0.0000 0.0000 0.5000\n" +
        "illum 2\n" +
        "Ns 65.8900\n" +
        "\n" +
        "newmtl lime\n" +
        "Ka 0.0000 0.5000 0.0000\n" +
        "Kd 0.0000 1.0000 0.0000\n" +
        "Ks 0.0000 0.5000 0.0000\n" +
        "illum 2\n" +
        "Ns 65.8900\n" +
        "\n" +
        "newmtl green\n" +
        "Ka 0.0000 0.2500 0.0000\n" +
        "Kd 0.0000 0.2500 0.0000\n" +
        "Ks 0.0000 0.2500 0.0000\n" +
        "illum 2\n" +
        "Ns 65.8900\n" +
        "\n" +
        "newmtl yellow\n" +
        "Ka 1.0000 0.6667 0.0000\n" +
        "Kd 1.0000 0.6667 0.0000\n" +
        "Ks 1.0000 0.6667 0.0000\n" +
        "illum 2\n" +
        "Ns 65.8900\n" +
        "\n" +
        "newmtl purple\n" +
        "Ka 0.5000 0.0000 1.0000\n" +
        "Kd 0.5000 0.0000 1.0000\n" +
        "Ks 0.5000 0.0000 1.0000\n" +
        "illum 2\n" +
        "Ns 65.8900\n" +
        "\n" +
        "newmtl orange\n" +
        "Ka 1.0000 0.1667 0.0000\n" +
        "Kd 1.0000 0.1667 0.0000\n" +
        "Ks 1.0000 0.1667 0.0000\n" +
        "illum 2\n" +
        "Ns 65.8900\n" +
        "\n" +
        "newmtl grey\n" +
        "Ka 0.5000 0.5000 0.5000\n" +
        "Kd 0.1837 0.1837 0.1837\n" +
        "Ks 0.5000 0.5000 0.5000\n" +
        "illum 2\n" +
        "Ns 65.8900\n" +
        "\n" +
        "newmtl rubber\n" +
        "Ka 0.0000 0.0000 0.0000\n" +
        "Kd 0.0100 0.0100 0.0100\n" +
        "Ks 0.1000 0.1000 0.1000\n" +
        "illum 2\n" +
        "Ns 65.8900\n" +
        "\n" +
        "newmtl flaqua\n" +
        "Ka 0.0000 0.4000 0.4000\n" +
        "Kd 0.0000 0.5000 0.5000\n" +
        "illum 1\n" +
        "\n" +
        "newmtl flblack\n" +
        "Ka 0.0000 0.0000 0.0000\n" +
        "Kd 0.0041 0.0041 0.0041\n" +
        "illum 1\n" +
        "\n" +
        "newmtl flblue_pure\n" +
        "Ka 0.0000 0.0000 0.5592\n" +
        "Kd 0.0000 0.0000 0.7102\n" +
        "illum 1\n" +
        "\n" +
        "newmtl flgrey\n" +
        "Ka 0.2163 0.2163 0.2163\n" +
        "Kd 0.5000 0.5000 0.5000\n" +
        "illum 1\n" +
        "\n" +
        "newmtl fllime\n" +
        "Ka 0.0000 0.3673 0.0000\n" +
        "Kd 0.0000 1.0000 0.0000\n" +
        "illum 1\n" +
        "\n" +
        "newmtl florange\n" +
        "Ka 0.6857 0.1143 0.0000\n" +
        "Kd 1.0000 0.1667 0.0000\n" +
        "illum 1\n" +
        "\n" +
        "newmtl flpurple\n" +
        "Ka 0.2368 0.0000 0.4735\n" +
        "Kd 0.3755 0.0000 0.7510\n" +
        "illum 1\n" +
        "\n" +
        "newmtl flred\n" +
        "Ka 0.4000 0.0000 0.0000\n" +
        "Kd 1.0000 0.0000 0.0000\n" +
        "illum 1\n" +
        "\n" +
        "newmtl flyellow\n" +
        "Ka 0.7388 0.4925 0.0000\n" +
        "Kd 1.0000 0.6667 0.0000\n" +
        "illum 1\n" +
        "\n" +
        "newmtl pink\n" +
        "Ka 0.9469 0.0078 0.2845\n" +
        "Kd 0.9878 0.1695 0.6702\n" +
        "Ks 0.7429 0.2972 0.2972\n" +
        "illum 2\n" +
        "Ns 106.2000\n" +
        "\n" +
        "newmtl flbrown\n" +
        "Ka 0.0571 0.0066 0.0011\n" +
        "Kd 0.1102 0.0120 0.0013\n" +
        "illum 1\n" +
        "\n" +
        "newmtl brown\n" +
        "Ka 0.1020 0.0185 0.0013\n" +
        "Kd 0.0857 0.0147 0.0000\n" +
        "Ks 0.1633 0.0240 0.0000\n" +
        "illum 2\n" +
        "Ns 65.8900\n" +
        "\n" +
        "newmtl glass\n" +
        "Ka 1.0000 1.0000 1.0000\n" +
        "Kd 0.4873 0.4919 0.5306\n" +
        "Ks 0.6406 0.6939 0.9020\n" +
        "illum 2\n" +
        "Ns 200.0000\n" +
        "\n" +
        "newmtl flesh\n" +
        "Ka 0.4612 0.3638 0.2993\n" +
        "Kd 0.5265 0.4127 0.3374\n" +
        "Ks 0.3000 0.3000 0.3000\n" +
        "illum 2\n" +
        "Ns 60.0000\n" +
        "\n" +
        "newmtl aqua\n" +
        "Ka 0.0000 0.4000 0.4000\n" +
        "Kd 0.0000 0.5000 0.5000\n" +
        "Ks 0.5673 0.5673 0.5673\n" +
        "illum 2\n" +
        "Ns 60.0000\n" +
        "\n" +
        "newmtl black\n" +
        "Ka 0.0000 0.0000 0.0000\n" +
        "Kd 0.0020 0.0020 0.0020\n" +
        "Ks 0.5184 0.5184 0.5184\n" +
        "illum 2\n" +
        "Ns 157.3600\n" +
        "\n" +
        "newmtl silver\n" +
        "Ka 0.9551 0.9551 0.9551\n" +
        "Kd 0.6163 0.6163 0.6163\n" +
        "Ks 0.3000 0.3000 0.3000\n" +
        "illum 2\n" +
        "Ns 60.0000\n" +
        "\n" +
        "newmtl dkblue_pure\n" +
        "Ka 0.0000 0.0000 0.0449\n" +
        "Kd 0.0000 0.0000 0.1347\n" +
        "Ks 0.0000 0.0000 0.5673\n" +
        "illum 2\n" +
        "Ns 65.8900\n" +
        "\n" +
        "newmtl fldkblue_pure\n" +
        "Ka 0.0000 0.0000 0.0449\n" +
        "Kd 0.0000 0.0000 0.1347\n" +
        "illum 1\n" +
        "\n" +
        "newmtl dkgreen\n" +
        "Ka 0.0000 0.0122 0.0000\n" +
        "Kd 0.0058 0.0245 0.0000\n" +
        "Ks 0.0000 0.0490 0.0000\n" +
        "illum 2\n" +
        "Ns 60.0000\n" +
        "\n" +
        "newmtl dkgrey\n" +
        "Ka 0.0490 0.0490 0.0490\n" +
        "Kd 0.0490 0.0490 0.0490\n" +
        "Ks 0.3000 0.3000 0.3000\n" +
        "illum 2\n" +
        "Ns 60.0000\n" +
        "\n" +
        "newmtl ltbrown\n" +
        "Ka 0.1306 0.0538 0.0250\n" +
        "Kd 0.2776 0.1143 0.0531\n" +
        "Ks 0.3000 0.1235 0.0574\n" +
        "illum 2\n" +
        "Ns 60.0000\n" +
        "\n" +
        "newmtl fldkgreen\n" +
        "Ka 0.0000 0.0122 0.0000\n" +
        "Kd 0.0058 0.0245 0.0000\n" +
        "illum 1\n" +
        "\n" +
        "newmtl flltbrown\n" +
        "Ka 0.1306 0.0538 0.0250\n" +
        "Kd 0.2776 0.1143 0.0531\n" +
        "illum 1\n" +
        "\n" +
        "newmtl tan\n" +
        "Ka 0.4000 0.3121 0.1202\n" +
        "Kd 0.6612 0.5221 0.2186\n" +
        "Ks 0.5020 0.4118 0.2152\n" +
        "illum 2\n" +
        "Ns 60.0000\n" +
        "\n" +
        "newmtl fltan\n" +
        "Ka 0.4000 0.3121 0.1202\n" +
        "Kd 0.6612 0.4567 0.1295\n" +
        "illum 1\n" +
        "\n" +
        "newmtl brzskin\n" +
        "Ka 0.4408 0.2694 0.1592\n" +
        "Kd 0.3796 0.2898 0.2122\n" +
        "Ks 0.3000 0.3000 0.3000\n" +
        "illum 2\n" +
        "Ns 25.0000\n" +
        "\n" +
        "newmtl lips\n" +
        "Ka 0.4408 0.2694 0.1592\n" +
        "Kd 0.9265 0.2612 0.2898\n" +
        "Ks 0.3000 0.3000 0.3000\n" +
        "illum 2\n" +
        "Ns 25.0000\n" +
        "\n" +
        "newmtl redorange\n" +
        "Ka 0.3918 0.0576 0.0000\n" +
        "Kd 0.7551 0.0185 0.0000\n" +
        "Ks 0.4694 0.3224 0.1667\n" +
        "illum 2\n" +
        "Ns 132.5600\n" +
        "\n" +
        "newmtl blutan\n" +
        "Ka 0.4408 0.2694 0.1592\n" +
        "Kd 0.0776 0.2571 0.2041\n" +
        "Ks 0.1467 0.1469 0.0965\n" +
        "illum 2\n" +
        "Ns 25.0000\n" +
        "\n" +
        "newmtl bluteal\n" +
        "Ka 0.0041 0.1123 0.1224\n" +
        "Kd 0.0776 0.2571 0.2041\n" +
        "Ks 0.1467 0.1469 0.0965\n" +
        "illum 2\n" +
        "Ns 25.0000\n" +
        "\n" +
        "newmtl pinktan\n" +
        "Ka 0.4408 0.2694 0.1592\n" +
        "Kd 0.6857 0.2571 0.2163\n" +
        "Ks 0.1467 0.1469 0.0965\n" +
        "illum 2\n" +
        "Ns 25.0000\n" +
        "\n" +
        "newmtl brnhair\n" +
        "Ka 0.0612 0.0174 0.0066\n" +
        "Kd 0.0898 0.0302 0.0110\n" +
        "Ks 0.1306 0.0819 0.0352\n" +
        "illum 2\n" +
        "Ns 60.4700\n" +
        "\n" +
        "newmtl blondhair\n" +
        "Ka 0.4449 0.2632 0.0509\n" +
        "Kd 0.5714 0.3283 0.0443\n" +
        "Ks 0.7755 0.4602 0.0918\n" +
        "illum 2\n" +
        "Ns 4.6500\n" +
        "\n" +
        "newmtl flblonde\n" +
        "Ka 0.4449 0.2632 0.0509\n" +
        "Kd 0.5714 0.3283 0.0443\n" +
        "illum 1\n" +
        "\n" +
        "newmtl yelloworng\n" +
        "Ka 0.5837 0.1715 0.0000\n" +
        "Kd 0.8857 0.2490 0.0000\n" +
        "Ks 0.3000 0.3000 0.3000\n" +
        "illum 2\n" +
        "Ns 60.0000\n" +
        "\n" +
        "newmtl bone\n" +
        "Ka 0.3061 0.1654 0.0650\n" +
        "Kd 0.9000 0.7626 0.4261\n" +
        "Ks 0.8939 0.7609 0.5509\n" +
        "illum 2\n" +
        "Ns 200.0000\n" +
        "\n" +
        "newmtl teeth\n" +
        "Ka 0.6408 0.5554 0.3845\n" +
        "Kd 0.9837 0.7959 0.4694\n" +
        "illum 1\n" +
        "\n" +
        "newmtl brass\n" +
        "Ka 0.2490 0.1102 0.0000\n" +
        "Kd 0.4776 0.1959 0.0000\n" +
        "Ks 0.5796 0.5796 0.5796\n" +
        "illum 2\n" +
        "Ns 134.8800\n" +
        "\n" +
        "newmtl dkred\n" +
        "Ka 0.0939 0.0000 0.0000\n" +
        "Kd 0.2286 0.0000 0.0000\n" +
        "Ks 0.2490 0.0000 0.0000\n" +
        "illum 2\n" +
        "Ns 60.0000\n" +
        "\n" +
        "newmtl taupe\n" +
        "Ka 0.1061 0.0709 0.0637\n" +
        "Kd 0.2041 0.1227 0.1058\n" +
        "Ks 0.3000 0.3000 0.3000\n" +
        "illum 2\n" +
        "Ns 84.5000\n" +
        "\n" +
        "newmtl dkteal\n" +
        "Ka 0.0000 0.0245 0.0163\n" +
        "Kd 0.0000 0.0653 0.0449\n" +
        "Ks 0.3000 0.3000 0.3000\n" +
        "illum 2\n" +
        "Ns 55.0400\n" +
        "\n" +
        "newmtl dkdkgrey\n" +
        "Ka 0.0000 0.0000 0.0000\n" +
        "Kd 0.0122 0.0122 0.0122\n" +
        "Ks 0.3000 0.3000 0.3000\n" +
        "illum 2\n" +
        "Ns 60.0000\n" +
        "\n" +
        "newmtl dkblue\n" +
        "Ka 0.0000 0.0029 0.0408\n" +
        "Kd 0.0000 0.0041 0.0571\n" +
        "Ks 0.3000 0.3000 0.3000\n" +
        "illum 2\n" +
        "Ns 60.0000\n" +
        "\n" +
        "newmtl gold\n" +
        "Ka 0.7224 0.1416 0.0000\n" +
        "Kd 1.0000 0.4898 0.0000\n" +
        "Ks 0.7184 0.3695 0.3695\n" +
        "illum 2\n" +
        "Ns 123.2600\n" +
        "\n" +
        "newmtl redbrick\n" +
        "Ka 0.1102 0.0067 0.0067\n" +
        "Kd 0.3306 0.0398 0.0081\n" +
        "illum 1\n" +
        "\n" +
        "newmtl flmustard\n" +
        "Ka 0.4245 0.2508 0.0000\n" +
        "Kd 0.8898 0.3531 0.0073\n" +
        "illum 1\n" +
        "\n" +
        "newmtl flpinegreen\n" +
        "Ka 0.0367 0.0612 0.0204\n" +
        "Kd 0.1061 0.2163 0.0857\n" +
        "illum 1\n" +
        "\n" +
        "newmtl fldkred\n" +
        "Ka 0.0939 0.0000 0.0000\n" +
        "Kd 0.2286 0.0082 0.0082\n" +
        "illum 1\n" +
        "\n" +
        "newmtl fldkgreen2\n" +
        "Ka 0.0025 0.0122 0.0014\n" +
        "Kd 0.0245 0.0694 0.0041\n" +
        "illum 1\n" +
        "\n" +
        "newmtl flmintgreen\n" +
        "Ka 0.0408 0.1429 0.0571\n" +
        "Kd 0.1306 0.2898 0.1673\n" +
        "illum 1\n" +
        "\n" +
        "newmtl olivegreen\n" +
        "Ka 0.0167 0.0245 0.0000\n" +
        "Kd 0.0250 0.0367 0.0000\n" +
        "Ks 0.2257 0.2776 0.1167\n" +
        "illum 2\n" +
        "Ns 97.6700\n" +
        "\n" +
        "newmtl skin\n" +
        "Ka 0.2286 0.0187 0.0187\n" +
        "Kd 0.1102 0.0328 0.0139\n" +
        "Ks 0.3000 0.3000 0.3000\n" +
        "illum 2\n" +
        "Ns 17.8300\n" +
        "\n" +
        "newmtl redbrown\n" +
        "Ka 0.1469 0.0031 0.0000\n" +
        "Kd 0.2816 0.0060 0.0000\n" +
        "Ks 0.3714 0.3714 0.3714\n" +
        "illum 2\n" +
        "Ns 141.0900\n" +
        "\n" +
        "newmtl deepgreen\n" +
        "Ka 0.0000 0.0050 0.0000\n" +
        "Kd 0.0000 0.0204 0.0050\n" +
        "Ks 0.3000 0.3000 0.3000\n" +
        "illum 2\n" +
        "Ns 113.1800\n" +
        "\n" +
        "newmtl flltolivegreen\n" +
        "Ka 0.0167 0.0245 0.0000\n" +
        "Kd 0.0393 0.0531 0.0100\n" +
        "illum 1\n" +
        "\n" +
        "newmtl jetflame\n" +
        "Ka 0.7714 0.0000 0.0000\n" +
        "Kd 0.9510 0.4939 0.0980\n" +
        "Ks 0.8531 0.5222 0.0000\n" +
        "illum 2\n" +
        "Ns 132.5600\n" +
        "\n" +
        "newmtl brownskn\n" +
        "Ka 0.0122 0.0041 0.0000\n" +
        "Kd 0.0204 0.0082 0.0000\n" +
        "Ks 0.0735 0.0508 0.0321\n" +
        "illum 2\n" +
        "Ns 20.1600\n" +
        "\n" +
        "newmtl greenskn\n" +
        "Ka 0.0816 0.0449 0.0000\n" +
        "Kd 0.0000 0.0735 0.0000\n" +
        "Ks 0.0490 0.1224 0.0898\n" +
        "illum 3\n" +
        "Ns 46.5100\n" +
        "sharpness 146.5100\n" +
        "\n" +
        "newmtl ltgrey\n" +
        "Ka 0.5000 0.5000 0.5000\n" +
        "Kd 0.3837 0.3837 0.3837\n" +
        "Ks 0.5000 0.5000 0.5000\n" +
        "illum 2\n" +
        "Ns 65.8900\n" +
        "\n" +
        "newmtl bronze\n" +
        "Ka 0.0449 0.0204 0.0000\n" +
        "Kd 0.0653 0.0367 0.0122\n" +
        "Ks 0.0776 0.0408 0.0000\n" +
        "illum 3\n" +
        "Ns 137.2100\n" +
        "sharpness 125.5800\n" +
        "\n" +
        "newmtl bone1\n" +
        "Ka 0.6408 0.5554 0.3845\n" +
        "Kd 0.9837 0.7959 0.4694\n" +
        "illum 1\n" +
        "\n" +
        "newmtl flwhite1\n" +
        "Ka 0.9306 0.9306 0.9306\n" +
        "Kd 1.0000 1.0000 1.0000\n" +
        "illum 1\n" +
        "\n" +
        "newmtl flwhite\n" +
        "Ka 0.6449 0.6116 0.5447\n" +
        "Kd 0.9837 0.9309 0.8392\n" +
        "Ks 0.8082 0.7290 0.5708\n" +
        "illum 2\n" +
        "Ns 200.0000\n" +
        "\n" +
        "newmtl shadow\n" +
        "Kd 0.0350 0.0248 0.0194\n" +
        "illum 0\n" +
        "d 0.2500\n" +
        "\n" +
        "newmtl fldkolivegreen\n" +
        "Ka 0.0056 0.0082 0.0000\n" +
        "Kd 0.0151 0.0204 0.0038\n" +
        "illum 1\n" +
        "\n" +
        "newmtl fldkdkgrey\n" +
        "Ka 0.0000 0.0000 0.0000\n" +
        "Kd 0.0122 0.0122 0.0122\n" +
        "illum 1\n" +
        "\n" +
        "newmtl lcdgreen\n" +
        "Ka 0.4000 0.4000 0.4000\n" +
        "Kd 0.5878 1.0000 0.5061\n" +
        "Ks 0.3000 0.3000 0.3000\n" +
        "illum 2\n" +
        "Ns 60.0000\n" +
        "\n" +
        "newmtl brownlips\n" +
        "Ka 0.1143 0.0694 0.0245\n" +
        "Kd 0.1429 0.0653 0.0408\n" +
        "Ks 0.3000 0.3000 0.3000\n" +
        "illum 2\n" +
        "Ns 25.0000\n" +
        "\n" +
        "newmtl muscle\n" +
        "Ka 0.2122 0.0077 0.0154\n" +
        "Kd 0.4204 0.0721 0.0856\n" +
        "Ks 0.1184 0.1184 0.1184\n" +
        "illum 2\n" +
        "Ns 25.5800\n" +
        "\n" +
        "newmtl flltgrey\n" +
        "Ka 0.5224 0.5224 0.5224\n" +
        "Kd 0.8245 0.8245 0.8245\n" +
        "illum 1\n" +
        "\n" +
        "newmtl offwhite.warm\n" +
        "Ka 0.5184 0.4501 0.3703\n" +
        "Kd 0.8367 0.6898 0.4490\n" +
        "Ks 0.3000 0.3000 0.3000\n" +
        "illum 2\n" +
        "Ns 60.0000\n" +
        "\n" +
        "newmtl offwhite.cool\n" +
        "Ka 0.5184 0.4501 0.3703\n" +
        "Kd 0.8367 0.6812 0.5703\n" +
        "Ks 0.3000 0.3000 0.3000\n" +
        "illum 2\n" +
        "Ns 60.0000\n" +
        "\n" +
        "newmtl yellowbrt\n" +
        "Ka 0.4000 0.4000 0.4000\n" +
        "Kd 1.0000 0.7837 0.0000\n" +
        "Ks 0.3000 0.3000 0.3000\n" +
        "illum 2\n" +
        "Ns 60.0000\n" +
        "\n" +
        "newmtl chappie\n" +
        "Ka 0.4000 0.4000 0.4000\n" +
        "Kd 0.5837 0.1796 0.0367\n" +
        "Ks 0.3000 0.3000 0.3000\n" +
        "illum 2\n" +
        "Ns 60.0000\n" +
        "\n" +
        "newmtl archwhite\n" +
        "Ka 0.2816 0.2816 0.2816\n" +
        "Kd 0.9959 0.9959 0.9959\n" +
        "illum 1\n" +
        "\n" +
        "newmtl archwhite2\n" +
        "Ka 0.2816 0.2816 0.2816\n" +
        "Kd 0.8408 0.8408 0.8408\n" +
        "illum 1\n" +
        "\n" +
        "newmtl lighttan\n" +
        "Ka 0.0980 0.0536 0.0220\n" +
        "Kd 0.7020 0.4210 0.2206\n" +
        "Ks 0.8286 0.8057 0.5851\n" +
        "illum 2\n" +
        "Ns 177.5200\n" +
        "\n" +
        "newmtl lighttan2\n" +
        "Ka 0.0980 0.0492 0.0144\n" +
        "Kd 0.3143 0.1870 0.0962\n" +
        "Ks 0.8286 0.8057 0.5851\n" +
        "illum 2\n" +
        "Ns 177.5200\n" +
        "\n" +
        "newmtl lighttan3\n" +
        "Ka 0.0980 0.0492 0.0144\n" +
        "Kd 0.1796 0.0829 0.0139\n" +
        "Ks 0.8286 0.8057 0.5851\n" +
        "illum 2\n" +
        "Ns 177.5200\n" +
        "\n" +
        "newmtl lightyellow\n" +
        "Ka 0.5061 0.1983 0.0000\n" +
        "Kd 1.0000 0.9542 0.3388\n" +
        "Ks 1.0000 0.9060 0.0000\n" +
        "illum 2\n" +
        "Ns 177.5200\n" +
        "\n" +
        "newmtl lighttannew\n" +
        "Ka 0.0980 0.0492 0.0144\n" +
        "Kd 0.7878 0.6070 0.3216\n" +
        "Ks 0.8286 0.8057 0.5851\n" +
        "illum 2\n" +
        "Ns 177.5200\n" +
        "\n" +
        "newmtl default\n" +
        "Ka 0.4000 0.4000 0.4000\n" +
        "Kd 0.7102 0.7020 0.6531\n" +
        "Ks 0.3000 0.3000 0.3000\n" +
        "illum 2\n" +
        "Ns 128.0000\n" +
        "\n" +
        "newmtl ship2\n" +
        "Ka 0.0000 0.0000 0.0000\n" +
        "Kd 1.0000 1.0000 1.0000\n" +
        "Ks 0.1143 0.1143 0.1143\n" +
        "illum 2\n" +
        "Ns 60.0000\n" +
        "\n" +
        "newmtl dkpurple\n" +
        "Ka 0.0082 0.0000 0.0163\n" +
        "Kd 0.0245 0.0000 0.0490\n" +
        "Ks 0.1266 0.0000 0.2531\n" +
        "illum 2\n" +
        "Ns 65.8900\n" +
        "\n" +
        "newmtl dkorange\n" +
        "Ka 0.4041 0.0123 0.0000\n" +
        "Kd 0.7143 0.0350 0.0000\n" +
        "Ks 0.7102 0.0870 0.0000\n" +
        "illum 2\n" +
        "Ns 65.8900\n" +
        "\n" +
        "newmtl mintgrn\n" +
        "Ka 0.0101 0.1959 0.0335\n" +
        "Kd 0.0245 0.4776 0.0816\n" +
        "Ks 0.0245 0.4776 0.0816\n" +
        "illum 2\n" +
        "Ns 65.8900\n" +
        "\n" +
        "newmtl fgreen\n" +
        "Ka 0.0000 0.0449 0.0000\n" +
        "Kd 0.0000 0.0449 0.0004\n" +
        "Ks 0.0062 0.0694 0.0000\n" +
        "illum 2\n" +
        "Ns 106.2000\n" +
        "\n" +
        "newmtl glassblutint\n" +
        "Ka 0.4000 0.4000 0.4000\n" +
        "Kd 0.5551 0.8000 0.7730\n" +
        "Ks 0.7969 0.9714 0.9223\n" +
        "illum 4\n" +
        "d 0.6700\n" +
        "Ns 60.0000\n" +
        "sharpness 60.0000\n" +
        "\n" +
        "newmtl bflesh\n" +
        "Ka 0.0122 0.0122 0.0122\n" +
        "Kd 0.0245 0.0081 0.0021\n" +
        "Ks 0.0531 0.0460 0.0153\n" +
        "illum 2\n" +
        "Ns 20.1600\n" +
        "\n" +
        "newmtl meh\n" +
        "Ka 0.4000 0.4000 0.4000\n" +
        "Kd 0.5551 0.8000 0.7730\n" +
        "Ks 0.7969 0.9714 0.9223\n" +
        "illum 4\n" +
        "d 0.2500\n" +
        "Ns 183.7200\n" +
        "sharpness 60.0000\n" +
        "\n" +
        "newmtl violet\n" +
        "Ka 0.0083 0.0000 0.1265\n" +
        "Kd 0.0287 0.0269 0.1347\n" +
        "Ks 0.2267 0.4537 0.6612\n" +
        "illum 2\n" +
        "Ns 96.9000\n" +
        "\n" +
        "newmtl iris\n" +
        "Ka 0.3061 0.0556 0.0037\n" +
        "Kd 0.0000 0.0572 0.3184\n" +
        "Ks 0.8041 0.6782 0.1477\n" +
        "illum 2\n" +
        "Ns 188.3700\n" +
        "\n" +
        "newmtl blugrn\n" +
        "Ka 0.4408 0.4144 0.1592\n" +
        "Kd 0.0811 0.6408 0.2775\n" +
        "Ks 0.1467 0.1469 0.0965\n" +
        "illum 2\n" +
        "Ns 25.0000\n" +
        "\n" +
        "newmtl glasstransparent\n" +
        "Ka 0.2163 0.2163 0.2163\n" +
        "Kd 0.4694 0.4694 0.4694\n" +
        "Ks 0.6082 0.6082 0.6082\n" +
        "illum 4\n" +
        "d 0.2500\n" +
        "Ns 200.0000\n" +
        "sharpness 60.0000\n" +
        "\n" +
        "newmtl fleshtransparent\n" +
        "Ka 0.4000 0.2253 0.2253\n" +
        "Kd 0.6898 0.2942 0.1295\n" +
        "Ks 0.7388 0.4614 0.4614\n" +
        "illum 4\n" +
        "d 0.2500\n" +
        "Ns 6.2000\n" +
        "sharpness 60.0000\n" +
        "\n" +
        "newmtl fldkgrey\n" +
        "Ka 0.0449 0.0449 0.0449\n" +
        "Kd 0.0939 0.0939 0.0939\n" +
        "illum 1\n" +
        "\n" +
        "newmtl sky_blue\n" +
        "Ka 0.1363 0.2264 0.4122\n" +
        "Kd 0.1241 0.5931 0.8000\n" +
        "Ks 0.0490 0.0490 0.0490\n" +
        "illum 2\n" +
        "Ns 13.9500\n" +
        "\n" +
        "newmtl fldkpurple\n" +
        "Ka 0.0443 0.0257 0.0776\n" +
        "Kd 0.1612 0.0000 0.3347\n" +
        "Ks 0.0000 0.0000 0.0000\n" +
        "illum 2\n" +
        "Ns 13.9500\n" +
        "\n" +
        "newmtl dkbrown\n" +
        "Ka 0.0143 0.0062 0.0027\n" +
        "Kd 0.0087 0.0038 0.0016\n" +
        "Ks 0.2370 0.2147 0.1821\n" +
        "illum 3\n" +
        "Ns 60.0000\n" +
        "sharpness 60.0000\n" +
        "\n" +
        "newmtl bone2\n" +
        "Ka 0.6408 0.5388 0.3348\n" +
        "Kd 0.9837 0.8620 0.6504\n" +
        "illum 1\n" +
        "\n" +
        "newmtl bluegrey\n" +
        "Ka 0.4000 0.4000 0.4000\n" +
        "Kd 0.1881 0.2786 0.2898\n" +
        "Ks 0.3000 0.3000 0.3000\n" +
        "illum 2\n" +
        "Ns 14.7300\n" +
        "\n" +
        "newmtl metal\n" +
        "Ka 0.9102 0.8956 0.1932\n" +
        "Kd 0.9000 0.7626 0.4261\n" +
        "Ks 0.8939 0.8840 0.8683\n" +
        "illum 2\n" +
        "Ns 200.0000\n" +
        "\n" +
        "newmtl sand_stone\n" +
        "Ka 0.1299 0.1177 0.0998\n" +
        "Kd 0.1256 0.1138 0.0965\n" +
        "Ks 0.2370 0.2147 0.1821\n" +
        "illum 3\n" +
        "Ns 60.0000\n" +
        "sharpness 60.0000\n" +
        "\n" +
        "newmtl hair\n" +
        "Ka 0.0013 0.0012 0.0010\n" +
        "Kd 0.0008 0.0007 0.0006\n" +
        "Ks 0.0000 0.0000 0.0000\n" +
        "illum 3\n" +
        "Ns 60.0000\n" +
        "sharpness 60.0000\n", OBJLoader.defaultAppearances, null, null);
  }
}

OBJLoader.defaultAppearances = {};

/**
 * Loads the 3D model from the given uri.
 * @param uri A zip file containing an OBJ entry that will be loaded
 *            or an URI noted as jar:uri!/objEntry where objEntry will be loaded.
 * @param callback The function that will be called once the 3D model is loaded.
 */
OBJLoader.prototype.load = function(uri, callback) {
  var objEntryName = null;
  if (uri.indexOf("jar:") === 0) {
    var entrySeparatorIndex = uri.indexOf("!/");
    objEntryName = uri.substring(entrySeparatorIndex + 2);
    uri = uri.substring(4, entrySeparatorIndex);
  }
    
  var loader = this;
  JSZipUtils.getBinaryContent(uri, function(err, data) {
    if (err) {
      callback(null, err); 
    }
    var zip = new JSZip(data);
    try {
      if (objEntryName == null) {
        // Search an OBJ entry
        var entries = zip.file(/.*/);
        for (var i in entries) {
          if (entries [i].name.match(/\.obj$/)) {
            callback(loader.parseOBJEntry(entries [i], zip), null);
            return;
          } 
        }
      } else {
        callback(loader.parseOBJEntry(zip.file(objEntryName), zip), null);
      }
    } catch (err) {
      callback(null, err);
    }
  });
}

/**
 * Returns a new scene created from the parsed objects. 
 */
OBJLoader.prototype.createScene = function(vertices, textureCoordinates, normals, groups, appearances) {
  var sceneRoot = new Group3D();
  for (var key in groups) {
    var group = groups [key];
    var geometries = group.geometries;
    if (geometries.length > 0) {
      var i = 0;
      while (i < geometries.length) {
        var firstGeometry = geometries [i];
        var firstGeometryHasTextureCoordinateIndices = firstGeometry.textureCoordinateIndices.length > 0;
        var firstFaceHasNormalIndices = (firstGeometry instanceof OBJFace) && firstGeometry.normalIndices.length > 0;
        var firstGeometryMaterial = firstGeometry.material;
        var appearance = OBJLoader.getAppearance(appearances, firstGeometryMaterial);
        // Search how many geometries share the same characteristics 
        var max = i;
        while (++max < geometries.length) {
          var geometry = geometries [max];
          var material = geometry.material;
          if ((geometry.constructor !== firstGeometry.constructor)
              || material === null && firstGeometryMaterial !== null
              || material !== null && OBJLoader.getAppearance(appearances, material) !== appearance
              || (firstGeometryHasTextureCoordinateIndices ^ geometry.textureCoordinateIndices.length > 0)
              || (firstFaceHasNormalIndices ^ ((geometry instanceof OBJFace) && geometry.normalIndices.length > 0))) {
            break;
          }
        }
        
        // Clone appearance to avoid sharing it
        if (appearance !== null) {
          appearance = appearance.clone();
          // TODO Create texture coordinates if geometry doesn't define its own coordinates ? 
        }

        // Create indices arrays for the geometries with an index between i and max
        var geometryCount = max - i;
        var coordinatesIndices = [];
        var stripCounts = []; 
        var onlyTriangles = true;
        for (var j = 0; j < geometryCount; j++) {
          var geometryVertexIndices = geometries [i + j].vertexIndices;
          coordinatesIndices.push.apply(coordinatesIndices, geometryVertexIndices);
          stripCounts.push(geometryVertexIndices.length);
          if (onlyTriangles && geometryVertexIndices.length !== 3) {
            onlyTriangles = false;
          }
        }
        var textureCoordinateIndices = [];
        if (firstGeometryHasTextureCoordinateIndices) {
          for (var j = 0; j < geometryCount; j++) {
            textureCoordinateIndices.push.apply(textureCoordinateIndices, geometries [i + j].textureCoordinateIndices);
          }
        } 
        
        var shape;
        if (firstGeometry instanceof OBJFace) {
          var normalIndices = [];
          if (firstFaceHasNormalIndices) {
            for (var j = 0; j < geometryCount; j++) {
              normalIndices.push.apply(normalIndices, geometries [i + j].normalIndices);
            }
          } else {
            // TODO Generate normals
          }
          
          var geometryArray;
          if (onlyTriangles) {
            geometryArray = new IndexedTriangleArray3D(vertices, coordinatesIndices,
                textureCoordinates, textureCoordinateIndices, normals, normalIndices);
          } else {
            var triangleCoordinateIndices = [];
            var triangleTextureCoordinateIndices = [];
            var triangleNormalIndices = [];
            for (var j = 0, index = 0; j < geometryCount; index += stripCounts [j], j++) {
              if (stripCounts [j] == 3) {
                triangleCoordinateIndices.push.apply(triangleCoordinateIndices, coordinatesIndices.slice(index, index + 3));
                if (textureCoordinateIndices.length > 0) {
                  triangleTextureCoordinateIndices.push.apply(triangleTextureCoordinateIndices, textureCoordinateIndices.slice(index, index + 3));
                }
                if (triangleNormalIndices.length > 0) {
                  triangleNormalIndices.push.apply(triangleNormalIndices, normalIndices.slice(index, index + 3));
                }
              } else if (stripCounts [j] == 4) {
                triangleCoordinateIndices.push.apply(triangleCoordinateIndices, coordinatesIndices.slice(index, index + 3));
                triangleCoordinateIndices.push.apply(triangleCoordinateIndices, coordinatesIndices.slice(index + 2, index + 4));
                triangleCoordinateIndices.push(coordinatesIndices [index]);
                if (textureCoordinateIndices.length > 0) {
                  triangleTextureCoordinateIndices.push.apply(triangleTextureCoordinateIndices, textureCoordinateIndices.slice(index, index + 3));
                  triangleTextureCoordinateIndices.push.apply(triangleTextureCoordinateIndices, textureCoordinateIndices.slice(index + 2, index + 4));
                  triangleTextureCoordinateIndices.push(textureCoordinateIndices [index]);
                }
                if (triangleNormalIndices.length > 0) {
                  triangleNormalIndices.push.apply(triangleNormalIndices, normalIndices.slice(index, index + 3));
                  triangleNormalIndices.push.apply(triangleNormalIndices, normalIndices.slice(index + 2, index + 4));
                  triangleNormalIndices.push(normalIndices [index]);
                }
              } else {
                // TODO Triangulate polygon
              }
            }
            geometryArray = new IndexedTriangleArray3D(vertices, triangleCoordinateIndices, 
                textureCoordinates, triangleTextureCoordinateIndices, normals, triangleNormalIndices);
          }
          shape = new Shape3D(group.name + (i == 0 ? "" : i), geometryArray, appearance);   
        } else { // Line
          shape = new Shape3D(group.name + (i == 0 ? "" : i), null, appearance);   
          for (var j = 0, index = 0; j < geometryCount; index += stripCounts [j], j++) {
            var lineCoordinatesIndices = coordinatesIndices.slice(index, index + stripCounts [j]);
            var lineTextureCoordinateIndices = [];
            if (textureCoordinateIndices.length > 0) {
              lineTextureCoordinateIndices = textureCoordinateIndices.slice(index, index + stripCounts [j]);
            }
            shape.addGeometry(new IndexedLineArray3D(vertices, lineCoordinatesIndices, 
                textureCoordinates, lineTextureCoordinateIndices));
          }
        }
        
        sceneRoot.addChild(shape);
        i = max;
      }
    }
  }
  
  return sceneRoot;
}

/**
 * Returns the appearance matching a given material. 
 */
OBJLoader.getAppearance = function(appearances, material) {
  var appearance = undefined;
  if (material !== null) {
    appearance = appearances [material];
  }
  if (appearance === undefined) {
    appearance = OBJLoader.defaultAppearances ["default"];
  }
  return appearance;
}

/**
 * Parses the scene described in the given OBJ entry.
 */
OBJLoader.prototype.parseOBJEntry = function(objEntry, zip, callback) {
  var vertices = [];
  var textureCoordinates = [];
  var normals = [];
  var currentGroup = new OBJGroup("default");
  var groups = {"default":currentGroup};
  var currentMaterial = "default"; 
  var appearances = {};
  for (var k in OBJLoader.defaultAppearances) {
    var appearance = OBJLoader.defaultAppearances [k];
    appearances [appearance.name] = appearance;
  }
  
  var lines = objEntry.asBinary().match(/^.*$/mg);
  for (var i = 0; i < lines.length; i++) {
    var line = lines [i];
    if (line.indexOf("v") === 0 || line.indexOf("f ") === 0 || line.indexOf("l ") === 0) {
      // Append to line next lines if it ends by a back slash
      while (line.indexOf("\\") === line.length - 1) {
        line = line.substring(0, line.length - 1);
        line += lines [++i];
      }
    }
    
    var strings = line.split(/\s+/);
    var start = strings [0];
    if (start === "v") {
      vertices.push(OBJLoader.parseVector3f(strings));
    } else if (start === "vt") {
      textureCoordinates.push(OBJLoader.parseVector2f(strings));
    } else if (start === "vn") {
      normals.push(OBJLoader.parseVector3f(strings));
    } else if (start === "l") {
      currentGroup.addGeometry(this.parseLine(strings, currentMaterial));
    } else if (start === "f") {
      currentGroup.addGeometry(this.parseFace(strings, currentMaterial));
    } else if (start === "g" || start === "o") {
      var smoothingGroup = currentGroup.smooth;
      if (strings.length > 1) {
        var name = strings [1];
        currentGroup = groups [name];
        if (currentGroup == null) {
          currentGroup = new OBJGroup(name);
          groups [name] = currentGroup;
        }        
      } else {
        currentGroup = groups ["default"];
      }
      currentGroup.smooth = smoothingGroup;
    } else if (start === "s") {
      currentGroup.smooth = strings [1] !== "off";
    } else if (start === "usemtl") {
      currentMaterial = line.substring(7, line.length).trim();
    } else if (start === "mtllib") {
      var mtllib = line.substring(7, line.length).trim();
      this.parseMaterialEntry(mtllib, appearances, objEntry, zip);
    }
  }
  
  return this.createScene(vertices, textureCoordinates, normals, groups, appearances);  
}

/**
 * Returns the object line in strings.
 */
OBJLoader.prototype.parseLine = function(strings, material) {
  //    l v       v       v       ...
  // or l v/vt    v/vt    v/vt    ...
  var vertexIndices = [];
  var textureCoordinateIndices = [];
  for (var i in strings) {
    if (i > 0) {
      var indices = strings [i].split("/");
      vertexIndices.push(parseInt(indices [0]) - 1);
      if (indices.length == 2) {
        textureCoordinateIndices.push(parseInt(indices [1]) - 1);
      }
    }
  }
  return new OBJLine(vertexIndices, textureCoordinateIndices, material);
}

/**
 * Returns the object face in strings.
 */
OBJLoader.prototype.parseFace = function(strings, material) {
  //    f v       v       v       ...
  // or f v//vn   v//vn   v//vn   ...
  // or f v/vt    v/vt    v/vt    ...
  // or f v/vt/vn v/vt/vn v/vt/vn ...
  var vertexIndices = [];
  var textureCoordinateIndices = [];
  var normalIndices = [];
  for (var i in strings) {
    if (i > 0) {
      var indices = strings [i].split("/");
      vertexIndices.push(parseInt(indices [0]) - 1);
      if (indices.length > 1) {
        if (indices [1].length > 0) {
          textureCoordinateIndices.push(parseInt(indices [1]) - 1);
        }
      }
      if (indices.length == 3) {
        normalIndices.push(parseInt(indices [2]) - 1);
      }
    }
  }
  return new OBJFace(vertexIndices, textureCoordinateIndices, normalIndices, material);
}

/**
 * Parses appearances from the given material entry.
 */
OBJLoader.prototype.parseMaterialEntry = function(mtlEntryName, appearances, objEntry, zip) {
  var lastSlash = objEntry.name.lastIndexOf("/");
  var mtlEntry = zip.file(lastSlash < 0  ? mtlEntryName  : (objEntry.name.substring(0, lastSlash + 1) + mtlEntryName));
  var currentAppearance = null; 
  OBJLoader.parseMaterial(mtlEntry.asBinary(), appearances, objEntry, zip);
}

OBJLoader.parseVector3f = function(strings) {
  //     v x y z
  // or vn x y z
  // or Ka r g b
  // or Kd r g b
  // or Ks r g b
  return vec3.fromValues(parseFloat(strings [1]), parseFloat(strings [2]), parseFloat(strings [3]));
}

OBJLoader.parseVector2f = function(strings) {
  // vt x y z
  return vec2.fromValues(parseFloat(strings [1]), parseFloat(strings [2]));
}

/**
 * Parses a map of appearances parsed from the given content. 
 */
OBJLoader.parseMaterial = function(mtlContent, appearances, objEntry, zip) {
  var lines = mtlContent.match(/^.*$/mg);
  for (var i in lines) {
    var line = lines [i];
    var strings = line.split(/\s+/);
    var start = strings [0];
    if (start === "newmtl") {
      currentAppearance = new Appearance3D(line.substring(7, line.length).trim());
      appearances [currentAppearance.name] = currentAppearance;
    } else if (currentAppearance != null) {
      if (start === "Ka") {
        currentAppearance.ambiantColor = OBJLoader.parseVector3f(strings);
      } else if (start === "Kd") {
        currentAppearance.diffuseColor = OBJLoader.parseVector3f(strings);
      } else if (start === "Ks") {
        currentAppearance.specularColor = OBJLoader.parseVector3f(strings);
      } else if (start === "Ns") {
        currentAppearance.shininess = Math.max(1, Math.min(parseFloat(strings [1]), 128));
      } else if (start === "d") {
        currentAppearance.transparency = 1 - Math.max(0, parseFloat(strings [1] === "-halo" ? strings [2] : strings [1]));
      } else if (start === "illum") {
        currentAppearance.illumination = parseInt(strings [1]);
      } else if (start === "map_Kd") {
        var imageEntryName = strings [strings.length - 1];
        var lastSlash = objEntry.name.lastIndexOf("/");
        var imageEntry = zip.file(lastSlash < 0  ? imageEntryName  : (objEntry.name.substring(0, lastSlash + 1) + imageEntryName));
        var base64Image = btoa(String.fromCharCode.apply(null, imageEntry.asUint8Array()));
        currentAppearance.textureImage = new Image();
        currentAppearance.textureImage.onload = function() {
            currentAppearance.textureImage.ready = true;
          };
        if (imageEntryName.toLowerCase().indexOf(".png") === imageEntryName.length - 4) {
          currentAppearance.textureImage.src = "data:image/png;base64," + base64Image;
        } else {
          currentAppearance.textureImage.src = "data:image/jpeg;base64," + base64Image;
        }
      } 
      // Ignore Ni and sharpness
    }
  }
}

/**
 * Creates a group of geometries read in an OBJ file.
 * @constructor
 */
function OBJGroup(name) {
  this.name = name;
  this.smooth = false;
  this.geometries = [];
}

OBJGroup.prototype.addGeometry = function(geometry) {
  this.geometries.push(geometry);
};

/**
 * Creates a line read in an OBJ file.
 * @constructor
 */
function OBJLine(vertexIndices, textureCoordinateIndices, material) {
  this.vertexIndices = vertexIndices;
  this.textureCoordinateIndices = textureCoordinateIndices;
  this.material = material;
}

/**
 * Creates a face read in an OBJ file.
 * @constructor
 */
function OBJFace(vertexIndices, textureCoordinateIndices, normalIndices, material) {
  this.vertexIndices = vertexIndices;
  this.textureCoordinateIndices = textureCoordinateIndices;
  this.normalIndices = normalIndices;
  this.material = material;
}



/**
 * 3D models objects manager.
 */
var ModelManager = {};

ModelManager.loadedModelNodes = {};
ModelManager.loadingModelObservers = {};

/**
 * Returns the minimum size of a model.
 */
ModelManager.getMinimumSize = function() {
  return 0.001;
}

/**
 * Returns the size of 3D shapes of node after 
 * an additional optional transformation.
 */
ModelManager.getSize = function(node, transformation) {
  if (transformation === undefined) {
    transformation = mat4.create();
  }
  var bounds = ModelManager.getBounds(node, transformation);
  var lower = vec3.create();
  bounds.getLower(lower);
  var upper = vec3.create();
  bounds.getUpper(upper);
  return vec3.fromValues(Math.max(ModelManager.getMinimumSize(), upper[0] - lower[0]), 
      Math.max(ModelManager.getMinimumSize(), upper[1] - lower[1]), 
      Math.max(ModelManager.getMinimumSize(), upper[2] - lower[2]));
}

/**
 * Returns the bounds of the 3D shapes of node with
 * an additional optional transformation.
 */
ModelManager.getBounds = function(node, transformation) {
  if (transformation === undefined) {
    transformation = mat4.create();
  }
  var objectBounds = new BoundingBox3D(
      vec3.fromValues(Infinity, Infinity, Infinity), 
      vec3.fromValues(-Infinity, -Infinity, -Infinity));
  ModelManager.computeBounds(node, objectBounds, transformation, !ModelManager.isOrthogonalRotation(transformation));
  return objectBounds;
}

/**
 * Returns true if the rotation matrix matches only rotations of 
 * a multiple of 90° degrees around x, y or z axis.
 */
ModelManager.isOrthogonalRotation = function(transformation) {
  for (var i = 0; i < 3; i++) {
    for (var j = 0; j < 3; j++) {
      // Return false if the matrix contains a value different from 0 1 or -1
      if (Math.abs(transformation[i * 4 + j]) > 1E-6
          && Math.abs(transformation[i * 4 + j] - 1) > 1E-6
          && Math.abs(transformation[i * 4 + j] + 1) > 1E-6) {
        return false;
      }
    }
  }
  return true;
}

ModelManager.computeBounds = function(node, bounds, parentTransformations, transformShapeGeometry) {
  if (node instanceof Group3D) {
    if (node instanceof TransformGroup3D) {
      parentTransformations = mat4.clone(parentTransformations);
      mat4.mul(parentTransformations, parentTransformations, node.transform);
    }
    // Compute the bounds of all the node children
    for (var i in node.children) {
      ModelManager.computeBounds(node.children [i], bounds, parentTransformations, transformShapeGeometry);
    }
  } else if (node instanceof Shape3D) {
    var shapeBounds;
    if (transformShapeGeometry) {
      shapeBounds = ModelManager.computeTransformedGeometryBounds(node, parentTransformations);
    } else {
      shapeBounds = node.getBounds();
      vec3.transformMat4(shapeBounds, shapeBounds, parentTransformations);
    }
    bounds.combine(shapeBounds);
  }
}

ModelManager.computeTransformedGeometryBounds = function(shape, transformation) {
  var lower = vec3.fromValues(Infinity, Infinity, Infinity);
  var upper = vec3.fromValues(-Infinity, -Infinity, -Infinity);    
  for (var i in shape.geometries) {
    // geometry instanceof IndexedGeometryArray3D
    var geometry = shape.geometries [i];
    var vertex = vec3.create();
    for (var index in geometry.vertexIndices) {
      vec3.copy(vertex, geometry.vertices [geometry.vertexIndices [index]]);
      ModelManager.updateBounds(vertex, transformation, lower, upper);
    }
  }
  return new BoundingBox3D(lower, upper);
}

ModelManager.updateBounds = function(vertex, transformation, lower, upper) {
  if (transformation !== null) {
    vec3.transformMat4(vertex, vertex, transformation);
  }
  if (lower[0] > vertex[0]) {
    lower[0] = vertex[0];
  }
  if (lower[1] > vertex[1]) {
    lower[1] = vertex[1];
  }
  if (lower[2] > vertex[2]) {
    lower[2] = vertex[2];
  }
  if (upper[0] < vertex[0]) {
    upper[0] = vertex[0];
  }
  if (upper[1] < vertex[1]) {
    upper[1] = vertex[1];
  }
  if (upper[2] < vertex[2]) {
    upper[2] = vertex[2];
  }
}

/**
 * Returns a transform group that will transform the model node
 * to let it fill a box of the given width centered on the origin.
 */
ModelManager.getNormalizedTransformGroup = function(node, modelRotation, width) {
  return new TransformGroup3D(ModelManager.getNormalizedTransform(node, modelRotation, width));
}

/**
 * Returns a transformation matrix that will transform the model node
 * to let it fill a box of the given width centered on the origin.
 */
ModelManager.getNormalizedTransform = function(node, modelRotation, width) {
  // Get model bounding box size 
  var modelBounds = ModelManager.getBounds(node);
  var lower = vec3.create();
  modelBounds.getLower(lower);
  var upper = vec3.create();
  modelBounds.getUpper(upper);
  // Translate model to its center
  var translation = mat4.create();
  mat4.translate(translation, translation,
      vec3.fromValues(-lower[0] - (upper[0] - lower[0]) / 2, 
          -lower[1] - (upper[1] - lower[1]) / 2, 
          -lower[2] - (upper[2] - lower[2]) / 2));
  
  var modelTransform;
  if (modelRotation !== null) {
    // Get model bounding box size with model rotation
    var modelTransform = ModelManager.getRotationTransformation(modelRotation);;
    mat4.mul(modelTransform, modelTransform, translation);
    var rotatedModelBounds = ModelManager.getBounds(node, modelTransform);
    rotatedModelBounds.getLower(lower);
    rotatedModelBounds.getUpper(upper);
  } else {
    modelTransform = translation;
  }

  // Scale model to make it fill a 1 unit wide box
  var scaleOneTransform = mat4.create();
  mat4.scale(scaleOneTransform, scaleOneTransform,
      vec3.fromValues(width / Math.max(ModelManager.getMinimumSize(), upper[0] - lower[0]), 
          width / Math.max(ModelManager.getMinimumSize(), upper[1] - lower[1]), 
          width / Math.max(ModelManager.getMinimumSize(), upper[2] - lower[2])));
  mat4.mul(scaleOneTransform, scaleOneTransform, modelTransform);
  return scaleOneTransform;
}

/**
 * Returns a transformation matching the given rotation.
 */
ModelManager.getRotationTransformation = function(modelRotation) {
  var modelTransform = mat4.create();
  modelTransform [0] = modelRotation [0][0];
  modelTransform [1] = modelRotation [0][1];
  modelTransform [2] = modelRotation [0][2];
  modelTransform [4] = modelRotation [1][0];
  modelTransform [5] = modelRotation [1][1];
  modelTransform [6] = modelRotation [1][2];
  modelTransform [8] = modelRotation [2][0];
  modelTransform [9] = modelRotation [2][1];
  modelTransform [10] = modelRotation [2][2];
  return modelTransform;
}

/**
 * Reads asynchronously a 3D node from content with supported loaders
 * and notifies the loaded model to the given modelObserver once available
 * with its modelUpdated and modelError methods. 
 */
ModelManager.loadModel = function(content, modelObserver) {
  var  modelRoot = ModelManager.loadedModelNodes [content];
  if (modelRoot != null) {
    // Notify cached model to observer with a clone of the model
    modelObserver.modelUpdated(modelRoot);
  } else {
    var observers = ModelManager.loadingModelObservers [content];
    if (observers !== undefined) {
      // If observers list exists, content model is already being loaded
      // register observer for future notification
      observers.push(modelObserver);
    } else {
      // Create a list of observers that will be notified once content model is loaded
      observers = [];
      observers.push(modelObserver);
      ModelManager.loadingModelObservers [content] = observers;
      
      new OBJLoader().load(content, function(loadedModel, err) {
          var observers = ModelManager.loadingModelObservers [content];
          delete ModelManager.loadingModelObservers [content];
          if (loadedModel != null) {
            ModelManager.loadedModelNodes [content] = loadedModel;
            for (var i in observers) {
              observers [i].modelUpdated(loadedModel);
            } 
          } else {
            for (var i in observers) {
              observers [i].modelError(err);
            } 
          }
        });
    }
  }
}



/**
 * Creates an appearance to store material attributes, transparency and texture.
 * @constructor
 */
function Appearance3D(name) {
  this.name = name;
}

Appearance3D.prototype.clone = function() {
  var clone = new Appearance3D(this.name);
  for (var attr in this) {
    if (this.hasOwnProperty(attr)) {
      clone [attr] = this [attr];
    } 
  }
  return clone;
}

/**
 * Creates an indexed 3D geometry array.
 * @constructor
 */
function IndexedGeometryArray3D(vertices, vertexIndices,
                                textureCoordinates,textureCoordinateIndices) {
  this.vertices = vertices;
  this.vertexIndices = vertexIndices;
  this.textureCoordinates = textureCoordinates;
  this.textureCoordinateIndices = textureCoordinateIndices;
}

/**
 * Creates the 3D geometry of an indexed line array.
 * @constructor
 */
function IndexedLineArray3D(vertices, vertexIndices,
                            textureCoordinates, textureCoordinateIndices) {
  IndexedGeometryArray3D.call(this, vertices, vertexIndices, textureCoordinates, textureCoordinateIndices);
}
IndexedLineArray3D.prototype = Object.create(IndexedGeometryArray3D.prototype);
IndexedLineArray3D.prototype.constructor = IndexedLineArray3D;

/**
 * Creates the 3D geometry of an indexed triangle array.
 * @constructor
 */
function IndexedTriangleArray3D(vertices, vertexIndices,
                                textureCoordinates,textureCoordinateIndices, 
                                normals, normalIndices) {
  IndexedGeometryArray3D.call(this, vertices, vertexIndices, textureCoordinates, textureCoordinateIndices);
  this.normals = normals;
  this.normalIndices = normalIndices;
}
IndexedTriangleArray3D.prototype = Object.create(IndexedGeometryArray3D.prototype);
IndexedTriangleArray3D.prototype.constructor = IndexedTriangleArray3D;

/**
 * Creates a 3D bounding box.
 * @constructor
 */
function BoundingBox3D(lower, upper) {
  this.lower = lower !== undefined 
      ? lower 
      : vec3.fromValues(-1.0, -1.0, -1.0);
  this.upper = upper !== undefined 
      ? upper 
      : vec3.fromValues( 1.0,  1.0,  1.0);
}

BoundingBox3D.prototype.getLower = function(p) {
  vec3.copy(p, this.lower);
}

BoundingBox3D.prototype.getUpper = function(p) {
  vec3.copy(p, this.upper);
}

BoundingBox3D.prototype.combine = function(bounds) {
  if (this.lower[0] > bounds.lower[0]) {
    this.lower[0] = bounds.lower[0];
  }
  if (this.lower[1] > bounds.lower[1]) {
    this.lower[1] = bounds.lower[1];
  }
  if (this.lower[2] > bounds.lower[2]) {
    this.lower[2] = bounds.lower[2];
  }
  if (this.upper[0] < bounds.upper[0]) {
    this.upper[0] = bounds.upper[0];
  }
  if (this.upper[1] < bounds.upper[1]) {
    this.upper[1] = bounds.upper[1];
  }
  if (this.upper[2] < bounds.upper[2]) {
    this.upper[2] = bounds.upper[2];
  }
}

BoundingBox3D.prototype.clone = function() {
  return new BoundingBox3D(this.lower, this.upper);
}

/**
 * Creates an abstract 3D node.
 * @constructor
 */
function Node3D() {
  this.parent = null;
}

/**
 * Creates a 3D shape.
 * @constructor
 */
function Shape3D(name, geometry, appearance) {
  Node3D.call(this);
  this.name = name;
  this.geometries = geometry !== null ? [geometry] : [];
  this.appearance = appearance;
  this.bounds = null;
}
Shape3D.prototype = Object.create(Node3D.prototype);
Shape3D.prototype.constructor = Shape3D;

Shape3D.prototype.addGeometry = function(geometry3D) {
  this.geometries.push(geometry3D);
}

Shape3D.prototype.getBounds = function() {
  if (this.bounds === null) {
    this.bounds = ModelManager.computeTransformedGeometryBounds(this, null);
  }
  return this.bounds.clone();
}

/**
 * Creates a group, parent of 3D shapes and other groups.
 * @constructor
 */
function Group3D() {
  Node3D.call(this);
  this.children = [];
}
Group3D.prototype = Object.create(Node3D.prototype);
Group3D.prototype.constructor = Group3D;

Group3D.prototype.addChild = function(child) {
  this.children.push(child);
  child.parent = this;
}

/**
 * Creates a transform group.
 * @constructor
 */
function TransformGroup3D(transform) {
  Group3D.call(this);
  this.transform = transform;
}
TransformGroup3D.prototype = Object.create(Group3D.prototype);
TransformGroup3D.prototype.constructor = TransformGroup3D;


/**
 * Creates a canvas 3D bound to HTML canvas with the given id.
 * @constructor
 */
function Canvas3D(id) {
  this.buffers = [];
  this.textures = [];
  
  // Initialize WebGL
  var canvas = document.getElementById(id);
  this.gl = canvas.getContext("webgl");
  if (!this.gl) {
    throw "No WebGL";
  }
  this.gl.viewportWidth = canvas.width;
  this.gl.viewportHeight = canvas.height;
  this.gl.clearColor(0.8, 0.8, 0.8, 1.0);
  this.gl.enable(this.gl.DEPTH_TEST);
  
  // Initialize shaders
  this.colorShaderProgram = this.gl.createProgram();
  var vertexShader = this.getShader(this.gl.VERTEX_SHADER,
      "attribute vec3 vertexPosition;" 
    + "uniform mat4 projectionMatrix;"
    + "uniform mat4 modelViewMatrix;"
    + "void main(void) {"
    + "  gl_Position = projectionMatrix * modelViewMatrix * vec4(vertexPosition, 1.0);"
    + "}");
  this.gl.attachShader(this.colorShaderProgram, vertexShader);
  var fragmentShader = this.getShader(this.gl.FRAGMENT_SHADER,
      "precision mediump float;"
    + "uniform vec4 vertexColor;"
    + "void main(void) {"
    + "  gl_FragColor = vertexColor;"
    + "}");
  this.gl.attachShader(this.colorShaderProgram, fragmentShader);
  this.gl.linkProgram(this.colorShaderProgram);
  this.colorShaderProgram.projectionMatrix = this.gl.getUniformLocation(this.colorShaderProgram, "projectionMatrix");
  this.colorShaderProgram.modelViewMatrix = this.gl.getUniformLocation(this.colorShaderProgram, "modelViewMatrix");
  this.colorShaderProgram.vertexColorUniform = this.gl.getUniformLocation(this.colorShaderProgram, "vertexColor");
  
  this.textureShaderProgram = this.gl.createProgram();
  vertexShader = this.getShader(this.gl.VERTEX_SHADER,
      "attribute vec3 vertexPosition;" 
    + "attribute vec2 vertexTextureCoord;"
    + "uniform mat4 modelViewMatrix;"
    + "uniform mat4 projectionMatrix;"
    + "varying vec2 varTextureCoord;"
    + "void main(void) {"
    + "  gl_Position = projectionMatrix * modelViewMatrix * vec4(vertexPosition, 1.0);"
    + "  varTextureCoord = vertexTextureCoord;"
    + "}");
  this.gl.attachShader(this.textureShaderProgram, vertexShader);
  fragmentShader = this.getShader(this.gl.FRAGMENT_SHADER,
      "precision mediump float;"
    + "varying vec2 varTextureCoord;"
    + "uniform sampler2D sampler;"
    + "void main(void) {"
    + "  gl_FragColor = texture2D(sampler, vec2(varTextureCoord.s, varTextureCoord.t));"
    + "}");
  this.gl.attachShader(this.textureShaderProgram, fragmentShader);
  this.gl.linkProgram(this.textureShaderProgram);
  this.textureShaderProgram.projectionMatrix = this.gl.getUniformLocation(this.textureShaderProgram, "projectionMatrix");
  this.textureShaderProgram.modelViewMatrix = this.gl.getUniformLocation(this.textureShaderProgram, "modelViewMatrix");
  this.textureShaderProgram.samplerUniform = this.gl.getUniformLocation(this.textureShaderProgram, "sampler");
}

Canvas3D.prototype.getShader = function(type, source) {
  var shader = this.gl.createShader(type);
  this.gl.shaderSource(shader, source);
  this.gl.compileShader(shader);
  if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
    throw "Invalid shader: " + source; 
  }
  return shader;
}

/**
 * Displays the given scene in the canvas.
 */
Canvas3D.prototype.setScene = function(scene) {
  var shapes = [];
  this.prepareScene(scene, shapes, mat4.create());
  this.shapes = shapes;
  this.drawScene();
}

Canvas3D.prototype.prepareScene = function(node, shapes, parentTransformations) {
  if (node instanceof Group3D) {
    if (node instanceof TransformGroup3D) {
      parentTransformations = mat4.clone(parentTransformations);
      mat4.mul(parentTransformations, parentTransformations, node.transform);
    }
    // Compute the bounds of all the node children
    for (var i in node.children) {
      this.prepareScene(node.children [i], shapes, parentTransformations);
    }
  } else if (node instanceof Shape3D) {
    var texture = null;
    if (node.appearance.textureImage !== undefined) {
      texture = this.prepareTexture(node.appearance.textureImage);
    }
    var color;
    if (node.appearance.diffuseColor !== undefined) {
      color = new Float32Array(4);
      color.set(node.appearance.diffuseColor);
      color.set([1.], 3); // Add transparency
    } else {
      color = new Float32Array([1., 1., 1., 1.]);
    }
    
    for (var i in node.geometries) {
      var geometry = node.geometries [i];
      var shape = {"vertexCount":geometry.vertexIndices.length, 
                   "transformation":parentTransformations};
      if (texture !== null) {
        shape.texture = texture;
        shape.shaderProgram = this.textureShaderProgram;
      } else {
        shape.color = color;
        shape.shaderProgram = this.colorShaderProgram;
      }
      shape.vertexBuffer = this.prepareBuffer(this.gl.ARRAY_BUFFER, geometry.vertices);
      shape.vertexIndicesBuffer = this.prepareBuffer(this.gl.ELEMENT_ARRAY_BUFFER, geometry.vertexIndices);
      shape.textureCoordinatesBuffer = this.prepareBuffer(this.gl.ARRAY_BUFFER, geometry.textureCoordinates);
      shape.textureCoordinateIndicesBuffer = this.prepareBuffer(this.gl.ELEMENT_ARRAY_BUFFER, geometry.textureCoordinateIndices);
      if (geometry instanceof IndexedTriangleArray3D) {
        shape.mode = this.gl.TRIANGLES;
        shape.normalsBuffer = this.prepareBuffer(this.gl.ARRAY_BUFFER, geometry.normals);
        shape.normalIndicesBuffer = this.prepareBuffer(this.gl.ELEMENT_ARRAY_BUFFER, geometry.normalIndices);
        shapes.push(shape);
      } else {
        shape.mode = this.gl.LINE_STRIP;
      } 
    }
  }
}

Canvas3D.prototype.prepareTexture = function(textureImage) {
  // Search whether texture already exists
  for (var i in this.textures) {
    if (this.textures [i].image.src == textureImage.src) {
      return this.textures [i];
    }
  }
  // Create texture
  var texture = this.gl.createTexture();
  texture.image = textureImage;
  if (textureImage.ready !== undefined) {
    canvas3D.bindTexture(texture);
  } else {
    var canvas3D = this;
    // If texture image isn't loaded yet, change image onload handler
    textureImage.onload = function() {
        canvas3D.bindTexture(texture);
        // Redraw scene
        requestAnimationFrame(function () {
            canvas3D.drawScene(); 
          });
      };
  }
  this.textures.push(texture);
  return texture;
}

Canvas3D.prototype.bindTexture = function(texture) {
  this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
  this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
  this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, texture.image);
  this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
  this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
  this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
  this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
  this.gl.bindTexture(this.gl.TEXTURE_2D, null);
}

Canvas3D.prototype.prepareBuffer = function(type, data) {
  if (data.length > 0) {
    // Search whether data is already buffered
    for (var i in this.buffers) {
      if (this.buffers [i].data === data) {
        return this.buffers [i];
      }
    }
    // Create buffer from data
    var buffer = this.gl.createBuffer();
    this.gl.bindBuffer(type, buffer);
    var dataArray; 
    if (type === this.gl.ARRAY_BUFFER) {
      var itemSize = data [0].length;
      dataArray = new Float32Array(data.length * itemSize)
      for (var i in data) {
        dataArray.set(data [i], i * itemSize);
      }
    } else {
      dataArray = new Uint16Array(data);
    }
    this.gl.bufferData(type, dataArray, this.gl.STATIC_DRAW);
    buffer.data = data;
    this.buffers.push(buffer);
    return buffer;
  } else {
    return null;
  }
}

Canvas3D.prototype.drawScene = function() {
  this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
  this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  
  var projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix, 45, this.gl.viewportWidth / this.gl.viewportHeight, 0.01, 100.0);
  var modelViewMatrix = mat4.create();
  mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -2.4]);
  // TODO Set view orientation
  mat4.rotateX(modelViewMatrix, modelViewMatrix, Math.PI / 9);
  mat4.rotateY(modelViewMatrix, modelViewMatrix, -Math.PI / 6);
  for (var i in this.shapes) {
    var shape = this.shapes [i];
    this.gl.useProgram(shape.shaderProgram);
    if (shape.texture !== undefined) {
      this.gl.activeTexture(this.gl.TEXTURE0);
      this.gl.bindTexture(this.gl.TEXTURE_2D, shape.texture);
      this.gl.uniform1i(this.textureShaderProgram.samplerUniform, 0);
    } else {
      this.gl.uniform4fv(this.colorShaderProgram.vertexColorUniform, shape.color);
    }
    
    var vertexPositionAttribute = this.gl.getAttribLocation(shape.shaderProgram, "vertexPosition");
    this.gl.enableVertexAttribArray(vertexPositionAttribute);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, shape.vertexBuffer);
    this.gl.vertexAttribPointer(vertexPositionAttribute, 3, this.gl.FLOAT, false, 0, 0);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, shape.vertexIndicesBuffer);
    if (shape.textureCoordinatesBuffer !== null
        && shape.texture !== undefined) {
      var textureCoordAttribute = this.gl.getAttribLocation(shape.shaderProgram, "vertexTextureCoord");
      this.gl.enableVertexAttribArray(textureCoordAttribute);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, shape.textureCoordinatesBuffer);
      this.gl.vertexAttribPointer(textureCoordAttribute, 2, this.gl.FLOAT, false, 0, 0);
    }
    this.gl.uniformMatrix4fv(shape.shaderProgram.projectionMatrix, false, projectionMatrix);
    var shapeModelViewMatrix = mat4.clone(modelViewMatrix);
    this.gl.uniformMatrix4fv(shape.shaderProgram.modelViewMatrix, false, 
        mat4.mul(shapeModelViewMatrix, shapeModelViewMatrix, shape.transformation));
    this.gl.drawElements(shape.mode, shape.vertexCount, this.gl.UNSIGNED_SHORT, 0);
  }
}

/**
 * Loads and displays the given model.
 */
Canvas3D.prototype.setModel = function(content, callback) {
  var canvas = this;
  ModelManager.loadModel(content,
    {
      modelUpdated: function(model) {
        // Place model at origin in a box as wide as the canvas
        var modelTransform = mat4.create();
        var size = ModelManager.getSize(model);
        mat4.scale(modelTransform, modelTransform, size);
        var scaleFactor = 1.8 / Math.max(Math.max(size[0], size[1]), size[2]);
        mat4.scale(modelTransform, modelTransform, vec3.fromValues(scaleFactor, scaleFactor, scaleFactor));
        mat4.mul(modelTransform, modelTransform, 
            ModelManager.getNormalizedTransform(model, null, 1));
        
        var scene = new TransformGroup3D(modelTransform); 
        scene.addChild(model);
        canvas.setScene(scene);
      },
     
      modelError: function(err) {
        if (callback !== undefined) {
          callback(err);
        }
      }
    });
}