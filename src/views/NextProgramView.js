define(['agile-app'], function (Agile) {
  'use strict';

  return Agile.View.extend({

    bindedTo: '[data-selector="nextProgram-view"]',

    ui: {
      image: 'img[data-selector="nextProgramImage"]',
      host: 'p[data-selector="nextProgramHost"]',
      title: 'h3[data-selector="nextProgramTitle"]',
      link: 'a[data-selector="nextProgramLink"]'

    },

    moduleEvents: {
      'update:nextprogram:data': '_onNextProgDataUpdated'
    },

    onBinding: function () {
      this._stream = this.$el[0].dataset.direct;
    },

    _setTargetBlankInStreamingPage: function () {
      // Create the event
      var event = new CustomEvent("setTargetBlankInStreamingPage", {});

      // Dispatch/Trigger/Fire the event
      document.dispatchEvent(event);
    },

    _onNextProgDataUpdated: function (data) {
      if (data.stream !== this._stream) {
        return;
      }

      this.ui.title.text(data.title);
      this.ui.link.attr("href", "/pr/" + data.programId);

      if (data.image) {
        this.ui.image.attr("src", data.image);
      } else {
        this.ui.image.hide();
      }
      if (data.host) {
        this.ui.host.text(data.host);
      } else {
        this.ui.host.hide();
      }
      this.$el[0].style.display = "block";

      this._setTargetBlankInStreamingPage();
    }
  });
});
