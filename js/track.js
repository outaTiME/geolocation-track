
(function (geo) {

  if (typeof geo !== "undefined") {

    // shared

    var settings = {

      interval: 30 * 1000 // 30 secs

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
      // trace
      console.log('Track started...');
      // tracking worker
      trackId = navigator.geolocation.watchPosition(
        function (position) {
          if (typeof workers[trackId] === "undefined") {
            lastPosition = position;
            console.log('Initial fix: %o', lastPosition);
            if (callback(lastPosition) !== false) {
              console.log('Worker run every %s second(s)', interval / 1000);
              // create worker to execute in the future
              var worker = {
                timestamp: new Date().getTime(),
                callback: function () {
                  console.log('Worker execution done, fix: %o', lastPosition);
                  callback(lastPosition);
                  // update time in each execution
                  worker.timestamp = new Date().getTime();
                }
              };
              worker.id = window.setInterval(worker.callback, interval);
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
      console.log('Updating track execution using: %s', trackId);
      if (typeof workers[trackId] !== "undefined") {
        var worker = workers[trackId],
          running = new Date().getTime() - worker.timestamp;
        console.log('Running time: %s second(s)', running / 1000);
        // window.clearInterval(workers[trackId]);
        // delete workers[trackId];
      }
    };

    geo.clearTrack = function (trackId) {
      console.log('Clearing track execution using: %s', trackId);
      navigator.geolocation.clearWatch(trackId);
      if (typeof workers[trackId] !== "undefined") {
        window.clearInterval(workers[trackId].id);
        delete workers[trackId];
      }
    };

   } else {

      // no geolocation support :(

   }

}(navigator.geolocation));
