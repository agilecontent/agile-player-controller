define(['agile-app', 'config'], function(Agile, config) {
    'use strict';

	return Agile.Command.extend({
    execute: function () {
      var _this = this;
      var x = 0;
      var intervalID = setInterval(function () {

        $("[data-selector='cmp-streaming-guide']").load(config.guideURL);
        $("[data-selector='cmp-all-streaming-guide']").load(config.guideDaylistURL);
        $("[data-selector='cmp-sticky-guide']").load(config.guideStickyURL);
        $("[data-selector='cmp-guide-detail-view']").load(config.guideDetailURL);
        $("[data-selector='cmp-sticky-footer-guide']").load(config.guideFooterURL,_this._reloadSliders());

        if (++x === 3) {
          window.clearInterval(intervalID);
      }
      }, 20000);
    },
    _reloadSliders: function () {
      // Create the event
      var event = new CustomEvent("reload-sliders", {});

      // Dispatch/Trigger/Fire the event
      setTimeout(function () {
        document.dispatchEvent(event);
      }, 500);
    }
  });
});
