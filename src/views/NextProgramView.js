define(['agile-app'], function (Agile) {
  'use strict';

  return Agile.View.extend({

    bindedTo: '[data-selector="nextProgram-view"]',

    ui: {
      div: '[data-selector="nextProgram-view"]',
      image: 'img[data-selector="nextProgramImage"]',
      host: 'p[data-selector="nextProgramHost"]',
      title: 'h3[data-selector="nextProgramTitle"]'

    },

    moduleEvents: {
      'update:nextprogram:data': '_onNextProgDataUpdated'
    },

    onBinding: function () {
      this._stream = this.$el[0].dataset.direct;
    },

    _onNextProgDataUpdated: function (data) {
      if (data.stream !== this._stream) {
        return;
      }

      this.ui.title.text(data.title);

      if (data.image) {
        this.ui.image.attr("src", data.image);
      } else {
        this.ui.image.hide();
      }
      if (data.host) {
        this.ui.host.text(data.host);
      }else {
        this.ui.host.hide();
      }
      this.ui.div.show();

    }
  });
});
