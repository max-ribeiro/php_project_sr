'use strict';

(function (factory, jQuery) {
  if (typeof define === 'function' && define.amd) {
    define('jquery.insideprogressbar', ['jquery', 'bootstrap'], factory);
  } else if (typeof exports === 'object') {
    module.exports.docsigner = factory(require('jquery'), require('bootstrap'));
  } else {
    window.docsigner = factory(jQuery);
  }
}(function ($) {
  $.fn.insideProgressBar = function (options) {
    var $this = $(this);

    $('button, .btn').prop('disabled', true);

    var $progress;
    var $progressbar;

    var settings;

    settings = $.extend({}, $.fn.insideProgressBar.defaults, options);

    $progress = $([
      '<div class="sg-progess progress">',
      '  <div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="2" aria-valuemin="2" aria-valuemax="100" style="min-width: 2em; width: 2%;">',
      '    2%',
      '  </div>',
      '</div>'
    ].join('\n')).hide();
    $progressbar = $progress.find('.progress-bar');

    $this.append($progress);

    $this.children().fadeOut().promise().then(function () {
      var deferred;

      $progressbar.css({width: '2%'});
      $progressbar.attr('aria-valuenow', 2);
      $progressbar.text('2%');

      $progress.fadeIn(function () {
        $progressbar.animate({width: '90%'}, {
          duration: settings.duration,
          step: function (now) {
            $progressbar.attr({'aria-valuenow': parseInt(now)});
            $progressbar.text(parseInt(now) + '%');
          },
          start: function () {
            deferred = settings.start.apply(null, arguments);
          },
          complete: function () {
            deferred
              .done(function () {
                var _arguments = arguments;
                $progressbar.animate({width: '100%'}, {
                  step: function (now) {
                    $progressbar.attr({'aria-valuenow': parseInt(now)});
                    $progressbar.text(parseInt(now) + '%');
                  },
                  complete: function () {
                    $('button, .btn').prop('disabled', false);
                    settings.complete.apply(null, _arguments);

                    $progress.fadeOut(function () {
                      $progress.remove();
                      $.when($this.children().fadeIn()).then(function(){
                        settings.after.apply(null, _arguments);
                      });

                    });


                  }
                });
              })
              .fail(function () {
                $progressbar.animate({width: '100%'}, {
                  step: function (now) {
                    $progressbar.attr({'aria-valuenow': parseInt(now)});
                    $progressbar.text(parseInt(now) + '%');
                  },
                  complete: function () {
                    $('button, .btn').prop('disabled', false);
                    settings.error.apply(null, arguments);

                    $progress.fadeOut(function () {
                      $progress.remove();
                      $this.children().fadeIn();
                    });
                  }
                });
              });
          }
        });
      });
    });

    return $this;
  };

  $.fn.insideProgressBar.defaults = {
    duration: 'slow',
    complete: function () {},
    error: function () {},
    after: function() {},
  };
}, window.jQuery));
