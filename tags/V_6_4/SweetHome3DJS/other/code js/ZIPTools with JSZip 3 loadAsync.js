ZIPTools.loadingZipObservers = {};

ZIPTools.getZIP = function(url, synchronous, zipObserver) {
  if (zipObserver === undefined) {
    zipObserver = synchronous;
    synchronous = false;
  }
  if (url in ZIPTools.openedZips) {
    zipObserver.zipReady(ZIPTools.openedZips [url]); 
  } else {
    if (url in ZIPTools.loadingZipObservers) {
      // If observers list exists, url is already being loaded
      // register observer for future notification
      ZIPTools.loadingZipObservers [contentUrl].push(zipObserver);
    } else {
      // Create a list of observers that will be notified once url is loaded
      var observers = [];
      observers.push(zipObserver);
      ZIPTools.loadingZipObservers [url] = observers;
      try {
        var request = new XMLHttpRequest();
        request.open('GET', url, !synchronous);
        request.responseType = "arraybuffer";
        request.overrideMimeType("application/octet-stream");
        request.onreadystatechange = function(ev) {
            if (request.readyState === XMLHttpRequest.DONE) {
              if ((request.status === 200 || request.status === 0)
                  && request.response != null) {
                try {
                  ZIPTools.runningRequests.splice(ZIPTools.runningRequests.indexOf(request), 1);
                  var zip = new JSZip();
                  zip.loadAsync(request.response)
                     .then(function() {
                         var observers = observers = ZIPTools.loadingZipObservers [url];
                         if (observers) {
                           delete ZIPTools.loadingZipObservers [url];
                           ZIPTools.openedZips [url] = zip;
                           for (var i = 0; i < observers.length; i++) {
                             observers [i].zipReady(zip); 
                           }
                         }
                       });
                } catch (ex) {
                  ZIPTools.notifyError(url, ex);
                }
              } else {
                // Report error for requests that weren't aborted
                var index = ZIPTools.runningRequests.indexOf(request);              
                if (index >= 0) {
                  ZIPTools.runningRequests.splice(index, 1);                
                  ZIPTools.notifyError(url, new Error(request.status + " while requesting " + url)); 
                }
              }
            }
          };
        request.onprogress = function(ev) {
            var observers = ZIPTools.loadingZipObservers [url];
            if (ev.lengthComputable
                && observers) {
              for (var i = 0; i < observers.length; i++) {
                if (observers [i].progression !== undefined) {
                  observer [i].progression(ZIPTools.READING, url, ev.loaded / ev.total);
                }
              } 
            }
          };
        request.send();
        ZIPTools.runningRequests.push(request);
      } catch (ex) {
        ZIPTools.notifyError(url, ex);
      }
    }
  }
}

/**
 * @private
 */
ZIPTools.notifyError = function(url, ex) {
  var observers = ZIPTools.loadingZipObservers [url];
  if (observers) {
    delete ZIPTools.loadingZipObservers [url];
    for (var i = 0; i < observers.length; i++) {
      observer [i].zipError(ex);
    } 
  }
}
