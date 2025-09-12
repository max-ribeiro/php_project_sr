(function(){
  'use strict';

  function factory(Handlebars, moment) {
    function pad(n, width, z) {
      z = z || '0';
      n = n + '';
      return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }

    Handlebars.registerHelper('moment', function (context, options) {
      var constructorFormat = options.hash.constructorFormat || 'YYYY-MM-DD HH:mm:ss.SSS';
      var format = options.hash.format || 'DD/MM/YYYY HH:mm:ss';

      var date = moment(context, constructorFormat);

      if (!date.isValid()) {
        return '';
      }

      return date.format(format);
    });

    Handlebars.registerHelper('momentSubDates', function (options) {
      var constructorFormat = options.hash.constructorFormat || 'YYYY-MM-DD HH:mm:ss.SSS';

      var start = moment(options.hash.start, constructorFormat);
      var end = moment(options.hash.end, constructorFormat);

      var diff = end.valueOf() - start.valueOf();
      var duration = moment.duration(diff);

      var durationString = '';

      if (duration.years()) {
        durationString += duration.years() + ' anos';
      }

      if (duration.months()) {
        durationString += duration.months() + ' meses';
      }

      if (duration.days()) {
        durationString += duration.days() + ' dias';
      }

      durationString += (duration.hours() ? pad(duration.hours(), 2) : '00') + ':';
      durationString += (duration.minutes() ? pad(duration.minutes(), 2) : '00') + ':';
      durationString += (duration.seconds() ? pad(duration.seconds(), 2) : '00');

      return durationString;
    });
  };

  if (typeof define === 'function' && define.amd) {
    define('handlebars.helper.moment', ['handlebars', 'moment'], factory);
  } else {
    factory(window.Handlebars, window.moment);
  }
}());