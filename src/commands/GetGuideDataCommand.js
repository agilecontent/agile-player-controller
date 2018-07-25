define(['agile-app', 'config'], function(Agile, config) {
    'use strict';

	return Agile.Command.extend({
    execute: function (data) {
      $("[data-selector='cmp-streaming-guide']").load(config.guideURL);
      $("[data-selector='cmp-all-streaming-guide']").load(config.guideDaylistURL);
      $("[data-selector='cmp-sticky-guide']").load(config.guideStickyURL);
      $("[data-selector='cmp-sticky-footer-guide']").load(config.guideFooterURL,this._reloadSliders());

    },
    _reloadSliders: function () {
      // Create the event
      var event = new CustomEvent("reload-sliders", {});

      // Dispatch/Trigger/Fire the event
      setTimeout(function () {
        document.dispatchEvent(event);
      }, 500);
    },
  });
});
