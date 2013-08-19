
(function (geo) {

  if (typeof geo !== "undefined") {

    // shared

    var settings = {

      interval: 15 * 1000 // 15 secs

    };

    var workers = {};

    // function

    geo.trackPosition = function (success, error, opts) {
      opts = opts || {};
      var
        trackId,
        interval = opts.interval || settings.interval,
        desiredAccuracy = opts.desiredAccuracy,
        lastPosition,
        udpatePosition = function (position) {
          if (typeof desiredAccuracy !== "undefined") {
            if (position.coords.accuracy <= desiredAccuracy) {
              lastPosition = position;
            } else {
              console.log('Invalid fix accuracy: %s (expected: %s)',
                position.coords.accuracy, desiredAccuracy);
            }
          } else {
            lastPosition = position;
          }
        },
        callback = function (position) {
          var result = success(position);
          if (result === false) {
            console.log('Callback cancels execution, wreck-it Ralph...');
            // cancel execution
            geo.clearTrack(trackId);
          }
          return result;
        };
      console.log('Track position starts...');
      // tracking worker
      trackId = navigator.geolocation.watchPosition(
        function (position) {
          if (typeof workers[trackId] === "undefined") {
            lastPosition = position;
            console.log('Initial fix: %o', lastPosition);
            if (callback(lastPosition) !== false) {
              // FIXME: ugly worker object creation and re-throw
              var worker = {
                interval: interval,
                callback: function () {
                  console.log('Worker execution done, fix: %o', lastPosition);
                  callback(lastPosition);
                  // re-throw
                  worker.id = window.setTimeout(worker.callback, worker.interval);
                }
              };
              // create worker to execute in the future
              worker.id = window.setTimeout(worker.callback, interval);
              // store
              workers[trackId] = worker;
            }
          } else {
            console.log('Worker already running, fix: %o', position);
            // update for better position (if found)
            udpatePosition(position);
          }
        },
        error,
        opts);
      // return tracking identifier
      return trackId;
    };

    geo.updateTrackInterval = function (trackId, interval) {
      interval = interval || settings.interval;
      console.log('Track position interval updated to: %s second(s)',
        interval / 1000);
      if (typeof workers[trackId] !== "undefined") {
        var worker = workers[trackId];
        // update interval
        worker.interval = interval;
      }
    };

    geo.clearTrack = function (trackId) {
      console.log('Track position stops...');
      navigator.geolocation.clearWatch(trackId);
      if (typeof workers[trackId] !== "undefined") {
        window.clearTimeout(workers[trackId].id);
        delete workers[trackId];
      }
    };

   } else {

      // no geolocation support :(

   }

}(navigator.geolocation));
