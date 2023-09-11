/*
 * ContentDigestManager.js
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

// Requires jszip.min.js
//          URLContent.js

/**
 * Manager able to store and compute content digest to compare content data faster.
 * @constructor
 * @private
 * @author Emmanuel Puybaret
 */
function ContentDigestManager() {
  this.contentDigestsCache = {};
  this.permanentContents = {};
}

/**
 * Singleton
 * @private
 */ 
ModelManager.instance = null;

/**
 * Returns an instance of this singleton.
 * @return {ModelManager} 
 */
ContentDigestManager.getInstance = function() {
  if (ContentDigestManager.instance == null) {
    ContentDigestManager.instance = new ContentDigestManager();
  }
  return ContentDigestManager.instance;
}

/**
 * Returns <code>true</code> if the contents in parameter contains the same data,
 * comparing their digest. If the digest of the contents was not
 * {@linkplain #setContentDigest(Content, byte[]) set} directly or in cache,
 * it will return <code>false</code>.
 * @param {URLContent} content1
 * @param {URLContent} content2
 * @return {boolean}
 */
ContentDigestManager.prototype.equals = function(content1, content2) {
    var content1Digest = this.contentDigestsCache [content1.getURL()];
    if (content1Digest == null) {
      return false;
    } else {
      return content1Digest === this.contentDigestsCache [content2.getURL()];
    }
  }

/**
 * Sets the SHA-1 digest of the given <code>content</code>. 
 * It should be used for permanent contents like the ones coming for preferences. 
 * @param {URLContent} content
 * @param {string} digest
 */
ContentDigestManager.prototype.setContentDigest = function(content, digest) {
  this.contentDigestsCache [content.getURL()] = digest;
  this.permanentContents [digest] = content;
}

/**
 * Returns the permanent content which matches the given <code>content</code> 
 * or <code>null</code> if doesn't exist.
 * @param {URLContent} content  a content with its digest already computed 
 * @return {URLContent}
 */
ContentDigestManager.prototype.getPermanentContentDigest = function(content) {
  var contentDigest = this.contentDigestsCache [content.getURL()];
  if (contentDigest !== undefined) {
    var permanentContent = this.permanentContents [contentDigest];
    if (permanentContent !== undefined) {
      return permanentContent;
    }
  } 
  
  return null;
}

/**
 * Returns asynchronously the SHA-1 digest of the given content.
 * @param {URLContent} content
 * @param {digestReady: function, digestError: function} digestObserver
 * @ignored
 */
ContentDigestManager.prototype.getContentDigest = function(content, digestObserver) {
  var contentDigest = this.contentDigestsCache [content.getURL()];
  if (contentDigest === undefined) {
    if (content.isJAREntry()) {
      this.getZipContentDigest(content, digestObserver);
    } else if (content instanceof LocalURLContent) {
      var manager = this;
      content.getBlob({
          blobReady: function(blob) {
            if (blob.type === "application/zip") {
              manager.getZipContentDigest(content, digestObserver);
            } else {
              manager.getURLContentDigest(content, digestObserver);
            }
          },
          blobError: function(status, error) {
            digestObserver.digestError(status, error);
          }    
        });
    } else {
      this.getURLContentDigest(content, digestObserver);
    }
  } else {
    digestObserver.digestReady(content, contentDigest);
  }
}

/**
 * Returns asynchronously the SHA-1 digest of the given content.
 * @param {URLContent} content content containing zipped data
 * @param {digestReady: function, digestError: function} digestObserver
 * @private
 */
ContentDigestManager.prototype.getZipContentDigest = function(content, digestObserver) {
  var manager = this;
  ZIPTools.getZIP(content.isJAREntry() ? content.getJAREntryURL() : content.getURL(), false, {
      zipReady : function(zip) {
        try {
          var entryName = content.isJAREntry() ? content.getJAREntryName() : "";
          var slashIndex = content instanceof HomeURLContent
              ? entryName.indexOf('/')
              : -1;
          var entryDirectory = entryName.substring(0, slashIndex + 1);
          var contentData = new Uint8Array(0);
          var entries = slashIndex > 0 || !(content instanceof HomeURLContent) 
              ? zip.file(new RegExp("^" + entryDirectory + ".*")).sort(function(entry1, entry2) { return entry1.name === entry2.name ? 0 : (entry1.name < entry2.name ? 1 : -1); }) // Reverse order
              : [zip.file(entryName)];
          
          for (var i = entries.length - 1; i >= 0 ; i--) {
            var zipEntry = entries [i];
            if (zipEntry.name !== entryDirectory
                && manager.isSignificant(zipEntry.name)) {
              // Append entry data to contentData
              var entryData = zipEntry.asUint8Array();
              var data = new Uint8Array(contentData.length + entryData.length);
              data.set(contentData);
              data.set(entryData, contentData.length);
              contentData = data;
            }
          }   
          
          manager.computeContentDigest(contentData, function(digest) {
              manager.contentDigestsCache [content.getURL()] = digest;
              digestObserver.digestReady(content, digest);
            });              
        } catch (ex) {
          this.zipError(ex);
        }
      },
      zipError : function(error) {
        digestObserver.digestError(error, error.message);
      }
    });
}

/**
 * Returns asynchronously the SHA-1 digest of the given content.
 * @param {URLContent} content content containing no zipped data 
 * @param {digestReady: function, digestError: function} digestObserver
 * @private
 */
ContentDigestManager.prototype.getURLContentDigest = function(content, digestObserver) {
  var manager = this;
  content.getStreamURL({
      urlReady: function(url) {
        var request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.responseType = "arraybuffer";
        request.addEventListener("load", function() {
            manager.computeContentDigest(request.response, function(digest) {
                manager.contentDigestsCache [content.getURL()] = digest;
                digestObserver.digestReady(content, digest);
              });
          });
        request.send();
      },
      urlError: function(status, error) {
        digestObserver.digestError(status, error);
      }    
    });
}

/**
 * Computes the digest of the given data and calls <code>observer</code> when digest is ready. 
 * @param {Uint8Array} contentData
 * @param {function} observer callback which will receive in parameter the SHA-1 digest of contentData in Base64
 * @private
 */
ContentDigestManager.prototype.computeContentDigest = function(contentData, observer) {
  var crypto = window.msCrypto !== undefined ? window.msCrypto : window.crypto;
  var digest;
  try {
    digest = crypto.subtle.digest("SHA-1", contentData);
  } catch (ex) {
    // Use SHA-256 instead even if secured hash is not needed here
    digest = crypto.subtle.digest("SHA-256", contentData);
  }
  if (digest.then !== undefined) { 
    digest.then(function(hash) {
        observer(btoa(String.fromCharCode.apply(null, new Uint8Array(hash))));
      });
  } else { 
    // IE 11 digest.result is available without promise support but only after a call to setTimeout 
    setTimeout(function() {
        observer(btoa(String.fromCharCode.apply(null, new Uint8Array(digest.result))));      
      });
  }
}

/**
 * Returns <code>true</code> if entry name is significant to distinguish
 * the data of a content from an other one. 
 * @param {string} entryName
 * @return {boolean} 
 * @private
 */
ContentDigestManager.prototype.isSignificant = function(entryName) {
  // Ignore LICENSE.TXT files
  var entryNameUpperCase = entryName.toUpperCase();
  return entryNameUpperCase !== "LICENSE.TXT"
        && entryNameUpperCase.indexOf("/LICENSE.TXT", entryNameUpperCase.length - "/LICENSE.TXT".length) === -1;
}
