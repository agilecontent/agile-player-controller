define(['agile-app'], function(Agile) {
    'use strict';

	return Agile.View.extend({

		bindedTo: '[data-selector="player-view"]',

        moduleEvents: {
            'play:video'            : '_onPlayVideo',
            'stop:video'            : '_onStopVideo',
            'update:player:data'    : '_updatePlayerData',
            'toggle:player'         : '_onTogglePlayer'
        },

        ui: {
            playerContainer: '[data-selector="player-container"]',
            playerDiv: '[data-selector="streaming-player"]',
            displayBtn : '[data-selector="player-display-button"]',

        },

        events: {
            'click [data-selector="player-display-button"]': '_onTogglePlayer',
            'click [data-selector="close-player-view"]': '_hidePlayerContainer',
            'click a[data-selector="station-display-button"]': '_onToggleStationView'
        },

        _states: {
            PLAYER_OPEN: 'open',
            PLAYER_CLOSE: 'close'
        },

		onBinding: function() {
            this._isDisplayed   = false;
            this._streamMap     = {};


            /*this._initPlayer();
            this._addEvent();*/
		},

        _mergeStreamMap: function(data) {
            var keys = Object.keys(this._streamMap), i = 0, l;

            if (!keys.length) {
                return this._streamMap = data;
            }

            keys = Object.keys(data);

            for (l = keys.length; i < l; i++) {
                this._streamMap[keys[i]] = data[keys[i]];
            }
        },


        _onPlayerStateRetrieved: function(data) {
            if (data.display === this._states.PLAYER_OPEN) {
                this._openPlayerContainer();
            }
        },


        play: function(data) {
            var url = data.url;


            this._streamId = data.stream;

            if (this._streamUrl !== url) {
                this.__player.data('mediaplayer').loadMediaByUrl(url, true);

                this._streamUrl = url;

                this._updatePlayerData(data);
            }

            this.__player.data('mediaplayer').play();
        },

        stop: function(data) {
            this.__player.data('mediaplayer').pause();
        },

        _onPlayVideo: function(data) {

            this._openPlayerContainer();

            this.play(data);


        },

        _updatePlayerData: function(data) {
            if (this._streamId !== data.stream) {
                return;
            }
            this.__player.data('mediaplayer').setImage(data.images);
            this.__player.data('mediaplayer').updateProgressbarTitle(data.title);
            this.__player.data('mediaplayer').updateProgressbarSubtitle(data.host);
        },

        _onStopVideo: function(data) {
            this.stop(data);
        },

        _initPlayer: function(url) {
            url = url || '/config/directos/1';

            this.__player = this.ui.playerDiv.mediaplayer({
                forcedToHtml5: true,
                width: 'auto',
                height: '100%',
                url: url,
                volumeControlShape: 'horizontalLine',
                autoplay: false
            });

        },


        _addEvent: function() {
            this.__player.on('play resume', Agile.bind(function() {
                this.trigger('module:set:play:btn:panel', {
                    stream: this._streamId
                });
            }, this));

            this.__player.on('pause', Agile.bind(function() {
                this.trigger('module:reset:play:btn:panel');
            }, this));
        },


        _openPlayerContainer: function() {
            this._isDisplayed = true;

            this.$el.slideDown();

            $(window).trigger('resize');

            this.trigger('module:player:opened');

        },

        _hidePlayerContainer: function() {
            this._isDisplayed = false;

            this.$el.slideUp();

            this.trigger('module:player:closed');
        },

        _onTogglePlayer: function() {
            if (this._isDisplayed) {
                this._hidePlayerContainer();
            } else {
                this._openPlayerContainer();
            }
        },

        _onToggleStationView: function() {
            this.trigger('module:toggle:station:view');
        }
	});
});
