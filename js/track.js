
(function (geo) {

  if (typeof geo !== "undefined") {

    // shared

    var settings = {

      frequency: 15 * 1000 // 15 secs

    };

    var workers = {};

    // function

    geo.trackPosition = function (success, error, opts) {
      opts = opts || {};
      var
        trackId = new Date().getTime(),
        frequency = opts.frequency || settings.frequency,
        desiredAccuracy = opts.desiredAccuracy,
        lastPosition,
        // FIXME: ugly worker object creation and re-throw
        worker = {
          frequency: frequency,
          callback: function () {
            console.log('Worker %s, took fix: %o', worker.id, lastPosition);
            if (typeof lastPosition === "undefined") {
              error(); // unable to take accurate position in desired time
            } else {
              success(lastPosition);
            }
            if (typeof workers[trackId] !== "undefined") { // stops in success ??
              // re-throw
              worker.id = window.setTimeout(worker.callback, worker.frequency);
              console.log('Worker %s, created', worker.id);
            } else {
              // console.warn('Worker %s, execution canceled', worker.id);
            }
          }
        };
      // starts
      console.log('Track position starts...');
      // create worker to execute in the future
      worker.id = window.setTimeout(worker.callback, frequency);
      console.log('Worker %s, created', worker.id);
      // tracking worker
      worker.watchPositionId = navigator.geolocation.watchPosition(
        function (position) {
          // update for better position (if found)
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
        error,
        opts);
      // store
      workers[trackId] = worker;
      // return tracking identifier
      return trackId;
    };

    geo.updateTrackFrequency = function (trackId, frequency) {
      frequency = frequency || settings.frequency;
      console.log('Track position frequency updated to: %s second(s)',
        frequency / 1000);
      if (typeof workers[trackId] !== "undefined") {
        var worker = workers[trackId];
        // update frequency
        worker.frequency = frequency;
      }
    };

    geo.clearTrack = function (trackId) {
      console.log('Track position stops...');
      if (typeof workers[trackId] !== "undefined") {
        var worker = workers[trackId];
        // clear
        navigator.geolocation.clearWatch(worker.watchPositionId);
        window.clearTimeout(worker.id);
        console.log('Worker %s, cleared', worker.id);
        delete workers[trackId];
      }
    };

   } else {

      // no geolocation support :(

   }

}(navigator.geolocation));
