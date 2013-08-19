/*!
 *              __     _ 
 *   _    _/__  /./|,//_`
 *  /_//_// /_|///  //_, 
 *
 * Geolocation Track v.0.1.0
 * Copyright (c) 2013 outaTiME, Inc.
 *
 * Author: outaTiME (afalduto [at] gmail dot com).
 */

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
        trackId = new Date().getTime(),
        interval = opts.interval || settings.interval,
        desiredAccuracy = opts.desiredAccuracy,
        lastPosition;
      console.log('Track position starts...');
      // worker
      // FIXME: ugly worker object creation and re-throw
      var worker = {
        interval: interval,
        callback: function () {
          console.log('Worker execution done, fix: %o', lastPosition);
          if (typeof lastPosition === "undefined") {
            error(); // unable to take accurate position in desired time
          } else {
            success(lastPosition);
          }
          // re-throw
          worker.id = window.setTimeout(worker.callback, worker.interval);
        }
      };
      // create worker to execute in the future
      worker.id = window.setTimeout(worker.callback, interval);
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
      if (typeof workers[trackId] !== "undefined") {
        var worker = workers[trackId];
        // clear
        navigator.geolocation.clearWatch(worker.watchPositionId);
        window.clearTimeout(worker.id);
        delete workers[trackId];
      }
    };

   } else {

      // no geolocation support :(

   }

}(navigator.geolocation));
