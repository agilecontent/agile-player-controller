define(['agile-app', '../components/streamMapOrden'], function(Agile, streamMapOrden) {
    'use strict';

	return Agile.View.extend({

		bindedTo  : '[data-selector="streaming-detail-view"]',

		ui: {
			description	: 'p[data-selector="description"]',
			title       : 'h2[data-selector="title"]',

		},

		moduleEvents: {
			'update:player:data'		: '_onDataUpdated'
		},

		onBinding: function() {
			this._stream = this.$el[0].dataset.direct;
		},


		_getPlayer: function() {
			var div;

			if (this.__player) {
				return this.__player;
			}

			div = $('[id^="detail-streaming-"]');

			if (div.length) {
				this.__player = div.data('mediaplayer');
			}

			return this.__player;
		},


		_onDataUpdated: function(data) {
			var description, player;

			if (data.stream !== this._stream) {
				return;
			}

			description = data.description + ' ' + data.hours;

			if (!data.description) {
				description = data.hours;
			}

			this.ui.description.text(description);
			this.ui.title.text(data.title);

			player = this._getPlayer();

			if (player) {
				player.setImage(data.images);
			}
		}
	});
});
